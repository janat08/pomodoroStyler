import { toJS, autorun, observable, action as transaction, reaction } from 'mobx'
import { format } from 'date-fns'
import Push from 'push.js'
import store from 'store'
import expire from 'store/plugins/expire'
import events from 'store/plugins/events'
import obs from 'store/plugins/observe'

import alarmwatch from "../sounds/alarmwatch.mp3"
import eAlarm from "../sounds/80sAlarm.mp3"
import alarmClock from "../sounds/alarmclock.mp3"
import ding from "../sounds/ding.mp3"
import doorbell from "../sounds/doorbell.mp3"

import nanoid from 'nanoid'
import dynamicFunction from 'dynamic-function'

import { Howl, Howler } from 'howler';




function genP(url) {
    var sound = new Howl({
        src: [url]
    });
    return sound
}

function log(...args) {
    console.log(...args)
}

store.addPlugin(events)
store.addPlugin(expire)
store.addPlugin(obs)
let c = store //cache
window.c = store

//cached set
function setc(key, val, duration = 1000) {
    store.set(key, val, new Date().getTime() + duration) //miliseconds to cache for
}

const soundsNames = ["Alarm Watch", "80s Alarm", "Alarm Clock", "Ding", "Doorbell"]
const sounds = [alarmwatch, eAlarm, alarmClock, ding, doorbell].map(genP)
let justLoaded = true
let currentEvent = new Date().getTime()
let active= c.get("active")
let id
function register() {
    id = nanoid()
    if (!active) { active = [] }
    active.push(id)
    c.set('active', active)
    console.log("registering")
    return id
}
register()

const now = new Date().getTime()
const defaultState = {
    strange: 1,
    active: active,
    timerModal: false,
    start: now,
    work: 3, //60*25 //work
    break: 3,
    bigBreak: 3,
    isWorking: true,
    id: id,
    // start: null,
    paused: now,
    stamp: now,
    sessions: 1,
    notifications: [], //for closing upon interaction
    // sounds: sounds,
    bigBreakSound: 2,
    workSound: 0,
    breakSound: 2,
    animationReflow: true,
    remaingTime: null,
    s: {
        sessionsLen: 2,
        autobreak: !false,
        autowork: true,
        notifications: true,
        volume: 0.5,
        notificationsInteraction: true,
    },
    get breakType() {
        if (this.s.sessionsLen == this.sessions) {
            return this.bigBreak
        }
        return this.break
    },
    get currentTimerLength() {
        if (this.isWorking){
            return this.work
        } else {
            return this.breakType
        }
    },
    get animationDuration() {
        return (this.isWorking ? this.work : this.breakType) + 1 + "s"
    },
    get primary() {
        return this.active[0] == this.id
    },
    get timeString(){
        return format(this.remaingTime, "mm:ss")
    }
}

var s
var act

const actions = {
    tick() {
        const now = new Date().getTime()
        clearTimeout(s.timeout)
        if (s.paused && s.timeString) return
        s.stamp = now
        const { start, work, paused, breakType } = s
        const pausedFor = now - (paused || now)
        const goal = (s.isWorking ? work : breakType) * 1000
        let time = goal - (now - pausedFor - start)
        let show = time
        if (time < 100) {
            s.isWorking = !s.isWorking
            s.start = now
            if (!(s.s.autobreak && !s.isWorking || s.s.autowork && s.isWorking)) {
                s.paused = now
            }
            if (s.isWorking) {
                s.sessions += 1
            }
            if (s.sessions > s.s.sessionsLen) {
                s.sessions = 1
            }
            act.notify(s.isWorking ? "Break Ended" : "Work Ended", "")
        }
        if (!s.paused) {
            s.timeout = setTimeout(function () {
                act.tick()
            }, Math.ceil(time / 1000) * 1000 - time - 99)
        }
        if ((now - start) <= 1200) {
            act.tanimationReflow()
        }
        s.remaingTime = show
    },
    notify() {
        if (s.s.notifications) {
            let sound, body, title
            let bigBreak = s.sessions == 1
            let requireInteraction
            if (s.isWorking) {
                title = bigBreak ? "Big break ended" : "Break ended"
                body = s.s.autowork ? "Beginning work" : "Ready to start work"
                sound = sounds[bigBreak ? s.bigBreakSound : s.breakSound]
                requireInteraction = !s.s.autowork
            } else {
                title = "Work ended"
                body = s.s.autobreak ? bigBreak ? "Beginning BIG break" : "Beginning break" : "Ready to start break"
                sound = sounds[s.workSound]
                requireInteraction = !s.s.autobreak
            }
            if (location.hostname === "localhost") {
                return
            }
            Push.close("previous")
            Push.create(title, {
                body: body,
                icon: `${pomodoroPicture}`,
                vibrate: [100],
                tag: "previous",
                requireInteraction: requireInteraction,
                onClick: function () {
                    window.focus();
                    this.close();
                }
            });
            sound.play()
        }
    },
    toggleStart() {
        const { paused, start } = s
        const now = new Date().getTime()
        if (paused) {
            s.start = start + (now - paused)
            s.paused = null
            act.tick(s.id)
        } else {
            s.paused = now
        }
    },
    reset() {
        const now = new Date().getTime()
        s.paused = now
        s.start = now
        act.tanimationReflow()
    },
    resetSessions() {
        s.sessions = 1
        act.reset()
    },
    playSound(index) {
        sounds[index].play()
    },
}


if ("init") {
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    } else {
        Object.assign(defaultState, { work: 25 * 60, break: 5 * 60, bigBreak: 30 * 60 })
    }

    function change(key, setting = false) {
        if ((typeof s[key] == "undefined" && !setting) || (typeof s.s[key] == "undefined" && setting)) {
            log("error")
            throw new Error(`${key} doesn't exist on ${setting}`)
        }
        if (setting) {
            return (val) => { s.s[key] = val.target.value }
        }
        return (val) => { s[key] = val }
    }

    function toggle(key, setting) {
        if ((typeof s[key] == "undefined" && !setting) || (typeof s.s[key] == "undefined" && setting)) {
            log("error")
            throw new Error(`${key} doesn't exist on ${setting}`)
        }
        if (key == "notifications") {
            return (val) => { s.s[key] = !s.s[key]; if (s.s[key]) Push.Permission.request(); }
        }
        if (setting) {
            return (val) => { s.s[key] = !s.s[key] }
        }
        return (val) => { s[key] = !s[key] }
    }
    const hash = Object.keys(defaultState).reduce((a, x) => {
        if (["stamp", "paused", "start", "id", "primary", "active"].indexOf(x) != -1) {
            console.log("skipping", x)
            return a
        }
        return a + x + defaultState[x]
    }, "") + Object.keys(defaultState.s).reduce((a, x) => {
        return a + x + defaultState.s[x]
    }, "")

    defaultState.hash = hash
    s = observable(defaultState)
    window.s = s
    Object.keys(defaultState).forEach((x) => {
        actions["c" + x] = (change(x))
        actions["t" + x] = (toggle(x))
    })
    Object.keys(defaultState.s).forEach((x) => {
        actions["c" + x] = (change(x, 1))
        actions["t" + x] = (toggle(x, 1))
    })
    act = {}
    for (let a in actions) {
        let cb = actions[a]
        cb.nameKey = a
        act[a] = action(cb)
    }
    Object.assign(act,
        {
            selectSound: (field) => {
                var res = action(function selSound (ev){
                    const index = ev.target.value
                    s[field] = index
                    sounds[index].play()
                })
                res.nameKey = "selSound"
                return res
            }
        }
    )
    act.tick(s.id)
    window.act = act
}


if ("autoruns") {
    autorun(function notificationPermissions() {
        if (s.start && !s.paused && s.s.notifications) {
            Push.Permission.request()
        }
    })

    autorun(function volume() {
        Howler.volume(s.s.volume)
    })
    autorun(function volume() {
        window.res = toJS(s)
    })

    autorun(function changeTitle() {
        const base = "Pomodoro Timer - Tomato Timer"
        s.remaingTime
        if (!s.paused) { window.document.title = s.timeString + " " + base }
        else { window.document.title = base }
    })

    // reaction(() => s.sessions && s.isWorking, (data, reaction) => {act.tanimationReflow()})

    // autorun(function forceTick(){
    //     if (s.sessions && s.isWorking && s.paused){
    //     }
    //     act.tick()
    // })

    autorun(function overflow() {
        const html = document.querySelector("html")
        if (s.timerModal) {
            html.style.overflow = "hidden"
        } else {
            html.style.overflow = "auto"
        }
    })

    autorun(function sync() {
        let active = c.get("active")
        if (active.length > 1 && justLoaded) {
            let save = c.get("save")
            console.log(1111111111111111, toJS(s))
            Object.assign(s, save)
            console.log(2222222222222222, toJS(s))
        }
        justLoaded = false
        if (s.primary) {
            log("sending state")
            var sS = toJS(s)
            delete sS.id
            delete sS.active
            
            c.set("save", toJS(sS))
        }
        // c.set("save", toJS(s))
    })
}

function action(cb) {
    return transaction((...args) => {
        if (s.primary) cb(...args)
        const a = cb.nameKey
        if (!s.primary && a != "tanimationReflow" && a !== "tick") log("sending", a)
        if (!s.primary) c.set('event', { a: a, args, stamp: new Date().getTime() })
    })
}

let currentHash = s.hash
    //for if a new tab is opened with the newer version, old one still using previous

let previous = new Date().getTime()
window.addEventListener('storage', () => {
    let active = c.get("active")
    let set = c.get("save")
    let hash = c.get("hash")
    if (s.hash != hash || !hash) {
        c.set("hash", s.hash)
        c.set("save", null)
        location.reload(true)
    }
    if (s.active.length != active.length) {
        s.active = active
    }
    if (!s.primary) {
        Object.assign(s, set)
        return
    }
    let val = JSON.parse(window.localStorage.getItem('event'))
    act[val.a](...val.args)
});

// window.addEventListener('storage', () => {
//     // let val = c.get("save")
//     let val = JSON.parse(window.localStorage.getItem('save'))
//     log('assign', 4)

//     if (typeof val == "undefined") {
//         log("saving")
//         c.set("save", toJS(s))
//         return
//     }
//     log('assign', 3, val.stamp== s.now)

//     if (val.stamp == s.now) return
//     log('assign', 2)

//     if (s.hash == val.hash) {
//         log('assign', val)
//         Object.assign(s, val)
//     } else {
//         c.set('save', s)
//     }  
//   });

// autorun(function sync() {
//     console.log("message 1")
//     let val = c.get('save')
//     if (s.stamp == val.stamp) return
//     console.log("message 2")
//     const state = toJS(s)
//     // console.log("running")
//     delete state.timeString
//     let saveNow = new Date().getTime()
//     state.stamp = saveNow
//     c.set("save", state)
//     console.log("message 2", c.get("save").stamp, c.get('save').stamp == saveNow)
// })
// store.set("unloading", "window")

window.onbeforeunload = function () {
    active = store.get('active')
    active.splice(active.indexOf(id), 1)
    store.set('active', active)

}

// window.addEventListener('beforeunload', (event) => {
//     console.log(s.active)
//     store.set("active", s.active + 1)
//     event.returnValue = '';
//     return
// });

export { s, act, sounds, soundsNames }
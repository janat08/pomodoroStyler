import { toJS, autorun, observable, action, reaction } from 'mobx'
import hyperElement, { attachStore } from 'hyper-element'
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

// import basic from './basic.html'

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
window.store = store

//cached set
function setc(key, val, duration = 1000) {
    store.set(key, val, new Date().getTime() + duration) //miliseconds to cache for
}

const soundsNames = ["Alarm Watch", "80s Alarm", "Alarm Clock", "Ding", "Doorbell"]
const sounds = [alarmwatch, eAlarm, alarmClock, ding, doorbell].map(genP)

const verId = 121111111111111111
const now = new Date().getTime()
const defaultState = {
    timerModal: false,
    ver: verId,
    start: now,
    work: 4, //60*25 //work
    break: 2,
    bigBreak: 5,
    isWorking: true,
    // start: null,
    paused: now,
    timeString: null,
    timePercent: null,
    sessions: 0,
    notifications: [], //for closing upon interaction
    // sounds: sounds,
    bigBreakSound: 2,
    workSound: 0,
    breakSound: 2,
    animationReflow: true,
    s: {
        sessions: 2,
        autobreak: true,
        autowork: true,
        notifications: true,
        volume: 0.5,
        notificationsInteraction: true,
    },
    get breakType() {
        if (this.s.sessions == this.sessions) {
            return this.bigBreak
        }
        return this.break
    },
    get names() {
        return this.name + 234
    },
    get animationDuration() {
        return (this.isWorking ? this.work : this.breakType)+"s"
    },
    // get animationReflow(){
    //     let react = s.sessions && s.isWorking
    //     return (s.start + s.isWorking)%2
    // }
}
document.style="overflow:hidden"
document.body.style="overflow:hidden"
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
} else{
  Object.assign(defaultState, {work: 25*60, break: 5*60, bigBreak: 30*60})
}
const hash = Object.keys(defaultState).reduce((a,x)=>{
    return a + x + defaultState[x]
}, "") + Object.keys(defaultState.s).reduce((a,x)=>{
    return a + x + defaultState.s[x]
}, "")
// const hash = 
const s = observable(defaultState)
window.s = s

const actions = {
    tick() {
        const now = new Date().getTime()
        const { start, work, paused, breakType } = s
        const pausedFor = now - (paused || now)
        const goal = (s.isWorking ? work : breakType) * 1000
        const time = goal - (now - pausedFor - start)
        if (time < 200) {
            s.isWorking = !s.isWorking
            s.start = now
            if (!(s.s.autobreak && !s.isWorking || s.s.autowork && s.isWorking)) {
                s.paused = now
            }
            if (s.isWorking) {
                s.sessions += 1
            }
            if (s.sessions > s.s.sessions) {
                s.sessions = 1
            }
            window.focus()
            this.notify(s.isWorking ? "Break Ended" : "Work Ended", "")
        }
        // s.timePercent = time/goal
        // log(s.timePercent)
        s.timeString = format(time, "mm:ss")
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
        } else {
            s.paused = now
        }
    },
    reset() {
        const now = new Date().getTime()
        s.paused = now
        s.start = now
        act.toggle("animationReflow")()
    },
    resetSessions() {
        s.sessions = 1
        this.reset()
    },
    toggle(key, setting) {
        if ((typeof s[key] == "undefined" && !setting) || (typeof s.s[key] == "undefined" && setting)){
            log("error")
            throw new Error(`${key} doesn't exist on ${setting}`)
        }
        if (key == "notifications") {
            return (val) => { s.s[key] = !s.s[key]; if (s.s[key])Push.Permission.request();}
        }
        if (setting){
            return (val) => { s.s[key] = !s.s[key] }
        }
        return (val) => { s[key] = !s[key] }
    },
    change(key, setting = false){
        if ((typeof s[key] == "undefined" && !setting) || (typeof s.s[key] == "undefined" && setting)){
            log("error")
            throw new Error(`${key} doesn't exist on ${setting}`)
        }
        if (setting){
            return (val)=>{s.s[key]=val.target.value}
        }
        return (val)=>{s[key]=val}
    },
    selectSound(field){
        return (ev)=>{
            const index = ev.target.value
            s[field] = index
            sounds[index].play()
        }
    },
    playSound(index){
        sounds[index].play()
    },
}

let act = {}
for (let a in actions) {
    act[a] = action((...args) => {
        return actions[a](...args)
    })
}
act.tick()
window.act = act

autorun(function notificationPermissions() {
    if (s.start && !s.paused && s.s.notifications) {
        Push.Permission.request()
    }
})

autorun(function volume() {
    Howler.volume(s.s.volume)
})

autorun(function changeTitle() {
    const base = "Pomodoro Timer - Tomato Timer"
    if (!s.paused) { window.document.title = s.timeString + " " + base }
    else { window.document.title = base }
})

reaction(() => s.sessions && s.isWorking, (data, reaction) => {act.toggle("animationReflow")()})

autorun(function tick() {
    let inter 
    console.log('starting tick tick')
    inter = setInterval(act.tick, 200)
})

autorun(function overflow(){
    const html = document.querySelector("html")
    if (s.timerModal){
        html.style.overflow = "hidden"
    } else {
        html.style.overflow = "auto"
    }
})

let saveNow = new Date().getTime()
var obsId = c.observe('save', function (val, oldVal) {
    // log('assign', 4)

    if (typeof val == "undefined") {
        // log("saving")
        c.set("save", toJS(s))
        return
    }
    // log('assign', 3)

    if (val.stamp == saveNow) return
    // log('assign', 2)

    if (s.ver == val.ver) {
        // log('assign', val)
        Object.assign(s, val)
    } else {

    }
})

autorun(function sync() {
    if (s.stamp == saveNow) return
    const state = toJS(s)
    // console.log("running")
    delete state.timeString
    saveNow = new Date().getTime()
    state.stamp = saveNow
    c.set("save", state)
})
// store.set("unloading", "window")

// window.onbeforeunload = function(){
//   store.set("active", s.active+1)
// }

window.addEventListener('beforeunload', (event) => {
    console.log(s.active)
    store.set("active", s.active + 1)
    event.returnValue = '';
    return
});

export { s, act, sounds, soundsNames }
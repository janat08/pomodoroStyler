import { toJS, autorun, observable, action } from 'mobx'
import hyperElement, { attachStore } from 'hyper-element'
import { format } from 'date-fns'
import Push from 'push.js'
import store from 'store'
import expire from 'store/plugins/expire'
import events from 'store/plugins/events'
import obs from 'store/plugins/observe'

import pomodoroPicture from '../Pomodoro-Timer.png'
import alarmwatch from "../sounds/alarmwatch.mp3"
import eAlarm from "../sounds/80sAlarm.mp3"
import alarmClock from "../sounds/alarmclock.mp3"
import ding from "../sounds/ding.mp3"
import doorbell from "../sounds/doorbell.mp3"

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

const sounds = [alarmwatch, eAlarm, alarmClock, ding, doorbell].map(genP)

const verId = 121111111
const now = new Date().getTime()
const defaultState = {
  ver: verId,
  start: now,
  work: 4, //60*25 //work
  break: 2,
  bigBreak: 5,
  isWorking: true,
  // start: null,
  paused: now,
  timeString: null,
  sessions: 0,
  notifications: [], //for closing upon interaction
  // sounds: sounds,
  bigBreakSound: 0,
  workSound: 1,
  breakSound: 2,
  s: {
    sessions: 2,
    autobreak: true,
    autowork: true,
    notifications: true,
    volume: 0.5,
  },
  get breakType() {
    if (s.s.sessions == s.sessions) {
      return s.bigBreak
    }
    return s.break
  },
  get names() {
    return this.name + 234
  },
}
const s = observable(defaultState)
window.s = s

const actions = {
  tick() {
    const now = new Date().getTime()
    const { start, work, paused, breakType } = s
    const pausedFor = now - (paused || now)
    const time = (s.isWorking ? work : breakType) * 1000 - (now - pausedFor - start)
    if (time <= 300) {
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
  },
  resetSessions() {
    s.sessions = 1
  },
  toggle(key) {
    if (key == "notifications" && !s[key]) {
      Push.Permission.request()
    }
    return () => { s[key] = !s[key] }
  }
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

autorun(function changeTitle() {
  const base = "Pomodoro Timer - Tomato Timer"
  if (!s.paused) { window.document.title = s.timeString + " " + base }
  else { window.document.title = base }
})

autorun(function tick() {
  setInterval(act.tick, 300)
})

autorun(function volume() {
  Howler.volume(s.s.volume)
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

document.registerElement("my-profile", class extends hyperElement {

  setup(attachStore) {
    autorun(attachStore(s));
  }// END setup

  render(Html, { names, timeString }) {
    Html`Profile: ${timeString} <br> <button onclick=${act.toggleStart}>sdf</button>
    <br> <button onclick=${act.paused}>pause</button> <button onclick=${act.resetSessions}>sessions</button>
    <button onclick=${act.reset}>reset</button>
    <img src="${pomodoroPicture}">
    ${s.sessions}`
  }// END render
})//END my-profile
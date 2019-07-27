import {toJS, autorun, observable, action} from 'mobx'
import hyperElement, {attachStore} from 'hyper-element'
import { format} from 'date-fns'
import Push from 'push.js'
import store from 'store'
import expire from 'store/plugins/expire'
import events from 'store/plugins/events'
import obs from 'store/plugins/observe'
import { localStored } from 'mobx-stored'
import _ from 'lodash'

store.addPlugin(events)
store.addPlugin(expire)
store.addPlugin(obs)
let c = store //cache
window.store = store
// const primary = c.get("primary")
// if (primary){
//   var obsId = c.observe('s', function(val, oldVal) {
//     Object.assign(s, val)
//   })
//   var obsId2 = c.observe('primary', function(val, oldVal) {
//     if (val = false){
//       Object.assign(s, newState)
//     }
//   })
// }

function notify(title, opts){
  if (s.s.notifications){
    Push(title, opts)
  }
}

//cached set
function setc(key, val, duration = 1000){
  store.set(key,val, new Date().getTime()+duration) //miliseconds to cache for
}
const old = c.get("save")
let id = c.get("id") || 0
id +=1
c.set("id", id)
const defaultState = {
  active: 0,
  id: id,
  ver: 1,
  start: true,
  count: 0,
  timer: 20, //60*25
  primary: true,
  s: {
    notifications: true
  }, 
  get timeString () {
    const {timer, count} = this
    const time = timer - count
    return format(new Date(time*1000), "mm:ss")
    // return `${minutes}:${seconds}`
  },
  get names () {
    return this.name +234
  }
}
const s = observable(defaultState)
window.s = s
const save = toJS(s)
if (c.get("save") && save.ver == old.ver){
  Object.assign(s, old)
} else {
  c.set("save", save)
}
// const {start, count, timer, timeString} = s
const actions = {
  tick() {
    const {count, timer} = s
    if (count === timer){
      s.count = 0
    } else {
      s.count += 1
    }
  },
  toggleStart(){
    s.start = !s.start
  },
  reset(){
    s.count = 0
    s.start = false
  },
  autoBreak(){
    s.autoBreak = !s.autoBreak
  },
}

// Push.create("Hello world!", {
//   body: "How's it hangin'?",
//   icon: '/icon.png',
//   timeout: 9000,
//   onClick: function () {
//       window.focus();
//       this.close();
//   }
// });

let act = {}
let stamp
function syncronize (func, a) {
  stamp = new Date()
  c.set("stateEvents", {ev: a, stamp: stamp})
  c.set("save", toJS(s))
  return func
}
for (let a in actions){
  act[a] = action((...args)=>{
    let res
    if (a == "tick"){
      res = _.throttle(syncronize(actions[a], a), 1000)(...args)
    } else {
      res = syncronize(actions[a], a)(...args)
    }
    return res
  })
}
var obsId = c.observe('stateEvents', function(val, oldVal) {
  if (typeof val == "undefined") return
  if (val.stamp == stamp) return
  console.log('running')
  act[val.ev]
})
window.act = act

act.autoBreak()

autorun(function notificationPermissions(){
  if (s.s.notifications){
    if (s.start){
      Push.Permission.request()
    }
    Push.Permission.request()
  }
})

autorun(()=>{
  const {start} = s
  let inter
  if (start){
    inter = setInterval(act.tick, 1000)
  } else if (!start && inter){
    window.clearInterval(inter);
    inter = null
  }
})
// store.set("unloading", "window")

window.onbeforeunload = function(){
  store.set("active", s.active+1)
}


document.registerElement("my-profile", class extends hyperElement{

  setup(attachStore){
    autorun(attachStore(s));
  }// END setup

  render(Html,{names, timeString}){
    Html`Profile: ${timeString}`
  }// END render
})//END my-profile
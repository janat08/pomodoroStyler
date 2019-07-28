import { toJS, autorun, observable, action } from 'mobx'
import hyperElement, { attachStore } from 'hyper-element'
import { format } from 'date-fns'
import Push from 'push.js'
import store from 'store'
import expire from 'store/plugins/expire'
import events from 'store/plugins/events'
import obs from 'store/plugins/observe'
import { localStored } from 'mobx-stored'
import _ from 'lodash'
import nanoid from 'nanoid'
function log(...args) {
  console.log(...args)
}


store.addPlugin(events)
store.addPlugin(expire)
store.addPlugin(obs)
let c = store //cache
window.store = store

function notify(title, opts) {
  // Push.create("Hello world!", {
  //   body: "How's it hangin'?",
  //   icon: '/icon.png',
  //   timeout: 9000,
  //   onClick: function () {
  //       window.focus();
  //       this.close();
  //   }
  // });

  if (s.s.notifications) {
    Push(title, opts)
  }
}

//cached set
function setc(key, val, duration = 1000) {
  store.set(key, val, new Date().getTime() + duration) //miliseconds to cache for
}
// const old = c.get("save")
function register() {
  let active = c.get("ids")
  let id = nanoid()
  if (!active) { active = new Set() }
  active.add(id)
  return id
}

let id = register()

const verId = 12
if (!ver()) { c.set("active", 1); c.set("id", 1); log('set') }
function ver() {
  const save = store.get("save")
  return save.ver == verId

}
const defaultState = {
  // active: active? 1,
  active: ver() ? active : 1,
  id: ver() ? id : 1,
  ver: verId,
  start: true,
  count: 0,
  timer: 20, //60*25
  s: {
    notifications: true
  },
  get timeString() {
    const { timer, count } = this
    const time = timer - count
    return format(new Date(time * 1000), "mm:ss")
    // return `${minutes}:${seconds}`
  },
  get names() {
    return this.name + 234
  },
  get primary() { return this.active == this.id }
}
const s = observable(defaultState)
window.s = s
const save = toJS(s)

const actions = {
  tick() {
    const { count, timer } = s
    if (count === timer) {
      s.count = 0
    } else {
      s.count += 1
    }
  },
  toggleStart() {
    s.start = !s.start
  },
  reset() {
    s.count = 0
    s.start = false
  },
  autoBreak() {
    s.autoBreak = !s.autoBreak
  },
}

let act = {}
let stamp
function syncronize(func, a) {
  stamp = new Date()
  c.set("stateEvents", { ev: a, stamp: stamp })
  return func
}
for (let a in actions) {
  act[a] = action((...args) => {
    syncronize(actions[a], a)
    if (!s.primary) {
      return () => { }
    }
    return actions[a]
  })
}
var primaryOb = c.observe('active', val => {
  c.active = val
})

var obsId = c.observe('stateEvents', function (val, oldVal) {
  if (typeof val == "undefined") return
  if (val.stamp == stamp) return
  // console.log('running')
  act[val.ev]
})
var obsId = c.observe('save', function (val, oldVal) {
  if (typeof val == "undefined") return
  if (s.primary) return
  if (save.ver == val.ver) {
    Object.assign(s, val, { active: active })
  } else {
    c.set("save", save)
  }
  // log("reassign")
  // Object.assign(s, val)
})
window.act = act

act.autoBreak()

autorun(function notificationPermissions() {
  if (s.s.notifications) {
    if (s.start) {
      Push.Permission.request()
    }
    Push.Permission.request()
  }
})

autorun(function tick() {
  const { start, primary } = s
  if (!primary) return
  let inter
  if (start) {
    inter = setInterval(act.tick, 1000)
  } else if (!start && inter) {
    window.clearInterval(inter);
    inter = null
  }
})

autorun(function tick() {
  c.set("save", toJS(s))
})
// store.set("unloading", "window")

// window.onbeforeunload = function(){
//   store.set("active", s.active+1)
// }
console.log(1, s.active)
// store.set("active", s.active+1)
console.log(2, store.get("active"))
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
    Html`Profile: ${timeString}`
  }// END render
})//END my-profile
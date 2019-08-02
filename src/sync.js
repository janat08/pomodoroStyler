/*
todo:
make nonexpire, and expire
mark actions complete, otherwise another primary takes over
there're no primary checks
replace autorun with something that cb after action completes with settimeout
id gets destructured into state with letter per field
features:
hashes defaultstate to force updates, and will force other tabs to update if new window is opened with recent version
no id duplicate checks

instructions:
enable strict, actions only
cache will reset if default state is changed
cache will not overwrite, or expire nonOverwrite
cache will not hash nonHash fields, modify defaultstate, and stuff
if you must force overwrite and version field in defaultState
nonhash only works on top level fields
diff nonOverwrite, to update with new fields
doesn't guard race conditions, and set is used throughout code instead of set https://github.com/marcuswestin/store.js/issues/302
has to have identifiable function.name or nameKey in actions
toJS shouldn't produce getter fields
*/
import nanoid from 'nanoid'
import store from 'store'
import expire from 'store/plugins/expire'
import observe from 'store/plugins/observe'
import operations from 'store/plugins/operations'

store.addPlugin(expire)
store.addPlugin(observe)
store.addPlugin(operations)

const log = console.log
// const c = store
let s
const original = store.get

/*
add race conditions checks
probably using promises
listen for separate unique name (like field+"very unique modifier") if item is about to be edited with event listeners/observe
and maybe start a que to edit that field
*/
// let c= {}
// function curry(field){
//     return (args)=>{
//         return store[field].apply(store, args)
//     }
// }

// window.addEventListener('storage', () => {

// });
// c.get = function(...args){
//     c.set(args[0], )
//     return get(args)
// }
// c.set = function(...args){
//     set(args)
// }
function initialize({ observable, autorun, toJS, actions, defaultState, nonHash = [], nonOverwrite = [], nonExpire = [], expire, noSync = [], timeout = 100 }) {
    const hash = makeHash(defaultState, nonHash)
    const nonOW = nonOverwriting(nonOverwrite, defaultState) //to not overwrite values when moving to new hash
    const { id, active, primary } = registerId(timeout)
    let s = observable(nonOW)
    s = setNewHashSave(hash, s, toJS) //to force other tabs to update if they have old keys/values/state, updates with oldest save
    Object.assign(s, { id }, { active }, { primary })
    const acts = actionsParse(actions, s)
    listenStorage(s, acts, hash)
    beginPublishingState(s, toJS, autorun, noSync.concat(["id", "active", "primary"]))
    removeActiveOnLeave(id, s)
    return { state: s, actions: acts }
}

function nonOverwriting(keys, state) {
    const original = c.get("save")
    if (!original) return state
    Object.keys(state).forEach((x, i) => {
        const val = original[x]
        if (keys.indexOf(x) != -1) {
            Object.assign(state[x], original[x])
        }
    })
    return state
}

function beginPublishingState(s, toJS, autorun, noSync) {
    autorun(function sync() {
        let active = c.get("active")
        if (s.primary) {
            log("sending state")
            var sS = toJS(s)
            noSync.forEach(x => {
                delete sS[x]
            })
            c.set("save", toJS(sS))
        }
        // c.set("save", toJS(s))
    })
}

function registerId(timeout) {

    const save = c.get('save')
    let id = nanoid()
    let active = store.get("active")
    //registering
    if (!active) { active = [] }
    active.push(id)
    c.set('active', active)
    var primary = active.length == 1
    console.log(active)


    // let index = val.length - 1
    // let last = val[index]
    // if (last.stamp == "complete") return
    // last.stamp = "complete"
    // c.set("event", val)

    setInterval(() => {
        const active = c.get('active')
        const ind = active.map(x => x.id).indexOf(id)
        const filtered = active[ind]
        if (filtered.stamp == "complete") {
            c.set(c.get('events').splice(ind, 1))
        } else {
            s.primary = true
            const active = c.get("active")
            const ind = active.indexOf(s.id)
            active.splice(ind, 1).unshift(s.id)
            c.set("active", active)
        }
    }, timeout)
    return { id, active, primary }
}

function makeHash(defaultState, nonHash) {
    const hash = Object.keys(defaultState).reduce((a, x) => {
        if (nonHash.indexOf(x) != -1) {
            console.log("skipping", x)
            return a
        }
        return a + x + JSON.stringify(defaultState[x])
    }, "")
    return hash
}

function setNewHashSave(currentHash, newSave, toJS) {
    let active = store.get("active")
    const hash = c.get("hash")
    const save = c.get("save")
    const nonGetter = toJS(newSave)
    const updated = currentHash != hash || !hash
    if (updated) {
        c.set("hash", currentHash)
        c.set("save", nonGetter)
        return newSave
    }
    const alone = active.length > 1
    if (alone && save) {
        Object.assign(newSave, save)
    } else if (alone && !save) {
        c.set('save', nonGetter)
    }
    return newSave
}

function actionsParse(cbs, s, timeout) {
    let result = {}
    for (let a in cbs) {
        let cb = cbs[a]
        cb.nameKey = a
        result[a] = handler(cb)
    }
    function handler(cb) {
        return function (...args) {
            if (s.primary) {
                cb(...args)
            } else {
                if (!s.primary && a != "tanimationReflow" && a !== "tick") console.log("sending", a)
                const a = cb.nameKey
                const eventId = nanoid()
                c.set('event', { a: a, args, id: eventId })
            }
        }
    }
    return result
}


function listenStorage(s, act, currentHash) {
    window.addEventListener('storage', () => {
        let hash = c.get("hash")
        if (currentHash != hash || !hash) {
            location.reload(true)
        }
        let active = c.get("active")
        let set = c.get("save")
        if (s.active.length != active.length) {
            s.active = active
        }
        if (s.active[0] == s.id) {
            s.primary = true
        }
        let val = c.get('event')
        if (!s.primary) {
            Object.assign(s, set)
        } else {
            console.log(val)
            act[val.a](...val.args)
        }

    });
}

//cached set
function setc(key, val, duration = 1000) {
    store.set(key, val, new Date().getTime() + duration) //miliseconds to cache for
}

function removeActiveOnLeave(id, s) {
    // window.setInterval(()=>{
    //     if(s.primary){

    //     } else {
    //         const order = s.active.indexOf(s.id)
    //         if (order == -1){
    //             //reregister
    //         }
    //         const previous = order-1
    //         c.set(s.active[previous], false)
    //     }
    //     c.set("activePoll")
    // })
    window.addEventListener('beforeunload', (event) => {

        let active = store.get('active')
        active.splice(active.indexOf(id), 1)
        store.set('active', active)
        return
    });
}
export { initialize }
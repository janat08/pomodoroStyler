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
// const c = stor
let s
const original = store.get

/*
add race conditions checks
probably using promises
listen for separate unique name (like field+"very unique modifier") if item is about to be edited with event listeners/observe
and maybe start a que to edit that field
*/
let c = {}
function curry(field) {
    return (...args) => {
        return store[field].apply(store, args)
    }
}
const get = curry("get")
const set = curry("set")
const each = curry("each")

window.addEventListener('storage', () => {

});
const overlap = {
    get: function (...args) {
        // c.set(args[0])
        return get(...args)
    },
    set: function (...args) {
        set(...args)
    }
}
c.get = function (args) {
    // c.set(args[0])
    return get(args)
}
c.set = function (args) {
    set(args)
}
c.each = store.each
function setRemoveActiveId(timeout) {
    return (value, key) => {
        if (key && value && key.indexOf('timeForSync') != -1) {
            const id = key.slice(0, -11)
            const active = c.get("active").filter(x => x != id)
            const diff = new Date().getTime() - value
            console.log(diff, timeout, key)
            if (diff > timeout) {
                console.log("removing", key)
                c.remove(key)
                console.log("actives", active)
                c.set('active', active)
            }
        }
    }
}
let removeActiveId
function initialize({ observable, autorun, toJS, actions, defaultState, nonHash = [], nonOverwrite = [], nonExpire = [], expire, noSync = [], timeout = 1000 }) {
    removeActiveId = setRemoveActiveId(timeout)
    const hash = makeHash(defaultState, nonHash)
    const nonOW = nonOverwriting(nonOverwrite, defaultState) //to not overwrite values when moving to new hash
    const { id, active, primary } = registerId(timeout)
    let s = observable(nonOW)
    // setNewHashSave(hash, s, toJS) //to force other tabs to update if they have old keys/values/state, updates with oldest save
    Object.assign(s, { id }, { active }, { primary }, setNewHashSave(hash, s, toJS))
    const acts = actionsParse(actions, s)
    listenStorage(s, acts, hash, timeout)
    beginPublishingState(s, toJS, autorun, noSync.concat(["id", "active", "primary"]))
    removeActiveOnLeave(id, s)
    console.log('primary', s.primary, primary, s.id, toJS(s.active))
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
    autorun(function sync(...args) {
        if (s.primary) {
            log("sending state", ...args)
            var sS = toJS(s)
            noSync.forEach(x => {
                delete sS[x]
            })
            // sS.lastUpdate = new Date().getTime()
            c.set("save", toJS(sS))
        }
        // c.set("save", toJS(s))
    })
}

function registerId(timeout) {
    const id = nanoid()
    let active = store.get("active")
    //registering
    if (!active) { active = [] }
    active.push(id)
    c.set('active', active)
    var primary = active[0] == id

    //clear crashed ids
    // c.each(removeActiveId)

    setInterval(() => {
        c.set(id + "timeForSync", new Date().getTime())
    }, (timeout / 2))
    return { id, active, primary }
}

function makeHash(defaultState, nonHash) {
    const hash = Object.keys(defaultState).reduce((a, x) => {
        if (nonHash.indexOf(x) != -1) {
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

function actionsParse(cbs, s) {
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
                const a = cb.nameKey
                if (!s.primary && a != "tanimationReflow" && a !== "tick") console.log("sending", a)

                const eventId = nanoid()
                c.set('event', { a: a, args, id: eventId })
            }
        }
    }
    return result
}

let lastId
let clearedAgan = false
function listenStorage(s, act, currentHash, timeout) {
    const timeouts = {}
    window.addEventListener('storage', (event) => {
        if (!clearedAgan) {
            // c.each(removeActiveId)
            clearedAgan = true
        }
        const key = event.key
        const val = event.newValue
        let primary = s.primary
        if (event.key.indexOf("timeForSync") != -1) {
            clearTimeout(timeouts[key])
            timeouts[key] = setTimeout(removeActiveId, timeout * 2)
            return
        }
        switch (key) {
            case 'hash':
                if (currentHash != val) {
                    location.reload(true)
                }
                break;
            case 'active':
                if (s.active.length != val.length) {
                    s.active = val
                }
                if (s.active[0] == s.id) {
                    s.primary = true
                } else {
                    s.primary = false
                }
                break;
            case 'event':
                if (val && primary) {
                    console.log("event", val)
                    act[val.a](...val.args)
                }
                break;
            case 'save':
                if (!primary) {
                    console.log("save")
                    Object.assign(s, val)
                }
                break;
        }
    });
}

//cached set
function setc(key, val, duration = 1000) {
    store.set(key, val, new Date().getTime() + duration) //miliseconds to cache for
}

function removeActiveOnLeave(id, s) {
    window.addEventListener('beforeunload', (event) => {

        let active = store.get('active')
        active.splice(active.indexOf(id), 1)
        store.set('active', active)
        return
    });
}
export { initialize }
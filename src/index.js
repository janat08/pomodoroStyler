import m from "mithril"
import O from "patchinko/immutable"
import stream from "mithril/stream"

import { app, App } from "./app"

const tokenService = {
  initial() {
    return {
      timer: 0
    };
  },
  service(state) {
    return {

    }
  }
};

const services = [
  tokenService,
]

const service = state => services
  .map(s => s.service)
  .reduce((x, f) => P(x, f(x)), state);


const combinedInit = O({},
  app.Initial(),
  services
    .map(s => s.initial(state))
    .reduce((a, x) => {
      return O(a, x)
    })
)

const update = stream()
const states = stream.scan(O, combinedInit, update).map((state) => {
  return service(state)
})

setInterval(() => {
  update({ timer: states().timer + 1 })
}, 1000)

// Only for using Meiosis Tracer in development.
require("meiosis-tracer")({ selector: "#tracer", rows: 25, streams: [states] })

const actions = app.Actions(update)

m.mount(document.getElementById("app"), {
  view: () => m(App, { state: states(), actions })
})

states.map(() => m.redraw())

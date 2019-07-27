import m from "mithril"
import b from "bss"
import View from "./view"
import { conditions, Conditions } from "../conditions"
import { timer } from "../timer"
// import { dateTime, DateTime } from "../dateTime"
// import { temperature, Temperature } from "../temperature"

import "polythene-css/dist/polythene.css"
import "polythene-css/dist/polythene-typography.css"

export const app = {
    Initial: () => Object.assign({}, conditions.Initial(), timer.Initial()),

    Actions: update =>
        Object.assign(
            {},
            conditions.Actions(update),
            timer.Actions(update),
            // dateTime.Actions(update),
            // temperature.Actions(update)
        )
}

export const App = {
    view: View
    // m(
    //   "div",
    //   m(
    //     "div" +
    //       b
    //         .f("left")
    //         .w("40%")
    //         .pr(40),
    //     m(DateTime, { state, actions })
    //   ),
    //   m("div" + b.f("left"), m(Conditions, { state, actions }), m(Temperature, { state, actions }))
    // )
}

import m from "mithril"
import b from "bss"
import { Checkbox, RadioGroup } from "polythene-mithril"

const timer = {
    Actions: update => ({
        togglePrecipitations: value => update({ conditions: O({ precipitations: value }) }),

        changeSky: value => update({ conditions: O({ sky: value }) })
    }),
    Initial: () => ({
        timer: 0
    }),
}

const Timer = {
    view: ({ attrs: { state, actions } }) => {
        return (
            <div id="modal-image" class="modal modal-full-screen">
                <div class="modal-background"></div>
                <div class="modal-content modal-card">
                    <header class="modal-card-head" style="padding: 0">
                        <p class="modal-card-title responsive-padding">3/4;Working</p>
                        <button class="modal-button-close is-large delete" aria-label="close"></button>
                    </header>
                    <section class="modal-card-body modal-background-colored">
                        <div class="modal-content-colored">
                            <span class="time-code" style="font-size: 35vmin; ">{state.timer}</span>
                        </div>
                    </section>
                    <footer class="modal-card-foot" style="padding: 0">
                        <a href="#" class="card-footer-item responsive-padding tooltip" data-tooltip="Pause" aria-label="pause">Pause</a>
                        <a href="#" class="card-footer-item responsive-padding tooltip" data-tooltip="Reset" aria-label="reset">Reset</a>
                        <a href="#" class="card-footer-item responsive-padding tooltip" data-tooltip="Fullscreen" data-toggle-fullscreen aria-label="fullscreen">fullscreen</a>
                        <a href="#" class="card-footer-item responsive-padding modal-button-close tooltip" data-tooltip="Close" aria-label="close">Close</a>
                    </footer>
                </div>
            </div>
        )
    }
}

export { Timer, timer }
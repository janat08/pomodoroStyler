import { autorun} from 'mobx'
import hyperElement from 'hyper-element'
import {act, go, s} from "./store"


document.registerElement("timer-modal", class extends hyperElement {

    setup(attachStore) {
      autorun(attachStore(s));
    }// END setup
    // animationReflow = 0

    render(render, all) {

      render`<div id="modal-image" class=${"modal modal-full-screen "+ (s.timerModal? 'is-active': '')}>
                <div class=" modal-background"></div>
<div class="modal-content modal-card">
  <header class="modal-card-head" style="padding: 0">
    <p class="modal-card-title responsive-padding">${s.sessions}/${s.s.sessions}:${s.isWorking?"Work":"Break"}</p>
    <button onclick=${go.h} class="modal-button-close is-large delete" aria-label="close"></button>
  </header>
  <section class="modal-card-body" style=${`animation: ${s.animationDuration} linear ${s.animationReflow? "slide"
    : "slideCopy" }; animation-play-state: ${s.paused? "paused" : "running" }`}>
    <div class="modal-content-colored">
      <span class="time-code" style="font-size: 35vmin; ">${s.timeString}</span>
    </div>
  </section>
  <footer class="modal-card-foot" style="padding: 0">
    <a onclick=${act.toggleStart} class="positive2 card-footer-item responsive-padding tooltip" data-tooltip="Pause"
      aria-label="pause">${s.paused?"Start":"Pause"}</a>
    <a onclick=${act.reset} class="positive3 card-footer-item responsive-padding tooltip" data-tooltip="Reset Time"
      aria-label="reset time">Reset</a>
    <a data-toggle-fullscreen class="positive4 card-footer-item responsive-padding tooltip" data-tooltip="Fullscreen"
      aria-label="fullscreen">FullScreen</a>
    <a onclick=${go.h} class="positive5 card-footer-item responsive-padding modal-button-close tooltip"
      data-tooltip="Close the timer" aria-label="Close the Timer">Close</a>
    <a onclick=${act.resetSessions} class="positive6 card-footer-item responsive-padding modal-button-close tooltip"
      data-tooltip="Reset Sessions Count" aria-label="reset session">Restart</a>
    <div class="dropdown negative6 is-right is-up is-hoverable card-footer-item responsive-padding">
      <div class="dropdown-trigger">
        <a style="" class="card-footer-item" aria-haspopup="true" aria-controls="dropdown-menu7">
          <span style="margin-right: 5px">Menu</span>
          <svg style="width:24px;height:24px" aria-hidden="true" focusable="false" data-prefix="fas"
            data-icon="angle-up" class="svg-inline--fa fa-angle-up fa-w-10" role="img"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
            <path fill="currentColor"
              d="M177 159.7l136 136c9.4 9.4 9.4 24.6 0 33.9l-22.6 22.6c-9.4 9.4-24.6 9.4-33.9 0L160 255.9l-96.4 96.4c-9.4 9.4-24.6 9.4-33.9 0L7 329.7c-9.4-9.4-9.4-24.6 0-33.9l136-136c9.4-9.5 24.6-9.5 34-.1z">
            </path>
          </svg>
        </a>
      </div>
      <div class="dropdown-menu" id="dropdown-menu7" role="menu">
        <div class="dropdown-content">
          <a onclick=${act.toggleStart} class="negative2 dropdown-item"
            aria-label="pause">${s.paused?"Start":"Pause"}</a>
          <a onclick=${act.reset} class="negative3 dropdown-item" aria-label="reset">Reset</a>
          <a data-toggle-fullscreen class="negative4 dropdown-item" aria-label="fullscreen">FullScreen</a>
          <a onclick=${go.h} class="negative5 dropdown-item" aria-label="close">Close</a>
          <a onclick=${act.resetSessions} class="negative6 dropdown-item" aria-label="reset session">Restart/reset Sessions</a>
        </div>
      </div>
    </div>
    </a>

  </footer>
</div>
</div>
<div>
</div>`
    }// END render
  })//END my-profile

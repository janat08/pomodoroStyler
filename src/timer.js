import { autorun} from 'mobx'
import hyperElement from 'hyper-element'
import {act, s} from "./store"
import {go} from './router'
import {openWin} from './root'
import m from "mithril"


function TimerModal (){
  return {
    view: ()=>{
    const animationStyle = {
      animation: `${s.animationDuration} linear ${s.animationReflow? "slide"
    : "slideCopy" }`,
     "animation-play-state": s.paused? "paused" : "running",
      overflow: "hidden",
      height:"100%"
    }

    return (
      <div>

      <div class={"modal modal-full-screen "+ (s.timerModal? 'is-active': '')}>
      <div class=" modal-background"></div>

      <div class="modal-content modal-card positive-max">
  <header class="modal-card-head" style="padding: 0; display: flex; align-items:center; justify-content: center; height: 100%">
    <p class="modal-card-title responsive-padding">{s.timeString}-<span class="" title={s.isWorking?"Work":"Break"}>{s.isWorking?"W":"B"}</span>-  
  <a onclick={act.toggleStart} class="" data-tooltip="Pause"
      aria-label="pause">{s.paused?"Start":"Pause"}</a>-
      <a onclick={()=>{if (window.opener == null) openWin(210, 200); window.resizeTo(210, 200)}}>
      <svg style="height: 20px;  vertical-align: middle;
" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="expand" class="svg-inline--fa fa-expand fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M0 180V56c0-13.3 10.7-24 24-24h124c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H64v84c0 6.6-5.4 12-12 12H12c-6.6 0-12-5.4-12-12zM288 44v40c0 6.6 5.4 12 12 12h84v84c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12V56c0-13.3-10.7-24-24-24H300c-6.6 0-12 5.4-12 12zm148 276h-40c-6.6 0-12 5.4-12 12v84h-84c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h124c13.3 0 24-10.7 24-24V332c0-6.6-5.4-12-12-12zM160 468v-40c0-6.6-5.4-12-12-12H64v-84c0-6.6-5.4-12-12-12H12c-6.6 0-12 5.4-12 12v124c0 13.3 10.7 24 24 24h124c6.6 0 12-5.4 12-12z"></path></svg>
      </a></p>
  </header>
  
</div>


<div class="modal-content modal-card negative-max">
  <header class="modal-card-head" style="padding: 0">
    <p class="modal-card-title responsive-padding">{s.sessions}/{s.s.sessionsLen}:{s.sessionsDaily}:{s.isWorking?"Work":"Break"}</p>
    <button onclick={go.h} class="modal-button-close is-large delete" aria-label="close"></button>
  </header>
  <section class="modal-card-body" style={animationStyle}>
    <div class="modal-content-colored">
      <span class="time-code" style="font-size: 35vmin; ">{s.timeString}</span>
    </div>
  </section>
  <footer class="modal-card-foot" style="padding: 0">
    <a onclick={act.toggleStart} class="positive2 card-footer-item responsive-padding tooltip" data-tooltip="Pause"
      aria-label="pause">{s.paused?"Start":"Pause"}</a>
    <a onclick={act.reset} class="positive3 card-footer-item responsive-padding tooltip" data-tooltip="Reset Time"
      aria-label="reset time">Reset</a>
    <a data-toggle-fullscreen class="positive4 card-footer-item responsive-padding tooltip" data-tooltip="Fullscreen"
      aria-label="fullscreen">FullScreen</a>
    <a onclick={go.h} class="positive5 card-footer-item responsive-padding modal-button-close tooltip"
      data-tooltip="Close the timer" aria-label="Close the Timer">Close</a>
    <a onclick={act.resetSessions} class="positive6 card-footer-item responsive-padding modal-button-close tooltip"
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
          <a onclick={act.toggleStart} class="negative2 dropdown-item"
            aria-label="pause">{s.paused?"Start":"Pause"}</a>
          <a onclick={act.reset} class="negative3 dropdown-item" aria-label="reset">Reset</a>
          <a data-toggle-fullscreen class="negative4 dropdown-item" aria-label="fullscreen">FullScreen</a>
          <a onclick={go.h} class="negative5 dropdown-item" aria-label="close">Close</a>
          <a onclick={act.resetSessions} class="negative6 dropdown-item" aria-label="reset session">Restart/reset Sessions</a>
        </div>
      </div>
    </div>

  </footer>
</div>
    </div>
      </div>
    )
  }
}
}


  export {TimerModal}
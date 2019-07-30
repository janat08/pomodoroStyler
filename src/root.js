import { autorun } from 'mobx'
import hyperElement from 'hyper-element'
import { act, s, sounds, soundsNames } from "./store"
import pomodoroPicture from '../Pomodoro-Timer.png'
import { go } from './router'
import Push from 'push.js'

document.registerElement("generate-sound-select", class extends hyperElement {
    setup(attachStore) {
        autorun(attachStore(s));
    }// END setup

    render(render, all) {
        const options = sounds
        const { kind, field } = this.attrs
        render`<div class="field is-horizontal">
    <div class="field-label">
        <label class="label">${kind}</label>
    </div>
    <div class="field-body">
        <div class="field">
            <div class="control">
                <div class="select">
                    <select oninput=${act.selectSound(field)}>
                        ${options.map((sound, i) => render.wire(sound, `:${kind}`)`
                            <option value=${i} selected=${s[field] == i ? true : false}>${soundsNames[i]}</option>
                        `)}
                    </select>
                </div>
            </div>
        </div>
    </div>
</div>`
    }// END render
})//END my-profile


document.registerElement("root-app", class extends hyperElement {
    setup(attachStore) {
        autorun(attachStore(s));
    }// END setup

    render(render, all) {
        render`
        <div style=${""}>
        <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
        <a class="navbar-item" onclick=${go.h}>
            <img src=${pomodoroPicture} />
        </a>

        <a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false"
            data-target="navbarBasicExample">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
        </a>
    </div>

    <div id="navbarBasicExample" class="navbar-menu">
        <div class="navbar-start">
            <a class="navbar-item" target="_blank" href="https://francescocirillo.com/pages/pomodoro-technique">
                Why/How
            </a>
            <a class="navbar-item" target="_blank"
                href="https://zenkit.com/collections/FlmmRXn_2/views/fSZLd18WB?rfsn=2890035.bfe37d">
                Features
            </a>
            <a class="navbar-item" target="_blank"
                href="https://zenkit.com/collections/FlmmRXn_2/views/eneQ2s6ON?rfsn=2890035.bfe37d">
                Roadmap
            </a>
        </div>
    </div>
</nav>
<section class="hero is-primary">
    <div class="hero-body">
        <div class="container">
            <h1 class="title">
                Pomodoro Timer
            </h1>
            <h2 class="subtitle">
                Time and track your 25 minute sessions
            </h2>
            <button class="button modal-button open-modal is-medium is-danger is-outlined" onclick=${go.t}>
                <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                    <path style="fill:#363636"
                        d="M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3" />
                </svg>
                Begin/open
                Work/Break 25min
            </button>
            <button class="button modal-button open-modal is-medium" data-target="modal-image"
                onclick="window.open(document.URL+'timer', '_blank', 'location=no,height=230,width=200,scrollbars=no,status=no');">
                <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                    <path style="fill:#363636"
                        d="M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3" />
                </svg>
                Start in standalone minimal window
            </button>
        </div>
    </div>
</section>
<section class="content">
    <h2>Introduction</h2>
    <p>
        Pomodoro technique has a bunch of benefits, but my personal ones are that it lets you not sit at the
        computer non-stop, and practice diffuse mind mode although officially you're not meant to think about work.
        The gist of practice is that you segment your work time with short breaks after 4 of which you take a longer
        one. You're meant to have healthy todo list, for which I recommend <a
            href="https://zenkit.com/?rfsn=2890035.bfe37d">zenkit</a>. Learn more at Why/How page.
    </p>
</section>
<div id="monitizationNotificaiton" class="notification">
    I don't have ads, but there's monetization that adblocker will interfere with (affiliate links, opt-in mining).
</div>
<timer-modal></timer-modal>

<section class="accordions">
    <article class="accordion">
        <div class="accordion-header toggle">
        <svg style="width:24px;height:24px;margin-right:10px" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="sliders-h" class="svg-inline--fa fa-sliders-h fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M496 384H160v-16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h80v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h336c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0-160h-80v-16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h336v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h80c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0-160H288V48c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16C7.2 64 0 71.2 0 80v32c0 8.8 7.2 16 16 16h208v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h208c8.8 0 16-7.2 16-16V80c0-8.8-7.2-16-16-16z"></path></svg>
            Settings and Options
        </div>
        <div class="accordion-body">
            <div class="accordion-content">
                <div class="field is-horizontal">
                    <div class="field-label is-normal">
                        <label class="label">Break duration</label>
                    </div>
                    <div class="field-body">
                        <div class="field">
                            <p class="control is-expanded">
                                <input oninput=${act.change("break")} class="input" type="text" placeholder=${s.break}/>
                            </p>
                        </div>
                    </div>
                </div>
                <div class="field is-horizontal">
                    <div class="field-label is-normal">
                        <label class="label">Long break duration</label>
                    </div>
                    <div class="field-body">
                        <div class="field">
                            <p class="control is-expanded">
                                <input oninput=${act.change("bigBreak")} class="input" type="text" placeholder=${s.bigBreak}/>
                            </p>
                        </div>
                    </div>
                </div>
                <div class="field is-horizontal">
                    <div class="field-label is-normal">
                        <label class="label">Work duration</label>
                    </div>
                    <div class="field-body">
                        <div class="field">
                            <p class="control is-expanded">
                                <input oninput=${act.change("work")} class="input" type="text" placeholder=${s.work}/>
                            </p>
                        </div>
                    </div>
                </div>
                <div class="field is-horizontal">
                    <div class="field-label is-normal">
                        <label class="label">Session length</label>
                    </div>
                    <div class="field-body">
                        <div class="field">
                            <p class="control is-expanded">
                                <input oninput=${act.change("sessions", 1)} class="input" type="text" placeholder=${s.s.sessions}/>
                            </p>
                            <p class="help">number of work cycles before big break</p>
                        </div>
                    </div>
                </div>
                <div class="field is-horizontal">
                    <div class="field-label">
                        <label class="label">Autostart break</label>
                    </div>
                    <div class="field-body">
                        <div class="field">
                            <div class="control is-narrow">
                                <label class="checkbox">
                                    <input oninput=${act.toggle("autobreak", 1)} type="checkbox" checked=${s.s.autobreak}/>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="field is-horizontal">
                    <div class="field-label">
                        <label class="label">Autostart work</label>
                    </div>
                    <div class="field-body">
                        <div class="field">
                            <div class="control is-narrow">
                                <label class="checkbox">
                                    <input oninput=${act.toggle("autowork", 1)} type="checkbox" checked=${s.s.autowork}/>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <generate-sound-select kind="Work end sound" field="workSound"></generate-sound-select>
                <generate-sound-select kind="Break end sound" field="breakSound"></generate-sound-select>
                <generate-sound-select kind="Big break end sound" field="bigBreakSound"></generate-sound-select>
                <div class="field is-horizontal">
                    <div class="field-label">
                        <label class="label">Alarm volume</label>
                    </div>
                    <div class="field-body">
                        <div class="field">
                            <p class="control is-expanded">
                                <input oninput=${act.change("volume", 1)} class="input" type="text" placeholder=${s.s.volume}/>
                            </p>
                        </div>
                    </div>
                </div>
                <div class="field is-horizontal">
                    <div class="field-label">
                        <label class="label">Allow notifications</label>
                    </div>
                    <div class="field-body">
                        <div class="field">
                            <p class="control is-expanded">
                                <input oninput=${act.toggle("notifications", 1)} type="checkbox" checked=${s.s.notifications}/> ${Push.Permission.has() ? "Browser permits notifications" : "Browser is blocking notifications, unblock if requests are blocked, toggle to grant permissions"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </article>
    <article class="accordion">
        <div class="accordion-header toggle">
        <svg style="width:24px;height:24px;margin-right:10px" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="donate" class="svg-inline--fa fa-donate fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 416c114.9 0 208-93.1 208-208S370.9 0 256 0 48 93.1 48 208s93.1 208 208 208zM233.8 97.4V80.6c0-9.2 7.4-16.6 16.6-16.6h11.1c9.2 0 16.6 7.4 16.6 16.6v17c15.5.8 30.5 6.1 43 15.4 5.6 4.1 6.2 12.3 1.2 17.1L306 145.6c-3.8 3.7-9.5 3.8-14 1-5.4-3.4-11.4-5.1-17.8-5.1h-38.9c-9 0-16.3 8.2-16.3 18.3 0 8.2 5 15.5 12.1 17.6l62.3 18.7c25.7 7.7 43.7 32.4 43.7 60.1 0 34-26.4 61.5-59.1 62.4v16.8c0 9.2-7.4 16.6-16.6 16.6h-11.1c-9.2 0-16.6-7.4-16.6-16.6v-17c-15.5-.8-30.5-6.1-43-15.4-5.6-4.1-6.2-12.3-1.2-17.1l16.3-15.5c3.8-3.7 9.5-3.8 14-1 5.4 3.4 11.4 5.1 17.8 5.1h38.9c9 0 16.3-8.2 16.3-18.3 0-8.2-5-15.5-12.1-17.6l-62.3-18.7c-25.7-7.7-43.7-32.4-43.7-60.1.1-34 26.4-61.5 59.1-62.4zM480 352h-32.5c-19.6 26-44.6 47.7-73 64h63.8c5.3 0 9.6 3.6 9.6 8v16c0 4.4-4.3 8-9.6 8H73.6c-5.3 0-9.6-3.6-9.6-8v-16c0-4.4 4.3-8 9.6-8h63.8c-28.4-16.3-53.3-38-73-64H32c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32h448c17.7 0 32-14.3 32-32v-96c0-17.7-14.3-32-32-32z"></path></svg>
            <p>Donations and Tips</p>
        </div>
        <div class="accordion-body">
            <div class="accordion-content">
                <p>This service is ad free, and private. There're no serius maintenance costs, except for my living.
                </p>
                Monthly:
                <a href="https://www.patreon.com/bePatron?u=8723710"
                    data-patreon-widget-type="become-patron-button">Become a Patron!</a>

                One-time:
                <a class="button" href="https://paypal.me/ermonjas?locale.x=en_US">
                    <span class="icon is-small">
                    <svg style="width:24px;height:24px" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="paypal" class="svg-inline--fa fa-paypal fa-w-12" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M111.4 295.9c-3.5 19.2-17.4 108.7-21.5 134-.3 1.8-1 2.5-3 2.5H12.3c-7.6 0-13.1-6.6-12.1-13.9L58.8 46.6c1.5-9.6 10.1-16.9 20-16.9 152.3 0 165.1-3.7 204 11.4 60.1 23.3 65.6 79.5 44 140.3-21.5 62.6-72.5 89.5-140.1 90.3-43.4.7-69.5-7-75.3 24.2zM357.1 152c-1.8-1.3-2.5-1.8-3 1.3-2 11.4-5.1 22.5-8.8 33.6-39.9 113.8-150.5 103.9-204.5 103.9-6.1 0-10.1 3.3-10.9 9.4-22.6 140.4-27.1 169.7-27.1 169.7-1 7.1 3.5 12.9 10.6 12.9h63.5c8.6 0 15.7-6.3 17.4-14.9.7-5.4-1.1 6.1 14.4-91.3 4.6-22 14.3-19.7 29.3-19.7 71 0 126.4-28.8 142.9-112.3 6.5-34.8 4.6-71.4-23.8-92.6z"></path></svg>
                    </span>
                    <span>Paypal.me</span>
                </a>
                <br />
                Pay for what you use:
                <br />
                Mining doesn't add up to a lot in electricity consumption, or value generated. It's roughly 15$
                if running 24/7 for a month, of which I get over 50%.
            </div>
        </div>
    </article>
</section>

<footer class="footer">
    <div class="content has-text-centered">
        <p><a target="_blank" href="static/privacyPolicy.html">Privacy Policy v1</a></p>
        <p><a href="mailto:jey.and.key@gmail.com">jey.and.key@gmail.com</a></p>
        <p><a target="_blank" href="https://fontawesome.com/license">Made with Font Awesome</a></p>
    </div>
</footer>
    </div>`
    }// END render
})//END my-profile

document.body.addEventListener('keyup', function (e) {
    console.log(123123)
    if (e.key == "Escape") {
        if (s.timerModal) {
            go.h()
        } else {
            go.t()
        }
    }
});
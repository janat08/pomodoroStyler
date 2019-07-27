import m from "mithril"
import {Timer} from "../timer/index.js"
export default  ({ attrs: { state, actions } }) =>
(
    <div>
        <div class="pageloader"><span class="title">loading right until before you quit on me <br />your second load will be
    much faster</span></div>
        <nav class="navbar" role="navigation" aria-label="main navigation">
            <div class="navbar-brand">
                <a class="navbar-item" href="/">
                    <img src="/Pomodoro-Timer.png" />
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
                    <a class="navbar-item is-active" href="/">
                        Timer
        </a>
                    <a class="navbar-item" target="_blank" href="https://francescocirillo.com/pages/pomodoro-technique">
                        Why/How
        </a>
                    <a class="navbar-item" target="_blank"
                        href="https://zenkit.com/collections/FlmmRXn_2/views/fSZLd18WB?rfsn=2890035.bfe37d">
                        22 Features
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
                    <button class="button modal-button open-modal is-medium is-danger is-outlined"
                        data-target="modal-image">
                        <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                            <path style="fill:#363636"
                                d="M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3" />
                        </svg>
                        Begin/open
                        Work/Break 25min
        </button>
                    <button class="button modal-button open-modal is-medium" data-target="modal-image"
                        onclick="window.open(document.URL, '_blank', 'location=no,height=200,width=180,scrollbars=no,status=no');">
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
<Timer state={state} actions={actions}></Timer>

        <section class="accordions">
            <article class="accordion is-active">
                <div class="accordion-header toggle">
                    <i class="fas fa-sliders-h"></i>Settings and Options
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
                                        <input class="input" type="text" />
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
                                        <input class="input" type="text" />
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
                                        <input class="input" type="text" />
                                    </p>
                                    <p class="help">number of work cycles before big break</p>
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
                                        <input class="input" type="text" />
                                    </p>
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
                                            <input type="checkbox" />
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
                                            <input type="checkbox" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="field is-horizontal">
                            <div class="field-label">
                                <label class="label">Alarm sound</label>
                            </div>
                            <div class="field-body">
                                <div class="field">
                                    <div class="control">
                                        <div class="select">
                                            <select>
                                                <option>80s Alarm</option>
                                                <option>Alarm Clock</option>
                                                <option>Wristwatch Alarm</option>
                                                <option>Elevator Ding</option>
                                                <option>Door Bell</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="field is-horizontal">
                            <div class="field-label">
                                <label class="label">Alarm volume</label>
                            </div>
                            <div class="field-body">
                                <div class="field">
                                    <p class="control is-expanded">
                                        <input class="input" type="text" />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </section>
        <article class="accordion">
            <div class="accordion-header toggle">
                <i class="fas fa-donate"></i>
                <p>Donations and Tips</p>
            </div>
            <div class="accordion-body">
                <div class="accordion-content">
                    <p>This service is ad free, and private. There're no serius maintenance costs, except for my living. </p>
                    Monthly:
            <a href="https://www.patreon.com/bePatron?u=8723710"
                        data-patreon-widget-type="become-patron-button">Become a Patron!</a>

                    One-time:
            <a class="button" href="https://paypal.me/ermonjas?locale.x=en_US">
                        <span class="icon is-small">
                            <i class="fab fa-paypal"></i>
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
        <footer class="footer">
            <div class="content has-text-centered">
                <p><a href="">Privacy Policy</a></p>
                <p><a href="mailto:jey.and.key@gmail.com">jey.and.key@gmail.com</a></p>
            </div>
        </footer>
    </div >
)
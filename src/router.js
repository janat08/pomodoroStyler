import { act, s } from "./store"
import Navigo from 'navigo'

var root = null;
var useHash = false; // Defaults to: false
var hash = '#!'; // Defaults to: '#'
var router = new Navigo(root, useHash, hash);

const go = {
  h: () => router.navigate('/'),
  t: () => router.navigate('/timer')
}

if (s.local) {
  router
    .on('/timer', function () {
      act.ctimerModal(true)
    })
    .resolve();

  router
    .on(function () {
      act.ctimerModal(false)
    })
    .resolve();
} else {
  router
    .on('/timer', function () {
      act.timerModal = true
    })
    .resolve();

  router
    .on(function () {
      act.timerModal = false
    })
    .resolve();
}


export { go }
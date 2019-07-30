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

router
  .on('/timer', function () {
    s.timerModal = true
  })
  .resolve();

router
  .on(function () {
    s.timerModal = false
  })
  .resolve();

export {go}
import variables from './variables.scss'
import bulmaAccordion from 'bulma-extensions/bulma-accordion/dist/js/bulma-accordion'
// import loader from 'bulma-extensions/bulma-pageloader/dist/css/'
import "./src"



if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
} else if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/static/sw.js')
    .then(function () {
      console.log('Service Worker Registered');
    });
}

document.addEventListener('click', function (event) {
  // Ignore clicks that weren't on the toggle button
  if (!event.target.hasAttribute('data-toggle-fullscreen')) return;

  // If there's an element in fullscreen, exit
  // Otherwise, enter it
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
}, false);

document.addEventListener("DOMContentLoaded", function (event) {
  bulmaAccordion.attach()
});

////////////navbar
document.addEventListener('DOMContentLoaded', () => {

  // Get all "navbar-burger" elements
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

  // Check if there are any navbar burgers
  if ($navbarBurgers.length > 0) {

    // Add a click event on each of them
    $navbarBurgers.forEach(el => {
      el.addEventListener('click', () => {

        // Get the target from the "data-target" attribute
        const target = el.dataset.target;
        const $target = document.getElementById(target);

        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        el.classList.toggle('is-active');
        $target.classList.toggle('is-active');

      });
    });
  }

});

export default () => {
  // classes2
  variables
};

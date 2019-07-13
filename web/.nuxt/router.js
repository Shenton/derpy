import Vue from 'vue'
import Router from 'vue-router'
import { interopDefault } from './utils'

const _5ca8dfd4 = () => interopDefault(import('..\\pages\\administration\\index.vue' /* webpackChunkName: "pages_administration_index" */))
const _6a56c3f9 = () => interopDefault(import('..\\pages\\modules\\index.vue' /* webpackChunkName: "pages_modules_index" */))
const _1e5e4818 = () => interopDefault(import('..\\pages\\administration\\commands.vue' /* webpackChunkName: "pages_administration_commands" */))
const _84871d6a = () => interopDefault(import('..\\pages\\administration\\modules.vue' /* webpackChunkName: "pages_administration_modules" */))
const _174c4638 = () => interopDefault(import('..\\pages\\modules\\activity.vue' /* webpackChunkName: "pages_modules_activity" */))
const _a743ca52 = () => interopDefault(import('..\\pages\\modules\\mp3.vue' /* webpackChunkName: "pages_modules_mp3" */))
const _72be3b33 = () => interopDefault(import('..\\pages\\modules\\pubg.vue' /* webpackChunkName: "pages_modules_pubg" */))
const _142ccb72 = () => interopDefault(import('..\\pages\\modules\\reddit.vue' /* webpackChunkName: "pages_modules_reddit" */))
const _0bff7e6a = () => interopDefault(import('..\\pages\\modules\\response.vue' /* webpackChunkName: "pages_modules_response" */))
const _84fca58e = () => interopDefault(import('..\\pages\\modules\\rss.vue' /* webpackChunkName: "pages_modules_rss" */))
const _16b246b4 = () => interopDefault(import('..\\pages\\index.vue' /* webpackChunkName: "pages_index" */))

Vue.use(Router)

if (process.client) {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual'

    // reset scrollRestoration to auto when leaving page, allowing page reload
    // and back-navigation from other pages to use the browser to restore the
    // scrolling position.
    window.addEventListener('beforeunload', () => {
      window.history.scrollRestoration = 'auto'
    })

    // Setting scrollRestoration to manual again when returning to this page.
    window.addEventListener('load', () => {
      window.history.scrollRestoration = 'manual'
    })
  }
}
const scrollBehavior = function (to, from, savedPosition) {
  // if the returned position is falsy or an empty object,
  // will retain current scroll position.
  let position = false

  // if no children detected and scrollToTop is not explicitly disabled
  if (
    to.matched.length < 2 &&
    to.matched.every(r => r.components.default.options.scrollToTop !== false)
  ) {
    // scroll to the top of the page
    position = { x: 0, y: 0 }
  } else if (to.matched.some(r => r.components.default.options.scrollToTop)) {
    // if one of the children has scrollToTop option set to true
    position = { x: 0, y: 0 }
  }

  // savedPosition is only available for popstate navigations (back button)
  if (savedPosition) {
    position = savedPosition
  }

  return new Promise((resolve) => {
    // wait for the out transition to complete (if necessary)
    window.$nuxt.$once('triggerScroll', () => {
      // coords will be used if no selector is provided,
      // or if the selector didn't match any element.
      if (to.hash) {
        let hash = to.hash
        // CSS.escape() is not supported with IE and Edge.
        if (typeof window.CSS !== 'undefined' && typeof window.CSS.escape !== 'undefined') {
          hash = '#' + window.CSS.escape(hash.substr(1))
        }
        try {
          if (document.querySelector(hash)) {
            // scroll to anchor by returning the selector
            position = { selector: hash }
          }
        } catch (e) {
          console.warn('Failed to save scroll position. Please add CSS.escape() polyfill (https://github.com/mathiasbynens/CSS.escape).')
        }
      }
      resolve(position)
    })
  })
}

export function createRouter() {
  return new Router({
    mode: 'history',
    base: decodeURI('/'),
    linkActiveClass: 'nuxt-link-active',
    linkExactActiveClass: 'nuxt-link-exact-active',
    scrollBehavior,

    routes: [{
      path: "/administration",
      component: _5ca8dfd4,
      name: "administration"
    }, {
      path: "/modules",
      component: _6a56c3f9,
      name: "modules"
    }, {
      path: "/administration/commands",
      component: _1e5e4818,
      name: "administration-commands"
    }, {
      path: "/administration/modules",
      component: _84871d6a,
      name: "administration-modules"
    }, {
      path: "/modules/activity",
      component: _174c4638,
      name: "modules-activity"
    }, {
      path: "/modules/mp3",
      component: _a743ca52,
      name: "modules-mp3"
    }, {
      path: "/modules/pubg",
      component: _72be3b33,
      name: "modules-pubg"
    }, {
      path: "/modules/reddit",
      component: _142ccb72,
      name: "modules-reddit"
    }, {
      path: "/modules/response",
      component: _0bff7e6a,
      name: "modules-response"
    }, {
      path: "/modules/rss",
      component: _84fca58e,
      name: "modules-rss"
    }, {
      path: "/",
      component: _16b246b4,
      name: "index"
    }],

    fallback: false
  })
}

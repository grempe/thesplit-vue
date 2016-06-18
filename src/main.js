import Vue from 'vue'
import VueResource from 'vue-resource'
import VueRouter from 'vue-router'

import App from './App.vue'
import Encrypt from './Encrypt.vue'
import Decrypt from './Decrypt.vue'

Vue.use(VueRouter)
Vue.use(VueResource);
Vue.http.options.emulateJSON = true

var router = new VueRouter()

router.map({
    '/': {
        component: Encrypt
    },
    '/d': {
        component: Decrypt
    }
})

router.beforeEach(function () {
  window.scrollTo(0, 0)
})

router.redirect({
  '*': '/'
})

router.start(App, '#app')

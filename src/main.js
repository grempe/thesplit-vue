import Vue from 'vue'
import VueResource from 'vue-resource'
import VueRouter from 'vue-router'

import App from './App.vue'
import Encrypt from './Encrypt.vue'
import Decrypt from './Decrypt.vue'

Vue.use(VueRouter)
Vue.use(VueResource);

var router = new VueRouter()

router.map({
    '/e': {
        name: 'encrypt',
        component: Encrypt
    },
    '/d': {
        name: 'decrypt',
        component: Decrypt
    },
    '/d/:uuid': {
        name: 'decrypt-uuid',
        component: Decrypt
    },
    '/d/:uuid/:key': {
        name: 'decrypt-uuid-key',
        component: Decrypt
    }
})

router.beforeEach(function () {
  window.scrollTo(0, 0)
})

router.redirect({
  '*': '/e'
})

router.start(App, '#app')

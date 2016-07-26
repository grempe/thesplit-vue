// ////////////////////////////////////////////////////////////////////////////
// 
// thesplit - A client application for the secure sharing of secrets.
// Copyright (c) 2016  Glenn Rempe
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
// 
// ////////////////////////////////////////////////////////////////////////////

import Vue from 'vue'
import VueResource from 'vue-resource'
import VueRouter from 'vue-router'

import App from './App.vue'
import Encrypt from './Encrypt.vue'
import Decrypt from './Decrypt.vue'
import About from './About.vue'

Vue.use(VueRouter)
Vue.use(VueResource);

var router = new VueRouter()

router.map({
    '/about': {
        name: 'about',
        component: About
    },
    '/security': {
        name: 'about',
        component: About
    },
    '/e': {
        name: 'encrypt',
        component: Encrypt
    },
    '/d': {
        name: 'decrypt',
        component: Decrypt
    },
    '/d/:id': {
        name: 'decrypt-id',
        component: Decrypt
    },
    '/d/:id/:key': {
        name: 'decrypt-id-key',
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


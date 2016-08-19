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

import App from './components/App.vue'
import Encrypt from './components/Encrypt.vue'
import Decrypt from './components/Decrypt.vue'
import Verify from './components/Verify.vue'
import About from './components/About.vue'
import Security from './components/Security.vue'
import Debug from './components/Debug.vue'

Vue.config.debug = process.env.NODE_ENV !== 'production'

Vue.use(VueRouter)
Vue.use(VueResource);

// setting : 'history: false'
// http://router.vuejs.org/en/options.html
//
// Use hash-bang '#!' URL's. They are not as pretty
// but without them a URL like /d/ID/KEY would pass
// both the ID and the secret KEY to the server, only
// for the server to redirect the request to /index.html
// so the SPA can then parse the /d/ID/KEY out and make
// use of it. So the server in this case receives a
// copy of the ID and KEY, for even a brief moment,
// and this could allow an attacker who has previously
// stored a stolen copy of the DB to decrypt a secret
// without the receipient knowing it had occurred.
// By making use of the hash-bang, nothing after the #!
// is ever sent to the server (unless the browser and
// client machine has been compropmised. Doom!) and remains
// in the client browser at all times.
var router = new VueRouter({history: false})

router.map({
  '/about': {
      name: 'about',
      component: About
  },
  '/security': {
      name: 'security',
      component: Security
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
  },
  '/v': {
      name: 'verify',
      component: Verify
  },
  '/v/:id': {
      name: 'verify-id',
      component: Verify
  },
  '/debug': {
      name: 'debug',
      component: Debug
  },
})

router.beforeEach(function () {
  window.scrollTo(0, 0)
})

router.redirect({
  '*': '/e'
})

router.start(App, '#app')

<!--
###############################################################################
#
# thesplit - A client application for the secure sharing of secrets.
# Copyright (c) 2016  Glenn Rempe
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
###############################################################################
-->

<template>
  <div class="container" v-cloak>

    <div class="columns">
      <div class="column">
        <header class="navbar bg-grey">
          <section class="navbar-section">
             <a v-link="{ path: '/send' }" class="navbar-brand">thesplit.is</a><br>
          </section>
          <section class="navbar-section">
              <a v-link="{ path: '/send' }" class="btn btn-link">Send</a>
              <a v-link="{ path: '/receive' }" class="btn btn-link">Receive</a>
              <a v-link="{ path: '/verify' }" class="btn btn-link">Verify</a>
              <a v-link="{ path: '/security' }" class="btn btn-link">Security</a>
              <a v-link="{ path: '/about' }" class="btn btn-link">About</a>
              <a v-link="{ path: '/debug' }" class="btn btn-link" v-if="settings.debug">Debug</a>
          </section>
        </header>
      </div>
    </div>

    <div class="columns">
      <div class="column col-2"></div>
      <div class="column col-8">
        <div v-for="alert in alerts">
          <div class="toast" v-bind:class="{ 'toast-primary': alert.type === 'primary', 'toast-success': alert.type === 'success', 'toast-danger': alert.type === 'danger' }" v-on:click="deleteAlert(alert)">
              <button class="btn btn-clear float-right" v-on:click="deleteAlert(alert)"></button>
              {{ alert.msg }}
          </div>
        </div>
      </div>
      <div class="column col-2"></div>
    </div>

    <router-view></router-view>

    <div id="footer" class="text-center">
      <br>
      <div class="divider"></div>
      <br>
      <em class="silver">the end-to-end encrypted, zero-knowledge, auto-expiring, one-time use, blockchain anchored, secret sharing service</em><br>
      <br>
      <p class="silver">&copy; 2016 Glenn Rempe - <a href="https://twitter.com/grempe" target="_blank">@grempe</a></p>
    </div>

  </div>
</template>

<script>
import store from '../vuex/store'
import * as actions from '../vuex/actions'
import * as getters from '../vuex/getters'

export default {
  data () {
    return {
    }
  },
  vuex: {
    getters,
    actions
  },
  store: store // make this and all child components aware of the new store
}
</script>

<style>
[v-cloak] {
  display: none;
}
.bg-grey {
  background-color: #efefef;
  padding: 1rem;
  border-radius: .3rem;
}
.silver {
  color: silver;
}
</style>

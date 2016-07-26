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
             <a v-link="{ path: '/e' }" class="navbar-brand">thesplit.is</a><br>
          </section>
          <section class="navbar-section">
              <a v-link="{ path: '/d' }" class="btn btn-link">decrypt a secret</a>
              <a v-link="{ path: '/about' }" class="btn btn-link">about</a>
          </section>
        </header>
      </div>
    </div>

    <div class="columns" v-if="toastSuccess">
      <div class="column">
        <div class="toast toast-success" v-on:click="clearToastSuccess">
            <button class="btn btn-clear float-right" v-on:click="clearToastSuccess"></button>
            {{ toastSuccess }}
        </div>
      </div>
    </div>

    <div class="columns" v-if="toastDanger">
      <div class="column">
        <div class="toast toast-danger" v-on:click="clearToastDanger">
            <button class="btn btn-clear float-right" v-on:click="clearToastDanger"></button>
            {{ toastDanger }}
        </div>
      </div>
    </div>

    <h5 class="orange text-center text-bold text-italic">ALPHA TESTING ONLY : DO NOT USE FOR SECURITY SENSITIVE INFO</h5>

    <router-view></router-view>
  </div>
</template>

<script>
export default {
  data () {
    return {
      toastDanger: null,
      toastSuccess: null
    }
  },
  methods: {
    clearToastDanger: function () {
      this.toastDanger = null
    },
    clearToastSuccess: function () {
      this.toastSuccess = null
    },
  },
  // the `events` option simply calls `$on` for you
  // when the instance is created
  events: {
    'toast-clear': function (msg) {
      // `this` in event callbacks are automatically bound
      // to the instance that registered it
      this.toastSuccess = null
      this.toastDanger = null
    },
    'toast-success': function (msg) {
      this.toastSuccess = msg
      var self = this
      setTimeout(function(){
        self.$dispatch('toast-clear', null)
      }, 5000)
    },
    'toast-danger': function (msg) {
      this.toastDanger = msg
      var self = this
      setTimeout(function(){
        self.$dispatch('toast-clear', null)
      }, 5000)
    }
  }
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
.orange {
  color: orange;
}
</style>

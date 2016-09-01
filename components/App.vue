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

  <nav class="navbar navbar-default" v-cloak>
    <div class="container-fluid">
      <!-- Brand and toggle get grouped for better mobile display -->
      <div class="navbar-header">
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" v-link="{ path: '/send' }"><em class="text-muted small">the</em><strong class="text-primary">SPLIT</strong><span class="text-muted small">.is</span></a>
      </div>

      <!-- Collect the nav links, forms, and other content for toggling -->
      <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
        <ul class="nav navbar-nav navbar-right">
          <li><a v-link="{ path: '/send' }">Send</a></li>
          <li><a v-link="{ path: '/receive' }">Receive</a></li>
          <li><a v-link="{ path: '/verify' }">Verify</a></li>
          <li><a v-link="{ path: '/security' }">Security</a></li>
          <li><a v-link="{ path: '/faq' }">FAQ</a></li>
          <li v-if="settings.debug"><a v-link="{ path: '/debug' }">Debug</a></li>
        </ul>
      </div><!-- /.navbar-collapse -->
    </div><!-- /.container-fluid -->
  </nav>

  <div class="container" v-cloak>

    <div class="row">
      <div v-for="a in alerts" class="col-md-12">
        <div class="alert alert-dismissible fade in" v-bind:class="{ 'alert-info': a.type === 'info', 'alert-success': a.type === 'success', 'alert-warning': a.type === 'warning', 'alert-danger': a.type === 'danger' }" role="alert">
          <button type="button" class="close" data-dismiss="alert" aria-label="Close" @click="deleteAlert(a)"><span aria-hidden="true">&times;</span></button>
          {{ a.msg }}
        </div>
      </div>
    </div>

    <router-view></router-view>

    <div class="row">
      <hr>
      <div class="col-md-12 text-center">
        <p class="text-muted">the end-to-end encrypted, zero-knowledge, auto-expiring, one-time use, blockchain anchored, secret sharing service</p>
        <p class="text-muted">&copy; 2016 Glenn Rempe - <a href="https://twitter.com/grempe" target="_blank">@grempe</a></p>
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
  ready: function() {
    // Setup the current environment as provided
    // for the app by the body tag of the index.html
    // that loaded us. Defaults to production.
    if ($('body').attr('data-environment')) {
      let env = $('body').attr('data-environment')
      if (env === 'npm') {
        this.setNpmEnv()
      } else if (env === 'development') {
        this.setDevEnv()
      } else if (env === 'test') {
        this.setTestEnv()
      } else {
        this.setProdEnv()
      }
    }
  },
  vuex: {
    getters,
    actions
  },
  route: {
    data: function (transition) {

      // bootstrap tooltip activate
      this.$nextTick(function () {
        $('[data-toggle="tooltip"]').tooltip()
      })

      transition.next({})
    }
  },
  store: store // make this and all child components aware of the new store
}
</script>

<style>
[v-cloak] {
  display: none;
}
</style>

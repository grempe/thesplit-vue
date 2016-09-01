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
  <div id="debug">

    <h2>Debug</h2>

    <div class="row">
      <div class="col-md-12">
        <p>Do you really think you should play here?</p>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <p>state.settings.debug : {{ settings.debug }} </p>
        <button @click='setDebugOn'>True</button>
        <button @click='setDebugOff'>False</button>
      </div>
    </div>

    <br>
    
    <div class="row">
      <div class="col-md-12">
        <p>state.settings.environment : {{ settings.environment }} </p>
        <p>state.settings.apiBaseUrl : {{ settings.apiBaseUrl }} </p>
        <button @click='setNpmEnv'>NPM</button>
        <button @click='setDevEnv'>DEV</button>
        <button @click='setTestEnv'>TEST</button>
        <button @click='setProdEnv'>PROD</button>
      </div>
    </div>

    <br>

    <div class="row">
      <div class="col-md-12">
        <p>Test Alerts</p>
        <button @click="addAlert('info', 'info blue')">info</button>
        <button @click="addAlert('success', 'success green')">success</button>
        <button @click="addAlert('warning', 'warning yellow')">warning</button>
        <button @click="addAlert('danger', 'danger red')">danger</button>
        <button @click="deleteAllAlerts()">delete all alerts</button>
      </div>
    </div>

  </div>
</template>

<script>
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
  route: {
    data: function (transition) {

      // bootstrap tooltip activate
      this.$nextTick(function () {
        $('[data-toggle="tooltip"]').tooltip()
      })

      transition.next({})
    }
  }
}
</script>

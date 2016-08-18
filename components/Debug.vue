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

    <div class="columns" v-show="!foo">
        <div class="column col-1"></div>
        <div class="form-group column col-10">
          <h4>Debug</h4>
          <p>You probably don't want to play here. Things might explode if you do.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="!foo">
        <div class="column col-1"></div>
        <div class="form-group column col-10">
            <p>state.settings.debug : {{ settings.debug }} </p>
            <button @click='setDebugOn'>True</button>
            <button @click='setDebugOff'>False</button>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="!foo">
        <div class="column col-1"></div>
        <div class="form-group column col-10">
            <p>state.settings.apiBaseUrl : {{ settings.apiBaseUrl }} </p>
            <button @click='setDevApi'>Use Dev API</button>
            <button @click='setHostApi'>Use Own Host API</button>
            <button @click='setProdApi'>Use Production API</button>
        </div>
        <div class="column col-1"></div>
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
  }
}
</script>

<style>
</style>

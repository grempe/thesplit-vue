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
          <h4>Debug Settings</h4>
          <p>You probably don't want to play here. Things might explode if you do.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="!foo">
        <div class="column col-1"></div>
        <div class="form-group column col-10">
            <p>apiBaseUrl : {{ apiBaseUrl }} </p>
            <button @click='useDevApi'>Use Dev API</button>
            <button @click='useProdApi'>Use Prod API</button>
        </div>
        <div class="column col-1"></div>
    </div>
    
  </div>
</template>

<script>
import { getApiBaseUrl } from './vuex/getters'
import { useDevApiUrl, useProdApiUrl } from './vuex/actions'

export default {
  data () {
    return {
    }
  },
  vuex: {
    actions: {
      useDevApi: useDevApiUrl,
      useProdApi: useProdApiUrl
    },
    getters: {
      apiBaseUrl: getApiBaseUrl
    }
  }
}
</script>

<style>
</style>

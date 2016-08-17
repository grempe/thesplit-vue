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
  <div id="verify">

    <div class="columns" v-show="!foo">
        <div class="column col-1"></div>
        <div class="form-group column col-10">
          <h4>Verify a Secret</h4>
          <p>The integrity of your data is important. Very important. That's why
              we take the job of ensuring you get back exactly what was put in,
              Byte for byte, so seriously.</p>
          <p>Your sensitive data is passed through a series of cryptographic
              integrity checks, both when uploaded by you and when downloaded
              by your recipient. We even anchor your data to the blockchain to
              allow an integrity audit without fear of revealing any sensitive
              information in the process.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="!foo">
      <div class="column col-1"></div>
        <div class="form-group column col-10">
          <label class="form-label" for="inputId">ID</label>
          <input id="inputId" v-model="id" type="text" class="form-input" placeholder="ID" autofocus></input>
        </div>
      <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="!foo">
      <div class="column col-9"></div>
      <div class="column col-2">
        <button class="btn btn-primary float-right tooltip tooltip-left" data-tooltip="Cryptographically verify secret data integrity" v-on:click="verifyReceipt" :disabled="!hasIdAndKey">Verify</button>
      </div>
      <div class="column col-1"></div>
    </div>

  </div>
</template>

<script>
// const apiBaseUrl = location.protocol + '//' + location.host + '/api/v1'
const apiBaseUrl = 'http://localhost:3000/api/v1'

export default {
  data () {
    return {
      id: this.$route.params.id
    }
  },
}
</script>

<style>
</style>

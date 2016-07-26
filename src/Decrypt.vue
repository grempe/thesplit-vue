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
  <div id="decrypt">

    <div class="columns" v-show="!secret">
        <div class="column col-1"></div>
        <div class="form-group column col-10">
          <h4>Decrypt a Secret</h4>
          <p>If you came here following a link someone shared with you, and the ID and Secret Key below are filled in, you are all set to continue. If either of these values were shared separately, just paste them into the right location below to continue.</p>
        </div>
        <div class="column col-1"></div>
    </div>
        
    <div class="columns" v-show="!secret">
        <div class="column col-1"></div>
        <div class="form-group column col-10">
          <label class="form-label" for="inputId">ID</label>
          <input id="inputId" v-model="id" type="text" class="form-input" placeholder="ID" autofocus></input>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="!secret">
        <div class="column col-1"></div>
        <div class="form-group column col-10">
          <label class="form-label" for="inputKey">Secret Key</label>
          <input id="inputKey" v-model="boxKeyB32" type="text" class="form-input" placeholder="Secret Key"></input>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="!secret">
      <div class="column col-9"></div>
      <div class="column col-2">
        <button class="btn btn-primary float-right tooltip tooltip-left" data-tooltip="Retrieve and destroy the server data and decrypt" v-on:click="decryptSecret" :disabled="!hasIdAndKey">Decrypt!</button>
      </div>
      <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="secret">
        <div class="column col-1"></div>
        <div class="form-group column col-10">
          <h4>Decrypted Secret</h4>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="secret">
      <div class="column col-1"></div>
      <div class="column col-10">
        <pre>{{ secret }}</pre>
      </div>
      <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="secret">
      <div class="column col-1"></div>
      <div class="column col-10">
        <p class="silver">The encrypted secret shared with you has been decrypted, and is displayed above. It has already been deleted from the server and can never be retrieved again. If needed, copy the secret now.</pre>
      </div>
      <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="secret">
      <div class="column col-12">
        <button class="btn centered tooltip tooltip-top" data-tooltip="There is no going back on this!" v-on:click="resetAll">Destroy It!</button>
      </div>
    </div>

  </div>
</template>

<script>
import nacl from 'tweetnacl'
import naclutil from 'tweetnacl-util'
nacl.util = naclutil
import BLAKE2s from 'blake2s-js'
import scrypt from 'scryptsy'
import base32 from 'base32-crockford-browser'

const apiBaseUrl = location.protocol + '//' + location.host + '/api/v1'
// const apiBaseUrl = 'http://localhost:3000/api/v1'

export default {
  data () {
    return {
      id: this.$route.params.id,
      boxKeyB32: this.$route.params.key,
      secret: null
    }
  },
  computed: {
    hasIdAndKey: function () {
      if (this.id && this.boxKeyB32) {
        return true
      } else {
        return false
      }
    }
  },
  methods: {
    resetAll: function () {
      this.id = null
      this.boxKeyB32 = null
      this.secret = null
      this.$dispatch('toast-clear', null)
    },
    decryptSecret: function () {
      this.$http.get(apiBaseUrl + '/secrets/' + this.id).then((response) => {
          let boxKey = nacl.util.decodeBase64(base32.decode(this.boxKeyB32))
          let box = nacl.util.decodeBase64(response.data.data.boxB64)
          let boxNonce = nacl.util.decodeBase64(response.data.data.boxNonceB64)
          let scryptSalt = nacl.util.decodeBase64(response.data.data.scryptSaltB64)

          // scrypt
          let N = 4096         // 2^12 : The number of iterations. number (integer)
          let r = 8            // Memory factor. number (integer)
          let p = 1            // Parallelization factor. number (integer)
          let keyLenBytes = 32 // The number of bytes to return. number (integer)
          let boxKeyScrypt = scrypt(boxKey, scryptSalt, N, r, p, keyLenBytes)
          let secret = nacl.util.encodeUTF8(nacl.secretbox.open(box, boxNonce, boxKeyScrypt))

          if (secret) {
            this.$dispatch('toast-success', 'Secret retrieved and decrypted')
            this.secret = secret
          } else {
            this.$dispatch('toast-danger', 'Secret retrieved but decryption failed. Wrong key?')
          }
      }, (response) => {
          // error callback
          if (response.data && response.data.message) {
            this.$dispatch('toast-danger', response.data.message)
          } else {
            this.$dispatch('toast-danger', 'Server Error')
          }
      });
    }
  }
}
</script>

<style>
</style>

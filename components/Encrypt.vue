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
  <div id="encrypt">

    <div class="columns" v-show="!submitted">
      <div class="column col-1"></div>
      <div class="column col-10">
        <div><span class="label float-right">{{ secretQuotaString }}</span></div>
      </div>
      <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="!submitted">
        <div class="column col-1"></div>
        <div class="form-group column col-10">
          <textarea id="inputSecretText" v-model="secret" type="text" class="form-input" placeholder="We all have secrets. Share yours safely." rows="5" autofocus></textarea>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="!submitted">
      <div class="column col-9"></div>
      <div class="column col-2">
        <button class="btn btn-primary float-right tooltip tooltip-left" data-tooltip="Encrypt, upload, and view share link" v-on:click="encryptSecret" :disabled="!secret">Send</button>
      </div>
      <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="hasSecretIdAndKey">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h4>Share Your Encrypted Secret</h4>
          <p>Your secret has been encrypted with a <em>very strong</em> random encryption key
          and safely stored. Copy this link and share it with your recipient. The encrypted
          secret will be destroyed when this link is first clicked, or after 24 hours have passed.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="hasSecretIdAndKey">
      <div class="column col-1"></div>
      <div class="column col-10">
        <h4 class="text-center"><a v-link="{ name: 'decrypt-id-key', params: { id: id, key: keyB32 }}">{{ secretBaseIdKeyUrl }}</a></h4>
        <br>
        <p class="text-center"><span class="label label-primary">Expires : {{ expiresAt }}</span></p>
      </div>
      <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="hasSecretIdAndKey">
      <div class="column col-12">
        <button class="btn centered tooltip tooltip-right" data-tooltip="The nuclear option!" v-on:click="removeSecret">Oops, destroy this secret!</button>
      </div>
    </div>

    <div class="columns" v-show="!secret">
      <div class="column col-1"></div>
      <div class="column col-10">
        <h5>Previously Sent Secrets</h5>
        <div v-for="secret in sentSecrets">
          <a v-link="{ name: 'decrypt-id-key', params: { id: secret.id, key: secret.keyB32 }}" class="btn btn-link">{{ $key }}</a><a @click="deleteSentSecret(secret.id)" class="btn btn-link">delete</a>
        </div>
        <div><a @click="deleteAllSentSecrets">delete all</a></div>
      </div>
      <div class="column col-1"></div>
    </div>

  </div>
</template>

<script>
import nacl from 'tweetnacl'
import naclutil from 'tweetnacl-util'
nacl.util = naclutil
import sha256 from "fast-sha256";
import BLAKE2s from 'blake2s-js'
import scrypt from 'scryptsy'
import base32 from 'base32-crockford-browser'
import numeral from 'numeral'

import * as actions from '../vuex/actions'
import * as getters from '../vuex/getters'

export default {
  data () {
    return {
      submitted: false,
      secret: '',
      createdAt: null,
      expiresAt: null,
      id: null,
      keyB32: null
    }
  },
  vuex: {
    getters,
    actions
  },
  computed: {
    secretBytes: function () {
      if (this.secret) {
        return nacl.util.decodeUTF8(this.secret)
      }
    },
    secretApproximateEncryptedBase64Length: function () {
      if (this.secret) {
        // NaCl encryption adds 16 Bytes of overhead
        let len_encrypted = this.secret.length + 16
        // http://stackoverflow.com/questions/13378815/base64-length-calculation
        return 4.0/3.0 * len_encrypted
      }
    },
    secretPercentageOfAllowedLength: function () {
      if (this.secret) {
        return this.secretApproximateEncryptedBase64Length / 65536
      }
    },
    secretQuotaString: function () {
      if (this.secret) {
        return numeral(this.secret.length).format(0.0) + ' : ' +  numeral(this.secretApproximateEncryptedBase64Length).format('0 b') + ' of ' + numeral(65536).format('0 b') + ' (' + numeral(this.secretPercentageOfAllowedLength).format('0.00%') + ')'
      }
    },
    hasSecretIdAndKey: function () {
      if (this.id && this.keyB32) {
        return true
      } else {
        return null
      }
    },
    secretBaseUrl: function () {
      if (location.protocol && location.host) {
        return location.protocol + '//' + location.host + '/#!/d/'
      }
    },
    secretBaseIdKeyUrl: function () {
      if (this.secretBaseUrl && this.id && this.keyB32) {
        return this.secretBaseUrl + this.id + '/' + this.keyB32
      }
    },
    secretId: function () {
      if (this.id) {
        return this.id
      }
    },
    secretKey: function () {
      if (this.keyB32) {
        return this.keyB32
      }
    }
  },
  methods: {
    resetAll: function () {
      this.secret = null
      this.submitted = false
      this.id = null
      this.createdAt = null
      this.expiresAt = null
      this.$dispatch('toast-clear', null)
    },
    removeSecret: function () {
      this.$http.delete(this.settings.apiBaseUrl + '/secrets/' + this.id).then((response) => {
        this.deleteSentSecret(this.id)
        this.resetAll()
        this.$dispatch('toast-success', 'Server secret destroyed')
      }, (response) => {
        // error callback
        this.resetAll()
        if (response.data && response.data.message) {
          this.$dispatch('toast-danger', response.data.message)
        } else {
          this.$dispatch('toast-danger', 'Server Error')
        }
      });
    },
    encryptSecret: function (event) {
      // The random key from which the box encryption key and
      // HMAC keys are derived using scrypt KDF. A Base32 encoded
      // copy of this key will become part of the secret URL for
      // sender and recipient. Base32 being URL/human friendly.
      let key = nacl.randomBytes(8)
      this.keyB32 = base32.encode(nacl.util.encodeBase64(key))
      
      // Derive NaCl Secret Box Key and HMAC Key with Scrypt
      let scryptSalt = nacl.randomBytes(32)
      let scryptSaltB64 = nacl.util.encodeBase64(scryptSalt)
      let scryptBytes = scrypt(key,
                               scryptSalt,
                               this.settings.scrypt.N,
                               this.settings.scrypt.r,
                               this.settings.scrypt.p,
                               this.settings.scrypt.keyLenBytes)

      // Split the KDF bytes, half for box encryption key,
      // and half for HMAC key.
      let boxKeyKdfBytes = scryptBytes.slice(0, 32)
      let hmacKeyKdfBytes = scryptBytes.slice(32, 64)

      // Encrypt the secret into an NaCl Secret Box
      let boxNonce = nacl.randomBytes(24)
      let boxNonceB64 = nacl.util.encodeBase64(boxNonce)
      let box = nacl.secretbox(this.secretBytes, boxNonce, boxKeyKdfBytes)
      let boxB64 = nacl.util.encodeBase64(box)

      // BLAKE2s HMAC hexdigest is used as the ID to store and lookup
      // secrets as well as allow the holder of the derived HMAC key to
      // authenticate the secret payload.
      let h = new BLAKE2s(this.settings.hmacLengthBytes, hmacKeyKdfBytes)
      h.update(nacl.util.decodeUTF8(scryptSaltB64))
      h.update(nacl.util.decodeUTF8(boxNonceB64))
      h.update(nacl.util.decodeUTF8(boxB64))
      let blake2sHash = h.hexDigest()

      // An object to submit the payload to the server
      var data = {'scryptSaltB64': scryptSaltB64,
                  'boxNonceB64': boxNonceB64,
                  'boxB64': boxB64,
                  'id': blake2sHash}

      // trigger UI changes
      this.submitted = true

      this.$http.post(this.settings.apiBaseUrl + '/secrets', data).then((response) => {
          // FIXME : store a full object in the store, not locally
          let r = response.json().data
          this.secret = null
          this.id = r.id
          this.createdAt = r.createdAt
          this.expiresAt = r.expiresAt
          this.$dispatch('toast-success', 'Secret encrypted and saved')
      }, (response) => {
          // error callback
          if (response.data && response.data.message) {
            this.submitted = false
            this.$dispatch('toast-danger', response.data.message)
          } else {
            this.submitted = false
            this.$dispatch('toast-danger', 'Server Error')
          }
      });
    }
  }
}
</script>

<style>
</style>

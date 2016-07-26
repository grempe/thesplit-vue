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
          <h4>Encrypt a Secret</h4>
        </div>
        <div class="column col-1"></div>
    </div>

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
          <textarea id="inputSecretText" v-model="secret" type="text" class="form-input" placeholder="We all have secrets. Send yours safely." rows="5" autofocus></textarea>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="!submitted">
      <div class="column col-9"></div>
      <div class="column col-2">
        <button class="btn btn-primary float-right tooltip tooltip-left" data-tooltip="Encrypt secret locally and upload" v-on:click="encryptSecret" :disabled="!secret">Encrypt!</button>
      </div>
      <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="hasSecretIdAndKey">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h4>Share Encrypted Secret</h4>
          <p>Your secret has been encrypted with a <em>very strong</em> random encryption key and safely stored on our servers. All secrets are encrypted to the same high security level and your choice of how you want to share it is a balance of your security needs and the recipient's convenience. All methods destroy the secret on our servers when first retrieved. In all cases the ID is a 16 Byte BLAKE2s HMAC of the encrypted data stored on the server. The Key is a cryptographically secure 32 Byte random number that has been stretched with scrypt. The encrypted data is always destroyed the first time it is retrieved and self-destructs if not retrieved.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="hasSecretIdAndKey">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>link + id + key (recommended for most)</h5>
          <p>The link contains both the ID used to retrieve the encrypted secret, and the key to decrypt it. Easy for most.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="hasSecretIdAndKey">
      <div class="column col-1"></div>
      <div class="column col-10">
      <blockquote>
          <em>The security analogy is mailing a key to the front door (The Key), with an address label in the envelope (The ID). If you can intercept the mail, you can get in the house. This method is secure if you trust the post office.</em>
      </blockquote>
        <textarea type="text" class="form-input" rows="2" disabled="disabled">{{ secretBaseIdKeyUrl }}</textarea>
      </div>
      <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="hasSecretIdAndKey">
      <div class="column col-1"></div>
      <div class="column col-10">
        <p class="text-center"><a v-link="{ name: 'decrypt-id-key', params: { id: id, key: boxKeyB32 }}">right click to copy link</a></p>
      </div>
      <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="hasSecretIdAndKey">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>link + id, separate key</h5>
          <p>The link contains only the ID used to retrieve the encrypted secret. You will need to separately share the key to decrypt the data. For maximum security you should use a different communication channel for the link and the key. This method requires your recipient, and an attacker, to be a little more advanced.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="hasSecretIdAndKey">
      <div class="column col-1"></div>
      <div class="column col-10">
        <blockquote>
            <em>The security analogy is mailing a postcard with an address (the link + ID), but sending the key to the front door of that address (the Key) in an otherwise empty FedEx envelope. Both carriers would need to be compromised to enter the right house. Unless the attacker can intercept both packages, from both postal services, and in time before the secret expires, your secret is safe. Intercepting just one package doesn't allow him to see anything except possibly the outside of the house (where the encrypted secret is). Oh, and the house dissapears when he first lays eyes upon it.</em>
        </blockquote>
        <div class="input-group">
            <span class="input-group-addon">Link + ID</span>
            <input type="text" class="form-input" value="{{ secretBaseIdUrl }}" disabled="disabled"/>
        </div>
      </div>
      <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="hasSecretIdAndKey">
      <div class="column col-1"></div>
      <div class="column col-10">
        <div class="input-group">
            <span class="input-group-addon">Key</span>
            <input type="text" class="form-input" value="{{ secretKey }}" disabled="disabled"/>
        </div>
      </div>
      <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="hasSecretIdAndKey">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>separate link, id, key</h5>
          <p>To use this method you don't share a link at all, just the ID and key values alone. You and the recipient would need to know, in advance, that you'll always use this site to share secrets. You share the random ID and the random Key using separate secure pre-determined channels.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="hasSecretIdAndKey">
      <div class="column col-1"></div>
      <div class="column col-10">
        <blockquote>
            <em>And now for a serious cloak-and-dagger analogy. Follow along. You and your recipient both quietly agree in advance that new secrets are always stored in the lockers at a certain bus station (the link). You never mention the name of the bus station again. To share a new secret, you write the number of the locker (the ID) containing the secret on the back of a postcard from Hawaii which you put on the bulletin board of the coffee shop you both frequent every day. You write the password for the lock (the key) in chalk on the outside of a mailbox at 5th and Main St. You signal that there is a new secret ready by writing a public Twitter post, from the account <a href="https://twitter.com/alicetraveller" target="_blank">@alicetraveller</a>, commenting on how good the weather in Buenos Aires is. Bob, your recipient, sees this tweet and knows he should now collect the postcard and the password and retrieve the secret from the bus station, burning it after reading it. Please note, if you need this level of security don't use this website. ;)</em>
        </blockquote>
        <div class="input-group">
            <span class="input-group-addon">Link</span>
            <input type="text" class="form-input" value="{{secretBaseUrl}}" disabled="disabled"/>
        </div>
      </div>
      <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="hasSecretIdAndKey">
      <div class="column col-1"></div>
      <div class="column col-10">
        <div class="input-group">
            <span class="input-group-addon">ID</span>
            <input type="text" class="form-input" value="{{ secretId }}" disabled="disabled"/>
        </div>
      </div>
      <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="hasSecretIdAndKey">
      <div class="column col-1"></div>
      <div class="column col-10">
        <div class="input-group">
            <span class="input-group-addon">Key</span>
            <input type="text" class="form-input" value="{{ secretKey }}" disabled="disabled"/>
        </div>
      </div>
      <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="hasSecretIdAndKey">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h5>Clear Data</h5>
          <em>Reset local data when you have finished sharing. Reloading the page will also clear local data. If you made a mistake in sharing a secret, you can instead destroy the server copy.</em>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="hasSecretIdAndKey">
      <div class="column col-6">
        <button class="btn centered tooltip tooltip-top" data-tooltip="Reset all local data" v-on:click="resetAll">RESET LOCAL DATA!</button>
      </div>
      <div class="column col-6">
        <button class="btn centered tooltip tooltip-top" data-tooltip="The nuclear option" v-on:click="removeSecret">DESTROY SERVER DATA!</button>
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
import numeral from 'numeral'

const apiBaseUrl = location.protocol + '//' + location.host + '/api/v1'
// const apiBaseUrl = 'http://localhost:3000/api/v1'


export default {
  data () {
    return {
      submitted: false,
      secret: '',
      createdAt: null,
      expiresAt: null,
      id: null,
      boxKeyB32: null
    }
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
        return numeral(this.secret.length).format(0.0) + ' characters : ' +  numeral(this.secretApproximateEncryptedBase64Length).format('0 b') + ' of ' + numeral(65536).format('0 b') + ' (' + numeral(this.secretPercentageOfAllowedLength).format('0.00%') + ') of encrypted quota length'
      }
    },
    hasSecretIdAndKey: function () {
      if (this.id && this.boxKeyB32) {
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
    secretBaseIdUrl: function () {
      if (location.protocol && location.host && this.id) {
        return location.protocol + '//' + location.host + '/#!/d/' + this.id
      }
    },
    secretBaseIdKeyUrl: function () {
      if (this.secretBaseUrl && this.id && this.boxKeyB32) {
        return this.secretBaseUrl + this.id + '/' + this.boxKeyB32
      }
    },
    secretId: function () {
      if (this.id) {
        return this.id
      }
    },
    secretKey: function () {
      if (this.boxKeyB32) {
        return this.boxKeyB32
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
      // removing a secret is simply a matter of retrieving it once.
      this.$http.delete(apiBaseUrl + '/secrets/' + this.id).then((response) => {
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
      let scryptSalt = nacl.randomBytes(32)
      let boxNonce = nacl.randomBytes(24)
      let boxKey = nacl.randomBytes(32)
      this.boxKeyB32 = base32.encode(nacl.util.encodeBase64(boxKey))

      // scrypt
      let N = 4096         // 2^12 : The number of iterations. number (integer)
      let r = 8            // Memory factor. number (integer)
      let p = 1            // Parallelization factor. number (integer)
      let keyLenBytes = 32 // The number of bytes to return. number (integer)
      let boxKeyScrypt = scrypt(boxKey, scryptSalt, N, r, p, keyLenBytes)
      let box = nacl.secretbox(this.secretBytes, boxNonce, boxKeyScrypt)

      let scryptSaltB64 = nacl.util.encodeBase64(scryptSalt)
      let boxNonceB64 = nacl.util.encodeBase64(boxNonce)
      let boxB64 = nacl.util.encodeBase64(box)

      // Use BLAKE2s in HMAC keyed mode with a pepper to create
      // a verification HMAC to help verify the integrity of the
      // data transferred to the server. Create a 16 Byte hash
      // to keep the length down. This hash, in addition to being
      // used for a non-security integrity check on the data, will
      // also be used as the key under which it is stored. A hex
      // representation of this HMAC will be embedded in the URL
      // used to retrieve the secret. It should be infeasible to
      // find encrypted secrets on the server by brute-force probes
      // of a 16 Byte (128 bit) key against the server. A collision
      // is not catastrophic though, since only encrypted data and
      // nonce/salt values are stored on the server. The server
      // can also use this value to check integrity of all incoming
      // and outgoing data.
      let blake2HashKey = nacl.util.decodeUTF8('secret:app:pepper')
      let h = new BLAKE2s(16, blake2HashKey)
      h.update(nacl.util.decodeUTF8(scryptSaltB64))
      h.update(nacl.util.decodeUTF8(boxNonceB64))
      h.update(nacl.util.decodeUTF8(boxB64))

      var data = {}
      data.scryptSaltB64 = scryptSaltB64
      data.boxNonceB64 = boxNonceB64
      data.boxB64 = boxB64
      data.blake2sHash = h.hexDigest()

      // trigger UI changes
      this.submitted = true

      this.$http.post(apiBaseUrl + '/secrets', data).then((response) => {
          this.secret = null
          this.id = response.data.data.id
          this.createdAt = response.data.data.createdAt
          this.expiresAt = response.data.data.expiresAt
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

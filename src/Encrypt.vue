<template>
  <div id="encrypt">
    <div class="columns" v-show="!submitted">
        <div class="column col-3"></div>
        <div class="form-group column col-6">
          <textarea id="inputSecretText" v-model="secret" type="text" class="form-input" placeholder="We all have secrets. Send yours safely." rows="5" autofocus></textarea>
        </div>
        <div class="column col-3"></div>
    </div>

    <div class="columns" v-show="!submitted">
      <div class="column col-7"></div>
      <div class="column col-1">
        <a class="btn btn-link float-right" v-on:click="resetAll" :disabled="!secret">reset</a>
      </div>
      <div class="column col-1">
        <button class="btn btn-primary float-right" v-on:click="encryptSecret" :disabled="!secret">Save</button>
      </div>
      <div class="column col-3"></div>
    </div>

    <div class="columns" v-show="url">
      <div class="column col-12">
        <p class="text-center"><a v-link="{ name: 'decrypt-uuid-key', params: { uuid: uuid, key: boxKeyB32 }}">{{ url }}</a></p>
        <p class="text-center"><a class="btn btn-link" v-on:click="resetAll">share new</a><a href="{{ url }}" class="text-center">remove</a></p>
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

// https://github.com/latentflip/base32-crockford-browser
import base32 from 'base32-crockford-browser'

// const baseUrl = location.protocol + '//' + location.host
// const baseUrl = 'http://0.0.0.0:9292'
const baseUrl = 'http://localhost:9292'
// const baseUrl = 'https://zerotime.herokuapp.com'

export default {
  data () {
    return {
      submitted: false,
      secret: '',
      url: null,
      createdAt: null,
      expiresAt: null,
      uuid: null,
      boxKeyB32: null
    }
  },
  computed: {
    secretBytes: function () {
      if (this.secret) {
        return nacl.util.decodeUTF8(this.secret)
      }
    }
  },
  methods: {
    resetAll: function () {
      this.secret = null
      this.submitted = false
      this.resetResponseData()
    },
    resetResponseData: function () {
      this.uuid = null
      this.url = null
      this.createdAt = null
      this.expiresAt = null
    },
    encryptSecret: function (event) {
      let scryptSalt = nacl.randomBytes(32)
      let boxNonce = nacl.randomBytes(24)
      let boxKey = nacl.randomBytes(32)
      this.boxKeyB32 = base32.encode(nacl.util.encodeBase64(boxKey))

      // scrypt
      let N = 16384        // 2^14 : The number of iterations. number (integer)
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
      // data transferred to the server.
      let blake2HashKey = nacl.util.decodeUTF8('zerotime')
      let h = new BLAKE2s(32, blake2HashKey)
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

      this.$http.post(baseUrl + '/secret', data).then((response) => {
          console.log(response)
          this.secret = null
          this.uuid = response.data.uuid
          this.url = baseUrl + '/d/' + this.uuid + '/' + this.boxKeyB32
          this.createdAt = response.data.created_at
          this.expiresAt = response.data.expires_at
      }, (response) => {
          // error callback
          console.log(response)
      });
    }
  }
}
</script>

<style>
</style>

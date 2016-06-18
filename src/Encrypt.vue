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
        <button class="btn btn-primary float-right" v-on:click="submitSecret" :disabled="!secret">Submit</button>
      </div>
      <div class="column col-3"></div>
    </div>

    <div class="columns" v-show="url">
      <div class="column col-12">
        <h5 class="text-center" v-if="url">{{ url }}</h5>
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

// See : https://github.com/joaquimserafim/base64-url
function base64unescape(str) {
  return (str + Array(5 - str.length % 4)
    .join('='))
    .replace(/\-/g, '+')
    .replace(/_/g, '/')
}

function base64escape(str) {
  return str.replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// const baseUrl = location.protocol + '//' + location.host
const baseUrl = 'http://0.0.0.0:9292'

export default {
  data () {
    return {
      submitted: false,
      secret: '',
      url: null,
      createdAt: null,
      expiresAt: null
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
      this.url = null
      this.createdAt = null
      this.expiresAt = null
    },
    submitSecret: function (event) {
      let nonce = nacl.randomBytes(24)
      let key = nacl.randomBytes(32)
      let box = nacl.secretbox(this.secretBytes, nonce, key)

      let nonceB64 = base64escape(nacl.util.encodeBase64(nonce))
      let keyB64 = base64escape(nacl.util.encodeBase64(key))
      let boxB64 = base64escape(nacl.util.encodeBase64(box))

      // Use BLAKE2s in HMAC keyed mode with a pepper.
      let hashKey = nacl.util.decodeUTF8('zerotime')
      let h = new BLAKE2s(32, hashKey)
      h.update(nacl.util.decodeUTF8(nonceB64))
      h.update(nacl.util.decodeUTF8(boxB64))

      var data = {}
      data.nonceBytesB64 = nonceB64
      data.boxBytesB64 = boxB64
      data.blake2sHash = h.hexDigest()

      this.submitted = true

      this.$http.post(baseUrl + '/secret', {
          'data': JSON.stringify(data)
        }, function (data) {
          this.secret = null
          this.url = baseUrl + '/' + data.uuid + '?k=' + keyB64
          this.createdAt = data.created_at
          this.expiresAt = data.expires_at
        })
        .catch(function (data, status, request) {
          // handle error
          this.submitted = false
        })
    }
  }
}
</script>

<style>
</style>

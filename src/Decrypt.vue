<template>
  <div id="decrypt">
    
    <h5 class="text-center">Retrieve Secret</h5>
    
    <div class="columns" v-show="!secret">
        <div class="column col-3"></div>
        <div class="form-group column col-6">
          <input id="inputId" v-model="id" type="text" class="form-input" placeholder="ID" autofocus></input>
        </div>
        <div class="column col-3"></div>
    </div>

    <div class="columns" v-show="!secret">
        <div class="column col-3"></div>
        <div class="form-group column col-6">
          <input id="inputKey" v-model="boxKeyB32" type="text" class="form-input" placeholder="Secret Key"></input>
        </div>
        <div class="column col-3"></div>
    </div>

    <div class="columns" v-show="!secret">
      <div class="column col-7"></div>
      <div class="column col-2">
        <button class="btn btn-primary float-right" v-on:click="decryptSecret" :disabled="!hasIdAndKey">Retrieve</button>
      </div>
      <div class="column col-3"></div>
    </div>

    <div class="columns" v-show="secret">
      <div class="column col-2"></div>
      <div class="column col-8">
        <pre>{{ secret }}</pre>
      </div>
      <div class="column col-2"></div>
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
    },
    decryptSecret: function () {
      this.$http.get(baseUrl + '/secret/' + this.id).then((response) => {
          let boxKey = nacl.util.decodeBase64(base32.decode(this.boxKeyB32))
          let box = nacl.util.decodeBase64(response.data.secret.boxB64)
          let boxNonce = nacl.util.decodeBase64(response.data.secret.boxNonceB64)
          let scryptSalt = nacl.util.decodeBase64(response.data.secret.scryptSaltB64)

          // scrypt
          let N = 16384        // 2^14 : The number of iterations. number (integer)
          let r = 8            // Memory factor. number (integer)
          let p = 1            // Parallelization factor. number (integer)
          let keyLenBytes = 32 // The number of bytes to return. number (integer)
          let boxKeyScrypt = scrypt(boxKey, scryptSalt, N, r, p, keyLenBytes)
          let secret = nacl.util.encodeUTF8(nacl.secretbox.open(box, boxNonce, boxKeyScrypt))

          if (secret) {
            this.secret = secret
          } else {
            this.secret = null
          }
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

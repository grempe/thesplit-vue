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
  <div id="send">

    <div class="columns" v-show="!activeSecretEncrypted">
        <div class="column col-1"></div>
        <div class="form-group column col-10">
          <textarea id="inputSecretText" :value="activeSecretPlaintext" @input="updateActiveSecretPlaintext" v-bind:disabled="activeSecretEncrypted" type="text" class="form-input" placeholder="We all have secrets. Share yours safely." rows="5" autofocus></textarea>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="!activeSecretEncrypted">
      <div class="column col-1"></div>
      <div class="column col-6">{{ secretQuotaString }}</div>
      <div class="column col-2">
        <button class="btn float-right tooltip tooltip-bottom" data-tooltip="Instantly clear secret without submitting" v-on:click="unsetActiveSecret" :disabled="!activeSecretPlaintext">Clear</button>
      </div>
      <div class="column col-2">
        <button class="btn btn-primary float-right tooltip tooltip-bottom" data-tooltip="Encrypt and submit secret, view shareable link" v-on:click="encryptActiveSecret" :disabled="!activeSecretPlaintext">Encrypt and Submit</button>
      </div>
      <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="activeSecretEncrypted">
        <div class="column col-1"></div>
        <div class="column col-10">
          <h4>Share Your Encrypted Secret Now</h4>
          <p>Your secret has been encrypted with a <em>very strong</em> random encryption key
          and safely encrypted (again) when stored in our server vault. This link is the only possible
          way to access that secret as only it contains both the unique ID and the decryption
          key needed to retrieve and view it. The decryption key is *never* written to disk
          and will be destroyed once you leave this page. Copy the link and share it with your
          recipient now. The encrypted secret will be destroyed immediately when this link is
          clicked by them and the encrypted data is viewed. If you try to 'test' the link that
          action will also destroy the secret. The secret will be permanently destroyed after
          24 hours whether accessed or not.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="activeSecretEncrypted">
      <div class="column col-1"></div>
      <div class="column col-10">
        <h4 class="text-center"><a v-link="{ name: 'receive-id-key', params: { id: activeSecret.id, key: activeSecret.keyB32 }}">{{ activeSecretUrl }}</a></h4>
        <div class="text-center"><a @click="unsetActiveSecret">Clear and Send New Secret</a></div>
      </div>
      <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="activeSecretEncrypted">
      <div class="column col-1"></div>
      <div class="column col-10">
      </div>
      <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="sentSecretsPresent">
      <div class="column col-1"></div>
      <div class="column col-10">
        <h6>Receipts ( <a @click="deleteAllSentSecrets">delete all local</a> )</h6>
        <p class="silver">These are receipts for secrets previously sent. These only serve
          as a reminder for what was sent and cannot be used to decrypt or view a secret. You
          can however use a receipt to delete a secret stored on the server which has not
          yet been accessed by a recipient.</pre>
        <table class="table table-striped table-hover">
            <tbody>
                <tr v-for="secret in sentSecrets | orderBy 'createdAt' -1">
                  <td>{{ $key }}</td>
                  <td>{{ (new Date(secret.createdAt)).toLocaleString() }}</td>
                  <td>Delete <a @click="deleteSentSecret(secret)">receipt</a> | <a @click="deleteServerSentSecret(secret)">receipt + secret</a></td>
                </tr>
            </tbody>
        </table>
      </div>
      <div class="column col-1"></div>
    </div>

  </div>
</template>

<script>
import numeral from 'numeral'
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
  computed: {
    secretApproximateEncryptedBase64Length: function () {
      if (this.activeSecretPlaintext) {
        // NaCl encryption adds 16 Bytes of overhead
        let len_encrypted = this.activeSecretPlaintext.length + 16
        // http://stackoverflow.com/questions/13378815/base64-length-calculation
        return 4.0/3.0 * len_encrypted
      }
    },
    secretPercentageOfAllowedLength: function () {
      if (this.activeSecretPlaintext) {
        return this.secretApproximateEncryptedBase64Length / 65536
      }
    },
    secretQuotaString: function () {
      if (this.activeSecretPlaintext) {
        return numeral(this.secretApproximateEncryptedBase64Length).format('0 b') + ' of ' + numeral(65536).format('0 b') + ' (' + numeral(this.secretPercentageOfAllowedLength).format('0.00%') + ')'
      }
    },
  },
  created () {
    this.deleteAllAlerts()
  },
  destroyed () {
    this.deleteAllAlerts()
    this.unsetActiveSecret()
  },
  route: {
    data: function (transition) {
      this.deleteAllAlerts()
      this.unsetActiveSecret()
      transition.next({})
    }
  },
}
</script>

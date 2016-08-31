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

    <h2>Send a Secret</h2>

    <div class="row" v-show="!activeSecretEncrypted">
        <div class="col-md-12">
          <textarea id="inputSecretText" :value="activeSecretPlaintext" @input="updateActiveSecretPlaintext | debounce 250" v-bind:disabled="activeSecretEncrypted" type="text" class="form-control" placeholder="We all have secrets. Share yours safely." rows="5" autofocus></textarea>
        <div class="progress">
          <div class="progress-bar" v-bind:class="{ 'progress-bar-info': secretQuotaPercentDisplayClass === 'info', 'progress-bar-success': secretQuotaPercentDisplayClass === 'success', 'progress-bar-warning': secretQuotaPercentDisplayClass === 'warning', 'progress-bar-danger': secretQuotaPercentDisplayClass === 'danger' }" role="progressbar" :aria-valuenow="secretQuotaPercentNum" aria-valuemin="0" aria-valuemax="100" style="min-width: 2.75em;" v-bind:style="{width: secretQuotaPercentString}">
            {{ secretQuotaPercentString }}
          </div>
        </div>
        </div>
    </div>

    <br>

    <div class="row" v-show="!activeSecretEncrypted">
      <div class="col-xs-12">
        <div class="text-right">
          <button class="btn btn-danger" v-on:click="unsetActiveSecret" :disabled="disableSecretSubmit" data-toggle="tooltip" data-placement="bottom" title="Clear the secret you've entered and don't submit anything">Clear</button>
          <button class="btn btn-default" v-on:click="encryptActiveSecret" :disabled="disableSecretSubmit" data-toggle="tooltip" data-placement="bottom" title="Encrypt and submit your secret, and display a link you can share">Encrypt + Submit</button>
        </div>
      </div>
    </div>

    <div class="row" v-show="activeSecretEncrypted">
      <div class="col-md-12">
        <h4>Share Your Encrypted Secret Now</h4>
        <p>Your secret has been securely encrypted with a <em>very strong</em> random encryption key
        and stored in the server Vault database. A private link has been generated that contains the
        ID and decryption key needed to locate and unlock your secret. The decryption key is
        <em>never</em> written to disk and this link will be destroyed once you leave this page.
        You should immediately copy this link and share it with your recipient. The encrypted secret
        will be destroyed immediately when this link is clicked and the encrypted data is viewed.
        If you try to 'test' the link you will also destroy the secret and prevent your recipient from
        viewing it as well. The secret will be permanently destroyed after 24 hours whether accessed or not.</p>
      </div>

      <div class="col-md-12">
          <p><a v-if="debug" v-link="{ name: 'receive-id-key', params: { id: activeSecret.id, key: activeSecret.keyB32 }}">dev link</a></p>
          <pre class="text-center">{{ activeSecretUrl }}</pre>
        
        <div class="text-center">
          <button class="btn btn-danger" v-on:click="unsetActiveSecret" :disabled="!activeSecretPlaintext" data-toggle="tooltip" data-placement="bottom" title="Permanently clear the secret and the private link to it">Clear Secret and Link</button>
        </div>
      </div>
    </div>

    <br>
    <br>

    <div class="row" v-show="sentSecretsPresent">
      <div class="col-md-12">
        <strong>Receipts ( <a @click="deleteAllSentSecrets">delete all</a> )</strong>
        <table class="table table-striped table-hover">
          <caption>
            Receipts for secrets previously sent. These serve as a reminder of what was sent
            and cannot be used to decrypt or view a secret. You can however use a receipt
            to delete a secret stored on the server which has not yet expired or been
            viewed.
          </caption>
          <thead>
            <tr>
              <th>ID</th>
              <th>Created At</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
              <tr v-bind:class="{ 'success': activeSecret.id === secret.id }" v-for="secret in sentSecrets | orderBy 'createdAt' -1">
                <td>{{ $key }}</td>
                <td>{{ (new Date(secret.createdAt)).toLocaleString() }}</td>
                <td><a @click="deleteSentSecret(secret)">receipt</a><span class="text-muted"> | </span><a @click="deleteServerSentSecret(secret)">both</a></td>
              </tr>
          </tbody>
        </table>
      </div>
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
    secretQuotaPercentDisplayClass: function () {
      if (this.activeSecretPlaintext) {
        let percent = this.secretPercentageOfAllowedLength * 100.0
        if (percent >= 90.0) {
          return 'danger'
        } else if (percent >= 80.0) {
          return 'warning'
        } else {
          return 'success'
        }
      } else {
        return 'success'
      }
    },
    secretQuotaPercentString: function () {
      if (this.activeSecretPlaintext) {
        return numeral(this.secretPercentageOfAllowedLength).format('0.0%')
      }
    },
    secretQuotaPercentNum: function () {
      if (this.activeSecretPlaintext) {
        return numeral(this.secretPercentageOfAllowedLength).multiply(100).format('0,0.0')
      }
    },
    disableSecretSubmit: function () {
      if (this.activeSecretPlaintext.length === 0) {
        return true
      }

      if ((this.secretPercentageOfAllowedLength * 100.0) > 100.0) {
        return true
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

      // bootstrap tooltip activate
      this.$nextTick(function () {
        $('[data-toggle="tooltip"]').tooltip()
      })

      transition.next({})
    }
  },
}
</script>

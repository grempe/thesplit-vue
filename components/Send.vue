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

    <h4 v-show="!activeSecretEncrypted">Send a Secret</h4>
    <h4 v-show="activeSecretEncrypted">Share Encrypted Secret</h4>

    <div class="row secret-send-input" v-show="!activeSecretEncrypted">
        <div class="col-md-12">
          <textarea id="inputSecretText" :value="activeSecretPlaintext" @input="updateActiveSecretPlaintext | debounce 250" v-bind:disabled="activeSecretEncrypted" type="text" class="form-control" placeholder="We all have secrets. Share yours safely." rows="5" autofocus></textarea>
        <div class="progress">
          <div class="progress-bar" v-bind:class="{ 'progress-bar-info': secretQuotaPercentDisplayClass === 'info', 'progress-bar-success': secretQuotaPercentDisplayClass === 'success', 'progress-bar-warning': secretQuotaPercentDisplayClass === 'warning', 'progress-bar-danger': secretQuotaPercentDisplayClass === 'danger' }" role="progressbar" :aria-valuenow="secretQuotaPercentNum" aria-valuemin="0" aria-valuemax="100" style="min-width: 2.75em;" v-bind:style="{width: secretQuotaPercentString}">
            {{ secretQuotaPercentString }}
          </div>
        </div>
        </div>
    </div>

    <div class="row secret-send-buttons" v-show="!activeSecretEncrypted">
      <div class="col-xs-12">
        <div class="text-right">
          <button class="btn btn-danger" v-on:click="unsetActiveSecret" :disabled="disableSecretSubmit" data-toggle="tooltip" data-placement="bottom" title="Clear the secret you've entered and don't submit anything">Clear</button>
          <button class="btn btn-default" v-on:click="encryptActiveSecret" :disabled="disableSecretSubmit" data-toggle="tooltip" data-placement="bottom" title="Encrypt and submit your secret, and display a link you can share">Encrypt + Submit</button>
        </div>
      </div>
    </div>

    <div class="row secret-send-link" v-show="activeSecretEncrypted">
      <div class="col-md-12">
        <p>This private link contains the identifier and the secret key needed to retrieve and decrypt your shared secret.
          This secret key is never stored or transmitted except by you. Secrets can only be viewed once and expire in 24 hours.</p>
      </div>

      <div class="col-md-12 text-center">
        <p><a v-if="debug" v-link="{ name: 'receive-id-key', params: { id: activeSecret.id, key: activeSecret.keyB32 }}">dev link</a></p>
        <strong class="text-danger">Save this link <em>now</em>! It will be forever destroyed when you leave this page.</strong>
        <pre class="bg-danger">{{ activeSecretUrl }}</pre>
      </div>
    </div>

    <div class="row secret-send-link-buttons" v-show="activeSecretEncrypted">
      <div class="col-md-12 text-center">
        <button class="btn btn-danger" v-on:click="unsetActiveSecret" :disabled="!activeSecretPlaintext" data-toggle="tooltip" data-placement="bottom" title="Permanently destroy the secret and the private link to it">Destroy Private Link</button>
      </div>
    </div>

    <div class="panel panel-default" v-show="sentSecretsPresent" >
      <div class="panel-heading">
        <h3 class="panel-title">Receipts <a class="pull-right" @click="deleteAllSentSecrets">delete all</a></h3>
        <br>
        <p>Receipts represent secrets previously sent. They cannot be used to decrypt or
          view the contents of a secret. If you change your mind about sharing you
          can always delete a secret which hasn't yet expired or been viewed. All times
          shown are in UTC.</p>
      </div>
      <div class="panel-body">
        <div class="row receipt" v-for="secret in sentSecrets | orderBy 'createdAt' -1">
          <div class="col-xs-12 col-sm-6">
            <samp>{{ $key }}</samp>&nbsp;<a @click="deleteServerSentSecret(secret)"><span class="glyphicon glyphicon-trash" aria-hidden="true" aria-label="delete"></span></a>
          </div>
          <div class="col-xs-12 col-sm-6">
            {{ secret.createdAt | moment "M/D/YYYY H:mm:ss" }} <span class="text-muted"> - {{ secret.createdAt | moment "from" "now" }}</span>
          </div>
        </div>
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

<style>
  .progress {
    margin-bottom: 0px;
  }

  .secret-send-input {
    margin-bottom: 2em;
  }

  .secret-send-buttons {
    margin-bottom: 2em;
  }

  .secret-send-link {
    margin-bottom: 2em;
  }

  .secret-send-link-buttons {
    margin-bottom: 2em;
  }

  .receipt {
    margin-bottom: 1em;
  }
</style>

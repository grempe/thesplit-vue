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

    <div id="secret-send-heading">
      <h4 v-show="!activeSecretEncrypted"><span class="fa fa-paper-plane fa-fw fa-lg"></span>Send a Secret</h4>
      <h4 v-show="activeSecretEncrypted">Share Encrypted Secret</h4>
    </div>

    <div id="secret-send-input" class="row" v-show="!activeSecretEncrypted">
      <div class="col-md-12">
        <textarea id="inputSecretText" :value="activeSecretPlaintext" @input="updateActiveSecretPlaintext | debounce 250" v-bind:disabled="activeSecretEncrypted" type="text" class="form-control" placeholder="We all have secrets. Share yours safely." rows="5" autofocus></textarea>
        <div class="progress">
          <div class="progress-bar" v-bind:class="{ 'progress-bar-info': secretQuotaPercentDisplayClass === 'info', 'progress-bar-success': secretQuotaPercentDisplayClass === 'success', 'progress-bar-warning': secretQuotaPercentDisplayClass === 'warning', 'progress-bar-danger': secretQuotaPercentDisplayClass === 'danger' }" role="progressbar" :aria-valuenow="secretQuotaPercentNum" aria-valuemin="0" aria-valuemax="100" style="min-width: 2.0em;" v-bind:style="{width: secretQuotaPercentWidthString}">
            {{ secretQuotaPercentString }}
          </div>
        </div>
      </div>
    </div>

    <div id="secret-send-buttons" class="row" v-show="!activeSecretEncrypted">
      <div class="col-xs-12">
        <div class="text-right">
          <button class="btn btn-danger" v-on:click="unsetActiveSecret" :disabled="disableSecretSubmit">Clear</button>
          <button class="btn btn-default" v-on:click="encryptActiveSecret" :disabled="disableSecretSubmit">Encrypt + Submit</button>
        </div>
      </div>
    </div>

    <div id="secret-send-link" class="row" v-show="activeSecretEncrypted">
      <div id="secret-send-link-text" class="col-md-12">
        <p>This private link contains the secret ID and key needed to retrieve and decrypt your shared secret.
          It is never transmitted except by you when you share this link. Secrets can only be viewed once
          and expire in 24 hours. <span class="text-danger">This link will be destroyed when you leave this
          page, copy it now.</span></p>
      </div>

      <br>

      <div id="secret-send-link-output" class="col-md-12 text-center">
        <!--<p><a v-if="debug" v-link="{ name: 'receive-id-key', params: { id: activeSecret.id, key: activeSecret.keyB32 }}">{{ activeSecretUrl }}</a></p>-->
        <pre id="active-secret-url" class="bg-danger">{{ activeSecretUrl }}</pre>
      </div>
    </div>

    <div id="secret-send-link-buttons" class="row" v-show="activeSecretEncrypted">
      <div class="col-md-12 text-center">
        <button class="btn btn-danger" v-on:click="unsetActiveSecret" :disabled="!activeSecretPlaintext"><span class="fa fa-trash fa-fw"></span>Destroy Link</button>
        <button v-show="!platformIos" class="btn btn-default" data-clipboard-target="#active-secret-url" :disabled="!activeSecretUrl"><span class="fa fa-copy fa-fw"></span>Copy Link</button>
      </div>
    </div>

    <div id="secret-send-link-copy-paste" class="row" v-show="activeSecretEncrypted">
      <div class="col-md-12 text-center">
        <p id="copy-paste-text"></p>
      </div>
    </div>

    <div id="secret-receipts" class="panel panel-default" v-show="sentSecretsPresent" >
      <div id="secret-receipts-text" class="panel-heading">
        <h3 class="panel-title">Receipts <a class="pull-right" @click="deleteAllSentSecrets"><span class="fa fa-trash fa-fw"></span>Delete All</a></h3>
        <br>
        <p>Receipts are a link to secrets previously sent. They can't be used to decrypt or
          view the contents of a secret. If you change your mind about a secret you shared
          previously you can delete it if it hasn't expired or been viewed. All times
          shown are in UTC.</p>
      </div>
      <div id="secret-receipts-output" class="panel-body">
        <div class="row receipt" v-for="secret in sentSecrets | orderBy 'createdAt' -1">
          <div class="col-xs-12 col-sm-6">
            <a @click="deleteServerSentSecret(secret)" alt="Delete Receipt"><span class="fa fa-trash fa-fw"></span></a><samp>{{ $key }}</samp>
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

// See : https://clipboardjs.com/
import Clipboard from 'clipboard'
// link clipboard to all 'btn' class objects
let clipboard = new Clipboard('.btn');

// handle events on clipboard actions
// success == selected + copied
clipboard.on('success', function(e) {
  if (navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
    $('#copy-paste-text').html('<span>Link copied! <kbd>&#8984;+V</kbd> to paste</span>')
  } else {
    $('#copy-paste-text').html('<span>Link copied! <kbd>Ctrl+V</kbd> to paste</span>')
  }
  e.clearSelection()
})

// error == only selected, not copied
clipboard.on('error', function(e) {
  if (navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
    $('#copy-paste-text').html('<span>Link selected! <kbd>&#8984;+C</kbd> to copy then <kbd>&#8984;+V</kbd> to paste</span>')
  } else {
    $('#copy-paste-text').html('<span>Link selected! <kbd>Ctrl+C</kbd> to copy then <kbd>Ctrl+V</kbd> to paste</span>')
  }
})

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
    secretQuotaPercentWidthString: function () {
      if (this.activeSecretPlaintext) {
        if (this.secretPercentageOfAllowedLength * 100 > 100 ) {
          return '100%'
        } else {
          return numeral(this.secretPercentageOfAllowedLength).format('0.0%')
        }
      }
    },
    secretQuotaPercentString: function () {
      if (this.activeSecretPlaintext) {
        return numeral(this.secretPercentageOfAllowedLength).format('0%')
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

  #secret-send-heading {
    margin-bottom: 2em;
  }

  #secret-send-input {
    margin-bottom: 2em;
  }

  #secret-send-buttons {
    margin-bottom: 2em;
  }

  #secret-send-link {
    margin-bottom: 2em;
  }

  #secret-send-link-text {
    margin-bottom: 2em;
  }

  #secret-send-link-buttons {
    margin-bottom: 2em;
  }

  #secret-send-link-copy-paste {
    margin-bottom: 2em;
  }

  .receipt {
    margin-bottom: 1em;
  }
</style>

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

    <div class="columns">
        <div class="column col-1"></div>
        <div class="form-group column col-10">
          <p class="silver" v-show="">The secret shared with you has been decrypted and is displayed below. The server copy has already been destroyed and can never be retrieved again.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="activeReceivedSecret">
      <div class="column col-1"></div>
      <div class="column col-10">
        <h6>Secret <span class="silver">( {{ activeReceivedSecretId }} )</span></h6>
        <p class="silver">Created @ {{ activeReceivedSecretCreatedAt }} UTC</p>
        <p class="silver">Received @ {{ activeReceivedSecretReceivedAt }} UTC</p>
        <p class="silver">Expires @ {{ activeReceivedSecretExpiresAt }} UTC</p>
        <pre>{{ activeReceivedSecretPlaintext }}</pre>
      </div>
      <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="!activeReceivedSecret">
      <div class="column col-3"></div>
      <div class="column col-6">
        <div class="empty">
            <i class="icon icon-people"></i>
            <p class="empty-title">Ooops, No Secret Selected</p>
            <p class="empty-meta" v-show="receivedSecretsPresent" >You have some previously received secrets you can view.</p>
            <p class="empty-meta">Maybe you'd like to send a new one?</p>
            <button v-link="{ path: '/e' }" class="empty-action btn btn-primary">Send New Secret</button>
        </div>
      </div>
      <div class="column col-3"></div>
    </div>

    <div class="columns" v-show="receivedSecretsPresent">
      <div class="column col-1"></div>
      <div class="column col-10">
        <h6>Previously Received Secrets ( <a @click="deleteAllReceivedSecrets">Delete All</a> )</h6>
        <p class="silver">These secrets were previously received and decrypted in this browser and stored for your convenience. To protect the sender, and yourself, you should delete those you no longer need. These secrets are unencrypted and this is <em>NOT</em> a secure storage area!</pre>
        <table class="table table-striped table-hover">
            <tbody>
                <tr v-bind:class="{ 'selected': paramId === secret.id }" v-for="secret in receivedSecrets | orderBy 'receivedAt' -1">
                  <td><a @click="setActiveReceivedSecret(secret)" v-link="{ name: 'decrypt-id-key', params: { id: secret.id, key: secret.keyB32 }}" class="btn btn-link">{{ $key }}</a></td>
                  <td><a @click="setActiveReceivedSecret(secret)" v-link="{ name: 'decrypt-id-key', params: { id: secret.id, key: secret.keyB32 }}" class="btn btn-link">{{ (new Date(secret.receivedAt)).toLocaleString() }}</a></td>
                  <td><a @click="deleteReceivedSecret(secret)" class="btn btn-link">Delete</a></td>
                </tr>
            </tbody>
        </table>
      </div>
      <div class="column col-1"></div>
    </div>

  </div>
</template>

<script>
import * as actions from '../vuex/actions'
import * as getters from '../vuex/getters'

export default {
  vuex: {
    getters,
    actions
  },
  computed: {
    paramId: function () {
      return this.$route.params.id
    },
    paramKey: function () {
      return this.$route.params.key
    },
  },
  created () {
    this.getSecret(this.paramId, this.paramKey)
    this.setActiveReceivedSecret(this.receivedSecrets[this.paramId])
  },
  route: {
    data: function (transition) {
      this.getSecret(this.paramId, this.paramKey)
      this.setActiveReceivedSecret(this.receivedSecrets[this.paramId])
      transition.next({})
    }
  }
}
</script>

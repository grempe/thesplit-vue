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
  <div id="receive">

    <div class="columns">
        <div class="column col-1"></div>
        <div class="form-group column col-10">
          <p class="silver" v-show="">The secret shared with you has been decrypted and is displayed below. The server copy has already been destroyed and can never be retrieved again.</p>
        </div>
        <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="activeReceivedSecretPresent">
      <div class="column col-1"></div>
      <div class="column col-10">
        <h6>Decrypted Secret <span class="silver">( ID : {{ activeReceivedSecretId }} : Created {{ activeReceivedSecretCreatedAt }} UTC )</span></h6>
        <pre>{{ activeReceivedSecretPlaintext }}</pre>
      </div>
      <div class="column col-1"></div>
    </div>

    <div class="columns" v-show="!activeReceivedSecretPresent">
      <div class="column col-3"></div>
      <div class="column col-6">
        <div class="empty">
            <i class="icon icon-people"></i>
            <p class="empty-title">No Secret Selected</p>
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
        <h6>Received Secrets ( <a @click="deleteAllReceivedSecrets">delete all</a> )</h6>
        <p class="silver">These secrets were previously received, decrypted locally, and stored for your convenience. To protect the sender, and yourself, you should delete any secrets you no longer need access to. These secrets are unencrypted and this is <em>NOT</em> a secure storage area!</pre>
        <table class="table table-striped table-hover">
            <tbody>
                <tr v-bind:class="{ 'selected': this.$route.params.id === secret.id }" v-for="secret in receivedSecrets | orderBy 'receivedAt' -1">
                  <td><a @click="setActiveReceivedSecret(secret)" v-link="{ name: 'receive-id-key', params: { id: secret.id, key: secret.keyB32 }}" class="btn btn-link">{{ $key }}</a></td>
                  <td>{{ (new Date(secret.receivedAt)).toLocaleString() }}</td>
                  <td><a @click="deleteReceivedSecret(secret)" class="btn btn-link">delete</a></td>
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
  created () {
    this.deleteAllAlerts()
  },
  destroyed () {
    this.deleteAllAlerts()
    this.unsetActiveReceivedSecret()
  },
  route: {
    data: function (transition) {
      this.deleteAllAlerts()
      this.getSecret(this.$route.params.id, this.$route.params.key)
      transition.next({})
    }
  }
}
</script>

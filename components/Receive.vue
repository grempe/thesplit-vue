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

    <h2 v-show="!activeReceivedSecretPresent">Receive a Secret</h2>

    <div class="row" v-show="activeReceivedSecretPresent">
      <div class="col-md-12">
        <div class="panel panel-success">
          <div class="panel-heading">
            <h4 class="panel-title">Decrypted Secret ( <a @click="unsetActiveReceivedSecret">close</a> )</h4>
            <br>
            <p class="text-muted text-small">
              <strong>ID</strong> : {{ activeReceivedSecretId }}<br>
              <strong>Created</strong> : {{ activeReceivedSecretCreatedAt }} UTC
            </p>
            <p class="text-muted text-small"></p>
          </div>
          <div class="panel-body">
            <pre class="pre-scrollable">{{ activeReceivedSecretPlaintext }}</pre>
          </div>
        </div>
      </div>
    </div>

    <div class="row" v-show="!activeReceivedSecretPresent">
      <div class="col-md-12">
        <div class="jumbotron">
          <h3 class="empty-title">No secret selected</h3>
          <p class="empty-meta" v-show="receivedSecretsPresent" >You have {{ receivedSecretsCount }} {{receivedSecretsCount | pluralize 'secret'}} linked in the received secrets section below.</p>
          <p class="empty-meta">Like to send a new one?</p>
          <button v-link="{ path: '/e' }" class="empty-action btn btn-primary">Send New Secret</button>
        </div>
        <div class="empty">
        </div>
      </div>
    </div>

    <br>
    <br>

    <div class="row" v-show="receivedSecretsPresent">
      <div class="col-md-12">
        <strong>Received ( <a @click="deleteAllReceivedSecrets">delete all</a> )</strong>
        <table class="table table-striped table-hover">
          <caption>
            These secrets were previously received, decrypted locally, and stored for your
            convenience. To protect the sender, and yourself, you should delete any secrets
            you no longer need access to. These secrets are unencrypted and this is
            <em>NOT</em> a secure storage area!
          </caption>
          <thead>
            <tr>
              <th>ID</th>
              <th>Received At</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
              <tr v-bind:class="{ 'success': this.$route.params.id === secret.id }" v-for="secret in receivedSecrets | orderBy 'receivedAt' -1">
                <td><a @click="setActiveReceivedSecret(secret)" v-link="{ name: 'receive-id-key', params: { id: secret.id, key: secret.keyB32 }}" class="btn btn-link">{{ $key }}</a></td>
                <td>{{ (new Date(secret.receivedAt)).toLocaleString() }}</td>
                <td><a @click="deleteReceivedSecret(secret)">delete</a></td>
              </tr>
          </tbody>
        </table>
      </div>
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

      // bootstrap tooltip activate
      this.$nextTick(function () {
        $('[data-toggle="tooltip"]').tooltip()
      })

      transition.next({})
    }
  }
}
</script>

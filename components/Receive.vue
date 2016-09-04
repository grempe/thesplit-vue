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

    <div class="row" v-show="activeReceivedSecretPresent">
      <div class="col-md-12">
        <div class="panel panel-success">
          <div class="panel-heading">
            <h4 class="panel-title">Decrypted Secret<a class="pull-right" @click="unsetActiveReceivedSecret"><span class="fa fa-times-circle"></span></a></h4>
            <br>
            <p class="text-muted text-small">
              {{ activeReceivedSecretId }}<br>
              {{ activeReceivedSecretCreatedAt | moment "M/D/YYYY H:mm:ss"}}<span class="text-muted"> - {{ activeReceivedSecretCreatedAt | moment "from" "now" }}</span>
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
          <h3 class="empty-title"><span class="fa fa-arrow-down fa-fw fa-lg"></span>Receive a Secret</h3>
          <p class="empty-meta" v-show="receivedSecretsPresent" >You've received {{ receivedSecretsCount }} {{receivedSecretsCount | pluralize 'secret'}} before.</p>
          <p class="empty-meta">Care to send a new one?</p>
          <button v-link="{ path: '/e' }" class="empty-action btn btn-primary">Send a new secret</button>
        </div>
        <div class="empty">
        </div>
      </div>
    </div>

    <div class="panel panel-default" v-show="receivedSecretsPresent" >
      <div class="panel-heading">
        <h3 class="panel-title">Received <a class="pull-right" @click="deleteAllReceivedSecrets"><span class="fa fa-trash fa-fw"></span>Delete All</a></h3>
        <br>
        <p>These secrets were previously received, and stored here for your
            convenience. To protect the sender, and yourself, from accidental disclosure
            you should delete, or store securely, any secrets you no longer need.
            These secrets are stored <em>unencrypted</em> in your browser! All times
            shown are in UTC.</p>
      </div>
      <div class="panel-body">
        <div class="row secret" v-for="secret in receivedSecrets | orderBy 'receivedAt' -1">
          <div class="col-xs-12 col-sm-6">
            <a @click="deleteReceivedSecret(secret)" alt="Delete Secret"><span class="fa fa-trash fa-fw"></span></a><samp><a @click="setActiveReceivedSecret(secret)" v-link="{ name: 'receive-id-key', params: { id: secret.id, key: secret.keyB32 }}" class="btn btn-link">{{ $key }}</a></samp>
          </div>
          <div class="col-xs-12 col-sm-6">
            {{ secret.receivedAt | moment "M/D/YYYY H:mm:ss" }} <span class="text-muted"> - {{ secret.receivedAt | moment "from" "now" }}</span>
          </div>
        </div>
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

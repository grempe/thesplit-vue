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
<div class="columns">
    <div class="column col-3"></div>
    <div class="form-group column col-6">
        <textarea id="inputSecretText" v-model="secret" v-on:keyup="notify" type="text" class="form-input" placeholder="We all have secrets. Send yours safely." rows="5" autofocus></textarea>
    <div class="column col-3"></div>
</div>
</template>

<script>
export default {
  props: ['secret'],
  methods: {
    notify: function () {
      if (this.secret) {
        this.$dispatch('secret-changed', this.secret.trim())
      }
    }
  }
}
</script>

<style>
</style>

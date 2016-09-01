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
  <div id="verify">

    <h4>Verify a Secret</h4>

    <div class="row" v-show="!foo">
      <div class="col-md-12">
        <p>Maintaining the security and integrity of your data is the most important
          job we do. That's why we take the job of ensuring you get back exactly what
          was put in, byte for byte, so seriously.</p>
        <p>Your sensitive data is passed through a series of cryptographic
            integrity checks, when uploaded and downloaded. We even go the extra
            mile and anchor a hash of your encrypted data in the Bitcoin blockchain,
            which we use as an immutable data store. This allows anyone to perform
            a data integrity audit without fear of revealing sensitive information.</p>
      </div>
    </div>
    
    <strong>Implementation TBD</strong>
  </div>
</template>

<script>
import * as actions from '../vuex/actions'
import * as getters from '../vuex/getters'

export default {
  data () {
    return {
      id: this.$route.params.id
    }
  },
  vuex: {
    getters,
    actions
  },
  route: {
    data: function (transition) {

      // bootstrap tooltip activate
      this.$nextTick(function () {
        $('[data-toggle="tooltip"]').tooltip()
      })

      transition.next({})
    }
  }
}
</script>

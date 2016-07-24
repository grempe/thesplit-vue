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

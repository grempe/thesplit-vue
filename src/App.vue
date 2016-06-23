<template>
  <div class="container" v-cloak>
    <div class="columns">
      <div class="column col-12">
        <header class="text-center">
          <h3>zerotime</h3>
          <em>end-to-end encrypted, zero-knowledge, secret sharing</em><br>
          <a v-link="{ path: '/e' }">create a secret</a>&nbsp;<a v-link="{ path: '/d' }">retrieve a secret</a>
        </header>
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {}
</script>

<style>
[v-cloak] {
  display: none;
}
</style>

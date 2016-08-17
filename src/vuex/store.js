import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// Create an object to hold the initial state when
// the app starts up.
const state = {
  settings: {
      apiBaseUrl: location.host == '127.0.0.1' || 'localhost' ? 'http://localhost:3000/api/v1' : location.protocol + '//' + location.host + '/api/v1'
  }
}

// Create an object storing various mutations.
const mutations = {
  // A mutation receives the current state as the first argument
  // You can make any modifications you want inside this function

  SETAPIURL (state, url) {
     state.settings.apiBaseUrl = url 
  }
}

// Combine the initial state and the mutations to create a Vuex store.
// This store can be linked to our app.
export default new Vuex.Store({
  state,
  mutations
})

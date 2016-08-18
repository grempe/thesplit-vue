import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const localhost = location.host == '127.0.0.1' || 'localhost'
const defaultBaseUrl = localhost ? 'http://localhost:3000/api/v1' : location.protocol + '//' + location.host + '/api/v1'

// Create an object to hold the initial state when
// the app starts up.
const state = {
  settings: {
      debug: true,
      apiBaseUrl: defaultBaseUrl
  }
}

// Create an object storing various mutations. mutation
// handler functions must be Synchronous! e.g. No API calls.
// A mutation receives the current state as the first argument
// You can make any modifications you want inside this function
const mutations = {
  SET_DEBUG_ON (state) {
    state.settings.debug = true
  },

  SET_DEBUG_OFF (state) {
    state.settings.debug = false
  },

  SET_DEV_API (state) {
    state.settings.apiBaseUrl = 'http://localhost:3000/api/v1'
  },

  SET_HOST_API (state) {
    state.settings.apiBaseUrl = location.protocol + '//' + location.host + '/api/v1'
  },

  SET_PROD_API (state) {
    state.settings.apiBaseUrl = 'https://thesplit.is/api/v1'
  },
  
}

// Combine the initial state and the mutations to create a Vuex store.
// This store can be linked to our app.
export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state,
  mutations
})

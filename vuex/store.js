import Vue from 'vue'
import Vuex from 'vuex'
import plugins from './plugins'

Vue.use(Vuex)

// HTML5 localStorage Keys
export const SENT_SECRETS_STORAGE_KEY = 'thesplit-sent-secrets'
export const RECEIVED_SECRETS_STORAGE_KEY = 'thesplit-received-secrets'

const localhost = location.host == '127.0.0.1' || 'localhost'

const defaultBaseUrl = localhost
  ? 'http://localhost:3000/api/v1'
  : location.protocol + '//' + location.host + '/api/v1'

// Create an object to hold the initial state when
// the app starts up. Load certain keys from localStorage
// if previously saved.
const state = {
  // Visual 'toasts'
  alerts: [],

  // Application wide configuration settings
  settings: {
    debug: true,

    // The API base URL
    apiBaseUrl: defaultBaseUrl,

    // N : 2^14 (8192, ~750ms on laptop) : The number of iterations. number (integer)
    // r: Memory factor. number (integer)
    // p: Parallelization factor. number (integer)
    // keyLenBytes: The number of bytes to return. number (integer)
    scrypt: {N: 8192, r: 8, p: 1, keyLenBytes: 64},

    // Length in bytes of the client generated HMAC of the encrypted contents.
    // The HMAC is used as the ID to lookup the encrypted data on the server.
    // See : https://blog.learnphoenix.io/how-long-should-i-make-my-api-key-833ebf2dc26f#.g50v0h1bx
    // 10 Bytes, 20 Hex chars
    //   n = Math.pow(16,20), or 1.2089258196146292e+24 possible combinations.
    // If we assume 'k' value is 1bn secrets stored in the lifetime of the app, this would
    // work out to a chance of collision of calculate(n, 1000000000) = 4.1359022029396897e-7
    // However, since secrets and their ID's are ephemeral, lasting only ~24 hours, the chance
    // of collision is much much lower.
    hmacLengthBytes: 10
  },

  // The currently in-view received secret
  activeReceivedSecret: {
    plaintext: '',
    keyB32: '',
    id: '',
    boxNonce: '',
    box: '',
    scryptSalt: '',
    createdAt: '',
    expiresAt: ''
  },

  // All previously received secrets
  receivedSecrets: JSON.parse(localStorage.getItem(RECEIVED_SECRETS_STORAGE_KEY) || '{}'),

  // The current in-progress empty secret for the sender to encrypt and send
  activeSecret: {
    plaintext: '',
    keyB32: '',
    id: '',
    boxNonce: '',
    box: '',
    scryptSalt: ''
  },

  // All previously sent secrets
  sentSecrets: JSON.parse(localStorage.getItem(SENT_SECRETS_STORAGE_KEY) || '{}')
}

// Create an object storing various mutations. mutation
// handler functions must be Synchronous! e.g. No API calls.
// A mutation receives the current state as the first argument
// You can make any modifications you want inside this function
const mutations = {
  // SETTINGS

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

  // ALERTS

  ADD_ALERT (state, type, msg) {
    state.alerts.push({
      type: type,
      msg: msg
    })
  },

  DELETE_ALERT (state, alert) {
    state.alerts.splice(state.alerts.indexOf(alert), 1)
  },

  DELETE_ALL_ALERTS (state) {
    state.alerts = []
  },

  // RECEIVED SECRETS

  SET_ACTIVE_RECEIVED_SECRET (state, sec) {
    if (state.activeReceivedSecret.id !== sec.id) {
      state.activeReceivedSecret = sec
    }
  },

  UNSET_ACTIVE_RECEIVED_SECRET (state) {
    state.activeReceivedSecret = {
      plaintext: '',
      keyB32: '',
      id: '',
      boxNonce: '',
      box: '',
      scryptSalt: '',
      createdAt: '',
      expiresAt: ''
    }
  },

  SET_ACTIVE_RECEIVED_SECRET_ID (state, id) {
    Vue.set(state.activeReceivedSecret, 'id', id)
  },

  SET_ACTIVE_RECEIVED_SECRET_KEY (state, key) {
    Vue.set(state.activeReceivedSecret, 'keyB32', key)
  },

  SET_ACTIVE_RECEIVED_SECRET_PLAINTEXT (state, pt) {
    Vue.set(state.activeReceivedSecret, 'plaintext', pt)
  },

  SET_ACTIVE_RECEIVED_SECRET_BOX_NONCE (state, n) {
    Vue.set(state.activeReceivedSecret, 'boxNonce', n)
  },

  SET_ACTIVE_RECEIVED_SECRET_BOX (state, b) {
    Vue.set(state.activeReceivedSecret, 'box', b)
  },

  SET_ACTIVE_RECEIVED_SECRET_SCRYPT_SALT (state, s) {
    Vue.set(state.activeReceivedSecret, 'scryptSalt', s)
  },

  SET_ACTIVE_RECEIVED_SECRET_CREATED_AT (state, t) {
    Vue.set(state.activeReceivedSecret, 'createdAt', t)
  },

  SET_ACTIVE_RECEIVED_SECRET_RECEIVED_AT (state, t) {
    Vue.set(state.activeReceivedSecret, 'receivedAt', t)
  },

  SET_ACTIVE_RECEIVED_SECRET_EXPIRES_AT (state, t) {
    Vue.set(state.activeReceivedSecret, 'expiresAt', t)
  },

  SAVE_RECEIVED_SECRET (state, sec) {
    Vue.set(state.receivedSecrets, sec.id, sec)
  },

  DELETE_RECEIVED_SECRET (state, id) {
    Vue.delete(state.receivedSecrets, id)
  },

  DELETE_ALL_RECEIVED_SECRETS (state) {
    state.receivedSecrets = {}
  },

  // SENT SECRETS

  SET_ACTIVE_SECRET (state, sec) {
    state.activeSecret = sec
  },

  UNSET_ACTIVE_SECRET (state) {
    state.activeSecret = {
      plaintext: '',
      keyB32: '',
      id: '',
      boxNonce: '',
      box: '',
      scryptSalt: ''
    }
  },

  SET_ACTIVE_SECRET_ID (state, id) {
    Vue.set(state.activeSecret, 'id', id)
  },

  SET_ACTIVE_SECRET_KEY (state, key) {
    Vue.set(state.activeSecret, 'keyB32', key)
  },

  SET_ACTIVE_SECRET_PLAINTEXT (state, pt) {
    Vue.set(state.activeSecret, 'plaintext', pt)
  },

  SET_ACTIVE_SECRET_BOX_NONCE (state, n) {
    Vue.set(state.activeSecret, 'boxNonce', n)
  },

  SET_ACTIVE_SECRET_BOX (state, b) {
    Vue.set(state.activeSecret, 'box', b)
  },

  SET_ACTIVE_SECRET_SCRYPT_SALT (state, s) {
    Vue.set(state.activeSecret, 'scryptSalt', s)
  },

  SAVE_SENT_SECRET (state, sec) {
    Vue.set(state.sentSecrets, sec.id, sec)
  },

  DELETE_SENT_SECRET (state, id) {
    Vue.delete(state.sentSecrets, id)
  },

  DELETE_ALL_SENT_SECRETS (state) {
    state.sentSecrets = {}
  },

}

// Combine the initial state and the mutations to create a Vuex store.
// This store can be linked to our app.
export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state,
  mutations,
  plugins
})

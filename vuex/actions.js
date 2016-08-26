import Vue from 'vue'
import nacl from 'tweetnacl'
import naclutil from 'tweetnacl-util'
nacl.util = naclutil
import * as sha256 from "fast-sha256";
import BLAKE2s from 'blake2s-js'
import scrypt from 'scryptsy'
import base32 from 'base32-crockford-browser'

// An action will receive the store as the first argument.
// Since we are only interested in the dispatch (and optionally the state)
// we can pull those two parameters using the ES6 destructuring feature

// ALERTS

export function addAlert ({ dispatch }, type, msg) {
  dispatch('ADD_ALERT', type, msg)
}

export function deleteAlert ({ dispatch }, alert) {
  dispatch('DELETE_ALERT', alert)
}

export function deleteAllAlerts ({ dispatch }) {
  dispatch('DELETE_ALL_ALERTS')
}

// ALL SECRETS

export function deleteAllSecrets ({ dispatch }) {
  dispatch('DELETE_ALL_SENT_SECRETS')
  dispatch('UNSET_ACTIVE_SENT_SECRET')
  dispatch('DELETE_ALL_RECEIVED_SECRETS')
  dispatch('UNSET_ACTIVE_RECEIVED_SECRET')
}

// SENT SECRETS

export function saveSentSecret ({ dispatch }, sec) {
  dispatch('SAVE_SENT_SECRET', sec)
  dispatch('SET_ACTIVE_SENT_SECRET', sec)
}

export function deleteSentSecret ({ dispatch }, sec) {
  dispatch('DELETE_SENT_SECRET', sec.id)
  if (this.activeSentSecret.id === sec.id) {
    dispatch('UNSET_ACTIVE_SENT_SECRET')
  }
}

export function deleteAllSentSecrets ({ dispatch }) {
  dispatch('DELETE_ALL_SENT_SECRETS')
  dispatch('UNSET_ACTIVE_SENT_SECRET')
}

export function setActiveSentSecret ({ dispatch }, sec) {
  dispatch('SET_ACTIVE_SENT_SECRET', sec)
}

export function unsetActiveSentSecret ({ dispatch }) {
  dispatch('UNSET_ACTIVE_SENT_SECRET')
}

// RECEIVED SECRETS

export function saveReceivedSecret ({ dispatch }, sec) {
  dispatch('SAVE_RECEIVED_SECRET', sec)
  dispatch('SET_ACTIVE_RECEIVED_SECRET', sec)
}

export function deleteReceivedSecret ({ dispatch }, sec) {
  dispatch('DELETE_RECEIVED_SECRET', sec.id)
  if (this.activeReceivedSecret.id === sec.id) {
    dispatch('UNSET_ACTIVE_RECEIVED_SECRET')
  }
}

export function deleteAllReceivedSecrets ({ dispatch }) {
  dispatch('DELETE_ALL_RECEIVED_SECRETS')
  dispatch('UNSET_ACTIVE_RECEIVED_SECRET')
}

export function setActiveReceivedSecret ({ dispatch }, sec) {
  dispatch('SET_ACTIVE_RECEIVED_SECRET', sec)
}

export function unsetActiveReceivedSecret ({ dispatch }) {
  dispatch('UNSET_ACTIVE_RECEIVED_SECRET')
}

export const setDebugOn = makeAction('SET_DEBUG_ON')
export const setDebugOff = makeAction('SET_DEBUG_OFF')
export const setDevApi = makeAction('SET_DEV_API')
export const setHostApi = makeAction('SET_HOST_API')
export const setProdApi = makeAction('SET_PROD_API')

function makeAction (type) {
  return ({ dispatch }, ...args) => dispatch(type, ...args)
}

export const getSecret = ({ dispatch, state }, id, keyB32) => {
  if (!state.receivedSecrets[id]) {
    Vue.http.get(state.settings.apiBaseUrl + '/secrets/' + id).then((response) => {
      let sec = response.json().data
      sec.id = id
      sec.keyB32 = keyB32
      let d = new Date
      sec.receivedAt = d.getTime()

      // UNIX Timestamp is seconds from Epoch, JS uses milliseconds
      sec.createdAt *= 1000
      sec.expiresAt *= 1000
      
      // Derive NaCl Secret Box Key and HMAC Key with Scrypt
      let keyBytes = nacl.util.decodeBase64(base32.decode(sec.keyB32))
      let scryptSaltBytes = nacl.util.decodeBase64(sec.scryptSaltB64)
      let scryptBytes = scrypt(keyBytes,
                                scryptSaltBytes,
                                state.settings.scrypt.N,
                                state.settings.scrypt.r,
                                state.settings.scrypt.p,
                                state.settings.scrypt.keyLenBytes)

      let boxKeyKdfBytes = scryptBytes.slice(0, 32)
      let hmacKeyKdfBytes = scryptBytes.slice(32, 64)

      // Create the BLAKE2s HMAC used for authenticating the storage ID/HMAC
      // against the payload actually retrieved
      let h = new BLAKE2s(state.settings.hmacLengthBytes, hmacKeyKdfBytes)
      h.update(nacl.util.decodeUTF8(sec.scryptSaltB64))
      h.update(nacl.util.decodeUTF8(sec.boxNonceB64))
      h.update(nacl.util.decodeUTF8(sec.boxB64))
      let blake2sHash = h.hexDigest()

      // Secure constant-time string comparison
      if (nacl.verify(nacl.util.decodeUTF8(blake2sHash), nacl.util.decodeUTF8(sec.id))) {
        // Payload HMAC is OK, decrypt the secret box contents
        let boxBytes = nacl.util.decodeBase64(sec.boxB64)
        let boxNonceBytes = nacl.util.decodeBase64(sec.boxNonceB64)
        let secretBytes = nacl.secretbox.open(boxBytes, boxNonceBytes, boxKeyKdfBytes)

        if (secretBytes) {
          sec.plaintext = nacl.util.encodeUTF8(secretBytes)
          dispatch('SAVE_RECEIVED_SECRET', sec)
          dispatch('SET_ACTIVE_RECEIVED_SECRET', sec)
        } else {
          dispatch('ADD_ALERT', 'danger', 'The secret could not be decrypted')
        }
      } else {
        dispatch('ADD_ALERT', 'danger', 'The HMAC of the received secret did not match the HMAC ID')
      }
    }, (response) => {
      // error callback
      let err = JSON.parse(response.body)
      dispatch('ADD_ALERT', 'danger', err.message)
    })
  }
}

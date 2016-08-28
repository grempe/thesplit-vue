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
}

export function deleteAllSentSecrets ({ dispatch }) {
  dispatch('DELETE_ALL_SENT_SECRETS')
}

export function setActiveSecret ({ dispatch }, sec) {
  dispatch('SET_ACTIVE_SECRET', sec)
}

export function unsetActiveSecret ({ dispatch }) {
  dispatch('UNSET_ACTIVE_SECRET')
}

// RECEIVED SECRETS

export function saveReceivedSecret ({ dispatch }, sec) {
  dispatch('SAVE_RECEIVED_SECRET', sec)
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

// RECEIVING SECRETS

export const getSecret = ({ dispatch, state }, id, keyB32) => {
  // requires id and keyB32 from URI to retrieve a secret
  if (!state.receivedSecrets[id] && id && keyB32) {
    Vue.http.get(state.settings.apiBaseUrl + '/secrets/' + id).then((response) => {
      // API returns boxB64, boxNonceB64, scryptSaltB64, createdAt, expiresAt
      let d = new Date
      let r = response.json().data

      dispatch('SET_ACTIVE_RECEIVED_SECRET_ID', id)
      dispatch('SET_ACTIVE_RECEIVED_SECRET_KEY', keyB32)
      dispatch('SET_ACTIVE_RECEIVED_SECRET_BOX_NONCE', r.boxNonceB64)
      dispatch('SET_ACTIVE_RECEIVED_SECRET_BOX', r.boxB64)
      dispatch('SET_ACTIVE_RECEIVED_SECRET_SCRYPT_SALT', r.scryptSaltB64)
      // UNIX Timestamp is seconds from Epoch, JS uses milliseconds
      dispatch('SET_ACTIVE_RECEIVED_SECRET_CREATED_AT', r.createdAt * 1000)
      dispatch('SET_ACTIVE_RECEIVED_SECRET_EXPIRES_AT', r.expiresAt * 1000)
      dispatch('SET_ACTIVE_RECEIVED_SECRET_RECEIVED_AT', d.getTime())
      
      // Derive NaCl Secret Box Key and HMAC Key with Scrypt
      let keyBytes = nacl.util.decodeBase64(base32.decode(state.activeReceivedSecret.keyB32))
      let scryptSaltBytes = nacl.util.decodeBase64(state.activeReceivedSecret.scryptSaltB64)
      let scryptBytes = scrypt(keyBytes,
                                scryptSaltBytes,
                                state.settings.scrypt.N,
                                state.settings.scrypt.r,
                                state.settings.scrypt.p,
                                state.settings.scrypt.keyLenBytes)

      let boxKeyKdfBytes = scryptBytes.slice(0, state.settings.scrypt.keyLenBytes / 2)
      let hmacKeyKdfBytes = scryptBytes.slice(state.settings.scrypt.keyLenBytes / 2, state.settings.scrypt.keyLenBytes)

      // Create the BLAKE2s HMAC used for authenticating the storage ID/HMAC
      // against the payload actually retrieved
      let h = new BLAKE2s(state.settings.hmacLengthBytes, hmacKeyKdfBytes)
      h.update(nacl.util.decodeUTF8(state.activeReceivedSecret.scryptSaltB64))
      h.update(nacl.util.decodeUTF8(state.activeReceivedSecret.boxNonceB64))
      h.update(nacl.util.decodeUTF8(state.activeReceivedSecret.boxB64))
      let blake2sHash = h.hexDigest()

      // Secure constant-time string comparison
      if (nacl.verify(nacl.util.decodeUTF8(blake2sHash), nacl.util.decodeUTF8(state.activeReceivedSecret.id))) {
        // Payload HMAC is OK, decrypt the secret box contents
        let boxBytes = nacl.util.decodeBase64(state.activeReceivedSecret.boxB64)
        let boxNonceBytes = nacl.util.decodeBase64(state.activeReceivedSecret.boxNonceB64)
        let secretBytes = nacl.secretbox.open(boxBytes, boxNonceBytes, boxKeyKdfBytes)

        if (secretBytes && nacl.util.encodeUTF8(secretBytes) !== "undefined") {
          dispatch('SET_ACTIVE_RECEIVED_SECRET_PLAINTEXT', nacl.util.encodeUTF8(secretBytes))
          dispatch('SAVE_RECEIVED_SECRET', state.activeReceivedSecret)
        } else {
          dispatch('ADD_ALERT', 'danger', 'The secret could not be decrypted')
        }
      } else {
        dispatch('ADD_ALERT', 'danger', 'The HMAC of the received secret did not match the HMAC ID')
      }
    }, (response) => {
      // error callback
      if (response.data && response.data.message) {
        dispatch('ADD_ALERT', 'danger', response.data.message)
      } else {
        dispatch('ADD_ALERT', 'danger', 'Server Error')
      }
    })
  }
}

// SENDING SECRETS

export const deleteServerSentSecret = ({ dispatch, state }, sec) => {
  dispatch('DELETE_SENT_SECRET', sec.id)
  Vue.http.delete(state.settings.apiBaseUrl + '/secrets/' + sec.id).then((response) => {
    dispatch('ADD_ALERT', 'success', "The local receipt and server secret have been destroyed.")
  }, (response) => {
    // error callback
    if (response.data && response.data.message) {
      if (response.data.code === 404) {
        dispatch('ADD_ALERT', 'success', "The local receipt and server secret have been destroyed.")
      } else {
        dispatch('ADD_ALERT', 'danger', response.data.message)
      }
    } else {
      dispatch('ADD_ALERT', 'danger', 'Server Error')
    }
  })
}

export const updateActiveSecretPlaintext = ({ dispatch, state }, e) => {
  dispatch('SET_ACTIVE_SECRET_PLAINTEXT', e.target.value)
}

export const encryptActiveSecret = ({ dispatch, state }) => {
  // The random key from which the box encryption key and
  // HMAC keys are derived using scrypt KDF. A Base32 encoded
  // copy of this key will become part of the secret URI for
  // sender and recipient. Base32 being URI and human friendly.
  let key = nacl.randomBytes(8)
  let keyB32 = base32.encode(nacl.util.encodeBase64(key))
  
  // Derive NaCl Secret Box Key and HMAC Key with Scrypt
  let scryptSalt = nacl.randomBytes(32)
  let scryptSaltB64 = nacl.util.encodeBase64(scryptSalt)
  let scryptBytes = scrypt(key,
                           scryptSalt,
                           state.settings.scrypt.N,
                           state.settings.scrypt.r,
                           state.settings.scrypt.p,
                           state.settings.scrypt.keyLenBytes)

  // Split the KDF bytes, half for the box encryption key, half for the HMAC key.
  let boxKeyKdfBytes = scryptBytes.slice(0, state.settings.scrypt.keyLenBytes / 2)
  let hmacKeyKdfBytes = scryptBytes.slice(state.settings.scrypt.keyLenBytes / 2, state.settings.scrypt.keyLenBytes)

  // Encrypt the secret into an NaCl Secret Box
  let boxNonce = nacl.randomBytes(24)
  let boxNonceB64 = nacl.util.encodeBase64(boxNonce)
  let plaintextBytes = nacl.util.decodeUTF8(state.activeSecret.plaintext)
  let box = nacl.secretbox(plaintextBytes, boxNonce, boxKeyKdfBytes)
  let boxB64 = nacl.util.encodeBase64(box)

  // BLAKE2s HMAC hexdigest is used as the ID to store and lookup
  // secrets as well as allow the holder of the derived HMAC key to
  // authenticate the secret payload.
  let h = new BLAKE2s(state.settings.hmacLengthBytes, hmacKeyKdfBytes)
  h.update(nacl.util.decodeUTF8(scryptSaltB64))
  h.update(nacl.util.decodeUTF8(boxNonceB64))
  h.update(nacl.util.decodeUTF8(boxB64))
  let blake2sHash = h.hexDigest()

  dispatch('SET_ACTIVE_SECRET_ID', blake2sHash)
  dispatch('SET_ACTIVE_SECRET_KEY', keyB32)
  dispatch('SET_ACTIVE_SECRET_BOX_NONCE', boxNonceB64)
  dispatch('SET_ACTIVE_SECRET_BOX', boxB64)
  dispatch('SET_ACTIVE_SECRET_SCRYPT_SALT', scryptSaltB64)

  // Trigger action to send the secret payload to the server
  postActiveSecret({dispatch, state})

  // AUTO-DELETE all local active secret data a short time after encrypted
  // and submitted to the server. The user must copy the URL within that time
  // or it will dissapear. Avoids possibility of someone viewing the UI
  // afterwards and finding plaintext laying around.
  setTimeout(function(){
    dispatch('UNSET_ACTIVE_SECRET')
  }, 60000)
}

export const postActiveSecret = ({ dispatch, state }) => {
  // Whitelist to be sure we only send allowed attributes to the server
  let whiteSec = {
    id: state.activeSecret.id,
    boxNonceB64: state.activeSecret.boxNonceB64,
    boxB64: state.activeSecret.boxB64,
    scryptSaltB64: state.activeSecret.scryptSaltB64
  }

  // Expects object w/ id, boxNonceB64, boxB64, scryptSaltB64
  Vue.http.post(state.settings.apiBaseUrl + '/secrets', whiteSec).then((response) => {
    // API returns id, createdAt, expiresAt
    let newSec = response.json().data
    
    // UNIX Timestamp is seconds from Epoch, JS uses milliseconds
    newSec.createdAt *= 1000
    newSec.expiresAt *= 1000

    dispatch('SAVE_SENT_SECRET', newSec)
  }, (response) => {
    // error callback
    if (response.data && response.data.message) {
      dispatch('ADD_ALERT', 'danger', response.data.message)
    } else {
      dispatch('ADD_ALERT', 'danger', 'Server Error')
    }
  })

}

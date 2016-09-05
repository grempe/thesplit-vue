import Vue from 'vue'
import nacl from 'tweetnacl'
import naclutil from 'tweetnacl-util'
nacl.util = naclutil
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
  dispatch('UNSET_ACTIVE_SECRET')
  dispatch('DELETE_ALL_RECEIVED_SECRETS')
  dispatch('UNSET_ACTIVE_RECEIVED_SECRET')
}

// SENT SECRETS

export function saveSentSecret ({ dispatch, state }, sec) {
  dispatch('SAVE_SENT_SECRET', sec)
}

export function deleteSentSecret ({ dispatch, state }, sec) {
  if (state.activeSecret && state.activeSecret.id === sec.id) {
    dispatch('UNSET_ACTIVE_SECRET')
  }
  dispatch('DELETE_SENT_SECRET', sec.id)
}

export function deleteAllSentSecrets ({ dispatch }) {
  dispatch('DELETE_ALL_SENT_SECRETS')
}

export function setActiveSecret ({ dispatch, state }, sec) {
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

export const setNpmEnv = makeAction('SET_NPM_ENV')
export const setDevEnv = makeAction('SET_DEV_ENV')
export const setTestEnv = makeAction('SET_TEST_ENV')
export const setProdEnv = makeAction('SET_PROD_ENV')

function makeAction (type) {
  return ({ dispatch }, ...args) => dispatch(type, ...args)
}

// RECEIVING SECRETS

export const getSecret = ({ dispatch, state }, id, keyB32) => {
  // requires id and keyB32 from URI to retrieve a secret
  if (!state.receivedSecrets[id] && id && keyB32) {    
    let h = new BLAKE2s(32)
    h.update(nacl.util.decodeUTF8(id))
    let serverId = h.hexDigest()

    Vue.http.get(state.settings.apiBaseUrl + '/secrets/' + serverId).then((response) => {
      // API returns box, box_nonce, scrypt_salt, created_at, expires_at
      let d = new Date
      let r = response.json().data

      dispatch('SET_ACTIVE_RECEIVED_SECRET_ID', id)
      dispatch('SET_ACTIVE_RECEIVED_SECRET_KEY', keyB32)
      dispatch('SET_ACTIVE_RECEIVED_SECRET_BOX_NONCE', r.boxNonce)
      dispatch('SET_ACTIVE_RECEIVED_SECRET_BOX', r.box)
      dispatch('SET_ACTIVE_RECEIVED_SECRET_SCRYPT_SALT', r.scryptSalt)
      // UNIX Timestamp is seconds from Epoch, JS uses milliseconds
      dispatch('SET_ACTIVE_RECEIVED_SECRET_CREATED_AT', r.createdAt * 1000)
      dispatch('SET_ACTIVE_RECEIVED_SECRET_EXPIRES_AT', r.expiresAt * 1000)
      dispatch('SET_ACTIVE_RECEIVED_SECRET_RECEIVED_AT', d.getTime())
      
      // Derive NaCl Secret Box Key and HMAC Key with Scrypt
      let keyBytes = nacl.util.decodeBase64(base32.decode(state.activeReceivedSecret.keyB32))
      let scryptSaltBytes = nacl.util.decodeBase64(state.activeReceivedSecret.scryptSalt)
      let scryptBytes = scrypt(keyBytes,
                                scryptSaltBytes,
                                state.settings.scrypt.N,
                                state.settings.scrypt.r,
                                state.settings.scrypt.p,
                                state.settings.scrypt.keyLenBytes)

      let boxKeyKdfBytes = scryptBytes.slice(0, state.settings.scrypt.keyLenBytes / 2)
      let hmacKeyKdfBytes = scryptBytes.slice(state.settings.scrypt.keyLenBytes / 2, state.settings.scrypt.keyLenBytes)

      // Recreate the BLAKE2s HMAC to authenticate that the payload that was
      // actually retrieved matches the ID (HMAC) that the data was retrieved
      // with and stored under.
      let h = new BLAKE2s(state.settings.hmacLengthBytes, hmacKeyKdfBytes)
      h.update(nacl.util.decodeUTF8(state.activeReceivedSecret.scryptSalt))
      h.update(nacl.util.decodeUTF8(state.activeReceivedSecret.boxNonce))
      h.update(nacl.util.decodeUTF8(state.activeReceivedSecret.box))
      let newId = h.hexDigest()

      // Secure constant-time string comparison
      if (nacl.verify(nacl.util.decodeUTF8(newId), nacl.util.decodeUTF8(id))) {
        // Payload HMAC is OK, decrypt the secret box contents
        let boxBytes = nacl.util.decodeBase64(state.activeReceivedSecret.box)
        let boxNonceBytes = nacl.util.decodeBase64(state.activeReceivedSecret.boxNonce)
        let secretBytes = nacl.secretbox.open(boxBytes, boxNonceBytes, boxKeyKdfBytes)

        if (secretBytes && nacl.util.encodeUTF8(secretBytes) !== "undefined") {
          dispatch('SET_ACTIVE_RECEIVED_SECRET_PLAINTEXT', nacl.util.encodeUTF8(secretBytes))
          dispatch('SAVE_RECEIVED_SECRET', state.activeReceivedSecret)
        } else {
          addAlert({ dispatch }, 'danger', 'The secret could not be decrypted')          
        }
      } else {
        addAlert({ dispatch }, 'danger', 'The HMAC of the received secret did not match the HMAC ID')          
      }
    }, (response) => {
      // error callback
      if (response.data && response.data.message) {
        addAlert({ dispatch }, 'danger', response.data.message)          
      } else {
        addAlert({ dispatch }, 'danger', 'Server Error')          
      }
    })
  }
}

// SENDING SECRETS

export const deleteServerSentSecret = ({ dispatch, state }, sec) => {
  deleteSentSecret({ dispatch, state }, sec)

  let h = new BLAKE2s(32)
  h.update(nacl.util.decodeUTF8(sec.id))
  let serverId = h.hexDigest()

  Vue.http.delete(state.settings.apiBaseUrl + '/secrets/' + serverId).then((response) => {
    addAlert({ dispatch }, 'success', "The local receipt and server secret have been removed.")
  }, (response) => {
    // error callback
    if (response.data && response.data.message) {
      if (response.data.code === 404) {
        addAlert({ dispatch }, 'info', "The local receipt was deleted, the server secret was already viewed or has expired.")
      } else {
        addAlert({ dispatch }, 'danger', response.data.message)
      }
    } else {
      addAlert({ dispatch }, 'danger', 'Server Error')
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
  // 16 Bytes, 128 bits random key
  let key = nacl.randomBytes(16)
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
  let id = h.hexDigest()

  dispatch('SET_ACTIVE_SECRET_ID', id)
  dispatch('SET_ACTIVE_SECRET_KEY', keyB32)
  dispatch('SET_ACTIVE_SECRET_BOX_NONCE', boxNonceB64)
  dispatch('SET_ACTIVE_SECRET_BOX', boxB64)
  dispatch('SET_ACTIVE_SECRET_SCRYPT_SALT', scryptSaltB64)

  // Trigger action to send the secret payload to the server
  postActiveSecret({dispatch, state})
}

export const postActiveSecret = ({ dispatch, state }) => {
  // Generate a 32 byte (64 char) hexdigest of the client ID.
  // This hash of the ID is the handle that all data on the
  // server will be stored and retrieved with. This is done
  // to make it impossible for an attacker with knowledge of
  // all ID's stored on the server to reverse the server ID
  // back into the client ID that is embedded in the URL
  // used to share the secret. If an attacker were able to
  // derive the ID used in the URL from what is found on the
  // server they could do a global search (e.g. all gmail,
  // all twitter) to find the owner of that unique hash. If
  // they were able to find the owner of the hash, that would
  // also likely give them access to the original encryption key
  // which is usually co-located with the client ID in the
  // secret URL.
  let h = new BLAKE2s(32)
  h.update(nacl.util.decodeUTF8(state.activeSecret.id))
  let serverId = h.hexDigest()
  
  // Whitelist to be sure we only send allowed attributes to the server
  let whiteSec = {
    id: serverId,
    boxNonce: state.activeSecret.boxNonce,
    box: state.activeSecret.box,
    scryptSalt: state.activeSecret.scryptSalt
  }

  // Expects object w/ id, box_nonce, box, scrypt_salt
  // camelCase will be auto-converted to snake_case for the server
  // on both POST and response.
  Vue.http.post(state.settings.apiBaseUrl + '/secrets', whiteSec).then((response) => {
    // API returns created_at, expires_at
    let newSec = response.json().data
    // the local client always deals in the client ID
    // and is not aware of, nor cares about, the
    // hashed version of this ID used as the server ID.
    newSec.id = state.activeSecret.id

    // UNIX Timestamp is seconds from Epoch, JS uses milliseconds
    newSec.createdAt *= 1000
    newSec.expiresAt *= 1000

    saveSentSecret({ dispatch, state }, newSec)
  }, (response) => {
    // error callback
    if (response.data && response.data.message) {
      addAlert({ dispatch }, 'danger', response.data.message)
    } else {
      addAlert({ dispatch }, 'danger', 'Server Error')
    }
  })

}

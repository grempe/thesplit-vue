export function debug (state) {
  return state.settings.debug
}

export function settings (state) {
  return state.settings
}

export function alerts (state) {
  return state.alerts
}

// RECEIVED SECRETS

export function activeReceivedSecret (state) {
  if (state.activeReceivedSecret) {
    return state.activeReceivedSecret
  }
}

export function activeReceivedSecretPresent (state) {
  if (state.activeReceivedSecret && state.activeReceivedSecret.plaintext !== '') {
    return state.activeReceivedSecret
  }
}

export function activeReceivedSecretId (state) {
  if (state.activeReceivedSecret) {
    return state.activeReceivedSecret.id
  }
}

export function activeReceivedSecretCreatedAt (state) {
  if (state.activeReceivedSecret) {
    return state.activeReceivedSecret.createdAt
  }
}

export function activeReceivedSecretPlaintext (state) {
  if (state.activeReceivedSecret) {
    return state.activeReceivedSecret.plaintext
  }
}

export function receivedSecrets (state) {
  return state.receivedSecrets
}

export function receivedSecretsPresent (state) {
  return Object.keys(state.receivedSecrets).length > 0
    ? true
    : false
}

export function receivedSecretsCount (state) {
  return Object.keys(state.receivedSecrets).length
}

// SENT SECRETS

export function activeSecret (state) {
  return state.activeSecret
}

export function activeSecretPlaintext (state) {
  if (state.activeSecret) {
    return state.activeSecret.plaintext
  }
}

export function activeSecretEncrypted (state) {
  return state.activeSecret.id !== "" ? true : false
}

export function activeSecretUrl (state) {
  if (location.protocol && location.host && state.activeSecret.id !== '' && state.activeSecret.keyB32 !== '') {
    return location.protocol + '//' + location.host + '/#!/r/' + state.activeSecret.id + '/' + state.activeSecret.keyB32
  }
}

export function sentSecrets (state) {
  return state.sentSecrets
}

export function sentSecretsPresent (state) {
  return Object.keys(state.sentSecrets).length > 0
    ? true
    : false
}

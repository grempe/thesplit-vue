export function debug (state) {
  return state.settings.debug
}

export function settings (state) {
  return state.settings
}

export function alerts (state) {
  return state.alerts
}

export function activeReceivedSecret (state) {
  return state.activeReceivedSecret
}

export function activeReceivedSecretId (state) {
  if (state.activeReceivedSecret) {
    return state.activeReceivedSecret.id
  }
}

export function activeReceivedSecretCreatedAt (state) {
  if (state.activeReceivedSecret) {
    return (new Date(state.activeReceivedSecret.createdAt)).toLocaleString()
  }
}

export function activeReceivedSecretReceivedAt (state) {
  if (state.activeReceivedSecret) {
    return (new Date(state.activeReceivedSecret.receivedAt)).toLocaleString()
  }
}

export function activeReceivedSecretExpiresAt (state) {
  if (state.activeReceivedSecret) {
    return (new Date(state.activeReceivedSecret.expiresAt)).toLocaleString()
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

export function activeSentSecret (state) {
  return state.activeSentSecret
}

export function sentSecrets (state) {
  return state.sentSecrets
}

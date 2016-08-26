import { SENT_SECRETS_STORAGE_KEY, RECEIVED_SECRETS_STORAGE_KEY } from './store'
import createLogger from 'vuex/logger'

const localStoragePlugin = store => {
  store.subscribe((mutation, { sentSecrets }) => {
    if(typeof(Storage) !== "undefined") {
      localStorage.setItem(SENT_SECRETS_STORAGE_KEY, JSON.stringify(sentSecrets))
    }
  }),
  store.subscribe((mutation, { receivedSecrets }) => {
    if(typeof(Storage) !== "undefined") {
      localStorage.setItem(RECEIVED_SECRETS_STORAGE_KEY, JSON.stringify(receivedSecrets))
    }
  })
}

export default process.env.NODE_ENV !== 'production'
  ? [createLogger(), localStoragePlugin]
  : [localStoragePlugin]

import { SENT_SECRETS_STORAGE_KEY, RECEIVED_SECRETS_STORAGE_KEY } from './store'
import createLogger from 'vuex/logger'

// See : https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
function storageAvailable(type) {
	try {
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e) {
		return false;
	}
}

const localStoragePlugin = store => {
  store.subscribe((mutation, { sentSecrets }) => {
    if(storageAvailable('localStorage')) {
      localStorage.setItem(SENT_SECRETS_STORAGE_KEY, JSON.stringify(sentSecrets))
    }
  }),
  store.subscribe((mutation, { receivedSecrets }) => {
    if(storageAvailable('localStorage')) {
      localStorage.setItem(RECEIVED_SECRETS_STORAGE_KEY, JSON.stringify(receivedSecrets))
    }
  })
}

export default process.env.NODE_ENV !== 'production'
  ? [createLogger(), localStoragePlugin]
  : [localStoragePlugin]

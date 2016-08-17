// An action will receive the store as the first argument.
// Since we are only interested in the dispatch (and optionally the state)
// we can pull those two parameters using the ES6 destructuring feature

export const useDevApiUrl = function ({ dispatch, state }) {
  dispatch('SETAPIURL', 'http://localhost:3000/api/v1')
}

export const useProdApiUrl = function ({ dispatch, state }) {
  dispatch('SETAPIURL', location.protocol + '//' + location.host + '/api/v1')
}

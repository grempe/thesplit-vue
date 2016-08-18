// An action will receive the store as the first argument.
// Since we are only interested in the dispatch (and optionally the state)
// we can pull those two parameters using the ES6 destructuring feature

export const setDebugOn = makeAction('SET_DEBUG_ON')
export const setDebugOff = makeAction('SET_DEBUG_OFF')
export const setDevApi = makeAction('SET_DEV_API')
export const setHostApi = makeAction('SET_HOST_API')
export const setProdApi = makeAction('SET_PROD_API')

function makeAction (type) {
  return ({ dispatch }, ...args) => dispatch(type, ...args)
}

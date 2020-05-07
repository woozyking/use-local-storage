import { useEffect } from 'react'
import lscache from 'lscache'

const SUPPORTED_HOOKS = ['useState', 'useReducer']

/**
 * Higher order function that configures and returns a modified version of
 * the given supported hook
 *
 * @function cached
 *
 * @param {string} key cache key.
 * @param {number} [ttl = null] Optional cache TTL/expiration. Default: no TTL
 * @param {number} [ttlMS = null] Optional cache TTL unit in milliseconds. Default: 60000
 *
 * @returns {(hook: function) => function} wrapped version of supported React hook
 */
export function cached(...params) {
  let key, ttl, ttlMS
  if (typeof params[0] === 'object' && params[0] !== null) {
    ({ key, ttl = null, ttlMS = null } = params[0])
  } else { // DEPRECATING in v2.0
    [key, ttl = null, ttlMS = null] = params
  }
  if (!isNaN(parseInt(ttlMS)) && ttlMS > 0) {
    lscache.setExpiryMilliseconds(ttlMS)
  }
  // argument validations
  if (!key || typeof key !== 'string') {
    throw new Error('key must be a non-empty string.')
  }
  if (ttl !== null && (isNaN(parseFloat(ttl)) || ttl < 0)) {
    throw new Error('ttl can only be null or a positive number.')
  }
  return (hook) => (...args) => {
    // hook support check
    if (!hook || typeof hook !== 'function' || !SUPPORTED_HOOKS.includes(hook.name)) {
      throw new Error(`only ${SUPPORTED_HOOKS.join(' | ')} can be cached.`)
    }
    // pull cached state
    const cachedState = lscache.get(key)
    // invoke hook depending on cached state availability
    const [state, method] = cachedState === null ? hook(...args) : hook(...{
      useState: [cachedState],
      useReducer: [args[0], cachedState],
    }[hook.name])
    // internal effect to update cache
    useEffect(() => {
      lscache.set(key, state, ttl)
    }, [state, key, ttl])
    // return [state, method()[, remove()]]
    return [state, method, () => lscache.remove(key)]
  }
}

export default cached

# use-cached

Higher-order-function that bakes state caching mechanism into supported React hooks. Built on top of [lscache](https://github.com/pamelafox/lscache) to provide seamless caching integration with TTL/expiration support.

## Supported Hooks

### Cached `useState`

```jsx
import React from 'react'
import { cached } from 'use-cached'

// get cached version of useState
const useState = cached('TEST_CACHE_KEY', 60)(React.useState) // key, ttl

function Counter({initialCount}) {
  // count here would be from cache if it exists as a non-null value
  const [count, setCount] = useState(initialCount)
  return (
    <>
      Count: {count}
      <button onClick={() => setCount(initialCount)}>Reset</button>
      <button onClick={() => setCount(prevCount => prevCount + 1)}>+</button>
      <button onClick={() => setCount(prevCount => prevCount - 1)}>-</button>
    </>
  )
}
```

### Cached `useReducer`

```jsx
import React from 'react'
import { cached } from 'use-cached'

// get cached version of useReducer
const useReducer = cached('TEST_CACHE_KEY', 60)(React.useReducer) // key, ttl

function init(initialCount) {
  return {count: initialCount}
}

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {count: state.count + 1}
    case 'decrement':
      return {count: state.count - 1}
    case 'reset':
      return init(action.payload)
    default:
      throw new Error()
  }
}

function Counter({initialCount}) {
  // state here would be from cache if it exists as a non-null value
  const [state, dispatch] = useReducer(reducer, initialCount, init)
  return (
    <>
      Count: {state.count}
      <button
        onClick={() => dispatch({type: 'reset', payload: initialCount})}>
        Reset
      </button>
      <button onClick={() => dispatch({type: 'increment'})}>+</button>
      <button onClick={() => dispatch({type: 'decrement'})}>-</button>
    </>
  )
}
```

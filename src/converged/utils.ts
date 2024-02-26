

import { $component, $reactive } from './constants'

import { effect } from './solid.js';
 const microtask = queueMicrotask

export {
    empty,
    isArray,
    toArray,
    isFunction,
    weakStore,
    freeze,
    flat,
    stringify,
    iterator,
    isReactive,
    isComponent,
    isComponentable,
    markComponent,
    isNotNullObject,
    isNullUndefined,
    withValue,
    entries,
    getValue,
    keys,
    emit,
    microtask
}

const emit = (
	node,
	eventName,
	data = { bubbles: true, cancelable: true, composed: true },
) => node.dispatchEvent(new CustomEvent(eventName, data))


const getValue = value => {
	while (typeof value === 'function') value = value()
	return value
}
const withValue = (value, fn) =>
	isFunction(value)
		? effect(() => {
				fn(getValue(value))
			})
		: fn(value)
 
  function markComponent(fn) {
	fn[$component] = null
	return fn
}
const isComponent = value =>
    isFunction(value) && $component in value

      const isNotNullObject = value =>
	value !== null && typeof value === 'object'

      const isNullUndefined = value =>
	value === undefined || value === null


const isComponentable = value =>
    !isReactive(value) &&
    (isFunction(value) ||
        // avoid [1,2] and support { toString(){ return "something"} }
        (!isArray(value) && isNotNullObject(value) && !value.then))

const empty = Object.create.bind(null, null)

const entries = Object.entries

const isArray = Array.isArray
const toArray = Array.from
const isFunction = value => typeof value === 'function'
const flat = arr => (arr.length === 1 ? arr[0] : arr)
const freeze = Object.freeze
const isReactive = value => isFunction(value) && $reactive in value
const stringify = JSON.stringify
const iterator = Symbol.iterator
const keys = Object.keys

function weakStore() {
    const store = new WeakMap()
    const set = store.set.bind(store)
    const get = store.get.bind(store)
    const has = store.has.bind(store)
    return {
        store,
        get: (obj, defaults = undefined) => {
            const o = get(obj)
            if (o) return o
            if (defaults !== undefined) {
                /**
                 * Default values should be passed as a function, so we dont
                 * constantly initialize values when giving them
                 */
                defaults = defaults()
                set(obj, defaults)
                return defaults
            }
        },
        set,
        has,
    }
}

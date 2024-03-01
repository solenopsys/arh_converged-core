

import { $component, $reactive } from './constants.js'

import { effect, untrack } from '../solid.js';
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
	markReactive,
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
	microtask,
	makeCallback,
	removeFromArray,
	groupBy
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

function removeFromArray(array, value) {
	const index = array.indexOf(value)
	if (index !== -1) array.splice(index, 1)
	return array
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
//@ts-ignore
const groupBy = Object.groupBy
const isArray = Array.isArray
const toArray = Array.from
const isFunction = value => typeof value === 'function'
const flat = arr => (arr.length === 1 ? arr[0] : arr)
const freeze = Object.freeze
const isReactive = value => isFunction(value) && $reactive in value
const stringify = JSON.stringify
const iterator = Symbol.iterator
const keys = Object.keys

function markReactive(fn) {
	fn[$reactive] = null
	return fn
}

function weakStore() {
	const store = new WeakMap()
	const set = store.set.bind(store)
	const get = store.get.bind(store)
	const has = store.has.bind(store)
	return {
		store,
		get: (obj, defaults: any = undefined) => {
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


// import { untrack } from '../reactivity/primitives/solid.js'
// import { flat, isArray, isFunction } from '../std/@main.js'
// import { isReactive } from '../reactivity/isReactive.js'
// import { markComponent } from './markComponent.js'

/**
 * Makes of `children` a function. Reactive children will run as is,
 * non-reactive children will run untracked, regular children will
 * just return.
 *
 * @param {Children} children
 * @returns {Function}
 */
function makeCallback(children) {
	/**
	 * When children is an array, as in >${[0, 1, 2]}< then children
	 * will end as `[[0, 1, 2]]`, so flat it
	 */
	children = isArray(children) ? flat(children) : children
	const asArray = isArray(children)
	const callbacks = !asArray
		? callback(children)
		: children.map(callback)
	return !asArray
		? markComponent((...args) => callbacks(args))
		: markComponent((...args) =>
			callbacks.map(callback => callback(args)),
		)
}

const callback = child =>
	isFunction(child)
		? isReactive(child)
			? args => {
				/**
				 * The function inside the `for` is saved in a signal. The
				 * result of the signal is our callback
				 *
				 * ```js
				 * htmlEffect(
				 * 	html =>
				 * 		html`<table>
				 * 			<tr>
				 * 				<th>name</th>
				 * 			</tr>
				 * 			<for each="${tests}">
				 * 				${item =>
				 * 					html`<tr>
				 * 						<td>${item.name}</td>
				 * 					</tr>`}
				 * 			</for>
				 * 		</table>`,
				 * )
				 * ```
				 */
				const r = child()
				return isFunction(r)
					? isReactive(r)
						? r()
						: untrack(() => r(...args))
					: r
			}
			: args => untrack(() => child(...args))
		: () => child
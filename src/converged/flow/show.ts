import { resolve } from '../renderer/manipulate'
import { memo } from '../solid'
import { getValue, isNullUndefined, makeCallback } from '../uitls/utils.js'


// Renders its children based on a condition

export function Show(props) {
	const callback = makeCallback(props.children)
	const value = memo(() => getValue(props.when))
	const condition = memo(() => !!value())

	// needs resolve to avoid re-rendering
	const fallback = isNullUndefined(props.fallback)
		? null
		: memo(() => resolve(props.fallback))

	return memo(() => (condition() ? callback(value) : fallback))
}
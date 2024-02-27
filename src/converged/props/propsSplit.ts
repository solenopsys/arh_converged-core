 
import {empty, keys } from "../uitls/utils"
import { Props } from './types';

// Split an object into multiple sub objects
export function propsSplit(props: Props, ...args: string[]): Props[] {
	const result: Props[] = [];
	const used = empty();

	for (const _props of args) {
		const target = empty();
		for (const key of _props) {
			used[key] = null;
			target[key] = props[key];
		}
		result.push(target);
	}

	const target = empty();
	for (const key of keys(props)) {
		if (used[key] === undefined) {
			target[key] = props[key];
		}
	}
	result.unshift(target);
	return result;
}

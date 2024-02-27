import { cleanup } from '../solid';
 
import { Elements } from './types';

import { isFunction, empty } from "../uitls/utils"


 
export const setEventNS = (node: Elements, name: string, value: EventListenerOrEventListenerObject, props: object, localName: string, ns: string) =>
	addEventListener(node, localName, value, false);

const EventNames: Record<string, string | null> = empty();

/**
 * Returns an event name when the string could be mapped to an event
 *
 */
export function eventName(name: string): string | null {
	if (name in EventNames) {
		return EventNames[name];
	}

	if (
		name.startsWith('on') &&
		window[name.toLowerCase()] !== undefined
	) {
		EventNames[name] = name.slice(2).toLowerCase();
	} else {
		EventNames[name] = null;
	}
	return EventNames[name];
}

/**
 * Adds an event listener to a node
 *
 */
export function addEventListener(
	node: Elements,
	type: string,
	handler: EventListenerOrEventListenerObject,
	external: boolean = true,
): Function | void {
	node.addEventListener(
		type,
		handler,
		isFunction(handler) ? null : handler,
	);

	// remove event on cleanup
	cleanup(() => {
		removeEventListener(node, type, handler, false);
	});

	if (external) {
		return () => removeEventListener(node, type, handler);
	}
}

/**
 * Removes an event listener from a node
 */
export function removeEventListener(
	node: Elements,
	type: string,
	handler: EventListenerOrEventListenerObject,
	external: boolean = true,
): Function | void {
	node.removeEventListener(type, handler);

	if (external) {
		return () => addEventListener(node, type, handler);
	}
}

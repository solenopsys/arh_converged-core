import { cleanup } from '../solid';
import { onMount } from '../scheduler';
import { Elements } from './intfs';
 
export const setRef = (node: Elements, name: string, value: Function, props: object) => value(node);

export const setOnMount = (node: Elements, name: string, value: Function, props: object) =>
	// timing is already controlled by onMount
	onMount([value, node]);

export const setUnmount = (node: Elements, name: string, value: Function, props: object) =>
	// we need to ensure the timing of the cleanup callback
	// so we queue it to run it at a specific time
	cleanup(() => value(node));

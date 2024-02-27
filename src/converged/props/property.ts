
import { isNullUndefined, withValue, emit } from "../uitls/utils"
import { Elements } from './types';

export const setPropertyNS = (
	node: Elements,
	name: string,
	value: any,
	props: object,
	localName: string,
	ns: string,
) => setProperty(node, localName, value);

export const setProperty = (node: Elements, name: string, value: any) =>
	withValue(value, value => _setProperty(node, name, value));


export function _setProperty(node: Elements, name: string, value: any) {
	// if the value is null or undefined it will be set to null
	if (isNullUndefined(value)) {
		// defaulting to undefined breaks `progress` tag and the whole page
		node[name] = null;
	} else {
		node[name] = value;
	}
	if (name === 'value') {
		emit(node, 'input');
		emit(node, 'change');
	}
}

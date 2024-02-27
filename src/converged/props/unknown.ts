
import { _setProperty } from './property';
import { _setAttribute } from './attribute';
import { isNullUndefined, isNotNullObject, withValue } from "../uitls/utils"
import { Elements } from './types';

export const setanyProp = (node: Elements, name: string, value: any, ns?: string) =>
	withValue(value, value => _setanyProp(node, name, value, ns));

const _setanyProp = (node: Elements, name: string, value: any, ns?: string) => {
	if (isNotNullObject(value)) {
		// when not null object
		_setProperty(node, name, value);
	} else if (typeof value === 'boolean' && !name.includes('-')) {
		// when boolean and name doesnt have a hyphen
		_setProperty(node, name, value);
	} else {
		// fallback to attribute
		_setAttribute(node, name, value, ns);
		// to be able to delete properties
		isNullUndefined(value) && _setProperty(node, name, value);
	}
};

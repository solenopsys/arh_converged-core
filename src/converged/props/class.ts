import { effect } from '../solid';
 import {withValue,
	entries,
	getValue,
	isNotNullObject,
} from   "../uitls/utils";

import { Elements } from './types';


export const setClass = (node: Elements, name: string, value: any, props: object) =>
	setClassList(node.classList, value);


export const setClassNS = (
	node: Elements,
	name: string,
	value: any,
	props: object,
	localName: string,
	ns: string,
) =>
	isNotNullObject(value)
		? setClassList(node.classList, value)
		: setClassListValue(node.classList, localName, value);

// todo: the name of the class is not reactive

function setClassList(classList: DOMTokenList, value: any | string | ArrayLike<any>) {
	switch (typeof value) {
		case 'string': {
			_setClassListValue(classList, value, true);
			break;
		}

		case 'object': {
			for (const [name, _value] of entries(value))
				setClassListValue(classList, name, _value);
			break;
		}

		case 'function': {
			effect(() => {
				setClassList(classList, getValue(value));
			});
			break;
		}
	}
}

const setClassListValue = (classList: DOMTokenList, name: string, value: any) =>
	withValue(value, value =>
		_setClassListValue(classList, name, value),
	);


const _setClassListValue = (classList: DOMTokenList, name: string, value: any) =>
	// null, undefined or false the class is removed
	!value
		? classList.remove(name)
		: classList.add(...name.trim().split(/\s+/));

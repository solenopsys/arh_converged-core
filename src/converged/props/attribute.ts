import { NS } from '../uitls/constants';
import { isNullUndefined, withValue } from '../uitls/utils';
import { Elements } from './types';

// NODE ATTRIBUTES

export const setAttributeNS = (
	node: Elements,
	name: string,
	value: any,
	props: object,
	localName: string,
	ns: string,
) => setAttribute(node, localName, value);


export const setAttribute = (node: Elements, name: string, value: any, ns?: string) =>
	withValue(value, value => _setAttribute(node, name, value, ns));


export function _setAttribute(node: Elements, name: string, value: any, ns?: string) {
	// if the value is null or undefined it will be removed
	if (isNullUndefined(value)) {
		ns && NS[ns]
			? node.removeAttributeNS(NS[ns], name)
			: node.removeAttribute(name);
	} else {
		ns && NS[ns]
			? node.setAttributeNS(NS[ns], name, value)
			: node.setAttribute(name, value);
	}
}

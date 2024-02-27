 import { withValue } from '../uitls/utils';
import { Elements } from './types';


export const setBoolNS = (node: Elements, name: string, value: any, props: object, localName: string, ns: string) =>
	setBool(node, localName, value);


export const setBool = (node: Elements, name: string, value: any) =>
	withValue(value, value => _setBool(node, name, value));


export const _setBool = (node: Elements, name: string, value: any) =>
	// if the value is falsy gets removed
	!value ? node.removeAttribute(name) : node.setAttribute(name, '');

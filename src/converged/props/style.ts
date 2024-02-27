import { effect } from '../solid';
import { isNullUndefined, isNotNullObject, withValue, entries, getValue } from "../uitls/utils"
import { Elements } from './types';

export const setStyle = (node: Elements, name: string, value: any, props: object) =>
	setNodeStyle(node.style, value);

export const setStyleNS = (node: Elements, name: string, value: any, props: object, localName: string, ns: string) =>
	setNodeStyle(
		node.style,
		isNotNullObject(value) ? value : { [localName]: value },
	);

export const setVarNS = (node: Elements, name: string, value: any, props: object, localName: string, ns: string) =>
	setNodeStyle(node.style, { ['--' + localName]: value });

function setNodeStyle(style: CSSStyleDeclaration, value: any) {
	if (isNotNullObject(value)) {
		for (const [name, _value] of entries(value))
			setStyleValue(style, name, _value);
		return;
	}
	const type = typeof value;
	if (type === 'string') {
		style.cssText = value;
		return;
	}
	if (type === 'function') {
		effect(() => {
			setNodeStyle(style, getValue(value));
		});
		return;
	}
}

export const setElementStyle = (node: Elements, name: string, value: any) =>
	setStyleValue(node.style, name, value);

const setStyleValue = (style: CSSStyleDeclaration, name: string, value: any) =>
	withValue(value, value => _setStyleValue(style, name, value));

const _setStyleValue = (style: CSSStyleDeclaration, name: string, value: string | null) =>
	isNullUndefined(value)
		? style.removeProperty(name)
		: style.setProperty(name, value);

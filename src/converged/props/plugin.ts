
import { empty, microtask } from "../uitls/utils"
import { withOwner } from '../solid';

export const plugins: Record<string, any> = empty();
export const pluginsNS: Record<string, any> = empty();
import { Elements } from './types';


// Defines a prop that can be used on any Element
export const propsPlugin = (propName: string, fn: (node: Elements, propName: string, propValue: Function | any, props: object) => void, runOnMicrotask: boolean = true) => {
	plugin(plugins, propName, fn, runOnMicrotask);
};

// Defines a namespaced prop that can be used on any Element

export const propsPluginNS = (NSName: string, fn: (node: Elements, propName: string, propValue: Function | any, props: object, localName: string, ns: string) => void, runOnMicrotask: boolean = true) => {
	plugin(pluginsNS, NSName, fn, runOnMicrotask);
};

const plugin = (plugins: Record<string, any>, name: string, fn: any, runOnMicrotask: boolean) => {
	plugins[name] = !runOnMicrotask
		? fn
		: (...args: any[]) => {
			const owned = withOwner();
			microtask(() => owned(() => fn(...args)));
		};
};

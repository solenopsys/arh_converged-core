import { entries } from '../uitls/utils';
import { hasProxy, proxy } from './proxy';
import { Elements } from './types';
import { plugins, pluginsNS, propsPlugin, propsPluginNS } from './plugin';
import { setStyle, setStyleNS, setVarNS } from './style';
import { setClass, setClassNS } from './class';
import { _setProperty, setProperty, setPropertyNS } from './property';
import { setAttributeNS } from './attribute';
import { setBoolNS } from './bool';
import { setOnMount, setRef, setUnmount } from './lifecycles';
import { eventName, setEventNS, addEventListener } from './event';
import { setanyProp } from './unknown';

export { propsPlugin, propsPluginNS };
export { propsProxy } from './proxy';
export { setProperty } from './property';
export { setAttribute } from './attribute';
export { setBool } from './bool';
export { setStyle } from './style';

// styles

propsPlugin('style', setStyle, false);
propsPluginNS('style', setStyleNS, false);
propsPluginNS('var', setVarNS, false);

// class

propsPlugin('class', setClass, false);
propsPluginNS('class', setClassNS, false);

// namespace

propsPluginNS('prop', setPropertyNS, false);
propsPluginNS('attr', setAttributeNS, false);
propsPluginNS('bool', setBoolNS, false);

// life-cycles

propsPlugin('onMount', setOnMount, false);
propsPluginNS('onMount', setOnMount, false);
propsPlugin('onUnmount', setUnmount, false);
propsPluginNS('onUnmount', setUnmount, false);

// ref

propsPlugin('ref', setRef, false);
propsPluginNS('ref', setRef, false);

// events

propsPluginNS('on', setEventNS, false);

// forced as properties

for (const item of ['value', 'textContent', 'innerText', 'innerHTML']) {
	propsPlugin(item, setProperty, false);
}

//Assigns props to an Element
export function assignProps(node: Elements, props: object): void {
	// document-fragment wont have a localName
	const isCustomElement = node.localName && node.localName.includes('-');

	for (let [name, value] of entries(props)) {
		// internal props
		if (name === 'children') continue;

		// run proxies
		if (hasProxy.value) {
			const { name: proxyName, value: proxyValue } = proxy(name, value);
			name = proxyName;
			value = proxyValue;
		}

		// run plugins
		if (plugins[name]) {
			plugins[name](node, name, value, props); 
			continue;
		}

		// onClick={handler}
		let event = eventName(name);
		if (event) {
			addEventListener(node, event, value, false);
			continue;
		}

		if (name.includes(':')) {
			// with ns
			const [ns, localName] = name.split(':');

			// run plugins NS
			if (pluginsNS[ns]) {
				pluginsNS[ns](node, name, value, props, localName, ns);
				continue;
			}

			// onClick:my-ns={handler}
			event = eventName(ns);
			if (event) {
				addEventListener(node, event, value, false);
				continue;
			}

			isCustomElement ? _setProperty(node, name, value) : setanyProp(node, name, value, ns);
			continue;
		}

		// catch all
		isCustomElement ? _setProperty(node, name, value) : setanyProp(node, name, value);
	}
}


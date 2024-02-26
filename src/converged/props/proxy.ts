export const proxies: ((prop: { name: string; value: any }) => void)[] = [];
export const hasProxy = { value: false };

/**
 * Defines a props proxy that will proxy all of the props, except
 * children. This could be used to rename attributes/properties or to
 * change values.
 */
export const propsProxy = (fn: (prop: { name: string; value: any }) => void) => {
	proxies.push(fn);
	hasProxy.value = true;
};

export const proxy = (name: string, value: any) => {
	const prop = {
		name,
		value,
	};
	for (const proxyFn of proxies) {
		proxyFn(prop);
	}
	return prop;
};

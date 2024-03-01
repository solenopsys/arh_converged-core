/**
 * Creates a component which is an untracked function that could be
 * called with a props object
 */

import { Componenteable, Props } from "../props/types";
import { empty, freeze, isComponent, isReactive, markComponent } from "../uitls/utils";
import { cleanup, untrack } from '../solid'
import { createNode, createTag } from "./manipulate";
import { $class } from "../uitls/constants";
import { ready } from "../scheduler";

const OBJECT = 'object'
const STRING = 'string'
const FUNCTION = 'function'
const DEFAULT_PROPS = freeze(empty())

class ComponentsCache {
    components = new Map()
    weakComponents = new WeakMap()

    isObject(value: Componenteable): boolean {
        return typeof value === OBJECT
    }

    getComponent(value: any) {
        return this.isObject(value) ? this.weakComponents.get(value) : this.components.get(value);
    }

    setComponent(value: any, component: any) {
        console.log("ADD COMP TO CACHE",value)
        this.isObject(value) ? this.weakComponents.set(value, component) : this.components.set(value, component);
    }
}

const CACHE = new ComponentsCache()

// builder for component
export function Factory(value: Componenteable | any): any {
    if (isComponent(value)) {
        return value;
    }

    const t = typeof value;

    // get from  cache
    let component = CACHE.getComponent(value);

    if (component) {
        return component;
    }

    if (t === STRING) {
        component = newStringComponent(value)
    } else if (t === FUNCTION) {
        component = newFunctionComponent(value)
    } else {
        if (value instanceof Node) {
            // an actual node component <div>
            component = (props = DEFAULT_PROPS) => createNode(value, props);
        } else {
            component = () => value;
        }
    }

    // save in cache component after creating
    CACHE.setComponent(value, component)

    return markComponent(component);
}

function newFunctionComponent(value: (props?: Props) => void) {
    if ($class in value) {
        // a class component <MyComponent../>
        return (props = DEFAULT_PROPS) =>
            untrack(() => { 
                const comp = new value();
                comp.ready && ready(comp.ready.bind(comp));
                comp.cleanup && cleanup(comp.cleanup.bind(comp));
                return comp.render(props);
            });
    }

    /**
     * ```js
     * const [Count, setCount] = signal(1)
     * return <Count />
     * ```
     */
    if (isReactive(value)) {
        console.log("IS REACTIVE")
        return () => value;
    }

    // a function component <MyComponent../>
    return (props: Props = DEFAULT_PROPS) => untrack(() => value(props));
}

function newStringComponent(value: string) {
    return (props = DEFAULT_PROPS) => createTag(value, props);
}

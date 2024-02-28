/**
 * Creates a component which is an untracked function that could be
 * called with a props object
 */

import { Componenteable, Props } from "../props/types";
import { empty, freeze, isComponent, isReactive, markComponent } from "../uitls/utils";

import {
    cleanup,
    untrack,
} from '../solid'
import { createNode, createTag } from "./manipulate";
import { $class } from "../uitls/constants";
import { ready } from "../scheduler";

const Components = new Map()
const WeakComponents = new WeakMap()
const defaultProps = freeze(empty())

export function Factory(value: Componenteable): any {
    if (isComponent(value)) {
        return value;
    }

    let component =
        typeof value === 'object'
            ? WeakComponents.get(value)
            : Components.get(value);
    if (component) {
        return component;
    }

    switch (typeof value) {
        case 'string': {
            // a string component, 'div' becomes <div>
            component = (props = defaultProps) => createTag(value, props);
            break;
        }
        case 'function': {
            if ($class in value) {
                // a class component <MyComponent../>
                component = (props = defaultProps) =>
                    untrack(() => {
                        const i = new value();
                        i.ready && ready(i.ready.bind(i));
                        i.cleanup && cleanup(i.cleanup.bind(i));

                        return i.render(props);
                    });
                break;
            }

            /**
             * ```js
             * const [Count, setCount] = signal(1)
             * return <Count />
             * ```
             */
            if (isReactive(value)) {
                component = () => value;
                break;
            }

            // a function component <MyComponent../>
            component = (props: Props = defaultProps) =>
                //@ts-ignore
                untrack(() => value(props));
            break;
        }
        default: {
            if (value instanceof Node) {
                // an actual node component <div>
                component = (props = defaultProps) => createNode(value, props);
                break;
            }

            component = () => value;
            break;
        }
    }

    // save in cache
    typeof value === 'object'
        ? WeakComponents.set(value, component)
        : Components.set(value, component);

    return markComponent(component);
}

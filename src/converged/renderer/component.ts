/**
 * Creates components for things. When props argument is given, the
 * props become fixed. When props argument is ommited, it allows you
 * to keep calling the returned function with new props.
 */


/**
 * Used by the JSX transform, as <>...</> or <Fragment>...</Fragment>.
 * This function is empty because its given to `Component` via the
 * transformer and we dont even need to run it. Avoid the temptation
 * to replace this for `noop` from `lib`.
 */
export const Fragment = () => { };
import { markComponent } from '../uitls/utils';
import { Factory } from './factory';


export function Component(value: string | Function | Element | object, props: any = undefined) {
    /**
     * Internal comment: Returns a function because we need to render
     * from parent to children instead of from children to parent. This
     * allows to properly set the reactivity tree (think of nested
     * effects that clear inner effects, context, etc).
     */
    // special case fragments, these are arrays and dont need untrack nor props
    if (value === Fragment) {
        return props.children;
    }

    // freeze props so isnt directly writable
    Object.freeze(props);

    /**
     * Create a callable function to pass `props`. When props its not
     * defined it allows the user to make a Factory of components, when
     * props its defined the props are fixed.
     */

    return props === undefined
        ? Factory(value)
        : markComponent(Factory(value).bind(null, props));
}
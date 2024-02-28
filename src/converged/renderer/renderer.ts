import {
    root,
    cleanup,
} from '../solid'

import {
    empty,
    isComponentable,
} from '../uitls/utils'

import { createChildren } from "./children"
import { Elements } from '../props/types'
import { Factory } from './factory'

/**
 * Inserts children into a parent
 * @param {any} children - Thing to render
 * @param   [parent] - Mount point,   defaults to document.body
 * @param   [options] -   Mounting options
 * @returns - Disposer
 */
export function render(children: any, parent?: Elements, options: { clear?: boolean; relative?: boolean } = empty()) {
    const dispose = root(dispose => {
        insert(children, parent, options);
        return dispose;
    });

    // run dispose when the parent scope disposes
    cleanup(dispose);
    return dispose;
}

/**
 * @param {any} children - Thing to render
 * @param  [parent] - Mount point, defaults to `document.body`
 * @param   [options] -  Mounting options
 */
function insert(children: any, parent?: Elements , options: { clear?: boolean; relative?: boolean } = empty()) {
    if (options.clear && parent) parent.textContent = '';

    return createChildren(
        parent || document.body,
        isComponentable(children) ? Factory(children) : children,
        // @ts-ignore
        options.relative,
    );
}




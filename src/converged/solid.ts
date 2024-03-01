import { markReactive } from './uitls/utils.js';
export { lazyMemo as memo };

import {
    // signals
    createSignal,
    createMemo,

    // effects
    createRoot,
    createRenderEffect,
    createEffect,


    // cleanup/untrack
    onCleanup,
    untrack as _untrack,


    getOwner,
    runWithOwner,
} from '../../converged-signals/src/index'; // /dist/dev.js

// Creates a signal
export const signal = (initialValue?: any, options?: any) => {
    const r = createSignal(initialValue, options);
    markReactive(r[0]);
    return r;
};

// Creates a read-only signal from the return value of a function that automatically updates

const memo = (fn: Function, options?:
    { equals?: false | ((prev: unknown, next: unknown) => boolean) }) =>
    // @ts-ignore
    markReactive(createMemo(fn, options));

// Creates a new root
export const root = (fn: (dispose: Function) => any) => createRoot(dispose => fn(dispose));

// Creates a renderEffect
export const renderEffect = <T>(fn: Function) => {





    //@ts-ignore
    createRenderEffect<T>(() => fn(), (fn) => {

    });
};

// Creates an effect
export const effect = <T>(fn: () => T) => {
    createEffect<T>(fn);
};

// Runs a callback on cleanup, returns callback
export const cleanup = <T>(fn: () => T) => {
    onCleanup(fn);
    return fn;
};

// Disables tracking for a function
//@ts-ignore
export const untrack = <T>(fn: Function) => _untrack(fn);

// Creates a context and returns a function to get or set the value

export function Context(defaultValue: any) {
    const id = Symbol();
    const context = { id, defaultValue };

    /**
     * @overload Gets the context value
     * @returns {any} Context value
     */
    /**
     * @overload Runs `fn` with a new value as context
     * @param {unknown} newValue - New value for the context
     * @param {Function} fn - Callback to run with the new context value
     * @returns {Children} Children
     */
    /**
     * @param {unknown | undefined} newValue
     * @param {Function | undefined} fn
     */
    function Context(newValue?: unknown, fn?: Function) {

        let res;
        renderEffect(() => {
            console.log("RENDER EFFECT CONTEXT", newValue)
            untrack(() => {

                const owner = getOwner()
             ///   console.log("OWNER",owner)
                //@ts-ignore
                owner.context = {
                    //@ts-ignore
                    ...owner.context,
                    [id]: newValue,
                }
                if (fn)
                    res = fn()
            });
        });

        return res;
    }
    return Context;
}

// Lazy version of `memo`, it will run the function only when used


function lazyMemo(fn: Function, options?: { equals?: false | ((prev: unknown, next: unknown) => boolean) }) {
    const [sleeping, setSleeping] = signal(true);
    const m = memo(() => {
        if (sleeping()) return;
        return fn();
    }, options);

    let read = () => {
        setSleeping(false);
        read = m;
        return m();
    };
    return markReactive(() => read());
}

// Returns a function on which you can pass functions to run with the current owner
export const withOwner = () => {
    const owner = getOwner();
    return fn => runWithOwner(owner, fn);
};

// Returns current owner
export const owner = getOwner;

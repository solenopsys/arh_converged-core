
import { Children, Elements, Props } from '../props/types';
import { Signal } from '../../../converged-signals/src/index'
import { assignProps } from '../props';
import { NS } from '../uitls/constants'
import {
    cleanup,
    memo,
    owner,
    Context,
} from '../solid'
import {
    isArray,
    isFunction,
    weakStore,
    flat,
} from '../uitls/utils'
import {
    createElement,
    createElementNS,
    createTextNode,
} from '../uitls/elements'
import { createChildren } from './children';


const useXMLNS = context()

/**
 * Creates and returns HTML Elements for `children`
 */
export const toHTML = (children: Elements): Elements =>
    /**
     * DocumentFragment is transformed to an `Array` of `Node/Element`,
     * that way we can keep a reference to the nodes. Because when the
     * DocumentFragment is used, it removes the nodes from the
     * DocumentFragment and then we will lose the reference.
     */

    flat(toHTMLFragment(children).childNodes);

/**
 * Creates and returns a DocumentFragment for `children`
 */
export function toHTMLFragment(children: Elements): DocumentFragment {
    const fragment = new DocumentFragment();
    createChildren(fragment, children);

    return fragment;
}

/**
 * Resolves and returns `children` in a memo
 */
export function resolve<T>(fn: Function): Signal<T> {
    const children = isFunction(fn) ? memo(fn) : () => fn;
    return memo(() => unwrap(children()));
}

/**
 * Recursively unwrap children functions
 */
function unwrap(children: Children): Children {
    if (isFunction(children)) {
        return unwrap(children());
    }
    if (isArray(children)) {
        const childrens: any[] = [];
        for (let child of children) {
            child = unwrap(child);
            isArray(child)
                ? childrens.push(...child)
                : childrens.push(child);
        }
        return childrens;
    }

    return children;
}

/**
 * Creates a context and returns a function to get or set the value
 */
export function context(defaultValue?) {
    console.log("CONTEXT DEFAULT: " ,defaultValue)
    /** @type {any} */
    const ctx = Context(defaultValue);

    // @ts-ignore
    ctx.Provider = props => ctx(props.value, () => toHTML(props.children));
    return ctx;
}


// nodes cleanup
const { get: nodeCleanupStore } = weakStore();
/**
 * Adds an element for cleanup
 */
export function nodeCleanup(node: Elements) {
    const own = owner();
    // null owners means its never disposed
    if (own) {
        const nodes = nodeCleanupStore(own, () => []);

        if (nodes.length === 0) {
            cleanup(() => {
                // reverse to remove parent first
                for (const node of nodes.reverse()) {
                    node.remove();
                }
                nodes.length = 0;
            });
        }

        nodes.push(node);
    }
}

// Assigns props to an element and creates its children
export function createNode(node: Elements, props: Props): Elements {
    // assign the props to the node
    assignProps(node, props);

    //@ts-ignore
    createChildren(node, props.children);

    return node;
}

// Creates placeholder to keep nodes in position
export const createPlaceholder = (parent: Elements, text: string, relative?: boolean): Elements =>
    /* dev
    return insertNode(
        parent,
        document.createComment(
            (text || '') + (relative ? ' relative' : ''),
        ),
        relative,
    )
    */
    insertNode(parent, createTextNode(''), relative);

// Adds the element to the document
export function insertNode(parent: Elements, node: Elements, relative?: boolean): Elements {

    console.log("INSERT NODE33")
    // special case `head`
    if (parent === document.head) {
        const querySelector = parent.querySelector.bind(parent);
        const name = node.tagName;

        // search for tags that should be unique
        let prev;
        if (name === 'TITLE') {
            prev = querySelector('title');
        } else if (name === 'META') {
            prev =
                querySelector(
                    'meta[name="' + node.getAttribute('name') + '"]',
                ) ||
                querySelector(
                    'meta[property="' + node.getAttribute('property') + '"]',
                );
        } else if (name === 'LINK' && node.rel === 'canonical') {
            prev = querySelector('link[rel="canonical"]');
        }

        // replace old node if there's any
        prev ? prev.replaceWith(node) : parent.appendChild(node);
    } else {
        relative ? parent.before(node) : parent.appendChild(node);
    }

    nodeCleanup(node);

    return node;
}




// Creates a x/html element from a tagName
export function createTag(tagName: string, props: Props): Elements {
    console.log("CREATE TAG", tagName)
    // namespace
    // use props xmlns or special case svg, math, etc in case of missing xmlns attribute
    const ns = props.xmlns || NS[tagName];
    const nsContext = useXMLNS();

    if (ns && ns !== nsContext) {
        // the ns changed, use the new xmlns
        console.log("CREATE NS")
        return useXMLNS(ns, () =>
            createNode(createElementNS(ns, tagName), props),
        );
    }

    // foreignObject is created with current xmlns
    // reset back to html (default browser behaviour)
    if (nsContext && tagName === 'foreignObject') {
        console.log("CREATE NS foreignObject")
        return useXMLNS(NS.html, () =>
            createNode(createElementNS(nsContext, tagName), props),
        );
    }

    console.log("CREATE NODE")
    return createNode(
        nsContext
            ? createElementNS(nsContext, tagName)
            : createElement(tagName),
        props,
    );
}


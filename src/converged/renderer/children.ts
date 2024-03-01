//  Creates the children for a parent

 import { Elements } from "../props/types";
import { renderEffect, signal, withOwner } from "../solid";
import { isArray, isComponent, isFunction, iterator, stringify, toArray } from "../uitls/utils";
import { createPlaceholder, insertNode } from "./manipulate";
import { $map } from "../uitls/constants";
import { createTextNode } from "../uitls/elements";

export function createChildren(parent: Elements, child: any, relative?: boolean): any {
    switch (typeof child) {
        case 'string':
        case 'number': {
            return insertNode(parent, createTextNode(child), relative);
        }
        case 'function': {
            console.log("CHILDREN FUNCTION")
            return functionHandler(parent, child, relative)
        }
        case 'object': {
            return objectHandler(parent, child, relative)
        }
        case 'undefined': {
            return null;
        }
        default: {
            return insertNode(parent, createTextNode(child.toString()), relative,);
        }
    }
}

function objectHandler(parent: Elements, child: any, relative?: boolean): any {
    // children/fragments
    if (isArray(child)) {
        if (child.length === 1) {
            return createChildren(parent, child[0], relative);
        }
        return child.map(child =>
            createChildren(parent, child, relative),
        );
    }

    // Node/DocumentFragment
    if (child instanceof Node) {
        /**
         * DocumentFragment are special as only the children get added
         * to the document and the document becomes empty. If we dont
         * insert them 1 by 1 then we wont have a reference to them
         * for deletion on cleanup with node.remove()
         */
        if (child instanceof DocumentFragment) {
            return createChildren(
                parent,
                toArray(child.childNodes),
                relative,
            );
        }
        return insertNode(parent, child, relative);
    }

    /**
     * The value is `null`, as in {null} or like a show returning
     * `null` on the falsy case
     */
    if (child === null) {
        return null;
    }

    // async components
    if ('then' in child) {
        const [value, setValue] = signal(null);
        /**
         * If the result of the promise is a function it runs it with
         * an owner. Else it will just use the return value
         */
        const owned = withOwner();
        const onResult = r =>
            parent.isConnected && setValue(isFunction(r) ? owned(r) : r);

        child.then(onResult).catch(onResult);
        return createChildren(parent, value, relative);
    }

    // iterable/Map/Set/NodeList
    if (iterator in child) {
        return createChildren(
            parent,
            toArray(child.values()),
            relative,
        );
    }

    // object.toString fancy objects
    return createChildren(
        parent,
        // object.create(null) would fail to convert to string
        'toString' in child ? child.toString() : stringify(child),
        relative,
    );
}



function functionHandler(parent: Elements, child: any, relative?: boolean): any {
    // component
    if (isComponent(child)) {
        return createChildren(parent, child(), relative);
    }

    let node;

    // For
    if ($map in child) {
        console.log("EFFFECT CHILDREN")
        // signal: needs an effect
 
        const effect = () => {
            node = child(child => {
                console.log("CHILDREN: ", child)
                /**
                 * Wrap the item with placeholders, to avoid resolving and
                 * for easy re-arrangement
                 */
                const begin = createPlaceholder(
                    parent,
                    null /*begin*/,
                    true,
                );
                const end = createPlaceholder(parent, null /*end*/, true);

                return [begin, createChildren(end, child, true), end];
            });

        }
        renderEffect(
            effect
        )

        return node;
    }

    // signal/memo/external/user provided function
    // needs placeholder to stay in position
    parent = createPlaceholder(
        parent,
        null /*child.name*/,
        relative,
    );

    // maybe a signal so needs an effect
    console.log("EFFECT2 CHILDREN")
    renderEffect(() => {
        node = createChildren(parent, child(), true);
    });
    /**
     * A placeholder is created and added to the document but doesnt
     * form part of the children. The placeholder needs to be
     * returned so it forms part of the group of children. If
     * children are moved and the placeholder is not moved with
     * them, then, whenever children update these will be at the
     * wrong place. wrong place: where the placeholder is and not
     * where the children were moved to
     */
    return [node, parent];

}

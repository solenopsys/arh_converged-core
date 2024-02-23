import { Jsxo, DomManipulate } from "./intf";
import { createEffect } from "../reactive/effect";

function insertChild(child: any, dom: DomManipulate, parent: Element) {
    const t: string = typeof child;

    if (t === 'string') {
        parent.appendChild(dom.createTextNode(child));
    } else if (t === 'number') {
        parent.appendChild(dom.createTextNode(child.toString()));
    } else if (t === 'function') {
        parent.appendChild(dom.createTextNode(child()));
    } else if (t === 'object') {
        jxsToDom(child, dom, parent);
    } else
        throw new Error('Unsupported type: ' + t);
}

function createNewElement(obj: Jsxo, dom: DomManipulate, parent: Element): [Element, any] {
    let elementName = obj.elementName;
    let props: any = obj.props;
    let element;

    const effect = () => {
        if (typeof elementName === 'function') {
            const comp: any = elementName({});
            props = comp.props;
            element = dom.createElement(comp.elementName);
        } else {
            element = dom.createElement(elementName);
        }
        parent.appendChild(element)
    };

    createEffect(effect)
    return [element, props]
}

export function jxsToDom(obj: Jsxo, dom: DomManipulate, parent: Element) {
    const [newElement, props] = createNewElement(obj, dom, parent);

    for (let name in props) {
        if (name.startsWith("on")) {
            const eventName = name.substring(2).toLowerCase()
            newElement.addEventListener(eventName, props[name]);
        } else if (name === "children") {
            if (Array.isArray(props.children)) {
                for (let child of props.children)
                    insertChild(child, dom, newElement)
            } else
                insertChild(props.children, dom, newElement)

        } else {
            newElement.setAttribute(name, props[name])
        }
    }
}
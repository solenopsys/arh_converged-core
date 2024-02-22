import { DomManipulate } from "./api";
import { createEffect } from "./reactive";
import { jsx } from 'src/converged/jsx';

interface Jsxo { elementName: string | any, props: any }


function insertChild(child: any, dom: DomManipulate, parent: Element) {
    const t: string = typeof child;

    if (t === 'string') {
        parent.appendChild(dom.createTextNode(child));
    } else if (t === 'number') {
        parent.appendChild(dom.createTextNode(child.toString()));
    } else if (t === 'function') {
        parent.appendChild(dom.createTextNode(child()));
    } else if (t === 'object') {
        convertJsxToDom(child, dom, parent);
    } else
        throw new Error('Unsupported type: ' + t);
}


export function convertJsxToDom(obj: Jsxo, dom: DomManipulate, parent: Element) {
    let elementName = obj.elementName;
    let input: any = obj.props;
    let newElement;

    const effect = () => {
        if (typeof elementName === 'function') {
            const comp: any = elementName({});
            input = comp.props;
            newElement = dom.createElement(comp.elementName);
        } else {
            newElement = dom.createElement(elementName);
        }
        parent.appendChild(newElement)
    };

    createEffect(effect)

    for (let name in input) {
        if (name.startsWith("on")) {
            const eventName = name.substring(2).toLowerCase()
            newElement.addEventListener(eventName, input[name]);
        } else if (name === "children") {
            if (Array.isArray(input.children)) {
                for (let child of input.children)
                    insertChild(child, dom, newElement)
            } else {
                insertChild(input.children, dom, newElement)
            }
        } else {
            newElement.setAttribute(name, input[name])
        }
    }
}
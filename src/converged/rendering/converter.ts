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
        createNewElement(child, dom, parent);
    } else
        throw new Error('Unsupported type: ' + t);
}

export function createNewElement(obj: Jsxo, dom: DomManipulate, parent: Element) {
    let elementName = obj.elementName;
    let props: any = obj.props;
    let element: Element;
    let firstCall = true;
    let comp: any;
    if (typeof elementName === 'function') {
        const effect = () => {
            console.log("CREATE EFFECT", firstCall, elementName)
            if (firstCall) {
                comp = elementName({}); // создание комопнента а он не должен создаваться
                console.log("COMPONENT", comp)
            }
            props = comp.props;
            const oldElement: Element = element;
            element = dom.createElement(comp.elementName);
            renderJsxToDom(element, props, dom)
            if (firstCall) {
                firstCall = false;
            } else {
                oldElement.remove()
                //   parent.appendChild(element)
            }
            parent.appendChild(element);
        };
        if (firstCall)
            createEffect(effect)
    } else {
        element = dom.createElement(elementName);
        renderJsxToDom(element, props, dom)
        parent.appendChild(element)
    }
}

function renderJsxToDom(newElement: Element, props: any, dom: DomManipulate) {


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
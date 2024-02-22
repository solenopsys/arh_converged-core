import { DomManipulate } from "./api";

interface Jsxo { elementName: string, props: any }

function childConvert(child: any, dom: DomManipulate): Element {
    const t: string = typeof child;
  //  console.log("TYPE ", t, " CHILD ", child)
    switch (t) {
        case 'string':
            return dom.createTextNode(child);
        case 'number':
            return dom.createTextNode(child.toString());
        case 'function':
            return dom.createTextNode(child());
        case 'object':
            return convertJsxToDom(child);
        default:
            throw new Error('Unsupported type: ' + t);
    }
}

function componentConvert(elementName: any, dom: DomManipulate): Element {
        //     return  renderEffect(() => {
    //    //   let v = type();
    //    //   while (typeof v === "function") v = v();
          
    //     });
    return convertJsxToDom(elementName({}));
}


export function convertJsxToDom(obj: Jsxo): Element {
    const dom: DomManipulate = document;

    const elementName = obj.elementName;
    const input: any = obj.props;

    if (typeof elementName === 'function') {
        return componentConvert(elementName,dom) 
    }

    const element = dom.createElement(elementName);

    for (let name in input) {
        if (name.startsWith("on")) {
            const eventName = name.substring(2).toLowerCase()
            element.addEventListener(eventName, input[name]);
            continue
        }

        if (name === "children") {
            if (Array.isArray(input.children)) {
                for (let child of input.children) element.appendChild(childConvert(child, dom));
            } else {
                element.appendChild(childConvert(input.children,dom))
            }

            continue
        }

        element.setAttribute(name, input[name])
    }
    return element
}
import { DomManipulate } from "./api";


function render(comp: (props: any) => JSX.Element, selector: string, dom: DomManipulate) {
  const body = dom.querySelector(selector)
  const element = domConverter(body, comp({}), {})
 console.log("ELEMENT",element)
  //body.appendChild(element as Element)
}


export function domConverter(parent: any, type: any, props: any,) {
  const t=typeof type

  console.log("IN",typeof type);
  if ( t=== 'object') { // jsx
  

    // effect(() => {
    //   let v = type();
    //   while (typeof v === "function") v = v();
    //   current = insertExpression(parent, v, current, marker, undefined);
    // });

    // return () => current;
    return domConverter(parent, type.jst, type.jsp)
  }

  if (t === 'function') { // component
  //  console.log("FUNCTION OK");
    // effect(() => {
    //   let v = type();
    //   while (typeof v === "function") v = v();
    //   current = insertExpression(parent, v, current, marker, undefined);
    // });

    // return () => current;
    return type({})
  }

  
}

function convertNode(type: any, props: any){
  const dom: DomManipulate = document;

  const element = dom.createElement(type);
  if (props.style)
    element.setAttribute("style", props.style)

  for (let name in props) {
    if (name.startsWith("on")) {
      const eventName = name.replace("on", "").toLowerCase()
      element.addEventListener(eventName, props[name]);
    }
  }

  if (Array.isArray(props.children)) {
    for (let child of props.children) {

      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child))
      } else if (typeof child === 'number') {
        console.log("NUMCHILD", child)
        const newLocal = document.createTextNode(child + "[nub]");
        element.appendChild(newLocal)
      } else {
        element.appendChild(child)
      }
    }
  } else if (typeof props.children === 'object') {
    element.appendChild(props.children)
  }

  if (typeof props.children === 'string') {
    element.appendChild(document.createTextNode(props.children))
  }
  return element
}

function jsx(type: any, props: any, p2: any, last: boolean, p4: any, owner: object) {
  return {jst: type,jsp: props };
}

export namespace JSX {
  export type Element = {}
  export type ArrayElement = {}
}
const Fragment = (props: { children: JSX.Element }) => {
  return props.children;
}

export { jsx, jsx as jsxs, jsx as jsxDEV, Fragment, render };
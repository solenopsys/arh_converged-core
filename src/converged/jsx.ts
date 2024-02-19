import { DomManipulate } from "./api";


function render(comp: (props: any) => JSX.Element, selector: string, dom: DomManipulate) {
  const body = dom.querySelector(selector)
  const element = comp({});
  body.appendChild(element as Element)
}


function jsx(type: any, props: any, p2: any, last: boolean, p4: any, owner: object) {
  const dom: DomManipulate = document;

  const element = dom.createElement(type);
  if (props.style)
    element.setAttribute("style", props.style)

  for (let name in props){
    if (name.startsWith("on")){
      const eventName=name.replace("on","").toLowerCase()
      element.addEventListener( eventName, props[name]);
    } 
  }  

  if (Array.isArray(props.children)) {
    for (let child of props.children) {

      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child))
      } else if (typeof child === 'number') {
        element.appendChild(document.createTextNode(child + ""))
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

  return element;
}

export namespace JSX {
  export type Element = {}
  export type ArrayElement = {}
}
const Fragment = (props: { children: JSX.Element }) => {
  return props.children;
}

export { jsx, jsx as jsxs, jsx as jsxDEV, Fragment, render };
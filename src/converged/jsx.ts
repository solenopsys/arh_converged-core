import { DomManipulate } from "./api";
import { convertJsxToDom } from "./converter";


function render(comp: any, selector: string, dom: DomManipulate) {
  const body = dom.querySelector(selector)

  convertJsxToDom( { elementName: comp, props: {} } , dom, body)
}


function jsx(type: any, props: any, p2: any, last: boolean, p4: any, owner: object) {
  return { elementName: type, props: props };
}

export namespace JSX {
  export type Element = {}
  export type ArrayElement = {}
}
const Fragment = (props: { children: JSX.Element }) => {
  return props.children;
}

export { jsx, jsx as jsxs, jsx as jsxDEV, Fragment, render };
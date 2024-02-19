import {h} from "./core"
function jsx(type: any, props: any) {

  const vdom = h(type, props);
  return vdom;
}

export namespace JSX {
  export type Element = {}
  export type ArrayElement = {}
}
const Fragment = (props: { children: JSX.Element }) => {
  return props.children;
}

export { jsx, jsx as jsxs, jsx as jsxDEV, Fragment };
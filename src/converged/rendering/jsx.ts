import { JSX, Jsxo } from "./intf"

const Fragment = (props: { children: JSX.Element }) => {
  return props.children;
}

function jsx(type: any, props: any, p2: any, last: boolean, p4: any, owner: object): Jsxo {
  return { elementName: type, props: props };
}

export { jsx, jsx as jsxs, jsx as jsxDEV, Fragment };
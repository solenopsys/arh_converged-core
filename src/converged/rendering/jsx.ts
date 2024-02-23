import { JSX, Jsxo } from "./intf"

export const Fragment = (props: { children: JSX.Element }) => {
  return props.children;
}

export function jsx(type: any, props: any, p2: any, last: boolean, p4: any, owner: object): Jsxo {
  return { elementName: type, props: props };
}


export namespace JSX {
    export type Element = {}
    export type ArrayElement = {}
}

export interface Jsxo { elementName: string | any, props: any }

export interface DomManipulate {
    createElement(tagName: string): Element;
    querySelector(selectors: string): Element;
    createTextNode(content: string): Element;
}

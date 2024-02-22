import { JSX } from "./jsx";

export interface ReactiveIntf {
    createSignal(value): any[];
    createEffect(fn);
    subscribe(running, subscriptions);
    cleanup(running) ;
}

export interface RenderingIntf  {
    render(code: JSX.Element, element: any): () => any ;
}

export interface DomManipulate{
    createElement(tagName:string):Element;
    querySelector(selectors:string):Element;
    createTextNode(content:string):Element;
}
export interface DomManipulate{
    createElement(tagName:string):Element;
    querySelector(selectors:string):Element;
}
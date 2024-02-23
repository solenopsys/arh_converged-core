import { jxsToDom } from "./converter"
import {DomManipulate} from "./intf"

export function render(comp: any, selector: string, dom: DomManipulate) {
    const body = dom.querySelector(selector)
    jxsToDom({ elementName: comp, props: {} }, dom, body)
}
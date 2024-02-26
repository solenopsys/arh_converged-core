import { createNewElement } from "./converter"
import {DomManipulate} from "./intf"

export function render(comp: any, selector: string, dom: DomManipulate) {
    const body = dom.querySelector(selector)
    createNewElement({ elementName: comp, props: {} }, dom, body)
}
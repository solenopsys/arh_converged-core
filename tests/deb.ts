
import {  jsx, render } from "../src/converged/rendering/jsx";

import {jxsToDom} from "../src/converged/rendering/converter";


function InsideTestComponent(props) {
    return jsx("div", {
        style: "border:2px;",
        children: [
            "Inside div"
        ]
    }, undefined, true, undefined, this);
}

import { GlobalRegistrator } from "@happy-dom/global-registrator";
 

GlobalRegistrator.register();


const result = jxsToDom( InsideTestComponent({}))
console.log("test dom convetor", result)



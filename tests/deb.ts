
import {  jsx, render } from "../src/converged/jsx";

import {convertJsxToDom} from "../src/converged/converter";


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


const result = convertJsxToDom( InsideTestComponent({}))
console.log("test dom convetor", result)



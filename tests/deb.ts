
import { domConverter, jsx, render } from "../src/converged/jsx";


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


const result = domConverter(null, InsideTestComponent, {})
console.log("test dom convetor", result)



import { createEffect, createSignal } from "../src/converged/reactive";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { test, expect } from 'bun:test';
import { DomManipulate } from "src/converged/api";
import { jsx, render } from "src/converged/jsx";

GlobalRegistrator.register();


function TestComponent(props) {
  const [count, setCount] = createSignal(0);
  createEffect(() => {
    console.log("The count is now", count());
  });
  return jsx("div", {
    style: "border:1px;",
    children: [
      jsx("div", {
        children: "Create div"
      }, undefined, false, undefined, this),
      jsx("table", {
        children: jsx("td", {}, undefined, false, undefined, this)
      }, undefined, false, undefined, this),
      jsx("button", {
        onClick: () => setCount(count() + 1),
        children: [
          "Click Me ",
          count()
        ]
      }, undefined, true, undefined, this)
    ]
  }, undefined, true, undefined, this);
}

test('test render', () => {
  const dom: DomManipulate = document;
  document.body.innerHTML = `<body></body>`;
  render(TestComponent, "body", dom);
  const div = document.querySelector('div');
  expect(div.getAttribute("style")).toEqual('border:1px;');
  const nodes = div.childNodes;
  expect(nodes.length).toEqual(3);

  const subDiv = nodes[0];
  expect(subDiv.nodeName).toEqual("DIV");
  expect(subDiv.childNodes.length).toEqual(1);

  const subTable = nodes[1];
  expect(subTable.nodeName).toEqual("TABLE");
  expect(subTable.childNodes.length).toEqual(1);
  expect(subTable.childNodes[0].nodeName).toEqual("TD");

  const button = nodes[2];
 
  expect(button.nodeName).toEqual("BUTTON");
  expect(button.childNodes.length).toEqual(2);
  expect(button.childNodes[0].nodeValue).toEqual("Click Me ");
  expect(button.childNodes[1].nodeValue).toEqual("0");
});



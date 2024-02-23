import { createEffect, createSignal } from "../src/converged/reactive/signal";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { test, expect } from 'bun:test';
import { DomManipulate } from "src/converged/api";
import { domConverter, jsx, render } from "src/converged/jsx";

GlobalRegistrator.register();


function InsideTestComponent(props) {
  return jsx("div", {
    style: "border:2px;",
    children: [
      "Inside div"
    ]
  }, undefined, true, undefined, this);
}


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
      }, undefined, false, undefined, this),
      jsx(InsideTestComponent, {}, undefined, true, undefined, this),
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
  expect(nodes.length).toEqual(4);

  const subDiv = nodes[0];
  expect(subDiv.nodeName).toEqual("DIV");
  expect(subDiv.childNodes.length).toEqual(1);
  expect(subDiv.childNodes[0].textContent).toEqual("Create div");

  const subTable = nodes[1];
  expect(subTable.nodeName).toEqual("TABLE");
  expect(subTable.childNodes.length).toEqual(1);
  expect(subTable.childNodes[0].nodeName).toEqual("TD");

  const button = nodes[2];

  expect(button.nodeName).toEqual("BUTTON");
  expect(button.childNodes.length).toEqual(2);
  expect(button.childNodes[0].nodeValue).toEqual("Click Me ");
  expect(button.childNodes[1].nodeValue).toEqual("0");

  const inside: any = nodes[3];
  expect(inside.nodeName).toEqual("DIV");
  expect(inside.getAttribute("style")).toEqual('border:2px;');
});


let setCountGlobal;
let getCountGlobal;

function RerenderTest(props) {
  const [count, setCount] = createSignal(0);
  setCountGlobal=setCount;
  getCountGlobal=count;
  return jsx("div", {
    style: "border:1px;",
    children: [
      jsx("div", {
        children:  count()
      }, undefined, false, undefined, this),
    ]
  }, undefined, true, undefined, this);
}



test('test rerender', () => {
  const dom: DomManipulate = document;
  document.body.innerHTML = `<body></body>`;
  render(RerenderTest, "body", dom);
  const div = document.querySelector('div');
  expect(div.getAttribute("style")).toEqual('border:1px;');
  const nodes = div.childNodes;
  expect(nodes.length).toEqual(1);

  const subDiv = nodes[0];
  expect(subDiv.nodeName).toEqual("DIV");
  expect(subDiv.childNodes.length).toEqual(1);
  expect(subDiv.childNodes[0].textContent).toEqual("0");

  console.log("--------------------------")
  setCountGlobal(1)
  getCountGlobal()
  expect(getCountGlobal()).toEqual(1);

  const subDiv2 = nodes[0];
  expect(subDiv2.childNodes[0].textContent).toEqual("1");

});
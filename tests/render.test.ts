
import { test, expect, beforeAll } from 'bun:test';
import { jsx } from "src/converged/renderer";
import { Component } from "src/converged/renderer/component";
import { render } from "src/converged/renderer/renderer";
import { effect, signal } from "src/converged/solid";




function InsideTestComponent(props) {
  return jsx("div", {
    style: "border:2px;",
    children: [
      "Inside div"
    ]
  });
}


function TestComponent(props) {
  const [count, setCount] = signal(1);
  effect(() => {
    console.log("The count is now", count());
  });
  return jsx("div", {
    style: "border:1px;",
    children: [
      jsx("div", {
        children: "Create div"
      }),
      jsx("table", {
        children: jsx("td", {})
      }),
      jsx("button", {
        onClick: () => setCount(count() + 1),
        children: [
          "Click Me ",
          count()
        ]
      }),
      jsx(InsideTestComponent, {}),
    ]
  });
}



test.skip('test render', () => {

  document.body.innerHTML = `<body></body>`;
  render(TestComponent, document.querySelector('body'));
  const div = document.querySelector('div');
  expect(div.getAttribute("style")).toEqual('border: 1px;');
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
  expect(button.childNodes[1].nodeValue + "").toEqual("1");

  const inside: any = nodes[3];
  expect(inside.nodeName).toEqual("DIV");
  expect(inside.getAttribute("style")).toEqual('border: 2px;');
});


let setCountGlobal;
let getCountGlobal;

function RerenderTest(props) {
  const [count, setCount] = signal(1);
  setCountGlobal = setCount;
  getCountGlobal = count;
  return jsx("div", {
    style: "border:1px;",
    children: [
      jsx("div", {
        children: count()
      }),
    ]
  });
}



test('test rerender', async () => {
  document.body.innerHTML = `<body></body>`;
  render(RerenderTest, document.querySelector('body'));
  const div = document.querySelector('div');
  expect(div.getAttribute("style")).toEqual('border: 1px;');
  const nodes = div.childNodes;
  expect(nodes.length).toEqual(1);

  const subDiv = nodes[0];
  expect(subDiv.nodeName).toEqual("DIV");
  expect(subDiv.childNodes.length).toEqual(1);
  expect(subDiv.childNodes[0].textContent + "").toEqual("1");

  console.log("--------------------------")
  let value
  effect(() => { value = getCountGlobal() });
  setCountGlobal(2)
  expect(getCountGlobal()).toEqual(2);
  await new Promise(setImmediate);

  expect(value).toEqual(2);


    const subDiv2 = nodes[0];
    expect(subDiv2.nodeName).toEqual("DIV");
    expect(subDiv2.childNodes[0].textContent+"").toEqual("2");

});
import { createSignal } from "./reactive";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { test, expect } from 'bun:test';
import { DomManipulate } from "./model";

GlobalRegistrator.register();


function TestComponent(props) {
  return jsx("div", {
    style: "border:1px;",
    children: [
      jsx("div", {
        children: "Create div"
      }, undefined, false, undefined, this),
      jsx("table", {
        children: jsx("td", {}, undefined, false, undefined, this)
      }, undefined, false, undefined, this),
    ]
  }, undefined, true, undefined, this);
}

const dom: DomManipulate=document;
function jsx(type: any, props: any, p2: any, last: boolean, p4: any, owner: object) {
  const element = dom.createElement(type);
  if(props.style)
     element.setAttribute("style",props.style)

  if(Array.isArray(props.children)){
    for (let child of props.children){
      element.appendChild(child)
    }
  }else if(typeof props.children=== 'object'){
    element.appendChild(props.children)
  }

  if(typeof props.children === 'string'){
    element.appendChild(document.createTextNode( props.children ))
  }

  return  element;
}


function render(comp: (props: any) => Element, selector: string, dom:DomManipulate) {
 const body= dom.querySelector(selector)
  const element = comp({});
  body.appendChild(element)
}

test('test render', () => {
  const dom: DomManipulate=document;
  document.body.innerHTML = `<body></body>`;
  render(TestComponent,"body",dom);
  const div = document.querySelector('div');
  expect( div.getAttribute("style")).toEqual('border:1px;');
  const nodes = div.childNodes;
  expect(nodes.length).toEqual(2);
 
  const subDiv = nodes[0];
  expect( subDiv.nodeName).toEqual("DIV");
  expect(   subDiv.childNodes.length).toEqual(1);

  const subTable = nodes[1];
  expect( subTable.nodeName).toEqual("TABLE");
  expect(   subTable.childNodes.length).toEqual(1);
  expect(   subTable.childNodes[0].nodeName).toEqual("TD");



});


   //   const [count, setCount] = createSignal(0);

   
   //jsx("button", {
      //   onClick: () => setCount(count() + 1),
      //   children: [
      //     "Click Me ",
      //     count()
      //   ]
      // }, undefined, true, undefined, this)

//render(){
  
//}


// test('dom renderign', () => {
//   document.body.innerHTML = `
//   <div style="border:1px;">
//   <div>Create div</div><table><td></td></table>
//   </div>
// `; //  <button onClick={() => setCount(count() + 1)}>Click Me {count()}</button>
//   const button = document.querySelector('button');
//   expect(button?.innerText).toEqual('My button');
// });

import { render } from "solidjs-example/dom/client";
import { createEffect, createSignal } from "./converged/reactive";

export function MyComponent1(props) {
  return <div style="border:1px;">  OK2
 </div>;
}



export function MyComponent(props) {
  const [count, setCount] = createSignal(0);


  createEffect(() => {
    console.log('The count is now', count());
  });


  return <div style="border:1px;">
    <div>Create div</div><table><td>ok10</td></table>
    <button onClick={() => setCount(count() + 1)}>Click Me {count()}</button>
    <MyComponent1></MyComponent1>
  </div>;
}

export abstract class JSXEXP{

  abstract render()

}


export class MyComponent0 extends JSXEXP{
    [count, setCount] = createSignal(0);


  // createEffect(() => {
  //   console.log('The count is now', count());
  // });


  render(){
    return <div style="border:1px;">
    <div>Create div</div><table><td>ok10</td></table>
    <button onClick={() => setCount(count() + 1)}>Click Me {count()}</button>
    <MyComponent1></MyComponent1>
  </div>;
  } 
}



/*
    

<core.For2 start="10"></core.For2>
<MyComponent1></MyComponent1> */


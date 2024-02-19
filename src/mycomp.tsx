
import { createEffect, createSignal,For2 } from "./core";

export function MyComponent1(props) {
  const [count, setCount] = createSignal(0);


  createEffect(() => {
    console.log('The count is now', count());
  });


  return <div style="border:1px;">
    OK
  </div>;
}



export function MyComponent(props) {
  const [count, setCount] = createSignal(0);


  createEffect(() => {
    console.log('The count is now', count());
  });


  return <div style="border:1px;">
    <div>Create div</div><table><td></td></table>
    <For2 start="10"></For2>
    <MyComponent1></MyComponent1>
    <button onClick={() => setCount(count() + 1)}>Click Me {count()}</button>
  </div>;
}


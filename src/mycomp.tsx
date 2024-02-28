
 

import { signal,effect } from "./converged/solid";

export function MyComponent1(props) {
  return <><div style="border:1px;">  OK2</div></> 
}



export function MyComponent(props) {
  const [count, setCount] = signal(0);


  effect(() => {
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

  

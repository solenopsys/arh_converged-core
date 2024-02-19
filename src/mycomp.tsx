
import * as core from "./converged/reactive";

// export function MyComponent1(props) {
//   const [count, setCount] = core.createSignal(0);


//   core.createEffect(() => {
//     console.log('The count is now', count());
//   });


//   return <div style="border:1px;">
//     OK
//   </div>;
// }



export function MyComponent(props) {
  const [count, setCount] = core.createSignal(0);


  core.createEffect(() => {
    console.log('The count is now', count());
  });


  return <div style="border:1px;">
    <div>Create div</div><table><td>ok10</td></table>
    <button onClick={() => setCount(count() + 1)}>Click Me {count()}</button>
  </div>;
}


/*
    

<core.For2 start="10"></core.For2>
<MyComponent1></MyComponent1> */


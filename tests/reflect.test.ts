
import { jsx } from '@solenopsys/converged/jsx-runtime';
import { test, expect } from 'bun:test';
import { createEffect, createSignal } from 'solidjs-example/reactive/signal';


function MyComponent(props) {
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
          children: jsx("td", {
            children: "ok10"
          }, undefined, false, undefined, this)
        }, undefined, false, undefined, this),
        jsx("button", {
          onClick: () => setCount(count() + 1),
          children: [
            "Click Me ",
            count()
          ]
        }, undefined, true, undefined, this),
      ]
    }, undefined, true, undefined, this);
  }

function create(comp) {
    const keys = Reflect.ownKeys(comp.prototype);
    console.log(keys); // Output: ['length', 'name', 'prototype', 'prop1']
    
     console.log(comp)

}


test('test render', () => {
    create(MyComponent)
});
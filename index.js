// src/core.tsx
function createSignal(value) {
  const read = undefined;
  const write = undefined;
  return [read, write];
}
function createEffect(fn) {
}
function render(code, element) {
  return;
}
function h(type, props) {
  console.log("TRANS", type, props);
  return {};
}
function For2() {
}

// src/mycomp.tsx
function MyComponent1(props) {
  const [count, setCount] = createSignal(0);
  createEffect(() => {
    console.log("The count is now", count());
  });
  return jsx("div", {
    style: "border:1px;",
    children: "OK"
  }, undefined, false, undefined, this);
}
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
        children: jsx("td", {}, undefined, false, undefined, this)
      }, undefined, false, undefined, this),
      jsx(For2, {
        start: "10"
      }, undefined, false, undefined, this),
      jsx(MyComponent1, {}, undefined, false, undefined, this),
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

// src/jsx.ts
var jsx = function(type, props) {
  const vdom = h(type, props);
  return vdom;
};

// src/index.tsx
render(MyComponent, document.getElementById("layout"));

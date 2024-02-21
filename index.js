// src/converged/jsx.ts
var render = function(comp, selector, dom) {
  const body = dom.querySelector(selector);
  const element = comp({});
  setInterval(() => {
    console.log("APPEND CHILD");
    body.appendChild(element);
  }, 1000);
};
var jsx = function(type, props, p2, last, p4, owner) {
  const dom = document;
  if (typeof type === "function") {
    return type();
  }
  const element = dom.createElement(type);
  if (props.style)
    element.setAttribute("style", props.style);
  for (let name in props) {
    if (name.startsWith("on")) {
      const eventName = name.replace("on", "").toLowerCase();
      element.addEventListener(eventName, props[name]);
    }
  }
  if (Array.isArray(props.children)) {
    for (let child of props.children) {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else if (typeof child === "number") {
        console.log("NUMCHILD", child);
        const newLocal = document.createTextNode(child + "[nub]");
        element.appendChild(newLocal);
      } else {
        element.appendChild(child);
      }
    }
  } else if (typeof props.children === "object") {
    element.appendChild(props.children);
  }
  if (typeof props.children === "string") {
    element.appendChild(document.createTextNode(props.children));
  }
  return element;
};

// src/converged/reactive.ts
var subscribe = function(running, subscriptions) {
  subscriptions.add(running);
  running.dependencies.add(subscriptions);
};
function createSignal(value) {
  const subscriptions = new Set;
  const read = () => {
    const running = context[context.length - 1];
    if (running)
      subscribe(running, subscriptions);
    return value;
  };
  const write = (nextValue) => {
    value = nextValue;
    for (const sub of [...subscriptions]) {
      sub.execute();
    }
  };
  return [read, write];
}
var cleanup = function(running) {
  for (const dep of running.dependencies) {
    dep.delete(running);
  }
  running.dependencies.clear();
};
function createEffect(fn) {
  const execute = () => {
    cleanup(running);
    context.push(running);
    try {
      fn();
    } finally {
      context.pop();
    }
  };
  const running = {
    execute,
    dependencies: new Set
  };
  execute();
}
var context = [];

// src/mycomp.tsx
function MyComponent1(props) {
  return jsx("div", {
    style: "border:1px;",
    children: "OK2"
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
      jsx(MyComponent1, {}, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
}

// src/index.tsx
render(MyComponent, "body", document);

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
  console.log("EFF");
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

// src/converged/converter.ts
var childConvert2 = function(child, dom, parent) {
  const t = typeof child;
  console.log("CHILD TYPE: ", t);
  console.log("CHILD VALUE: ", child);
  if (t === "string") {
    parent.appendChild(dom.createTextNode(child));
    return;
  }
  if (t === "number") {
    parent.appendChild(dom.createTextNode(child.toString()));
    return;
  }
  if (t === "function") {
    parent.appendChild(dom.createTextNode(child()));
    return;
  }
  if (t === "object") {
    convertJsxToDom(child, dom, parent);
    return;
  }
  throw new Error("Unsupported type: " + t);
};
function convertJsxToDom(obj, dom, parent) {
  console.log("CONVERSION RUN", obj);
  let elementName = obj.elementName;
  let input = obj.props;
  let element;
  const newLocalFunction = () => {
    if (typeof elementName === "function") {
      const obj2 = elementName({});
      console.log("IN EFFECT", obj2);
      input = obj2.props;
      element = dom.createElement(obj2.elementName);
    } else {
      element = dom.createElement(elementName);
    }
    parent.appendChild(element);
  };
  createEffect(newLocalFunction);
  for (let name in input) {
    if (name.startsWith("on")) {
      const eventName = name.substring(2).toLowerCase();
      element.addEventListener(eventName, input[name]);
      continue;
    }
    if (name === "children") {
      if (Array.isArray(input.children)) {
        for (let child of input.children) {
          console.log("IN ARRAY");
          childConvert2(child, dom, element);
        }
      } else {
        childConvert2(input.children, dom, element);
      }
      continue;
    }
    element.setAttribute(name, input[name]);
  }
}

// src/converged/jsx.ts
var render = function(comp, selector, dom) {
  const body = dom.querySelector(selector);
  convertJsxToDom({ elementName: comp, props: {} }, dom, body);
};
var jsx = function(type, props, p2, last, p4, owner) {
  return { elementName: type, props };
};

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

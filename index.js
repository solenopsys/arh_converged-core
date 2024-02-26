// src/converged/rendering/jsx.ts
function jsx(type, props, p2, last, p4, owner) {
  return { elementName: type, props };
}

// src/converged/reactive/context.ts
var context = [];

// src/converged/reactive/effect.ts
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

// src/converged/rendering/converter.ts
var insertChild = function(child, dom, parent) {
  const t = typeof child;
  if (t === "string") {
    parent.appendChild(dom.createTextNode(child));
  } else if (t === "number") {
    parent.appendChild(dom.createTextNode(child.toString()));
  } else if (t === "function") {
    parent.appendChild(dom.createTextNode(child()));
  } else if (t === "object") {
    createNewElement(child, dom, parent);
  } else
    throw new Error("Unsupported type: " + t);
};
function createNewElement(obj, dom, parent) {
  let elementName = obj.elementName;
  let props = obj.props;
  let element;
  let firstCall = true;
  let comp;
  if (typeof elementName === "function") {
    const effect2 = () => {
      console.log("CREATE EFFECT", firstCall, elementName);
      if (firstCall) {
        comp = elementName({});
        console.log("COMPONENT", comp);
      }
      props = comp.props;
      const oldElement = element;
      element = dom.createElement(comp.elementName);
      renderJsxToDom(element, props, dom);
      if (firstCall) {
        firstCall = false;
      } else {
        oldElement.remove();
      }
      parent.appendChild(element);
    };
    if (firstCall)
      createEffect(effect2);
  } else {
    element = dom.createElement(elementName);
    renderJsxToDom(element, props, dom);
    parent.appendChild(element);
  }
}
var renderJsxToDom = function(newElement, props, dom) {
  for (let name in props) {
    if (name.startsWith("on")) {
      const eventName = name.substring(2).toLowerCase();
      newElement.addEventListener(eventName, props[name]);
    } else if (name === "children") {
      if (Array.isArray(props.children)) {
        for (let child of props.children)
          insertChild(child, dom, newElement);
      } else
        insertChild(props.children, dom, newElement);
    } else {
      newElement.setAttribute(name, props[name]);
    }
  }
};

// src/converged/rendering/render.ts
function render(comp, selector, dom) {
  const body = dom.querySelector(selector);
  createNewElement({ elementName: comp, props: {} }, dom, body);
}

// src/converged/reactive/signal.ts
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

// src/mycomp.tsx
function MyComponent1(props) {
  return jsx("div", {
    style: "border:1px;",
    children: "  OK2"
  }, undefined, false, undefined, this);
}
function MyComponent(props) {
  const [count2, setCount2] = createSignal(0);
  createEffect(() => {
    console.log("The count is now", count2());
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
        onClick: () => setCount2(count2() + 1),
        children: [
          "Click Me ",
          count2()
        ]
      }, undefined, true, undefined, this),
      jsx(MyComponent1, {}, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
}
class MyComponent0 {
  render() {
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
}

// src/index.tsx
render(MyComponent, "body", document);
render(MyComponent0, "body", document);

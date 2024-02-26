import {context} from "./context"

function subscribe(running, subscriptions) {
  subscriptions.add(running);
  running.dependencies.add(subscriptions);
}

export function createSignal<T>(value: T): [() => T, (nextValue: T) => void] {
  const subscriptions = new Set<{ execute: () => void }>();

  const read = () => {
    const running = context[context.length - 1];
   
    if (running) subscribe(running, subscriptions);
    return value;
  };

  const write = (nextValue: T) => {
    value = nextValue;
    for (const sub of [...subscriptions]) { 
      sub.execute();
    }
  };
  return [read, write];
}


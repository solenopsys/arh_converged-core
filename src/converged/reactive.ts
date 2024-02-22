
const context = [];

function subscribe(running, subscriptions) {
    subscriptions.add(running);
    running.dependencies.add(subscriptions);
}

export function createSignal<T>(value: T): [() => T, (nextValue: T) => void] {
    const subscriptions = new Set<{ execute: () => void }>();

    const read = () => {
        const running = context[context.length - 1];
        if (running) subscribe(running, subscriptions);
        console.log("READ SIGNAL VALUE:",value)
        return value;
    };

    const write = (nextValue: T) => {
      console.log("WRITE SIGNAL VALUE:",nextValue)
        value = nextValue;

        for (const sub of [...subscriptions]) {
            sub.execute();
        }
    };
    return [read, write];
}

function cleanup(running) {
    for (const dep of running.dependencies) {
      dep.delete(running);
    }
    running.dependencies.clear();
  }
  
  export function createEffect(fn) {
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
      dependencies: new Set()
    };
  
    execute();
  }
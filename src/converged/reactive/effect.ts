import { context } from "./context"

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
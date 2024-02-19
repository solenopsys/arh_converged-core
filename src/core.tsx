import { JSX } from "@solenopsys/converged/jsx-runtime";
import * as api from "./api";

export interface Subscription {
    execute: () => void,
    dependencies: Set<Subscription>,
}
export interface JsContext {
    context: Subscription[];
}



// Define the implementation of the module
export const reactiveImpl: api.ReactiveIntf | JsContext = {

    subscribe(running: Subscription, subscriptions: Set<Subscription>) {
        subscriptions.add(running);
        running.dependencies.add(subscriptions);
    },

    createSignal(value: object): any[] {
        const subscriptions = new Set<Subscription>();

        const read = () => {
            const running = this.context[this.context.length - 1];
            if (running) this.subscribe(running, subscriptions);
            return value;
        };

        const write = (nextValue) => {
            value = nextValue;

            for (const sub of [...subscriptions]) {
                sub.execute();
            }
        };
        return [read, write];
    },

    cleanup(running: Subscription) {
        for (const dep of running.dependencies) {
            dep.delete(running);
        }
        running.dependencies.clear();
    },

    createEffect(fn:()=>void) {
        const execute = () => {
            this.cleanup(running);
            this.context.push(running);
            try {
                fn();
            } finally {
                this.context.pop();
            }
        };

        const running = {
            execute,
            dependencies: new Set()
        };

        execute();
    },
};


export const renderingImpl: api.RenderingIntf = {
    render(code: JSX.Element, element: any): () => any {
        return undefined;
    }
}


export function h(type: any, props: any) {
    console.log("TRANS", type, props)
    return {};
}



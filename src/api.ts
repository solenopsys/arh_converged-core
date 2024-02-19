export interface ReactiveIntf {
    createSignal(value): any[];
    createEffect(fn);
    subscribe(running, subscriptions);
    cleanup(running) ;
}

export interface RenderingIntf  {
    render(code: JSX.Element, element: any): () => any ;
}
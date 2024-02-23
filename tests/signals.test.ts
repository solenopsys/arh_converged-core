import { expect, test,jest } from "bun:test";
import { createEffect, createSignal } from "../src/converged/reactive/signal";

 

test("signal", () => {
    const [count, setCount] = createSignal(3)
    expect(count()).toBe(3);
    setCount(5);
    expect(count()).toBe(5);
});



test("effect", () => {
    const [count, setCount] = createSignal(3)

    var inCount=0;

    createEffect(() =>inCount=count());
    expect(count()).toBe(3);
    expect(inCount).toBe(3);
});


 
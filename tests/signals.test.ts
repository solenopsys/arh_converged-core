import { expect, test, jest } from "bun:test";
import { createEffect, createSignal } from "../src/converged/reactive";
import { context } from "src/converged/reactive/context";



test("signal", () => {
    const [count, setCount] = createSignal(3)
    const l = context.length
    expect(context.length).toBe(0);
    expect(count()).toBe(3);
    setCount(5);
    expect(count()).toBe(5);
    expect(context.length).toBe(0);
});



test("effect", () => {
    const [count, setCount] = createSignal(3)

    var text = "";
    expect(context.length).toBe(0);
    createEffect(() => { text = "num " + count() });
    setCount(5);
    //  expect(context.length).toBe(1);
    expect(count()).toBe(5);
    expect(text ).toBe("num 5");

    setCount(6);

    expect(text ).toBe("num 6");
});



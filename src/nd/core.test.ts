import { expect, test } from "bun:test";
import { createSignal } from "./reactive";

test("signal write read", () => {
    const [count, setCount] = createSignal(3)
    expect(count()).toBe(3);
    setCount(5);
});

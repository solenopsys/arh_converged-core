
import { expect, test, jest,beforeAll } from "bun:test";

import { context } from "src/converged/renderer/manipulate";
import { effect, signal } from "src/converged/solid";


 
 
test("signal", () => {
    const [count, setCount] = signal(3)
    const l = context.length
    expect(context.length).toBe(1);
    expect(count()).toBe(3);
    setCount(5);
    expect(count()).toBe(5);
    expect(context.length).toBe(1);
});




test("effect", async () => {
 

    const [count, setCount] = signal(3)

    var text = "";
    expect(context.length).toBe(1);
    console.log(context)
    effect(() => {  
        text = "num " + count()
    
    });
     setCount(5);
     expect(context.length).toBe(1);
     expect(count()).toBe(5);

     await new Promise(setImmediate); 
     expect(text ).toBe("num 5");

    setCount(6);
    await new Promise(setImmediate);
    expect(text ).toBe("num 6");
});



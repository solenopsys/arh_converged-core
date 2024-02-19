// just keep a global ref to the instance around for convenience
var instance;
// this function will be imported for wasm to use
function console_log_ex(location, size) {
    var buffer = new Uint8Array(instance.exports.memory.buffer, location, size);
    var decoder = new TextDecoder();
    var string = decoder.decode(buffer);
    console.log(string);
}
// define our imports
// Define our imports
const memory = new WebAssembly.Memory({ initial: 256, maximum: 256 });
const importObject = {
    env: {
        memory,
        __memory_base: 0, // Присвойте нужное значение для __memory_base
        __table_base: 0 // Присвойте нужное значение для __table_base
    }
};

// do the thing
WebAssembly.instantiateStreaming(fetch("core.wasm"), importObject)
    .then(function (results) {
        instance = results.instance;
        var add = results.instance.exports.add;
        var create = results.instance.exports.launch_export;
      
        // Начнем измерение времени
        console.time('benchmarc');
        
        // Проведем миллион вызовов функции add
        // for (let i = 0; i < 100000000; i++) {
        //     add(3, 4);
        // }

        create()
        
        // Закончим измерение времени и выведем результат
        console.timeEnd('benchmarc');
    })
    .catch(function (error) {
        console.error("Error instantiating WASM module:", error);
    });

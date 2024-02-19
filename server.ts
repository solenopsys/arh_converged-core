Bun.serve({
    fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === "/") {
            // Serve HTML file
            const htmlContent =  Bun.file("./index.html");
            return new Response(htmlContent, { headers: { 'Content-Type': 'text/html' } });
          }

           
          if (url.pathname === "/index.js") {
            // Serve JS file
            const jsContent =  Bun.file("./index.js");
            return new Response(jsContent, { headers: { 'Content-Type': 'application/javascript' } });
          }
          if (url.pathname === "/wasm.js") {
            // Serve JS file
            const jsContent =  Bun.file("./wasm.js");
            return new Response(jsContent, { headers: { 'Content-Type': 'application/javascript' } });
          }
          if (url.pathname === "/core.wasm") {
            // Serve JS file
            const jsContent =  Bun.file("./zigexp/zig-out/lib/core.wasm");
            return new Response(jsContent, { headers: { 'Content-Type': 'application/wasm' } });
          }
        return new Response("404!");
    },
  }); 
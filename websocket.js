const WebSocketServer = require("ws").Server;
const wss = new WebSocketServer({ port: 2222 });

wss.on("connection", (ws) => {
   console.info("websocket connection open");

   if (ws.readyState === ws.OPEN) {
       ws.send(JSON.stringify({
           msg1: 'yo, im msg 1'
       }))

       setTimeout(() => {
            ws.send(JSON.stringify({
                msg2: 'yo, im a delayed msg 2'
            }))
       }, 1000)
   }
});

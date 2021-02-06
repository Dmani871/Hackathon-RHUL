const express = require("express");
const http = require("http");
const ws = require("ws");

const app = express();
const server = http.createServer(app);
const wsServer = new ws.Server({ server });

const port = 8000;
console.log("hello world");

app.use("/client", express.static("client"));

server.listen(port, function () {
  console.log(`Server started on port ${port}`);
});

let clientCount = 0;

let mapDimension = 10;

let map = Array(mapDimension)
  .fill()
  .map(() => Array(mapDimension).fill(0));

console.log(map);

wsServer.on("connection", (client) => {
  clientCount++;
  console.log("Hello world");

  client.send(JSON.stringify({ dimension: 10 }));

  client.on("message", (message) => {});

  client.on("close", () => {});
});

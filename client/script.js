let connection;
let map;

let w = 0;
let h = 0;

function fixSize() {
  w = window.innerWidth;
  h = window.innerHeight;
  const canvas = document.getElementById("snakeCanvas");
  canvas.width = w;
  canvas.height = h;
}

function onload() {
  let protocol = window.location.protocol.toLowerCase().replace("http", "ws");
  let host = window.location.hostname;
  let port = window.location.port;

  connection = new WebSocket(protocol + "//" + host + ":" + port);

  connection.addEventListener("open", () => console.log("Connection OK!"));

  connection.addEventListener("message", recieveMessage);

  connection.addEventListener("error", () => alert("An error occurred!"));

  connection.addEventListener("close", () =>
  console.log("The WebSocket was closed!");
  fixSize();
}

function recieveMessage(event) {
    console.log(JSON.parseevent.data);)
  draw();
}

function draw() {
  const canvas = document.getElementById("snakeCanvas");
  const context = canvas.getContext("2d");

  const squareSize = 50;

  context.fillStyle = "#000000";
  context.fillRect(0, 0, w, h);

  context.fillStyle = "#009900";
  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[0].length; j++) {
      context.fillRect(
        i * squareSize + 5,
        j * squareSize + 5,
        squareSize,
        squareSize
      );
    }
  }

  window.requestAnimationFrame(draw);
}

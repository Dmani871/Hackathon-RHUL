let connection;
let map;

let w = 0;
let h = 0;

document.onkeydown = checkKey;

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

  connection.addEventListener("close", () => console.log("The WebSocket was closed!"));
  fixSize();

}

function recieveMessage(event) {
    map = JSON.parse(event.data);
	console.log(map);
	draw();
}

function draw() {
  const canvas = document.getElementById("snakeCanvas");
  const context = canvas.getContext("2d");

  const squareSize = 50;

  context.fillStyle = "#000000";
  context.fillRect(0, 0, w, h);

  context.fillStyle = "#009900";
  for (let i = 0; i < map.dimension; i++) {
    for (let j = 0; j < map.dimension; j++) {
      context.fillRect(
        i * squareSize + 5,
        j * squareSize + 5,
        squareSize - 5,
        squareSize - 5
      );
    }
  }

  context.fillStyle = "#FFFFFF";

  for (let clientPositions of map.self.positions) {
	context.fillRect(clientPositions.x * squareSize + 5, clientPositions.y * squareSize + 5, squareSize - 5, squareSize - 5);
  }

  context.fillStyle = "#FF0000";
  for (let player of map.players) {

	for (let playerPositions of player.positions) {

		context.fillRect(playerPositions.x * squareSize + 5, playerPositions.y * squareSize + 5, squareSize - 5, squareSize - 5);

	}

  }

  window.requestAnimationFrame(draw);
}

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow
		connection.send(JSON.stringify({direction: 1}));
    }
    else if (e.keyCode == '40') {
        // down arrow
		connection.send(JSON.stringify({direction: 3}));
    }
    else if (e.keyCode == '37') {
       // left arrow
	   connection.send(JSON.stringify({direction: 2}));
    }
    else if (e.keyCode == '39') {
       // right arrow
	   connection.send(JSON.stringify({direction: 0}));
    }

}
let connection;
let map;

let w = 0;
let h = 0;

document.onkeydown = checkKey;

var background = new Image();
background.src = "background.jpg";

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

  context.fillStyle = "#000000";
  context.fillRect(0, 0, w, h);

  /*let backgroundPattern = context.createPattern(background, 'repeat');
  context.fillStyle = backgroundPattern;
  context.fillRect(0, 0, w, h);*/
  /*

  for (var i= 0; i<100; i++) {
    ctx.beginPath();
    ctx.moveTo(c.width*Math.random(),c.height*Math.random());
    ctx.lineTo(c.width*Math.random(),c.height*Math.random());
    ctx.strokeStyle= "rgb(" +
    Math.round(256*Math.random()) + "," + 
    Math.round(256*Math.random()) + "," + 
    Math.round(256*Math.random()) + ")";
    ctx.stroke();
  }
  */
  /*context.fillStyle = "#009900";
  for (let i = 0; i < map.dimension; i++) {
    for (let j = 0; j < map.dimension; j++) {
      context.fillRect(
        i * squareSize + 5,
        j * squareSize + 5,
        squareSize - 5,
        squareSize - 5
      );
    }
  }*/

  const squareSizeX = w /  map.dimensionX;
  const squareSizeY = h / map.dimensionY;

  context.fillStyle = "#FFFFFF";

  for (let clientPositions of map.self.positions) {
	  context.fillRect(clientPositions.x * squareSizeX, clientPositions.y * squareSizeY, squareSizeX, squareSizeY);
  }

  context.fillStyle = "#FF0000";
  for (let player of map.players) {

	  for (let playerPositions of player.positions) {

		  context.fillRect(playerPositions.x * squareSizeX, playerPositions.y * squareSizeY, squareSizeX, squareSizeY);

	  }

  }

  //checkCollision();
  window.requestAnimationFrame(draw);

}

function checkCollision() {

  let x = map.self.positions[map.self.positions.length - 1].x;
  let y = map.self.positions[map.self.positions.length - 1].y;

  if (x < 0) {
    connection.send(JSON.stringify({direction: 1}));
  } else if (x >= map.dimension - 1) {
    connection.send(JSON.stringify({direction: 3}));
  } else if (y < 0) {
    connection.send(JSON.stringify({direction: 0}));
  } else if (y >= map.dimension - 1) {
    connection.send(JSON.stringify({direction: 2}));
  }

}

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow
		  if (map.self.direction != 3) {
        connection.send(JSON.stringify({direction: 1}));
      }
    }
    else if (e.keyCode == '40') {
        // down arrow
      if (map.self.direction != 1) {
		    connection.send(JSON.stringify({direction: 3}));
      }
    }
    else if (e.keyCode == '37') {
       // left arrow
    	if (map.self.direction != 0) {
	    	connection.send(JSON.stringify({direction: 2}));
    	}
    }
    else if (e.keyCode == '39') {
       // right arrow
	   if (map.self.direction != 2) {
	   	connection.send(JSON.stringify({direction: 0}));
	   }
    }

}
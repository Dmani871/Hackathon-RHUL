let connection;
let map;

let w = 0;
let h = 0;

let GAME_OVER = false;

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

  connection.addEventListener("close", () => {
    
    console.log("Game is over");
    GAME_OVER = true;

  });
  fixSize();

  window.addEventListener('resize', fixSize);

}

function recieveMessage(event) {
    map = JSON.parse(event.data);
	  console.log(map);
	  draw();
}

function draw() {
  const canvas = document.getElementById("snakeCanvas");
  const context = canvas.getContext("2d");

  const squareSizeX = w /  map.dimensionX;
  const squareSizeY = h / map.dimensionY;

  context.fillStyle = "#880000";
  context.fillRect(0, 0, w, h);

  context.fillStyle = "#000000";
  context.fillRect(map.zone * squareSizeX, map.zone * squareSizeY, w - map.zone * squareSizeX * 2, h - map.zone * squareSizeY * 2);

  if (GAME_OVER) {
    context.fillStyle = '#008800';
    context.font = "54px Arial";
    context.textAlign = "center";
    context.fillText("We have a winner", w/2, h/2 - 100);
    context.fillText("Refresh to play again", w/2, h/2);
  }

  context.fillStyle = map.self.colour;

  for (let clientPositions of map.self.positions) {
	  context.fillRect(clientPositions.x * squareSizeX, clientPositions.y * squareSizeY, squareSizeX, squareSizeY);
  }

  context.fillStyle = "#FFFFFF";
  try {
    context.fillRect(map.self.positions[map.self.positions.length - 1].x * squareSizeX, map.self.positions[map.self.positions.length - 1].y * squareSizeY, squareSizeX, squareSizeY)
  } catch (error) {};

  for (let player of map.players) {

    context.fillStyle = player.colour;
	  for (let playerPositions of player.positions) {

		  context.fillRect(playerPositions.x * squareSizeX, playerPositions.y * squareSizeY, squareSizeX, squareSizeY);

	  }

  }

  if (map.timeToStart > 0) {
    context.fillStyle = '#008800';
    context.font = "54px Arial";
    context.fillText(map.timeToStart, w/2, h/2 + 100);

    context.textAlign = "center";
    context.fillText("You are the snake with the white head", w/2, h/4);
    context.fillText("Don't hit other players, or the edge", w/2, h/4 + 100);
    context.fillText("Last to survive wins", w/2, h/4 + 200);
  }

  window.requestAnimationFrame(draw);

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
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

let mapDimension = 15;

let map = Array(mapDimension)
  .fill()
  .map(() => Array(mapDimension).fill(0));

let clients = []; // {clientID, positions: []};

const speed = 50;

setInterval(moveClients, speed);

wsServer.on("connection", (client) => {

	//Generates values for the new player
	clientCount++;
	client.id = clientCount;

	let x = Math.floor(Math.random() * (mapDimension - 3));
	let y = Math.floor(Math.random() * (mapDimension - 3));
  //for (i i)
	//directions: 0 -> right, 1 -> up, 2 -> left, 3 -> down
	let clientJSON = {clientID: clientCount, direction: 0, positions: [{x: x, y: y},{x: x+1, y: y},{x: x+2, y: y}]};
	clients.push(clientJSON);

	sendPlayerInfo();

	client.on("message", (message) => {

		let messageJSON = JSON.parse(message);

		for (let c of clients) {
			if (c.clientID == client.id) {
				c.direction = messageJSON.direction;
			}
		}

	});

	client.on("close", () => {

		//This removes the clients that just disconnected from client array
		for (let c of clients) {
			if (c.clientID == client.id) clients.splice(clients.indexOf(c), 1);
		}

		//Send updated player list;
		sendPlayerInfo();

	});

});

function sendPlayerInfo() {

	for (let c of wsServer.clients) {

		let self;
		let players = [];

		for (let arrayClients of clients) {
			if (arrayClients.clientID == c.id) {
				self = arrayClients;
			} else {
				players.push(arrayClients);
			}
		}

		c.send(JSON.stringify({dimension: mapDimension, self: self, players: players}));

	}

}

function moveClients() {

	for (let c of clients) {

		for (let i = 0; i < c.positions.length - 1; i++) {
			c.positions[i].x = c.positions[i + 1].x;
			c.positions[i].y = c.positions[i + 1].y;
		}
	
		if (c.direction == 0) {
			c.positions[c.positions.length - 1].x++;
		} else if (c.direction == 1) {
			c.positions[c.positions.length - 1].y--;
		} else if (c.direction == 2) {
			c.positions[c.positions.length - 1].x--;
		} else {
			c.positions[c.positions.length - 1].y++;
		}

	}

	sendPlayerInfo();

}
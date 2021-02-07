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

let mapX = 100;
let mapY = 50;

let map = Array(mapY)
  .fill()
  .map(() => Array(mapX).fill(0));

let clients = []; // {clientID, positions: []};

const speed = 75;

let timeToStart = 10;
let countdown = false;

let gameloop;
let zoneloop;

let zone = 0;

wsServer.on("connection", (client) => {

	//Generates values for the new player
	clientCount++;
	client.id = clientCount;

	if (clientCount >= 2 && countdown == false) {
		countdown = true;
		let startingTimeout = setInterval(() => {
			console.log("Time to start: " + timeToStart);
			sendPlayerInfo();
			timeToStart--;

			if (timeToStart <= 0) {
				clearTimeout(startingTimeout);
				gameloop = setInterval(moveClients, speed);
				zoneloop = setInterval(addZone, 5000);
			}

		}, 1000);
	}

	let x = Math.floor(Math.random() * (mapX - 20));
	let y = Math.floor(Math.random() * (mapY - 20));
	let colour = "#" + Math.floor(Math.random()*16777215).toString(16);

	//directions: 0 -> right, 1 -> up, 2 -> left, 3 -> down

	let positions = [];
	for (let i = 0; i < 15; i++) {
		positions.push({x: x + i, y: y});
	}

	let clientJSON = {clientID: clientCount, direction: 0, alive: true, zone: zone, timeToStart: timeToStart, colour: colour, positions: positions};
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

function collision() {
	for (let c1 of clients) {
		let head = c1.positions[c1.positions.length - 1];
		for (let c2 of clients) {
			if (c1 != c2) {
				for (let i = 0; i < c2.positions.length - 1; i++) {
					try {
						if (head.x==c2.positions[i].x && head.y==c2.positions[i].y){
							console.log("hello");
							c1.alive = false;
							c1.positions = [];
						}
					} catch (error) {}
				}
				
			}

		}

	}
}


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

		c.send(JSON.stringify({dimensionX: mapX, dimensionY: mapY, timeToStart: timeToStart, zone: zone, self: self, players: players}));

	}

}

function moveClients() {

	let clientAliveCount = 0;
	
	for (let c of clients) {

		if (c.alive) {

			clientAliveCount++;

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

			if (c.positions[c.positions.length - 1].x < zone) {
				c.alive = false;
				c.positions = [];
			} else if (c.positions[c.positions.length - 1].x >= mapX - zone) {
				c.alive = false;
				c.positions = [];
			} else if (c.positions[c.positions.length - 1].y < zone) {
				c.alive = false;
				c.positions = [];
			} else if (c.positions[c.positions.length - 1].y >= mapY - zone) {
				c.alive = false;
				c.positions = [];
			}

		}

	}

	if (clientAliveCount <= 1) {
		clearTimeout(gameloop);
		clearTimeout(zoneloop);
		clients = [];
		console.log("Game is over");
	
		countdown = false;
		clientCount = 0;
		timeToStart = 10;
		zone = 0;

		for (let c of wsServer.clients) c.close();
	} else {
		collision();
	}

	sendPlayerInfo();

}

function addZone() {
	zone++;
}
var util = require("util"),
    io = require("socket.io"),
    acePile = "<div class='cardholder pile-ace'></div>"+
				"<div class='cardholder pile-ace'></div>"+
				"<div class='cardholder pile-ace'></div>"+
				"<div class='cardholder pile-ace'></div>"+
				"<div class='cardholder pile-ace'></div>"+
				"<div class='cardholder pile-ace'></div>"+
				"<div class='cardholder pile-ace'></div>"+
				"<div class='cardholder pile-ace'></div>";
    //Player = require("./Player").Player;

// Client side player class
var Player = function(id) {
	var score = 0,
		html,
		color;


	return {
		id: id,
		html: html,
		color: color
	};
};


var socket,
	players;

function init() {
	players = [];
	socket = io.listen(8000);

	socket.configure(function() {
		// Only use WebSockets
		socket.set("transports", ["websocket"]);

		// Restrict log output
		socket.set("log level", 2);
	});

	setEventHandlers();
};

function setEventHandlers() {
	socket.sockets.on("connection", onSocketConnection);
};

function onSocketConnection(client) {
	// util.log will output the string in the terminal window on execute
	util.log("New player has connected: "+client.id);


	client.on("disconnect", onClientDisconnect);
	client.on("new player", onNewPlayer);
	client.on("card move", onCardMove);
	client.on("ace pile", onAcePile);
	client.on("remove player", onRemovePlayer);
	client.on("restart requested", onRequestRestart);
	client.on("restart answer", onRestartAnswer);
}

function onClientDisconnect() {
	// 'this' points to the onSocketConnection client object
	util.log("Player has disconnected: "+this.id);

	var removePlayer = getPlayerById(this.id);

	// Player not found
	if (!removePlayer) {
		util.log("Player not found: "+this.id);
		return;
	};

	// Remove player from players array
	players.splice(players.indexOf(removePlayer), 1);

	// Broadcast removed player to connected socket clients
	this.broadcast.emit("remove player", {id: this.id});
};

function onNewPlayer(data) {
	var newPlayer = new Player(this.id);
	newPlayer.html = data.html;

	// Broadcasts the new players info to all existing players
	this.broadcast.emit("new player", { id: newPlayer.id, html: newPlayer.html });

	// Broadcasts the existing players info to the new player
	var existingPlayer;
	for (var i = 0; i < players.length; i++) {
	    existingPlayer = players[i];
	    this.emit("new player", { id: existingPlayer.id, html: existingPlayer.html });
	};
	this.emit("ace pile", { html: acePile });

	players.push(newPlayer);

};

function onCardMove(data) {
	var p = getPlayerById(data.id);
	p.html = data.html;
	p.score = data.score;
	this.broadcast.emit("card move", data); // broadcast the changed HTML to other player
};

function onAcePile(data) {
	acePile = data.html;
	this.broadcast.emit("ace pile", data); // broadcast the changed HTML to other player
};

function onRemovePlayer(data) {
	this.broadcast.emit("remove player", data);
};

function onRequestRestart(data) {
	this.broadcast.emit("restart requested", data);
};

function onRestartAnswer(data){
	if(data.restart){
		acePile = "<div class='cardholder pile-ace'></div>"+
				"<div class='cardholder pile-ace'></div>"+
				"<div class='cardholder pile-ace'></div>"+
				"<div class='cardholder pile-ace'></div>"+
				"<div class='cardholder pile-ace'></div>"+
				"<div class='cardholder pile-ace'></div>"+
				"<div class='cardholder pile-ace'></div>"+
				"<div class='cardholder pile-ace'></div>";
		this.broadcast.emit("ace pile", data);
	}
	this.broadcast.emit("restart answer", data);
}

function getPlayerById(id) {
    for (var i = 0; i < players.length; i++) {
        if (players[i].id == id)
            return players[i];
    };

    return false;
};


init();
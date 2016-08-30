$(document).ready(function() {
	var socket = io.connect("http://localhost", {port: 8000}),
		remotePlayers = [],
		localPlayer = new Player("0");


	socket.on("connect", onSocketConnected);
	socket.on("disconnect", onSocketDisconnect);
	socket.on("new player", onNewPlayer);
	socket.on("remove player", onRemovePlayer);
	socket.on("card move", onCardMove);
	socket.on("ace pile", onAcePile);


	function initCards() {
		var deck = Deck.create();
		// Add the card HTML to page
		
		// The playable cards
		$("#board-"+localPlayer.id+" .empty").each(function(index, obj) {
			$(obj).append(deck[index].HTML);
		});

		var cardHTML = "", thirteenHTML = "";
		for (var j = 4; j < 16; j++) {
			thirteenHTML += deck[j].HTML;
		}
		for (var i = 16; i < deck.length; i++) {
			cardHTML += deck[i].HTML;
		}
		
		$("#board-"+localPlayer.id+" .pile-thirteen").append(thirteenHTML);
		$("#board-"+localPlayer.id+" .pile-thirteen .card").addClass("turned");
		$("#board-"+localPlayer.id+" .pile-thirteen").children().each(function(index, obj) {
			$(obj).css({
				top: index * 12 -1 +"px"
			})
		});
		$("#board-"+localPlayer.id+" .pile-thirteen").children().last().removeClass("turned");
		
		$("#board-"+localPlayer.id+" .pile").append(cardHTML);
		$("#board-"+localPlayer.id+" .pile .card").addClass("turned");
	};


	function onSocketConnected() {
		console.log("Connected to socket server: "+socket.socket.sessionid);
		localPlayer.id = socket.socket.sessionid;
		
		
		
		if (remotePlayers.length > 0) {
			console.log("second player!");
		} else {
			
		}
		
		Board.init(socket, localPlayer.id);
		initCards();

		var html = $("#board-"+localPlayer.id+".board").html();

		// Make the cards draggable
		Deck.draggable(socket, localPlayer.id);
		Deck.doubleClickable(socket, localPlayer.id);
		Deck.resetTurnedCards();

		socket.emit("new player", {id: socket.socket.sessionid, html: html });
		socket.emit("move card", { html: html, id: localPlayer.id });
	};

	function onSocketDisconnect() {
		console.log("Disconnected from socket server");
	};

	function onNewPlayer(data) {
		console.log("New player connected: "+data.id);
	
		var newPlayer = new Player(data.id);
		newPlayer.html = data.html;
		remotePlayers.push(newPlayer);
		
		// GET THE OTHER PLAYERS BOARD
		$(".other-player-board").html("<div id='board-"+data.id+"' class='board' style='transform:rotate(0.5turn)'>"+data.html+"</div>");
		Deck.resetTurnedCards();
	};

	function onRemovePlayer(data) {
		var removePlayer = getPlayerById(data.id);

		// Player not found
		if (!removePlayer) {
			console.log("Player not found: "+data.id);
			return;
		};

		// Remove player from array
		remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
		$("#board-"+data.id).remove();

		// remove the board from other players html
		console.log("Player has disconnected: "+data.id);
	};

	function onCardMove(data) {
		var p = getPlayerById(data.id);
		remotePlayers[remotePlayers.indexOf(p)].html = data.html;
		$("#board-"+data.id).html(data.html);
		$(".other-player-scoreDiv .score").html(data.score);
	};

	function onAcePile(data) {
		localPlayer.id = socket.socket.sessionid;
		$(".ace-piles").html(data.html);
		Deck.initAcePiles(socket, localPlayer.id);
	};

	function getPlayerById(id) {
		for (var i = 0; i < remotePlayers.length; i++) {
			if (remotePlayers[i].id == id)
				return remotePlayers[i];
		};

		return false;
	};


});
var io = require('socket.io').listen(1111);

// Turn off socket.io debug messages
io.set('log level', 2);

var rooms = [];

io.sockets.on('connection', function(socket) {
	var player = new Player(socket.id, Math.floor(Math.random()*501),
		Math.floor(Math.random()*301));
	var room = null; 
	

	socket.on('join_room', function(roomId) {
		socket.join(roomId);

		//If the room doesn't exist create it
		if(rooms[roomId] == undefined) {
			console.log("Creating room " + roomId);
			rooms[roomId] = new Room(roomId);
		}

		room = rooms[roomId];

		//Add the player to the room
		room.get_state(socket);
		room.add_player(player);
	});

	socket.on('update_player', function(id, x, y, xDir, yDir) {
		room.update_player(id, x, y, xDir, yDir);
	});

	socket.on('disconnect', function() {
		room.remove_player(player.id);
	});
});

function Room(id) {
	this.id = id;
	this.players = [];
}

Room.prototype.add_player = function(player) {
	this.players[player.id] = player;

	//Let anyone in the room know about the player
	io.sockets.in(this.id).emit('new_player', player.id, player.x,
		player.y, player.xDir, player.yDir);
}

Room.prototype.remove_player = function(playerId) {
	//Remove the player from the players list
	delete this.players[playerId];

	//Tell all the clients to git rid of the player
	io.sockets.in(this.id).emit('delete_player', playerId);
}

//For debuging
Room.prototype.list_players = function() {
	for(var i in this.players) {
		console.log(this.players[i].id);
	}
}

Room.prototype.get_state = function(socket) {
	for(var i in this.players) {
		socket.emit('new_player', this.players[i].id, this.players[i].x,
			this.players[i].y, this.players[i].xDir, this.players[i].yDir);
	}
}

Room.prototype.update_player = function(id, x, y, xDir, yDir) {
	//Update servers knowledge of the player
	this.players[id].x = x;
	this.players[id].y = y;
	this.players[id].xDir = xDir;
	this.players[id].yDir = yDir;

	//Update the clients
	io.sockets.in(this.id).emit('update_player', id, x, y, xDir, yDir);
}

function Player(id, x, y) {
	this.id = id;
	this.x = x;
	this.y = y;
	this.xDir = 0;
	this.yDir = 0;
}

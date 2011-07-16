var io = require('socket.io').listen(1111);

// Turn off socket.io debug messages
io.set('log level', 2);

var rooms = [];

var tempRoom = new Room(0);
rooms[0] = tempRoom;

io.sockets.on('connection', function(socket) {
	var player = new Player(socket.id, Math.floor(Math.random()*501),
		Math.floor(Math.random()*301));
	var roomId = 0;
	var room = rooms[roomId];
	
	socket.join(roomId);

	room.get_state(socket);
	room.add_player(player);
	console.log(room.players.join(", "));

	socket.on('key_down', function(keyCode) {
		switch(keyCode)
		{
			case 37: //left
				player.move(-5,0);
				break;
			case 38: //up
				player.move(0,-5);
				break;
			case 39: //right
				player.move(5,0);
				break;
			case 40: //down
				player.move(0,5);
				break;
		}

		room.update(player);
	});

	//socket.emit('test', { hellow: 'world' });
	//socket.on('test2', function(data) {
	//	console.log(data);
	//});
});

function Room(id) {
	this.id = id;
	this.players = [];
}

Room.prototype.add_player = function(player) {
	this.players.push(player);

	//Let anyone in the room know about the player
	io.sockets.in(this.id).emit('new_player', player);
}

Room.prototype.remove_player = function(player) {
	this.players.splice(this.players.indexOf(player), 1);
}

Room.prototype.get_state = function(socket) {
	for(var p in this.players) {
		socket.emit('new_player', this.players[p]);
	}
}

Room.prototype.update = function(player) {
	io.sockets.in(this.id).emit('update_player', player);
}

function Player(id, x, y) {
	this.id = id;
	this.x = x;
	this.y = y;
}

Player.prototype.move = function(x, y) {
	this.x += x;
	this.y += y;
}

window.requestAnimFrame = (function(){
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(/* function */ callback, /* DOMElement */ element){
			window.setTimeout(callback, 1000 / 60);
		};
})();	

function Client() {
	this.socket = null;
	this.sessionId = null;

	this.players = [];
	this.player = null;
}

Client.prototype.init = function(ctx) {
	this.socket = io.connect('http://localhost:1111');
	this.ctx = ctx;

	//Set the keyboard listeners
	this.keyboard_init();

	//Socket.IO events
	var that = this;

	this.socket.on('connect', function() {
		that.sessionId = this.socket.sessionid;
	});

	this.socket.on('update_player', function(id, x, y, xDir, yDir) {
		//If you are the player you are already in the right spot
		if(id != that.sessionId)
		{
			that.players[id].set_pos(x, y);
			that.players[id].set_x_dir(xDir);
			that.players[id].set_y_dir(yDir);
		}
	});

	this.socket.on('delete_player', function(id) {
		delete that.players[id];
	});

	this.socket.on('new_player', function(id, x, y, xDir, yDir) {
		//Create a new player object
		that.players[id] = new Player(id, x, y);
		that.players[id].set_x_dir(xDir);
		that.players[id].set_y_dir(yDir);

		//Store this sessions player for easier access
		if(id == that.sessionId) that.player = that.players[id];
	});
}

Client.prototype.keyboard_init = function () {
	var that = this;

	window.addEventListener('keydown', function (evt) {
		switch(evt.keyCode)
		{
		case 37: //left
			if(that.player.get_x_dir() != -1) {
				that.player.set_x_dir(-1);
				that.update_player();
			}
			break;
		case 38: //up
			if(that.player.get_y_dir() != -1) {
				that.player.set_y_dir(-1);
				that.update_player();
			}
			break;
		case 39: //right
			if(that.player.get_x_dir() != 1) {
				that.player.set_x_dir(1);
				that.update_player();
			}
			break;
		case 40: //down
			if(that.player.get_y_dir() != 1) {
				that.player.set_y_dir(1);
				that.update_player();
			}
			break;
		}
	}, true);

	window.addEventListener('keyup', function (evt) {
		switch(evt.keyCode)
		{
		case 37: //left
			if(that.player.get_x_dir() == -1) {
				that.player.set_x_dir(0);
				that.update_player();
			}
			break;
		case 38: //up
			if(that.player.get_y_dir() == -1) {
				that.player.set_y_dir(0);
				that.update_player();
			}
			break;
		case 39: //right
			if(that.player.get_x_dir() == 1) {
				that.player.set_x_dir(0);
				that.update_player();
			}
			break;
		case 40: //down
			if(that.player.get_y_dir() == 1) {
				that.player.set_y_dir(0);
				that.update_player();
			}
			break;
		}
	}, true);
}

Client.prototype.start = function() {
	var that = this;
	(function loop() {
		that.update();
		that.draw();
		requestAnimFrame(loop, that.ctx.canvas);
	})();
}

Client.prototype.update = function() {
	for(var i in this.players) {
		this.players[i].update();
	}
}

Client.prototype.draw = function() {
	this.ctx.clearRect(0, 0, 500, 500);

	for(var i in this.players) {
		this.players[i].draw(this.ctx);
	}
}

Client.prototype.update_player = function() {
	this.socket.emit('update_player', this.player.id,
		this.player.x, this.player.y, this.player.xDir, this.player.yDir);
}

function Player(id, x, y) {
	this.id = id;
	this.x = x;
	this.y = y;
	this.xDir = 0;
	this.yDir = 0;
}

Player.prototype.set_pos = function(x, y) {
	this.x = x;
	this.y = y;
}

Player.prototype.set_x_dir = function(xDir) {
	this.xDir = xDir;
}

Player.prototype.set_y_dir = function(yDir) {
	this.yDir = yDir;
}

Player.prototype.get_x_dir = function() {
	return this.xDir;
}

Player.prototype.get_y_dir = function() {
	return this.yDir;
}

Player.prototype.update = function() {
	this.x += this.xDir * 2;
	this.y += this.yDir * 2;
}

Player.prototype.draw = function(ctx) {
	ctx.fillRect(this.x, this.y, 10, 10);
}

var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var game = new Client();

game.init(ctx);
game.start();

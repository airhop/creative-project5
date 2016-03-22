var sockets = function(server) {
	var io = require('socket.io')(server);

	var players = [];

	io.on('connection', function(socket) {
		console.log('USER CONNECTED ==============================================');

	})

	return io;
}

module.exports = sockets;

function findPlayer(player) {
	return player.id == this.id;
}

function filterEnemies(enemy) {
	// console.log(enemy.id, this.id);
	return enemy.id != this.id;
}
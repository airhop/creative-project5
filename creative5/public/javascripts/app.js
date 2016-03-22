var app = angular.module('app', []);

/*
 ** CONTROLLERS =========================================================
 */

app.controller('gameCtrl', function($scope, $interval, $timeout, Component, ColorService, ScoreService) {
	$scope.playing = false;
	$scope.submitting = false;
	$scope.showingScores = false;
	$scope.buttonText = 'Start Game';
	$scope.lives = 3;
	$scope.score = 0;
	$scope.level = 1;
	$scope.selectSFX = new Audio('audio/select.wav');
	$scope.gameoverSFX = new Audio('audio/gameover.mp3');
	$scope.jumpSFX = new Audio('audio/jump.wav');
	$scope.hitSFX = new Audio('audio/hit.wav');
	$scope.lvUpSFX = new Audio('audio/levelup.wav');

	$scope.mainBGM = new Audio('audio/main.mp3');
	$scope.mainBGM.loop = true;
	$scope.scoresBGM = new Audio('audio/scores.mp3');
	$scope.scoresBGM.loop = true;
	$scope.menuBGM = new Audio('audio/menu.mp3');
	$scope.menuBGM.loop = true;
	$scope.menuBGM.play();

	$scope.volume = 1;
	$scope.changeVolume = function() {
		$scope.mainBGM.volume = $scope.volume;
		$scope.scoresBGM.volume = $scope.volume;
		$scope.menuBGM.volume = $scope.volume;
		$scope.gameoverSFX.volume = $scope.volume;
		$scope.jumpSFX.volume = $scope.volume;
		$scope.hitSFX.volume = $scope.volume;
		$scope.lvUpSFX.volume = $scope.volume;
		$scope.selectSFX.volume = $scope.volume;
	}

	ScoreService.get().then(function() {
		$scope.highScores = ScoreService.scores();
	})

	$scope.playerColor = '#0099ff';
	$scope.$watch('playerColor', function(color) {
		ColorService.set(color);
	})

	$scope.obstacles = [];
	$scope.obstacleColor = '#4d4d4d';

	$scope.startGame = function () {
		$scope.menuBGM.pause();
		$scope.mainBGM.load();
		$scope.mainBGM.play();
		$scope.selectSFX.play();
		$scope.playing = true;
		$scope.gameArea.start();
		$scope.player = new Component($scope.gameArea, $scope.playerColor, 20, 40, $scope.gameArea.getHeight() - 20, $scope);
		// $scope.player = new Component($scope.gameArea, 'blue', 40, 40, 40, $scope.gameArea.getHeight() - 40, $scope);
		$scope.obstacles.push(new Component($scope.gameArea, $scope.obstacleColor, 5, $scope.gameArea.getWidth() - 5, $scope.gameArea.getHeight() - 5, $scope));
		// $scope.obstacles.push(new Component($scope.gameArea, 'red', 10, 10, $scope.gameArea.getWidth() - 10, $scope.gameArea.getHeight() - 10, $scope));
		$scope.obstacles[0].jumpHeight = Math.floor(Math.random() * 10) + 5;
	}

	$scope.gameArea = {
		canvas: document.getElementById('canvas'),
		start: function() {
			$scope.reset();
			this.canvas.width = 720;
			this.canvas.height = 300;
			this.context = this.canvas.getContext('2d');
			this.FPS = 60;
			this.interval = $interval($scope.updateGameArea, 1000 / this.FPS);
			this.score = $interval(function() {
				$scope.score += $scope.level;
			}, 75)
		},
		clear: function() {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			// this.context.fillStyle = 'red'
			// this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
		},
		stop: function() {
			$interval.cancel(this.interval);
			$interval.cancel(this.score);
			$scope.mainBGM.pause();
			$scope.gameoverSFX.play();
			$scope.submitting = true;
			// $scope.playing = false;
			$scope.buttonText = "Play Again";
		},
		getWidth: function() {
			return this.canvas.width;
		},
		getHeight: function() {
			return this.canvas.height;
		}
	}

	$scope.reset = function() {
		$scope.score = 0;
		$scope.level = 1;
		$scope.lives = 3;
		$scope.nextLevel = 100;
		$scope.obstacles = [];
	}

	$scope.updateGameArea = function() {

		$scope.gameArea.clear();

    	$scope.player.speedX = 0;
	    if ($scope.gameArea.keys && $scope.gameArea.keys[32]) {
	    	if (!$scope.player.jumping) {
	    		$scope.jumpSFX.play();
	    		$scope.score += 1;
	    	}
	    	$scope.player.jump();
	    }
	    if ($scope.gameArea.keys && $scope.gameArea.keys[37]) {$scope.player.speedX = -5; }
	    if ($scope.gameArea.keys && $scope.gameArea.keys[39]) {$scope.player.speedX = 5; }

		$scope.player.update();
		if ($scope.invincibleColor) {
			$scope.player.draw($scope.invincibleColor);
		} else {
			$scope.player.draw();
		}

		$scope.obstacles.forEach(function(obstacle) {
			if (obstacle.hitLeftWall) {obstacle.speedX = obstacle.random;}
			if (obstacle.hitRightWall) {obstacle.speedX = -obstacle.random;}
			obstacle.jump();
			obstacle.update();
			obstacle.draw();
			if ($scope.collide($scope.player, obstacle)) {
				if (!$scope.invincible) {
					$scope.invincible = true;
					$scope.hitSFX.play();
					$scope.lives--;
					$scope.invincibleColor = 'transparent';
					var colorInterval = $interval(function() {
						$scope.invincibleColor = $scope.invincibleColor == $scope.playerColor ? 'transparent' : $scope.playerColor;
					}, 150)
					$timeout(function() {
						$scope.invincible = false;
						$scope.invincibleColor = undefined;
						$interval.cancel(colorInterval);
					}, 1500)
				}

				if ($scope.lives <= 0) {
					$scope.gameArea.stop();
				}
			}
		})
		if ($scope.score > $scope.nextLevel) {
			$scope.levelUp();
		}
	}

	$scope.levelUp = function() {
		$scope.nextLevel += $scope.nextLevel * 2;
		// $scope.nextLevel += 100;
		$scope.level++;
		console.log('level up');
		$scope.lvUpSFX.play();
		$scope.obstacles.push(new Component($scope.gameArea, $scope.obstacleColor, 5, $scope.gameArea.getWidth() - 5, $scope.gameArea.getHeight() - 5));
		// $scope.obstacles.push(new Component($scope.gameArea, 'red', 10, 10, $scope.gameArea.getWidth() - 10, $scope.gameArea.getHeight() - 10));
		$scope.obstacles[$scope.obstacles.length - 1].jumpHeight = Math.floor(Math.random() * 10) + 5;
	}

	$scope.collide = function(a, b) {
		var diffX = a.x - b.x;
		var diffY = a.y - b.y;
		var distance = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2))
		return distance < a.radius + b.radius;
	}

	$scope.keydown = function(e) {
		// console.log(e.keyCode);
		$scope.gameArea.keys = ($scope.gameArea.keys || []);
		$scope.gameArea.keys[e.keyCode] = true;
	}

	$scope.keyup = function(e) {
		$scope.gameArea.keys[e.keyCode] = false;
	}

	$scope.submitScore = function() {
		$scope.selectSFX.play();
		$scope.menuBGM.load();
		$scope.menuBGM.play();
		ScoreService.submit({ name: $scope.playerName.toUpperCase(), score: $scope.score, color: $scope.playerColor});
		$scope.submitting = false;
		$scope.playing = false;

	}

	$scope.showScores = function() {
		$scope.selectSFX.play();
		$scope.menuBGM.pause();
		$scope.scoresBGM.load();		
		$scope.scoresBGM.play();
		ScoreService.get().then(function() {
			$scope.highScores = ScoreService.scores();
			$scope.showingScores = true;
		})
	}

	$scope.hideScores = function() {
		$scope.showingScores = false;
		$scope.scoresBGM.pause();
		$scope.menuBGM.load();
		$scope.menuBGM.play();
	}
})

/*
 ** COMPONENT CLASS =========================================================
 */

app.factory('Component', ['$timeout', function($timeout) {
	function Component(gameArea, color, radius, x, y, $scope)  {
	    this.color = color;
	    this.radius = radius;
	    this.x = x;
	    this.y = y;
	    this.speedY = 0;
	    this.speedX = 0;
	    this.gravity = 0.5;
	    this.gravitySpeed = 0;
	    this.jumpHeight = 13;
	    this.jumping = false;
	    this.hitLeftWall = false;
	    this.hitRightWall = true;
	    this.random = Math.floor(Math.random() * 5) + 1;
	    this.draw = function(otherColor) {
	        ctx = gameArea.context;
	        ctx.beginPath();
	        ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
	        ctx.fillStyle = otherColor || color;
	        ctx.fill();
	    }
	    this.update = function() {
	    	this.gravitySpeed += this.gravity;
	        this.x += this.speedX;
	        this.y += this.gravitySpeed;
	        this.hitLeftWall = false;
	        this.hitRightWall = false;
	        this.hitWall();
	    }
	    this.hitWall = function() {
	    	var bottom = gameArea.canvas.height - this.radius;
	    	if (this.y > bottom) {
	    		this.y = bottom;
	    		if (this.jumping) {
	    			this.jumping = false;
	    		}
	    	} 
	    	var left = this.radius;
	    	if (this.x < left) {
	    		this.x = left;
	    		this.hitLeftWall = true;
	    	}
	    	var right = gameArea.canvas.width - this.radius;
	    	if (this.x > right) {
	    		this.x = right;
	    		this.hitRightWall = true;
	    	}
	    }
	    this.jump = function() {
	    	if (!this.jumping) this.gravitySpeed = -this.jumpHeight;
     		this.jumping = true;
	    }
	}
	return Component;
}])


/*
 ** SERVICES =========================================================
 */

// COLORS
app.factory('ColorService', function() {
	var color = '#0099ff';

	return {
		get: function() {
			return color;
		},
		set: function(newColor) {
			color = newColor;
		}
	}
})

// SCORES
app.factory('ScoreService', function($http) {
	var highScores = [];

	return {
		submit: function(score) {
			console.log(score);
			$http.post('/scores', score)
				.success(function(message) {
					console.log(message);
				})
				.error(function() {
					console.log('POST: /scores \t error')
				})
		},
		get: function() {
			return $http.get('/scores')
				.success(function(scores) {
					// console.log(scores);
					highScores = scores;
				})
				.error(function() {
					console.log('GET: /scores error');
				})
		},
		scores: function() {
			return highScores;
		}
	}
})

// SOCKETS
app.factory('socket', function($rootScope) {
	var socket = io.connect();
	return {
		on: function(eventName, callback) {
			socket.on(eventName, function() {
				var args = arguments;
				$rootScope.$apply(function () {
					callback.apply(socket, args);
				});
			});
		},
		emit: function(eventName, data, callback) {
			socket.emit(eventName, data, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			})
		}
	};
});
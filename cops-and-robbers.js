/**
 * Game engine for CSC481 assignment.
 * Group Members:
 *     Andrew Shryock      (ajshryoc)
 *     Chris Miller        (cjmille7)
 *     Colleen Britt       (cbritt)
 *     John-Michael Caskey (jmcaskey)
 *
 * Cops and Robbers game logic.
 */
var CopsAndRobbersGame = function() {
	var GRID_WIDTH;
	var GRID_HEIGHT;
	var grid;

	var TILE_WIDTH = 64;
	var TILE_HEIGHT = 64;

	var NUM_COPS = 2;
	var numCop = 0; // used to give cops unique names
	var NUM_ROBBERS = 2;

	var numRob = 0; // used to give robbers unique names

	var robbers = []; // array to hold all robber objects
	var cops = []; // array to hold all cop objects

	var MAPS = [];
	var map1 = ['xxxxxxxxx',
		'x xxxx  x',
		'x    x xx',
		'x xx x xx',
		'x       x',
		'x x xxx x',
		'x x xxx x',
		'x x     x',
		'xxxxxxxxx'];

	var map2 = ['xxxxxxxxx',
		'x       x',
		'x       x',
		'x       x',
		'x       x',
		'x       x',
		'x       x',
		'x       x',
		'xxxxxxxxx'];

	var map3 = ['xxxxxxxxx',
		'x       x',
		'x xx xx x',
		'x  x x  x',
		'xx x x xx',
		'x       x',
		'x xx xx x',
		'x       x',
		'xxxxxxxxx'];

	MAPS.push(map1);
	MAPS.push(map2);
	MAPS.push(map3);


	var moveCounter;
	var waitForKeypress;
	var player;
	var state;
	var winner;
	var validMove;
	var robberAITurn;
	var copAITurn;

	this.uiComponents;

	// sort of an attempt at a psuedo JavaScript enum to differentiate between the two types
	var TILE_TYPE = {
			WALKABLE : "walkable",
			UNWALKABLE: "unwalkable",
			OCCUPIED: "occupied"
	};

	function Grid(width, height) {

		this.width = width;
		this.height = height;
		this.grid;

		function Tile(xIdx, yIdx, type) {
			this.prototype = Object.create(GameObject.prototype);
			GameObject.call(this);

			this.xIdx = xIdx;
			this.yIdx = yIdx;
			this.type = type;
			this.hasCop = false;
			this.hasRobber = false;

			this.name = "tile-" + xIdx + "-" + yIdx;

			if (this.type === TILE_TYPE.WALKABLE) {
				this.sprite = addSpriteFromSheet(xIdx*TILE_WIDTH, yIdx*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT, 1, 'sprites/cops and robbers/floor.png', TILE_WIDTH, TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT, 0, 0);
			} else if (this.type === TILE_TYPE.UNWALKABLE) {
				this.sprite = addSpriteFromSheet(xIdx*TILE_WIDTH, yIdx*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT, 1, 'sprites/cops and robbers/wall.png', TILE_WIDTH, TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT, 0, 0);
			}

			this.getType = function() {
				return this.type;
			};

			this.setType = function(type) {
				this.type = type;
			};

			this.hasCop = function() {
				return this.hasCop;
			};

			this.setHasCop = function(hasCop) {
				this.hasCop = hasCop;
			};

			this.hasRobber = function() {
				return this.hasRobber;
			};

			this.setHasRobber = function(hasRobber) {
				this.hasRobber = hasRobber;
			};

			this.setVisibility(true);
		}

		this.init = function(mapNum) {
			this.grid = new Array(this.width);
			var map = MAPS[mapNum];
			var tyleType;

			for (var i = 0; i < map.length; i++) {
				this.grid[i] = new Array(map[i].length);
				for (var j = 0; j < map[i].length; j++) {
					if (map[j].charAt(i) == 'x')
						tyleType = TILE_TYPE.UNWALKABLE;
					else 
						tyleType = TILE_TYPE.WALKABLE;
					var tile = new Tile(i, j, tyleType);
					this.grid[i][j] = tile;
					addCreatedGameObject(tile);
				}
			}
		};

		this.getTile = function(x, y) {
			return this.grid[x][y];
		};

		this.getTileType = function(x,y) {
			return this.grid[x][y].type;
		}
	};

	// x and y are the position within the grid, not coordinates
	function Cop(x, y) {
		this.prototype = Object.create(GameObject.prototype);
		GameObject.call(this);

		this.name = "cop"+numCop++;
		this.sprite = addSpriteFromSheet(x*TILE_WIDTH, y*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT, 1, 'sprites/cops and robbers/cop.png', TILE_WIDTH, TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT, 0, 0);

		this.setVisibility(true);

		this.getDirection = function() {
			return this.direction;
		};

		this.setDirection = function(direction) {
			this.direction = direction;
		};
		this.target;

	};

	// x and y are the position within the grid, not coordinates
	function Robber(x, y) {
		this.prototype = Object.create(GameObject.prototype);
		GameObject.call(this);

		this.name = "robber"+numRob++;
		this.sprite = addSpriteFromSheet(x*TILE_WIDTH, y*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT, 1, 'sprites/cops and robbers/robber.png', TILE_WIDTH, TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT, 0, 0);

		this.setVisibility(true);

		this.getDirection = function() {
			return this.direction;
		};

		this.setDirection = function(direction) {
			this.direction = direction;
		};

		this.robberAI = function(){
			for (var i = 0; i < cops.length; i++) {
				var current = [];
				var next = [];
				var steps = -3;
				var cop = cops[i];
				var x = Math.floor(cop.sprite.X / TILE_WIDTH);
				var y = Math.floor(cop.sprite.Y / TILE_HEIGHT);
				next.push(getGameObject("tile-" + x + "-" + y));

				while (next.length > 0 || current.length > 0) {
					if (current.length === 0) {
						current = next;
						next = [];
						steps += 1;
					}
					var tile = current.shift();
					if (tile.safety === undefined) {
						tile.safety = steps;
					} else {
						tile.safety = Math.min(tile.safety, steps);
					}
					tile.checked = true;
					//add adjacent tiles to list to be evaluated
					if (tile.xIdx > 0 && !getGameObject("tile-" + (tile.xIdx - 1) + "-" + (tile.yIdx)).checked) {
						next.push(getGameObject("tile-" + (tile.xIdx - 1) + "-" + (tile.yIdx)));
					}
					if (tile.yIdx > 0 && !getGameObject("tile-" + (tile.xIdx) + "-" + (tile.yIdx - 1)).checked) {
						next.push(getGameObject("tile-" + (tile.xIdx) + "-" + (tile.yIdx - 1)));
					}
					if (tile.xIdx < GRID_WIDTH - 1 && !getGameObject("tile-" + (tile.xIdx + 1) + "-" + (tile.yIdx)).checked) {
						next.push(getGameObject("tile-" + (tile.xIdx + 1) + "-" + (tile.yIdx)));
					}
					if (tile.yIdx < GRID_HEIGHT - 1 && !getGameObject("tile-" + (tile.xIdx) + "-" + (tile.yIdx + 1)).checked) {
						next.push(getGameObject("tile-" + (tile.xIdx) + "-" + (tile.yIdx + 1)));
					}
				}
			}

			//sets walls so that robber can't choose them
			for (var i = 0; i < GRID_WIDTH; i++) {
				for (var j = 0; j < GRID_HEIGHT; j++) {
					if (getGameObject("tile-" + i + "-" + j).type === TILE_TYPE.UNWALKABLE) {
						getGameObject("tile-" + i + "-" + j).safety = -99;
					}
					if (getGameObject("tile-" + i + "-" + j).type === TILE_TYPE.OCCUPIED) {
						getGameObject("tile-" + i + "-" + j).safety = -2;
					}
				}
			}

			//code used to avoid going down deadends
			x = Math.floor(this.sprite.X / TILE_WIDTH);
			y = Math.floor(this.sprite.Y / TILE_HEIGHT);
			var val = 0;
			if (getGameObject("tile-" + (x - 1) + "-" + y).safety === -99)
				val++;
			if (getGameObject("tile-" + (x + 1) + "-" + y).safety === -99)
				val++;
			if (getGameObject("tile-" + x + "-" + (y - 1)).safety === -99)
				val++;
			if (getGameObject("tile-" + x + "-" + (y + 1)).safety === -99)
				val++;
			//turns off deadend avoidance if robber is in a tunnel
			if (val > 1) {
				for (var i = 0; i < GRID_WIDTH; i++) {
					for (var j = 0; j < GRID_HEIGHT; j++) {
						if (getGameObject("tile-" + i + "-" + j).safety > 0) {
							val = 0;
							if (getGameObject("tile-" + (i - 1) + "-" + j).safety < 0)
								val++;
							if (getGameObject("tile-" + (i + 1) + "-" + j).safety < 0)
								val++;
							if (getGameObject("tile-" + i + "-" + (j - 1)).safety < 0)
								val++;
							if (getGameObject("tile-" + i + "-" + (j + 1)).safety < 0)
								val++;

							if (val === 3) {
								getGameObject("tile-" + i + "-" + j).safety = -1;
							}
						}
					}
				}
			}

			var max = -2;
			if (x > 0 && getGameObject("tile-" + (x - 1) + "-" + (y)).safety >= max) {
				this.setDirection("left");
				max = getGameObject("tile-" + (x - 1) + "-" + (y)).safety;
			}
			if (x < GRID_WIDTH - 1 && getGameObject("tile-" + (x + 1) + "-" + (y)).safety >= max) {
				this.setDirection("right");
				max = getGameObject("tile-" + (x + 1) + "-" + (y)).safety;
			}
			if (y > 0 && getGameObject("tile-" + (x) + "-" + (y - 1)).safety >= max) {
				this.setDirection("up");
				max = getGameObject("tile-" + (x) + "-" + (y - 1)).safety;
			}
			if ( y < GRID_WIDTH - 1 && getGameObject("tile-" + (x) + "-" + (y + 1)).safety >= max) {
				this.setDirection("down");
				max = getGameObject("tile-" + (x) + "-" + (y + 1)).safety;
			}
			for (var i = 0; i < GRID_WIDTH; i++) {
				for (var j = 0; j < GRID_HEIGHT; j++) {
					if (getGameObject("tile-" + i + "-" + j).type !== TILE_TYPE.UNWALKABLE) {
						getGameObject("tile-" + i + "-" + j).checked = false;
						getGameObject("tile-" + i + "-" + j).safety = GRID_WIDTH + GRID_HEIGHT;
					}
				}
			}
		}
	};


	this.createGame = function() {
		moveCounter = 0;
		validMove = false;
		robberAITurn = true;
		state = "not-started";      
		this.uiComponents = UIComponents.getInstance();
	};

	this.setUpGame = function() {
		grid = new Grid(GRID_WIDTH, GRID_HEIGHT);

		var mapNum = Math.floor(MAPS.length * Math.random());
		grid.init(mapNum);

		GRID_WIDTH = MAPS[mapNum][0].length;
		GRID_HEIGHT = MAPS[mapNum].length;

		// Create the player obj
		var validPos = false;
		while (!validPos) {
			var x = Math.round(Math.random()*(GRID_WIDTH-1));
			var y = Math.round(Math.random()*(GRID_HEIGHT-1));
			if (grid.getTileType(x, y) == "walkable")
				validPos = true;
		}
		grid.getTile(x, y).setType(TILE_TYPE.OCCUPIED);
		if (playerType == "cop") {
			NUM_COPS--;
			var p = new Cop(x, y);
			p.name = "player"
				addCreatedGameObject(p);
			//cops.push(p);
		} else if (playerType == "robber") {
			NUM_ROBBERS--;
			var p = new Robber(x, y);
			p.name = "player";
			addCreatedGameObject(p);
			//robbers.push(p);
		}

		player = getGameObjectsWithName("player")[0];
		for (var i = 0; i < NUM_COPS; i++) {
			var validPos = false;
			while (!validPos) {
				var x = Math.round(Math.random()*(GRID_WIDTH-1));
				var y = Math.round(Math.random()*(GRID_HEIGHT-1));

				if (grid.getTileType(x, y) == "walkable")

					validPos = true;
			}

			var cop = new Cop(x, y);
			addCreatedGameObject(cop);
			grid.getTile(x, y).setType(TILE_TYPE.OCCUPIED);
			cop.target = player;
			cops.push(cop);
		}

		for (var i = 0; i < NUM_ROBBERS; i++) {
			var validPos = false;
			while (!validPos) {
				var x = Math.round(Math.random()*(GRID_WIDTH-1));
				var y = Math.round(Math.random()*(GRID_HEIGHT-1));

				if (grid.getTileType(x, y) == "walkable")
					validPos = true;
			}
			var robber = new Robber(x, y);
			addCreatedGameObject(robber);
			grid.getTile(x, y).setType(TILE_TYPE.OCCUPIED);
			robbers.push(robber);
		}

		// add player to the num_cops/num_robbers
		if (playerType == "robber")
			NUM_ROBBERS++;
		this.newTargets();
	};

	this.update = function() {
		if (state == "not-started") {
			draw();
			if (isKeyDown(82)) {
				playerType = "robber"
					state = "running";
				this.setUpGame();
			} else if (isKeyDown(67)) {
				playerType = "cop"
					state = "running";
				this.setUpGame();
			} else if (isKeyDown(83)) {
				playerType = "spectator";
				state="running";
				this.setUpGame();
			}
		} else if (state == "running") {
			this.checkWinConditions();
			if (playerType == "robber") {
				if (!validMove) {
					this.playerTurn();
					moveCounter++;
				}
				if (robberAITurn) {
					this.robberTurn();
					robberAITurn = false;
				}
				if (validMove) {
					this.checkWinConditions();
					this.copTurn();
					validMove = false;
				}
			} else if (playerType == "cop") {
				if (robberAITurn) {
					this.robberTurn();
					this.checkWinConditions();
					validMove = false;
					robberAITurn = false;
				} else {
					if (!validMove) {
						this.playerTurn();
						moveCounter++;
					}
					if (copAITurn) {
						this.copTurn();
						copAITurn = false;
					}
				}

			} else {
				if (copAITurn) {
					this.copTurn();
					this.checkWinConditions();
					copAITurn = false;
				} else {
					this.robberTurn();
					this.checkWinConditions();
					copAITurn = true;
				}
				moveCounter++
			}
		} else if (state == "gameover") {
			if (isKeyDown("space"))
				this.restart();
		}
	};

	this.checkWinConditions = function() {
		if (NUM_ROBBERS == 0) {
			winner = "cop";
			state = "gameover";
			this.gameOver();
		} else if (moveCounter > 100) {
			winner = "rob";
			state = "gameover";
			this.gameOver();
		}
	}

	this.robberTurn = function() {
		moveCounter++;
		for (let i = 0; i < robbers.length; i++) {
			var robber = robbers[i];
			robber.robberAI();
			var x = robber.sprite.X/TILE_WIDTH;
			var y = robber.sprite.Y/TILE_HEIGHT;
			var curX = x;
			var curY = y;

			if (robber.direction == "left")
				x--;
			else if (robber.direction == "right")
				x++;
			else if (robber.direction == "up")
				y--;
			else if (robber.direction == "down")
				y++;
			if (this.isValidDirection(x,y))
				this.moveObj(robber);
			else {
				grid.getTile(curX,curY).setType("walkable");
				robbers.splice(robbers.indexOf(robber), 1);
				removeGameObject(robber.name);
				NUM_ROBBERS--;
				if (NUM_ROBBERS > 0)
					this.newTargets();
			}
		}
	}

	this.playerTurn = function() {
		var x = player.sprite.X/TILE_WIDTH;
		var y = player.sprite.Y/TILE_HEIGHT;
		if (!validMove) {
			if(isKeyDown("right")) {
				player.setDirection("right");
				x++;
			} else if (isKeyDown("left")) {
				player.setDirection("left");
				x--;
			} else if(isKeyDown("down")) {
				player.setDirection("down");
				y++;
			} else if (isKeyDown("up")) {
				player.setDirection("up");
				y--;
			}
			validMove = this.isValidDirection(x, y);
			if (!validMove && grid.getTileType(x,y) === 'occupied') {
				if (playerType === "cop") {
					for (var r of robbers) {
						if (r.sprite.X / TILE_WIDTH === x && r.sprite.Y / TILE_HEIGHT === y) {
							validMove = true;
							robbers.splice(robbers.indexOf(r), 1);
							removeGameObject(r.name);
							NUM_ROBBERS--;
							if (NUM_ROBBERS > 0)
								this.newTargets();
						}
					}
				}
			}
		}
		if (validMove ) {
			if (playerType == "robber") {
				robberAITurn = true;
			}

			if (playerType == "cop") {
				robberAITurn = true;
				copAITurn = true;
			}

			this.moveObj(player);
		}
	}

	this.copTurn = function() {
		for (let i = 0; i < cops.length; i++) {
			var cop = cops[i];
			var x = cop.sprite.X/TILE_WIDTH;
			var y = cop.sprite.Y/TILE_HEIGHT;
			var direction = this.copAI(x, y, cop.target.sprite.X/TILE_WIDTH, cop.target.sprite.Y/TILE_HEIGHT);
			cop.setDirection(direction);
			this.moveObj(cop);
		}
	}

	// returns if the specified tile is valid
	this.isValidDirection = function(x,y) {
		var valid = grid.getTileType(x,y) == 'walkable';
		return valid;
	};

	this.moveObj = function(obj) {
		var x = obj.sprite.X/TILE_WIDTH;
		var y = obj.sprite.Y/TILE_HEIGHT;

		grid.getTile(x,y).setType("walkable");

		if (obj.direction == "right")
			x++;
		else if (obj.direction == "left")
			x--;
		else if (obj.direction == "down")
			y++;
		else if (obj.direction == "up")
			y--;

		grid.getTile(x,y).setType("occupied");
		obj.sprite.X = TILE_WIDTH * x;
		obj.sprite.Y = TILE_HEIGHT * y;
	};

	// recursively finds the best path to the target 

	this.copAI = function(x, y, targetX, targetY) {
		// Distance used for heuristic 
		function getDist(root, goal){
			var minX = Math.min(root.x, goal[0]);
			var minY = Math.min(root.y, goal[1]);
			var maxX = Math.max(root.x, goal[0]);
			var maxY = Math.max(root.y, goal[1]);
			var badTileValue = 4;
			var dist = 0;

			// account for row
			for (var i = minX; i< maxX; i++) {
				var type = grid.getTileType(i, minY);
				if (type == "unwalkable") 
					dist+=badTileValue;
				else
					dist++;
			}

			// account for column
			for (var i = minY; i< maxY; i++) {
				var type = grid.getTileType(maxX, i);
				if (type == "unwalkable") 
					dist+=badTileValue;
				else
					dist++;
			}

			return dist;

		}

		// get the neighboring tiles for the x,y coord
		function getNeighbors(x,y) {
			var neighbors = {};
			neighbors['up'] = [grid.getTileType(x,y-1), x, y-1];
			neighbors['down'] = [grid.getTileType(x,y+1), x, y+1];
			neighbors['left'] = [grid.getTileType(x-1,y), x-1, y];
			neighbors['right'] = [grid.getTileType(x+1,y), x+1, y];
			return neighbors;
		}
		// root node
		var root = Node(null, x, y);

		// bootleg tuple for goal coords
		var goal = [targetX, targetY];

		// pseudo-queue to hold the valid paths. Sort by f+g
		var queue = [root];

		// list to hold all explored tiles. used to prevent infinite loops
		var visited = [[root.x, root.y]];

		root.f = getDist(root, goal);
		root.g = 0;
		root.fg = root.f+root.g;
		var currentNode = queue.shift();

		// keep track of the best move (lowest fg) in case the path
		// becomes blocked by other objects and the path cannot be found
		var bestMoveSoFar = root;

		while (currentNode.x != goal[0] || currentNode.y != goal[1]) {

			var neighbors = getNeighbors(currentNode.x, currentNode.y);

			for (var key in neighbors) {
				var skip = false;
				var neighbor = neighbors[key];
				// make sure the tile is walkable and hasn't been visited before
				if (neighbor[0] == "walkable"){ 
					for (var i = 0; i < visited.length; i++) {
						if (visited[i][0] == neighbor[1] && visited[i][1] == neighbor[2])
							skip = true;
					}
				} else {
					skip = true;
				}

				if (skip) 
					continue;

				var newNode = Node(currentNode, neighbor[1], neighbor[2]);
				newNode.f = getDist(newNode, goal);
				newNode.g = distanceToRoot(root, newNode);
				newNode.fg = newNode.f+newNode.g;
				newNode.direction = key;

				// make the tile as visited
				visited.push([neighbor[1], neighbor[2]]);

				// check for best move
				if (bestMoveSoFar.fg >= newNode.fg)
					bestMoveSoFar = newNode;

				// insert into the queue sorted by fg
				for (var i = 0; i < queue.length; i++) {
					if (queue[i].fg > newNode.fg) {
						queue.splice(i,0,newNode);
						i = queue.length;
					}
				}
				// if it isn't in, then it gets pushed to the end
				// only happens if fg is greater than everything in list
				if (!queue.includes(newNode))
					queue.push(newNode);

			}

			// get the first element from the queue
			if (queue.length > 0)
				currentNode = queue.shift();
			else {
				currentNode = bestMoveSoFar;
				break;
			}
		}

		if (currentNode != root) {
			// get to the first move from the best move
			while (currentNode.parent != root) {
				currentNode = currentNode.parent;
			}
			return currentNode.direction;
		}
		return "";
	}

	// randomly generate a new target for all the cops
	this.newTargets = function() {
		let newTarget = robbers[Math.floor(NUM_ROBBERS*Math.random())];
		for (var i = 0; i < cops.length; i++) {
			var cop = cops[i];
			cop.target = newTarget;
		}
	}

	this.draw = function() {
		context = canvas.getContext('2d');
		context.fillStyle = "black";
		context.textAlign = "center";
		context.font = "20px Arial";
		if (state == "not-started") {
			context.fillText("Press R to play Robber", canvas.width/2, canvas.height/2);
			context.fillText("Press C to play Cop", canvas.width/2, canvas.height/2.5);
			context.fillText("Press S to spectate", canvas.width/2, canvas.height/1.7);
		}
	};

	// Setter for the activeObjectIndex field; use this to maintain the selected object index
	this.setActiveObjectIndex = function(index) {
		this.activeObjectIndex = index;
	};

	// Getter for the activeObjectIndex field; use this to get the selected object index
	this.getActiveObjectIndex = function() {
		return this.activeObjectIndex;
	};

	this.gameOver = function() {
		if (winner == "cop") {
			this.uiComponents.addAlert(getContext().canvas.width/1.3, getContext().canvas.height/2.5, "Cops win!", "black");
		} else if (winner == "rob") {
			this.uiComponents.addAlert(getContext().canvas.width/1.3, getContext().canvas.height/2.5, "Robbers win!", "black");
		}
		this.uiComponents.addAlert(getContext().canvas.width/1.3, getContext().canvas.height/2.2, "Press space to start a new game.", "black");
	};

	this.restart = function() {
		clearGame();
		startGame(new CopsAndRobbersGame(), 150, document.getElementById('cops-and-robbers-game-canvas'));
	};
}
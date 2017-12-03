/**
 * Game engine for CSC481 assignment.
 * Group Members:
 *     Andrew Shryock      (ajshryoc)
 *     Chris Miller        (cjmille7)
 *     Colleen Britt       (cbritt)
 *     John-Michael Caskey (jmcaskey)
 *
 * Snake game logic.
 */
var OnlineMultiplayerSnakeGame = function() {
    var CELL_WIDTH = 20;
    var SCORE_STRING_ID1 = "snake-score-1";
    var SCORE_STRING_ID2 = "snake-score-2";
    var HIGHSCORE_STRING_ID1 = "snake-highscore-1";
    var HIGHSCORE_STRING_ID2 = "snake-highscore-2";
    var SNAKE_SPRITESHEET_SRC = 'sprites/snake/snake_spritesheet.png';

    var PEERJS_API_KEY = {
        key: "w0rwwdd4na2x1or"
    };
    var PEERJS_DEFAULT_NAME = "opponent";
    var peer;
    var conn;
    var eventToSend;
    var snakeEventToSend;

    this.uiComponents;
    this.activeObjectIndex;
    var peerMessage;

    var state;
    var restartFlag;
    var restartTimer;
    var startFlag;
    var startTimer;
    var alert;
    this.score = new Array();
    this.highScore = new Array();

    document.getElementById('room-id-submit').addEventListener('click', function() {
        var onlineMode = document.getElementById('online-snake-options').value;
        var roomId = document.getElementById('room-id').value;
        console.log(onlineMode);
        console.log(roomId);

        switch (onlineMode) {
            case "create-room":
                peer = new Peer(roomId, PEERJS_API_KEY);
                peer.on('connection', function(connection) {
                    conn = connection;
                    conn.on('open', function(data) {
                        game.state = "starting";
                        console.log('opened connection ' + data);
                        getGameObject("poison").move();
                        setTimeout(getGameObject("poison").move, 3000);
                        getGameObject("food").move();
                        getGameObject("snake1").client = true;

                    });

                    conn.on('data', function(data) {
                        console.log('received: ' + data);
                        data = JSON.parse(data);
                        getGameObject("snake1").client = true;
                        switch (data.type) {
                            case "reset":
                                game.restart();
                                break;
                            case "start":
                                game.state = 'running';
                                game.clearAlerts();
                                break;
                            case "food":
                                food = getGameObject("food");
                                food.sprite.X = data.info.x;
                                food.sprite.Y = data.info.y;
                                getGameObject("snake" + data.info.player).grow();
                                this.score[data.info.player] += 50;
                                break;
                            case "poison":
                                getGameObject("snake" + data.info.player).shrink();
                                this.score[data.info.player] -= 50;
                                getGameObject("poison").move();
                                break;
                            case "poisonmove":
                                poison = getGameObject("poison");
                                poison.move();
                                break;
                            case "gameover":
                                game.gameOver();
                                break;
                            default: //handles all directional movements
                                if (data.info !== undefined) {
                                    snake = getGameObject("snake" + data.info.player);
                                    snake.event = data.type;
                                    snake.updateSegments(data.info.segments);
                                }
                                break;
                        }
                    });
                });
                break;
            case "join-room":
                peer = new Peer(PEERJS_DEFAULT_NAME, PEERJS_API_KEY);
                peer.on('open', function(id) {
                    console.log("Peer ID: " + id);
                    conn = peer.connect(roomId);
                    conn.on('open', function(data) {
                        game.state = "starting";
                        getGameObject("poison").client = true;

                    });

                    conn.on('data', function(data) {
                        console.log('received: ' + data);
                        data = JSON.parse(data);
                        getGameObject("snake0").client = true;
                        switch (data.type) {
                            case "reset":
                                game.restart();
                                break;
                            case "start":
                                game.state = "running";
                                game.clearAlerts();
                                break;
                            case "food":
                                getGameObject("snake" + data.info.player).grow();
                                this.score[data.info.player] += 50;
                                break;
                            case "foodmove":
                                food = getGameObject("food");
                                food.sprite.X = data.info.x;
                                food.sprite.Y = data.info.y;
                                break;
                            case "poison":
                                getGameObject("snake" + data.info.player).shrink();
                                this.score[data.info.player] -= 50;
                                break;
                            case "poisonmove":
                                poison = getGameObject("poison");
                                poison.sprite.X = data.info.x;
                                poison.sprite.Y = data.info.y;
                                break;
                            case "gameover":
                                game.gameOver();
                                break;
                            default: //handles all directional movements
                                if (data.info !== undefined) {
                                    snake = getGameObject("snake" + data.info.player);
                                    snake.event = data.type;
                                    snake.updateSegments(data.info.segments);

                                }
                                break;
                        }
                    });
                });
                break;

            default:
                // should not happen
        }
    });

    function Snake(player) {
        this.prototype = Object.create(GameObject.prototype);
        GameObject.call(this);

        var STARTING_SNAKE_LENGTH = 3;
        var snakeLength = 0;

        this.name = "snake" + player;
        this.sprite = null;
        this.snakeArray = [];
        this.event = null;
        this.client = false;

        if (player == 0) {
            this.direction = "right";
        } else if (player == 1) {
            this.direction = "left";
        }


        this.draw = function() {
            for (var segment of this.snakeArray) {
                segment.draw();
            }
        };

        this.grow = function() {
            var x;
            var y;

            if (this.snakeArray.length > 0) {
                var tail = this.snakeArray.pop();
                x = tail.sprite.X;
                y = tail.sprite.Y;
                this.snakeArray.push(tail);

                switch (this.direction) {
                    case "right":
                        x -= (CELL_WIDTH);
                        break;
                    case "left":
                        x += (CELL_WIDTH);
                        break;
                    case "up":
                        y += (CELL_WIDTH);
                        break;
                    case "down":
                        y -= (CELL_WIDTH);
                        break;
                }

            } else {
                if (player === 0) {
                    x = canvas.width / 2 + 3 * CELL_WIDTH;
                    y = canvas.height / 2;
                } else {
                    x = canvas.width / 2 - 3 * CELL_WIDTH;
                    y = canvas.height / 2;
                }
            }

            this.snakeArray.push(new SnakeSegment(x, y));
        };

        this.shrink = function() {
            if (this.snakeArray.length > 1) {
                this.snakeArray.pop();
            } else {
                return -1;
            }
        };

        this.move = function() {
            var tail = this.snakeArray[this.snakeArray.length - 1];
            var head = this.snakeArray[0];
            var headX;
            var headY;

            if (head !== undefined) {
                headX = head.sprite.X;
                headY = head.sprite.Y;
            } else {
                headX = 0;
                headY = 0;
            }

            switch (this.direction) {
                case "right":
                    tail.sprite.X = (headX + CELL_WIDTH);
                    tail.sprite.Y = headY;
                    break;
                case "left":
                    tail.sprite.X = (headX - CELL_WIDTH);
                    tail.sprite.Y = headY;
                    break;
                case "up":
                    tail.sprite.Y = (headY - CELL_WIDTH);
                    tail.sprite.X = headX;
                    break;
                case "down":
                    tail.sprite.Y = (headY + CELL_WIDTH);
                    tail.sprite.X = headX;
                    break;
            }


            this.snakeArray.pop();
            this.snakeArray.unshift(tail);
        };

        this.checkCollisionWithSelf = function() {
            for (var segment of this.snakeArray) {
                if (this.getHead().name !== segment.name &&
                    this.getHead().sprite.X == segment.sprite.X &&
                    this.getHead().sprite.Y == segment.sprite.Y) {
                    return true;
                }
            }
            return false;
        };
        this.checkCollisionWithPlayer = function() {
            var other = getGameObject("snake" + (Math.abs(player - 1)));
            for (var segment of other.snakeArray) {
                if (this.getHead().name !== segment.name &&
                    this.getHead().sprite.X === segment.sprite.X &&
                    this.getHead().sprite.Y === segment.sprite.Y) {
                    if (segment.name === other.getHead().name &&
                        this.snakeArray.length > other.snakeArray.length) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }
            return false;
        };

        this.getDirection = function() {
            return this.direction;
        };

        this.setDirection = function(direction) {
            this.direction = direction;
        };

        this.getHead = function() {
            return this.snakeArray[0];
        };

        this.setVisibility(true);

        for (var i = 0; i < STARTING_SNAKE_LENGTH; i++) {
            this.grow();
        }

        this.updateSegments = function(segments) {
            for (var i = 0; i < this.snakeArray.length; i++) {
                this.snakeArray[i].sprite.X = segments[i].x;
                this.snakeArray[i].sprite.Y = segments[i].y;
            }
        }

        this.getSegmentLocations = function() {
            locations = [];
            for (var segment of this.snakeArray) {
                locations.push({
                    "x": segment.sprite.X,
                    "y": segment.sprite.Y
                });
            }
            return locations;
        }

        function SnakeSegment(x, y) {
            this.prototype = Object.create(GameObject.prototype);
            GameObject.call(this);

            this.name = "snake-segment-" + snakeLength;
            this.sprite = addSpriteFromSheet(x, y, CELL_WIDTH, CELL_WIDTH, 1, SNAKE_SPRITESHEET_SRC, 40, 40, 200, 80, 40 * player, 120);

            snakeLength++;

            this.setVisibility(true);
        }
    }

    function Food() {
        this.prototype = Object.create(GameObject.prototype);
        GameObject.call(this);

        this.name = "food";
        this.sprite = addSpriteFromSheet(0, 0, CELL_WIDTH, CELL_WIDTH, 10, SNAKE_SPRITESHEET_SRC, 40, 40, 200, 80, 0, 40);

        this.move = function() {
            var filled = true;
            while (filled) {
                filled = false;
                var x = Math.round(Math.random() * (canvas.width - CELL_WIDTH) / CELL_WIDTH) * CELL_WIDTH;
                var y = Math.round(Math.random() * (canvas.height - CELL_WIDTH) / CELL_WIDTH) * CELL_WIDTH;

                for (var segment of getGameObject("snake0").snakeArray) {
                    if (x == segment.sprite.X && y == segment.sprite.Y) {
                        filled = true;
                    }
                }
                for (var segment of getGameObject("snake1").snakeArray) {
                    if (x == segment.sprite.X && y == segment.sprite.Y) {
                        filled = true;
                    }
                }
                var poison = getGameObject("poison");
                if (poison && x == poison.sprite.X && y == poison.sprite.Y) {
                    filled = true;
                }
            }

            this.sprite.X = x;
            this.sprite.Y = y;

            eventToSend = new SnakeEvent("foodmove", {
                "x": x,
                "y": y
            });

            if (conn !== undefined) {
                if (eventToSend !== undefined) {
                    conn.send(JSON.stringify(eventToSend));
                }
            }
            eventToSend = undefined;
        };

        this.move();
        this.setVisibility(true);
    }

    function Poison() {
        this.prototype = Object.create(GameObject.prototype);
        GameObject.call(this);

        this.name = "poison";
        this.sprite = addSpriteFromSheet(0, 0, CELL_WIDTH, CELL_WIDTH, 10, SNAKE_SPRITESHEET_SRC, 40, 40, 200, 80, 0, 0);
        this.sprite.X = -20;
        this.sprite.Y = -20;
        this.client = false;

        this.move = function() {
            if (!this.client) {
                clearInterval(window.snakePoisonInterval);
                var filled = true;
                while (filled) {
                    filled = false;
                    var x = Math.round(Math.random() * (canvas.width - CELL_WIDTH) / CELL_WIDTH) * CELL_WIDTH;
                    var y = Math.round(Math.random() * (canvas.height - CELL_WIDTH) / CELL_WIDTH) * CELL_WIDTH;

                    for (var segment of getGameObject("snake0").snakeArray) {
                        if (x == segment.sprite.X && y == segment.sprite.Y) {
                            filled = true;
                        }
                    }
                    for (var segment of getGameObject("snake1").snakeArray) {
                        if (x == segment.sprite.X && y == segment.sprite.Y) {
                            filled = true;
                        }
                    }
                    var food = getGameObject("food");
                    if (food && x == food.sprite.X && y == food.sprite.Y) {
                        filled = true;
                    }

                }

                getGameObject("poison").sprite.X = x;
                getGameObject("poison").sprite.Y = y;
                window.snakePoisonInterval = setTimeout(getGameObject("poison").move, 3000);

                eventToSend = new SnakeEvent("poisonmove", {
                    "x": x,
                    "y": y
                });
                if (conn !== undefined) {
                    if (eventToSend !== undefined) {
                        conn.send(JSON.stringify(eventToSend));
                    }
                }
                eventToSend = undefined;
            }
        };

        this.setVisibility(true);
    }

    function SnakeEvent(type, info) {
        this.type = type;
        this.info = info;
    }

    this.createGame = function() {
        if (this.state === undefined) {
            this.state = "start";
        } else {
            this.state = "starting";
        }
        this.restartFlag = false;
        this.restartTimer = 0;
        this.startFlag = false;
        this.startTimer = 0;
        this.score[0] = 0;
        this.score[1] = 0;

        this.uiComponents = UIComponents.getInstance();
        this.uiComponents.addBox(0, 0, canvas.width, canvas.height, "black", undefined);
        this.uiComponents.addScore(10, 35, SCORE_STRING_ID1, this.score[0], "blue");
        this.uiComponents.addHighScore(10, 65, HIGHSCORE_STRING_ID1, "snake-high-score1", "blue");
        this.uiComponents.addScore(10, 95, SCORE_STRING_ID2, this.score[1], "orange");
        this.uiComponents.addHighScore(10, 125, HIGHSCORE_STRING_ID2, "snake-high-score2", "orange");
        this.highScore[0] = this.uiComponents.getHighScore(HIGHSCORE_STRING_ID1);
        this.highScore[1] = this.uiComponents.getHighScore(HIGHSCORE_STRING_ID2);

        addCreatedGameObject(new Snake(0)); // player 1
        addCreatedGameObject(new Snake(1)); // player 2
        addCreatedGameObject(new Food());
        addCreatedGameObject(new Poison());
    }

    this.startGame = function() {
        this.state = "running";
    }

    this.update = function() {
        if (this.state === "gameover") {
            if (this.restartTimer < 30) {
                this.restartTimer++;
                return;
            }
            if (!this.restartFlag) {
                this.uiComponents.addAlert(getContext().canvas.width - 350, 75, "Press space to restart!", "bold white");
                this.restartFlag = true;
            }
            if (isKeyDown("space")) {
                eventToSend = new SnakeEvent("reset");
                if (conn !== undefined) {
                    if (eventToSend !== undefined) {
                        conn.send(JSON.stringify(eventToSend));
                        this.state = "running";
                    }
                }
                eventToSend = undefined;
                this.restart();
            }
            return;
        } else if (this.state === "running") {
            this.updateSnake(0); // player 1
            this.updateSnake(1); // player 2
        } else if (this.state === "starting") {
            if (this.startTimer < 15) {
                this.startTimer++;
                return;
            }
            if (!this.startFlag) {
                this.startFlag = true;
                this.peerMessage = this.uiComponents.addAlert(getContext().canvas.width - 350, 75, "Press space to Begin!", "bold white");
                return;
            }
            if (isKeyDown("space")) {
                this.startFlag = false;

                eventToSend = new SnakeEvent("start");
                if (conn !== undefined) {
                    if (eventToSend !== undefined) {
                        conn.send(JSON.stringify(eventToSend));
                        this.state = "running";
                    }
                }
                eventToSend = undefined;
                game.clearAlerts();
            }
        } else if (this.state === "start") {
            if (conn !== undefined) {
                this.state = "starting";
            }
        }
    }

    this.updateSnake = function(player) {
        var snake = getGameObject("snake" + player);

        var previousDirection = snake.getDirection();
        if (!snake.client) {
            if (isKeyDown("right") && !isKeyDown("left") && !isKeyDown("up") && !isKeyDown("down")) {
                if (previousDirection !== "left") {
                    snake.setDirection("right");
                    snakeEventToSend = new SnakeEvent("right", {
                        "player": player,
                        "segments": snake.getSegmentLocations()
                    });
                }
            } else if (!isKeyDown("right") && isKeyDown("left") && !isKeyDown("up") && !isKeyDown("down")) {
                if (previousDirection !== "right") {
                    snake.setDirection("left");
                    snakeEventToSend = new SnakeEvent("left", {
                        "player": player,
                        "segments": snake.getSegmentLocations()
                    });
                }
            } else if (!isKeyDown("right") && !isKeyDown("left") && isKeyDown("up") && !isKeyDown("down")) {
                if (previousDirection !== "down") {
                    snake.setDirection("up");
                    snakeEventToSend = new SnakeEvent("up", {
                        "player": player,
                        "segments": snake.getSegmentLocations()
                    });
                }
            } else if (!isKeyDown("right") && !isKeyDown("left") && !isKeyDown("up") && isKeyDown("down")) {
                if (previousDirection !== "up") {
                    snake.setDirection("down");
                    snakeEventToSend = new SnakeEvent("down", {
                        "player": player,
                        "segments": snake.getSegmentLocations()
                    });
                }
            } else {
                snake.setDirection(previousDirection);
            }
        }

        if (conn !== undefined) {
            if (snakeEventToSend !== undefined) {
                conn.send(JSON.stringify(snakeEventToSend));
            }
        }
        snakeEventToSend = undefined;

        switch (snake.event) {
            case "right":
                if (previousDirection !== "left") {
                    snake.setDirection("right");
                }
                break;
            case "left":
                if (previousDirection !== "right") {
                    snake.setDirection("left");
                }
                break;
            case "up":
                if (previousDirection !== "down") {
                    snake.setDirection("up");
                }
                break;
            case "down":
                if (previousDirection !== "up") {
                    snake.setDirection("down");
                }
                break;
            default:

                break;

        }

        snake.event = null;
        var head = snake.getHead();
        var food = getGameObject("food");
        var poison = getGameObject("poison");

        if (head === undefined ||
            head.sprite.X < 0 || head.sprite.X == canvas.width ||
            head.sprite.Y < 0 || head.sprite.Y == canvas.height) {
            this.gameOver();
            return;
        }

        // We really should use checkCollision, although for some reasons, it's not accurate
        if (head.sprite.X === food.sprite.X && head.sprite.Y == food.sprite.Y) {
            snake.grow();
            food.move();
            this.score[player] += 50;
            eventToSend = new SnakeEvent("food", {
                "player": player
            });
        }
        if (head.sprite.X === poison.sprite.X && head.sprite.Y == poison.sprite.Y) {
            if (snake.shrink() === -1) {
                this.gameOver();
                return;
            }
            poison.move();
            this.score[player] -= 50;
            eventToSend = new SnakeEvent("poison", {
                "player": player
            });
        }

        if (snake.checkCollisionWithSelf()) {
            this.gameOver();
            return;
        }

        if (snake.checkCollisionWithPlayer()) {
            console.log("player" + player + " loses");
            this.gameOver();
            return;
        }

        if (conn !== undefined) {
            if (eventToSend !== undefined) {
                conn.send(JSON.stringify(eventToSend));
            }
        }
        eventToSend = undefined;
        snake.move();

        if (player == 0) {
            this.uiComponents.setScore(SCORE_STRING_ID1, this.score[player]);
        } else if (player == 1) {
            this.uiComponents.setScore(SCORE_STRING_ID2, this.score[player]);
        }
    }

    this.draw = function() {
        // Draws the start instructions
        if (this.state === "start" && this.peerMessage === undefined) {
            this.peerMessage = this.uiComponents.addAlert(getContext().canvas.width - 350, 75, "Waiting for connection", "bold white");
        } else if (this.state === "starting" && this.peerMessage.text === "Waiting for connection") {
            this.uiComponents.removeUIComponent(this.peerMessage);
        } else if (this.state === "running" && this.peerMessage !== undefined) {
            this.uiComponents.removeUIComponent(this.peerMessage);
        }
    }

    this.setActiveObjectIndex = function(index) {
        this.activeObjectIndex = index;
    }

    this.getActiveObjectIndex = function() {
        return this.activeObjectIndex;
    }

    this.gameOver = function() {
        if (this.state !== "gameover") {
            this.state = "gameover";
            eventToSend = new SnakeEvent("gameover");

            if (conn !== undefined) {
                if (eventToSend !== undefined) {
                    conn.send(JSON.stringify(eventToSend));
                }
            }
        }
        if (this.score[0] > this.highScore[0]) {
            this.highScore[0] = this.score[0];
            this.uiComponents.setHighScore(HIGHSCORE_STRING_ID1, this.highScore[0]);
        }
        if (this.score[1] > this.highScore[1]) {
            this.highScore[1] = this.score[1];
            this.uiComponents.setHighScore(HIGHSCORE_STRING_ID2, this.highScore[1]);
        }
        var snake1 = getGameObject("snake0");
        var snake2 = getGameObject("snake1");
        var winner;
        if (snake1.snakeArray.length > snake2.snakeArray.length) {
            winner = "Player 1 wins!";
        } else if (snake2.snakeArray.length > snake1.snakeArray.length) {
            winner = "Player 2 wins!";
        } else {
            winner = "It's a draw!";
        }



        this.uiComponents.addAlert(getContext().canvas.width - 300, 50, winner, "bold white");
    }

    this.restart = function() {
        removeGameObject("food");
        removeGameObject("poison");
        removeGameObject("snake0"); // player 1
        removeGameObject("snake1"); // player 2
        this.uiComponents.clearUIComponents();

        this.createGame();
    }
}

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
var LocalMultiplayerSnakeGame = function() {
    var CELL_WIDTH = 20;
    var SCORE_STRING_ID1 = "snake-score-1";
    var SCORE_STRING_ID2 = "snake-score-2";
    var HIGHSCORE_STRING_ID1 = "snake-highscore-1";
    var HIGHSCORE_STRING_ID2 = "snake-highscore-2";
    var SNAKE_SPRITESHEET_SRC = 'sprites/snake/snake_spritesheet.png';

    this.uiComponents;
    this.activeObjectIndex;

    var state;
    var restartFlag;
    var restartTimer;
    this.score = new Array();
    this.highScore = new Array();

    function Snake(player) {
        this.prototype = Object.create(GameObject.prototype);
        GameObject.call(this);

        var STARTING_SNAKE_LENGTH = 3;
        var snakeLength = 0;

        this.name = "snake" + player;
        this.sprite = null;
        this.snakeArray = [];
        if (player == 0) {
            this.direction = "right";
        } else if (player == 1) {
            this.direction = "a";
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

                if (player == 0) {
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
                } else if (player == 1) {
                    switch (this.direction) {
                        case "d":
                            x -= (CELL_WIDTH);
                            break;
                        case "a":
                            x += (CELL_WIDTH);
                            break;
                        case "w":
                            y += (CELL_WIDTH);
                            break;
                        case "s":
                            y -= (CELL_WIDTH);
                            break;
                    }
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

            if (player == 0) {
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
            } else if (player == 1) {
                switch (this.direction) {
                    case "d":
                        tail.sprite.X = (headX + CELL_WIDTH);
                        tail.sprite.Y = headY;
                        break;
                    case "a":
                        tail.sprite.X = (headX - CELL_WIDTH);
                        tail.sprite.Y = headY;
                        break;
                    case "w":
                        tail.sprite.Y = (headY - CELL_WIDTH);
                        tail.sprite.X = headX;
                        break;
                    case "s":
                        tail.sprite.Y = (headY + CELL_WIDTH);
                        tail.sprite.X = headX;
                        break;
                }
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

        this.move = function() {
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
        };

        this.setVisibility(true);
    }

    this.createGame = function() {
        this.state = "running";
        this.restartFlag = false;
        this.restartTimer = 0;
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
        setTimeout(getGameObject("poison").move, 3000);
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
                this.restart();
            }
            return;
        }
        this.updateSnake(0); // player 1
        this.updateSnake(1); // player 2
    }

    this.updateSnake = function(player) {
        var snake = getGameObject("snake" + player);

        var previousDirection = snake.getDirection();


        if (player == 0) {
            if (isKeyDown("right") && !isKeyDown("left") && !isKeyDown("up") && !isKeyDown("down")) {
                if (previousDirection !== "left") {
                    snake.setDirection("right");
                }
            } else if (!isKeyDown("right") && isKeyDown("left") && !isKeyDown("up") && !isKeyDown("down")) {
                if (previousDirection !== "right") {
                    snake.setDirection("left");
                }
            } else if (!isKeyDown("right") && !isKeyDown("left") && isKeyDown("up") && !isKeyDown("down")) {
                if (previousDirection !== "down") {
                    snake.setDirection("up");
                }
            } else if (!isKeyDown("right") && !isKeyDown("left") && !isKeyDown("up") && isKeyDown("down")) {
                if (previousDirection !== "up") {
                    snake.setDirection("down");
                }
            } else {
                snake.setDirection(previousDirection);
            }
        } else if (player == 1) {
            if (isKeyDown("d") && !isKeyDown("a") && !isKeyDown("w") && !isKeyDown("s")) {
                if (previousDirection !== "a") {
                    snake.setDirection("d");
                }
            } else if (!isKeyDown("d") && isKeyDown("a") && !isKeyDown("w") && !isKeyDown("s")) {
                if (previousDirection !== "d") {
                    snake.setDirection("a");
                }
            } else if (!isKeyDown("d") && !isKeyDown("a") && isKeyDown("w") && !isKeyDown("s")) {
                if (previousDirection !== "s") {
                    snake.setDirection("w");
                }
            } else if (!isKeyDown("d") && !isKeyDown("a") && !isKeyDown("w") && isKeyDown("s")) {
                if (previousDirection !== "w") {
                    snake.setDirection("s");
                }
            } else {
                snake.setDirection(previousDirection);
            }
        }

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

        }
        if (head.sprite.X === poison.sprite.X && head.sprite.Y == poison.sprite.Y) {
            if (snake.shrink() === -1) {
                this.gameOver();
                return;
            }
            poison.move();
            this.score[player] -= 50;
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

        snake.move();

        if (player == 0) {
            this.uiComponents.setScore(SCORE_STRING_ID1, this.score[player]);
        } else if (player == 1) {
            this.uiComponents.setScore(SCORE_STRING_ID2, this.score[player]);
        }
    }

    this.draw = function() {
        // Draws the start instructions
        if (getGameObject("poison").sprite.X < 0) {
            context.font = "30px Verdana";
            context.fillText("Press a directional key to begin!", context.canvas.width / 2 - 100, context.canvas.height / 2);
        }
    }

    this.setActiveObjectIndex = function(index) {
        this.activeObjectIndex = index;
    }

    this.getActiveObjectIndex = function() {
        return this.activeObjectIndex;
    }

    this.gameOver = function() {
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

        this.state = "gameover";
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

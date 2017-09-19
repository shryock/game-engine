/**
 * Alchemy game for CSC481 assignment.
 * Group Members:
 *     Andrew Shryock      (ajshryoc)
 *     Chris Miller        (cjmille7)
 *     Colleen Britt       (cbritt)
 *     John-Michael Caskey (jmcaskey)
 */
var SnakeGame = function() {
    this.storage;
    this.activeObjectIndex;
    this.direction;
    this.unlockedElements = [];

    this.score;
    this.highScore;
    this.food;
    this.images;
    this.snakeArray;

    this.width = canvas.width;
    this.height = canvas.height;
    this.cellWidth = 20;
    
    this.badFoodTimer = 0;

    this.createGame = function() {
        this.score = 0;

        this.storage = new Storage();
        this.highScore = this.storage.getItem("snake-high-score");
        if (this.highScore === null) {
            this.highScore = 0;
        }

        // this needs to be changed
        this.images = {};
        //images.push("https://i.imgur.com/RUJQrTx.png"); // temp
        //addGameObjectWithSprite("snake", 20 + (this.cellWidth) + 10, 20, this.cellWidth, this.cellWidth, images[0]);
        //this.unlockedElements.push(getGameObject("snake"));
        this.images.food = addSpriteFromSheet( 0, 0, this.cellWidth, this.cellWidth, 10, 'sprites/snake_spritesheet.png', 40, 40, 200, 80, 0, 40);
        addGameObject("food", this.images.food);
        this.images.poison = addSpriteFromSheet( 0, 0, this.cellWidth, this.cellWidth, 10, 'sprites/snake_spritesheet.png', 40, 40, 200, 80, 0, 0);
        addGameObject("poison", this.images.poison);
        
        this.createSnake();
        this.createFood();
        this.createBadFood();
    }

    this.update = function() {
    	var previousDirection = this.getDirection()
        this.setDirection(getLastKeyDown());
    	
    	// Check to make sure the direction is valid. Ignore otherwise
    	if (previousDirection == "right" && this.direction == "left") {
    		this.direction = previousDirection;
    	} else if (previousDirection == "up" && this.direction == "down") {
    		this.direction = previousDirection;
    	} else if (previousDirection == "left" && this.direction == "right") {
    		this.direction = previousDirection;
    	} else if (previousDirection == "down" && this.direction == "up") {
    		this.direction = previousDirection;
    	}
        
        // this is where the snake movement begins
		// store the x and y coordinates of the head
		var snakeX = this.snakeArray[0].x;
		var snakeY = this.snakeArray[0].y;
        
        // next position of the snake head
		if(this.direction == "right")  snakeX++;
		else if(this.direction == "left")  snakeX--;
		else if(this.direction == "up") snakeY--;
		else if(this.direction == "down") snakeY++;
		
        // check if the snake hit the wall or collided into its own body and restart if it did
        if(snakeX == -1 || snakeX == this.width/this.cellWidth 
            || snakeY == -1 || snakeY == this.height/this.cellWidth 
            || checkCollision(snakeX, snakeY, this.snakeArray)) {
                this.gameOver();
        	return;
		}
		
		// when the snake eats food
		if(snakeX == food.x && snakeY == food.y) {
			var tail = {x: snakeX, y: snakeY};
			this.score += 50;
			this.createFood();
		} else if(snakeX == badFood.x && snakeY == badFood.y) {
			// pop twice to shrink the snake
			if (this.snakeArray.length > 1 ) {
				var tail = this.snakeArray.pop();
				var tail = this.snakeArray.pop();
			} else {
				// game over because no more snake parts
				this.gameOver();
				return;
			}
			
            tail.x = snakeX; 
            tail.y = snakeY;
			this.score -= 50;
			this.createBadFood();
		} else {
			var tail = this.snakeArray.pop();
            tail.x = snakeX; 
            tail.y = snakeY;
		}
        
        // add the tail to the front to make the snake move
		this.snakeArray.unshift(tail); 
		
		// move bad food if 3 seconds have passed
		if (this.badFoodTimer++ > badFood.timer) {
			this.createBadFood();
			this.badFoodTimer = 0;
		}
    }

    this.draw = function() {
    	// draws background and border
        context.fillStyle = "white";
        context.fillRect(0, 0, this.width, this.height);
        context.strokeStyle = "black";
        context.strokeRect(0, 0, this.width, this.height);

        // draws the snake
        for(var i = 0; i < this.snakeArray.length; i++) {
            var c = this.snakeArray[i];
            this.paintCell(c.x, c.y);
        }
        
        // draws the food
        if (getLastKeyDown() !== null) {
        	this.unlockedElements.push(getGameObject('food'));
			this.unlockedElements.push(getGameObject('poison'));
        }
        
        // draws the score
        var score_text = "Score: " + this.score;
        context.font = "30px Verdana";
        context.fillText(score_text, 10, 35); // this should print the score
        var high_score_text = "High Score: " + this.highScore;
        context.fillText(high_score_text, 10, 65);
    }

    // this is temporary; creates boxes to represent snake and food
    this.paintCell = function(x, y, color) {
    	if (color === undefined) {
    		color = "black";
    	}
		context.fillStyle = color;
		context.fillRect(x*this.cellWidth, y*this.cellWidth, this.cellWidth, this.cellWidth);
		context.strokeStyle = "white";
		context.strokeRect(x*this.cellWidth, y*this.cellWidth, this.cellWidth, this.cellWidth);
	}

    this.canDrawObject = function(object) {
        var canDraw = false;
            
        for (var element of this.unlockedElements) {
            if (object === element) {
                canDraw = true;
                break;
            }
        }
        return canDraw;
    }

    this.setActiveObjectIndex = function(index) {
        this.activeObjectIndex = index;
    }

    this.getActiveObjectIndex = function() {
        return this.activeObjectIndex;
    }

    this.setDirection = function(direction) {
        this.direction = direction;
    }

    this.getDirection = function() {
        return this.direction;
    }

    this.createSnake = function() {
        var length = 3;
        this.snakeArray = [];
        this.direction = "right";
        for (var i = length; i >= 1; i--) {
            this.snakeArray.push({x:i + 20, y:1 +10}) // begins in the middle of the canvas
        }
    }

    this.createFood = function() {
        food = {
			x: Math.round(Math.random()*(this.width-this.cellWidth)/this.cellWidth), 
            y: Math.round(Math.random()*(this.height-this.cellWidth)/this.cellWidth), 
            color: "black",
        }
        getGameObject('food').sprite.X = food.x * this.cellWidth;
        getGameObject('food').sprite.Y = food.y * this.cellWidth;
    }
    this.createBadFood = function() {
    	badFood = {
            x: Math.round(Math.random()*(this.width-this.cellWidth)/this.cellWidth), 
            y: Math.round(Math.random()*(this.height-this.cellWidth)/this.cellWidth),
            timer: 90,
            color: "red",
        }
    	getGameObject('poison').sprite.X = badFood.x * this.cellWidth;
        getGameObject('poison').sprite.Y = badFood.y * this.cellWidth;
    }
    
    this.gameOver = function() {
    	if (this.score > this.highScore) {
            this.highScore = this.score;
            this.storage.setItem("snake-high-score", this.highScore);
        }
	    this.createGame()

    }
}

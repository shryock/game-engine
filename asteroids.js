/**
 * Game engine for CSC481 assignment.
 * Group Members:
 *     Andrew Shryock      (ajshryoc)
 *     Chris Miller        (cjmille7)
 *     Colleen Britt       (cbritt)
 *     John-Michael Caskey (jmcaskey)
 *
 * Asteroids game logic.
 */
var AsteroidsGame = function() {
    this.activeObjectIndex;
    this.score;
    var SCORE_STRING_ID = "asteroids-score";
    this.highScore;
    var HIGHSCORE_STRING_ID = "asteroids-highscore";
    this.level;
    var LEVEL_STRING_ID = "asteroids-level";

    this.laserCounter;

    this.totalNumberOfAsteroids;
    this.totalNumberOfLasers;
    
    var LASER_TIMER = 10;
    this.CIRCLE_DEG = 360;
    var ONE_SEC_TIMER = 30; //based on frames, not ms
    var restartTimer = 0;
    var restartFlag;

    //ship vars
    this.canShoot = false;
    this.FRICTION = 0.05;
    this.THRUST_SPEED = 0.3;
    this.TURN_SPEED = 5;

    // level vars
    this.currentLevelAsteroids;
    var INCREMENT_ASTEROIDS = 2;
    var START_NUM_ASTEROIDS = 4;
    var MAX_NUM_ASTEROIDS = 20;
    
    this.uiComponents;

    function Background(x, y) {
        var BACKGROUND_WIDTH = 64;
        var BACKGROUND_SPRITE = 'sprites/asteroids/space.png';

        this.prototype = Object.create(GameObject.prototype);
        GameObject.call(this);
        this.name = "background-" + x + "-" + y;
        this.sprite = addSprite(x, y, BACKGROUND_WIDTH, BACKGROUND_WIDTH, BACKGROUND_SPRITE);
        this.sprite.rotation = Math.floor(Math.random() * 4) * 90; 
        this.setVisibility(true);
    }

    function Asteroid(x, y, id, size, speed, orientation, spin) {
        var ASTEROID_WIDTH = 20;
        var ASTEROID_IMG_SRC = 'sprites/asteroids/asteroid.png';

        this.prototype = Object.create(GameObject.prototype);
        GameObject.call(this);
        this.name = "asteroid-" + id;
        this.sprite = addSprite(x, y, size*ASTEROID_WIDTH, size*ASTEROID_WIDTH, ASTEROID_IMG_SRC);
        this.size = size;
        this.speed = speed;
        this.orientation = orientation;
        this.spin = spin;

        this.setVisibility(true);
    }
    
    function Explosion(x, y, width, height) {
        var spriteSheet = 'sprites/asteroids/explosion.png';
        var spriteWidth = 96;
        var spriteHeight = 96;
        var frames = 12;
        this.prototype = Object.create(GameObject.prototype);
        GameObject.call(this);
        
        this.sprite = addSpriteFromSheet(x, y, width, height, frames, spriteSheet, spriteWidth, spriteHeight, spriteWidth, spriteHeight, 0, 0);
        this.name = "explosion";
        this.setVisibility(true);
        
        setTimeout(function() {
        	var explosions = searchForObjectsByName("explosion");
        	if (explosions.length > 0) {
        		explosions[0].setVisibility(false);
                removeGameObject(explosions[0].name);
                }
        }, 200)
    }

    function Laser(x, y, id, orientation, shipSpeed) {
        var LASER_SPEED = 5;
        var LASER_IMG_SRC = 'sprites/asteroids/laser.png';
        var SHIP_SPEED = shipSpeed;
        this.prototype = Object.create(GameObject.prototype);
        GameObject.call(this);
        this.name = "laser-" + id;
        this.sprite = addSprite(x, y, 9, 15, LASER_IMG_SRC);
        this.sprite.rotation = orientation;
        this.orientation = orientation;
        this.speed = LASER_SPEED + SHIP_SPEED;

        this.setVisibility(true);

        setTimeout(function() {
            var lasers = searchForObjectsByName("laser");
            if (lasers.length > 0) {
                lasers[0].setVisibility(false);
                spawnExplosion(lasers[0]);
                removeGameObject(lasers[0].name);
                }
        }, 2000);
    }

    function Spaceship() {
        var SPACHESHIP_IMG_SRC = 'sprites/asteroids/spaceship.png';

        this.prototype = Object.create(GameObject.prototype);
        GameObject.call(this);
        this.name = "spaceship";
        this.sprite = addSprite(canvas.width/2, canvas.height/2, 30, 25, SPACHESHIP_IMG_SRC);
        this.orientation = 0;
        this.speed = 0;
        this.direction = 0;
        
        this.THRUST_SPEED = 0.3;
        this.MAX_SPEED = 7;

        this.getOrientation = function() {
            return this.orientation;
        };

        this.setOrientation = function(orientation) {
            this.sprite.rotation = orientation;
        	this.orientation = orientation;
        };
        this.getSpeed = function() {
            return this.speed;
        };

        this.setSpeed = function(speed) {
            if (Math.abs(speed) < this.MAX_SPEED)
            	this.speed = speed;
        };
        
        this.accelerate = function() {
        	var t1 = Math.PI * this.direction / 180;
        	var t2 = Math.PI * this.orientation / 180;
        	var r1 = this.speed;
        	var r2 = this.THRUST_SPEED;
        	var x1 = Math.cos(t1) * r1;
        	var y1 = Math.sin(t1) * r1;
        	var x2 = Math.cos(t2) * r2;
        	var y2 = Math.sin(t2) * r2;
        	var x3 = x1 + x2;
        	var y3 = y1 + y2;
        	this.direction = 180 * Math.atan(y3 / x3) / Math.PI;
        	if (x3 < 0) {
        		this.direction = -180 + 180 * Math.atan(y3 / x3) / Math.PI;
        	}
        	this.setSpeed(Math.sqrt( Math.pow(x3, 2) + Math.pow(y3, 2) ));
        };
        this.setVisibility(true);
    }

    this.createGame = function() {
    	this.state = "running";
        this.laserCounter = 0;
        this.totalNumberOfAsteroids = 0;
        this.totalNumberOfLasers = 0;
        this.score = 0;
        this.currentLevelAsteroids = START_NUM_ASTEROIDS;
        this.level = 0;
        this.restartTimer = 0;
        this.restartFlag = false;
        
        this.uiComponents = UIComponents.getInstance();
        this.uiComponents.addLevel(10, 35, LEVEL_STRING_ID, this.level, "white");
        this.uiComponents.addScore(10, 65, SCORE_STRING_ID, this.score, "white");
        this.uiComponents.addHighScore(10, 95, HIGHSCORE_STRING_ID, "white");
        this.highScore = this.uiComponents.getHighScore(HIGHSCORE_STRING_ID);

        for (var i = 0; i < getContext().canvas.width / 64; i++) {
            for (var j = 0; j < getContext().canvas.height / 64; j++) {
                addCreatedGameObject(new Background(i*64, j*64));
            }
        }

        this.createShip();
    };

    this.draw = function() {

    };

    this.update = function() {
    	if (this.state === "gameover") {
    		if (this.restartTimer < 60) {
    			this.restartTimer++;
    			return;
    		}
    		if (!this.restartFlag) {
    			this.uiComponents.addAlert(getContext().canvas.width/2, getContext().canvas.height/2 + 35, "Press space to restart!", "bold white");
    			this.restartFlag = true;
    		}
    		var key = getLastKeyDown();
    		if (key === "space") {
    			this.restart();
    		}
    		return;
    	}
        var asteroids = searchForObjectsByName("asteroid");
        var lasers = searchForObjectsByName("laser");
        var ship = getGameObject("spaceship");

        // Check bounds and asteroid collision, then move
        for (var i = 0; i < asteroids.length; i++) {
            var asteroid = asteroids[i];
            if (checkBounds(asteroid)) {
                this.wrapObject(asteroid);
                continue;
            }

            // Check collision with ship
            if (checkCollision(asteroid.sprite, ship.sprite)) {
                this.gameOver();
                return;
            }

            // check for collision with lasers
            for (var j = 0; j < lasers.length; j++) {
                var laser = lasers[j];
                // If the asteroid collides with a laser, delete them both
                if (checkCollision(asteroid.sprite, laser.sprite)) {
                    spawnExplosion(asteroid);
                	removeGameObject(asteroid.name);
                    removeGameObject(laser.name);
                    this.totalNumberOfAsteroids--;
                    this.score += 100;
                    continue;
                }
            }
            // Check for collision with other asteroids
//            for (var j = i+1; j < asteroids.length; j++) {
//                // If two asteroids collide, delete them both
//            	if (checkCollision(asteroid.sprite, asteroids[j].sprite)) {
//                    this.destroy(asteroid, asteroids[j]);
//                    this.totalNumberOfAsteroids -= 2;
//                    continue;
//            	}
//            }

            // Move the asteroid
            move(asteroid, asteroid.orientation, asteroid.speed, asteroid.spin);
        }

        // Check bounds and move all lasers
        for (var i = 0; i < lasers.length; i++) {
            var laser = lasers[i];
            if (checkBounds(laser)) {
                this.wrapObject(laser);
            }

            // Move the laser
            move(laser, laser.orientation, laser.speed, 0);
        }
        
        if (checkBounds(ship)) {
        	this.wrapObject(ship);
        }
        
        // friction (in space??)
        if (ship.getSpeed() > 0)
        	ship.setSpeed(ship.getSpeed()-this.FRICTION);
        else if (ship.getSpeed() < 0)
        	ship.setSpeed(0);
        // move ship
        move(ship, ship.direction, ship.speed, 0);
        
        if (this.totalNumberOfAsteroids == 0) {
            this.level++;
            this.displayAsteroids();
        }
        
        if (this.laserCounter == LASER_TIMER) {
        	this.canShoot = true;
        } else {
        	this.laserCounter++;
        }
        
        // ship stuff below
        var key = getLastKeyDown();
        if (key === "up") {
        	ship.accelerate();
        } else if (key === "right") {
        	ship.setOrientation((ship.getOrientation()+this.TURN_SPEED) % this.CIRCLE_DEG);
        } else if (key === "left") {
        	ship.setOrientation((ship.getOrientation()-this.TURN_SPEED) % this.CIRCLE_DEG);
        } else if (key === "space" && this.canShoot) {
        	this.shootLaser(ship);
        	this.canShoot = false;
        	this.laserCounter = 0;
        }

        this.uiComponents.setScore(SCORE_STRING_ID, this.score);
        this.uiComponents.setLevel(LEVEL_STRING_ID, this.level);
    };

    this.canDrawObject = function(object) {
        return object.isVisible();
    };

    // Setter for the activeObjectIndex field; use this to maintain the selected object index
    this.setActiveObjectIndex = function(index) {
        this.activeObjectIndex = index;
    };

    // Getter for the activeObjectIndex field; use this to get the selected object index
    this.getActiveObjectIndex = function() {
        return this.activeObjectIndex;
    };
    
    this.wrapObject = function(object) {
    	var canvas = getContext().canvas;
    	
    	var x = object.sprite.X;
    	var y = object.sprite.Y;
    	
    	if (x + object.sprite.width < 0)
    		object.sprite.X = canvas.width;
    	else if (x > canvas.width)
    		object.sprite.X = 0;
    	
    	if (y+object.sprite.height < 0)
    		object.sprite.Y = canvas.height;
    	else if (y > canvas.height)
    		object.sprite.Y = 0;
    }
    
    this.createShip = function() {
    	var canvas = getContext().canvas;
        addCreatedGameObject(new Spaceship());
    };
    
    // Spawn a laser from the ship coords
    this.shootLaser = function(ship) {
    	var dir = ship.getOrientation();
    	var speed = ship.getSpeed();
    	var shipX = ship.sprite.X + ship.sprite.width/2;
    	var shipY = ship.sprite.Y + ship.sprite.height/2;
        addCreatedGameObject(new Laser(shipX, shipY, this.totalNumberOfLasers, dir, speed));
        this.totalNumberOfLasers++;
    };
    
    // delete objects after collision. Removes from the game objects array
    this.destroy = function(obj1, obj2) {
    	// remove from game objects
    	removeGameObject(obj1.name);
    	removeGameObject(obj2.name);
    };
    
    function spawnExplosion(object) {
    	var sprite = object.sprite;
    	var x = sprite.X;
    	var y = sprite.Y;
    	var width = sprite.width;
    	var height = sprite.height;
    	
    	if (object.name.includes("laser")) {
    		width = width*5;
    		height = height*3;
    	}
    	addCreatedGameObject(new Explosion(x, y, width, height));
    }
    
    
    this.generateAsteroid = function() {
        var index  = searchForObjectsByName("asteroid").length;
        var canvas = getContext().canvas;

        // For randomly generating within a range of whole numbers use the formula:
        // Math.round(Math.random() * (max - min) + min)
        var location  = Math.round(Math.random()*(4 - 1) + 1);
        var x;
        var y;
        var dir;
        var size  = Math.round(Math.random()*(3 - 1) + 1);  // only 20-60 pixels^2
        var speed = Math.round(Math.random()*(10 - 5) + 5); // only 5 pixels/frame - 10 pixels/frame
        var spin  = Math.round(Math.random()*(30 - 1) + 1); // 30 degrees/frame or less

        switch (location) {
            case 1:                          // above the screen
                x   = Math.round(Math.random()*canvas.width);
                y   = Math.round(Math.random()*(-10 - -50) + -10);
                dir = Math.round(Math.random()*(270 - 90) + 90);
                break;
            case 2:                         // right of the screen
                x   = Math.round(Math.random()*(canvas.width + 50 - (canvas.width + 10)) + (canvas.width + 10));
                y   = Math.round(Math.random()*canvas.height);
                dir = Math.round(Math.random()*-180);
                break;
            case 3:                         // below the screen
                x   = Math.round(Math.random()*canvas.width);
                y   = Math.round(Math.random()*(canvas.height + 50 - (canvas.height + 10)) + (canvas.height + 10));
                dir = Math.round(Math.random()*(90 - -90) + -90);
                break;
            case 4:                         // left of the screen
                x   = Math.round(Math.random()*(canvas.width -50 - (canvas.width - 10)) + (canvas.width - 10));
                y   = Math.round(Math.random()*canvas.height);
                dir = Math.round(Math.random()*(180));
                break;
        }

        dir = Math.round(Math.random()*-180);

        addCreatedGameObject(new Asteroid(x, y, this.totalNumberOfAsteroids, size, speed, dir, spin));
        this.totalNumberOfAsteroids++;
    };

    this.displayAsteroids = function() {
        for (var i = 0; i < this.currentLevelAsteroids; i++) {
            this.generateAsteroid();
        }
        if (this.currentLevelAsteroids < MAX_NUM_ASTEROIDS) {
            this.currentLevelAsteroids += INCREMENT_ASTEROIDS;  
        }
    };

    this.gameOver = function() {
    	this.state = "gameover";
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.uiComponents.setHighScore(HIGHSCORE_STRING_ID, this.highScore);
        }

        this.uiComponents.addAlert(getContext().canvas.width/2, getContext().canvas.height/2, "GAMEOVER", "bold white");
    };
    
    this.restart = function() {
    	// delete everything
    	clearGame();
    	startGame(new AsteroidsGame(), 30, document.getElementById('asteroids-game-canvas'));
    }
}

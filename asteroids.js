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

    this.particleSystem;

    this.totalNumberOfLasers;

    var ASTEROID_WIDTH = 20;
    var ASTEROID_IMG_SRC = 'sprites/asteroids/asteroid.png';

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
        }, 200);
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
        this.setCollidability(true);

        var _this = this;

        setTimeout(function() {
            var lasers = searchForObjectsByName("laser");
            if (lasers.length > 0) {
                _this.setVisibility(false);
                spawnExplosion(_this);
                removeGameObject(_this.name);
            }
        }, 2000);
    }

    function Spaceship() {
        var SPACHESHIP_IMG_SRC = 'sprites/asteroids/spaceship.png';

        this.prototype = Object.create(GameObject.prototype);
        GameObject.call(this);
        this.name = "spaceship";
        this.sprite = addSprite(canvas.width / 2, canvas.height / 2, 30, 25, SPACHESHIP_IMG_SRC);
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
            this.setSpeed(Math.sqrt(Math.pow(x3, 2) + Math.pow(y3, 2)));
        };
        this.setVisibility(true);
        this.setCollidability(true);
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
                addCreatedGameObject(new Background(i * 64, j * 64));
            }
        }

        // instantiate particle system
        this.particleSystem = new ParticleSystem("asteroid", ASTEROID_IMG_SRC, ASTEROID_WIDTH, ASTEROID_WIDTH, -100, 0, -100, 0, 0, 360, 1, 3, 5, 10, undefined, true);
        addCreatedGameObject(this.particleSystem);

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
                this.uiComponents.addAlert(getContext().canvas.width / 2, getContext().canvas.height / 2 + 35, "Press space to restart!", "bold white");
                this.restartFlag = true;
            }

            if (isKeyDown("space")) {
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
            if (checkCollision(asteroid, ship)) {
                this.gameOver();
                return;
            }

            // check for collision with lasers
            for (var j = 0; j < lasers.length; j++) {
                var laser = lasers[j];
                // If the asteroid collides with a laser, delete them both
                if (checkCollision(asteroid, laser)) {
                    spawnExplosion(asteroid);
                    this.particleSystem.destroyParticle(asteroid.name);
                    removeGameObject(laser.name);
                    this.totalNumberOfAsteroids--;
                    this.score += 100;
                    continue;
                }
            }

            // Move the asteroid
            move(asteroid, asteroid.dir, asteroid.speed, 0);
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
            ship.setSpeed(ship.getSpeed() - this.FRICTION);
        else if (ship.getSpeed() < 0)
            ship.setSpeed(0);
        // move ship
        move(ship, ship.direction, ship.speed, 0);

        if (this.particleSystem.getNumberParticles() == 0) {
            this.level++;
            //this.displayAsteroids();
            this.particleSystem.generateFiniteNumParticles(this.currentLevelAsteroids, 1000);

            if (this.currentLevelAsteroids < MAX_NUM_ASTEROIDS) {
                this.currentLevelAsteroids += INCREMENT_ASTEROIDS;
            }
        }

        if (this.laserCounter == LASER_TIMER) {
            this.canShoot = true;
        } else {
            this.laserCounter++;
        }

        // ship stuff below
        if (isKeyDown("up")) {
            ship.accelerate();
        }
        if (isKeyDown("right")) {
            ship.setOrientation((ship.getOrientation() + this.TURN_SPEED) % this.CIRCLE_DEG);
        }
        if (isKeyDown("left")) {
            ship.setOrientation((ship.getOrientation() - this.TURN_SPEED) % this.CIRCLE_DEG);
        }
        if (isKeyDown("space") && this.canShoot) {
            this.shootLaser(ship);
            this.canShoot = false;
            this.laserCounter = 0;
        }

        this.uiComponents.setScore(SCORE_STRING_ID, this.score);
        this.uiComponents.setLevel(LEVEL_STRING_ID, this.level);
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

        if (y + object.sprite.height < 0)
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
        var shipX = ship.sprite.X + ship.sprite.width / 2;
        var shipY = ship.sprite.Y + ship.sprite.height / 2;
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
            width = width * 5;
            height = height * 3;
        }
        addCreatedGameObject(new Explosion(x, y, width, height));
    }

    this.gameOver = function() {
        this.state = "gameover";
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.uiComponents.setHighScore(HIGHSCORE_STRING_ID, this.highScore);
        }

        this.uiComponents.addAlert(getContext().canvas.width / 2, getContext().canvas.height / 2, "GAMEOVER", "bold white");
    };

    this.restart = function() {
        // delete everything
        clearGame();
        startGame(new AsteroidsGame(), 30, document.getElementById('asteroids-game-canvas'));
    }
}
/**
 * Game Engine for CSC481 assignment.
 * Group Members:
 *     Andrew Shryock      (ajshryoc)
 *     Chris Miller        (cjmille7)
 *     Colleen Britt       (cbritt)
 *     John-Michael Caskey (jmcaskey)
 *
 * This is the Gallery module, which controls which game should be started.
 * When new games are added, add a new case statement to the switch structure.
 */
var Gallery = function() {
    this.gameCanvasIndex = 0;
    this.gameHasStarted = false;

    this.initGame = function(game) {
        if (this.gameHasStarted) {
            clearGame();
        }
        switch(game) {
            case 0:
                startGame(new AlchemyGame(), 30, document.getElementById('alchemy-game-canvas'));
                this.gameHasStarted = true;
                break;
            case 1:
                startGame(new SnakeGame(), 60, document.getElementById('snake-game-canvas'));
                this.gameHasStarted = true;
                break;
            case 2:
                startGame(new AsteroidsGame(), 30, document.getElementById('asteroids-game-canvas'));
                this.gameHasStarted = true;
                break;
            case 3:
                startGame(new LocalMultiplayerSnakeGame(), 60, document.getElementById('local-multiplayer-snake-game-canvas'));
                this.gameHasStarted = true;
                break;
            case 4:
                startGame(new OnlineMultiplayerSnakeGame(), 100, document.getElementById('online-multiplayer-snake-game-canvas'));
                this.gameHasStarted = true;
                break;
            case 5:
                startGame(new CopsAndRobbersGame(), 150, document.getElementById('cops-and-robbers-game-canvas'));
                this.gameHasStarted = true;
                break;
            default:
                console.log("Invalid game selected.");
        }
    };

    this.incrementGameCanvas = function(value) {
        this.clearGameCanvas(this.gameCanvasIndex);
        this.showGameCanvas(this.gameCanvasIndex += value);
    };

    this.currentGameCanvas = function(value) {
        this.clearGameCanvas(this.gameCanvasIndex);
        this.showGameCanvas(this.gameCanvasIndex = value);
    };

    this.clearGameCanvas = function(value) {
        var gameCanvasContainers = document.getElementsByClassName("game-canvas-container");
        gameCanvasContainers[this.gameCanvasIndex].className += " slide-right";
        gameCanvasContainers[this.gameCanvasIndex].style.display = "none";
    };

    this.showGameCanvas = function(value) {
        var dots = document.getElementsByClassName("dot");
        var gameCanvasContainers = document.getElementsByClassName("game-canvas-container");

        if (value > gameCanvasContainers.length - 1) {
            this.gameCanvasIndex = 0;
        }

        if (value < 0) {
            this.gameCanvasIndex = gameCanvasContainers.length - 1;
        }

        for (var i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(" active", "");
        }

        gameCanvasContainers[this.gameCanvasIndex].style.display = "block";
        dots[this.gameCanvasIndex].className += " active";

        this.initGame(this.gameCanvasIndex);
    };

    this.showGameCanvas(this.gameCanvasIndex);
}
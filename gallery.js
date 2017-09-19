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
    this.initGame = function(game) {
        switch(game) {
            case "alchemy":
                clearGame();
                startGame(new AlchemyGame(), 30);
                document.getElementById('snakeInstructions').style.display = "none";
                break;
            case "snake":
                clearGame();
                startGame(new SnakeGame(), 60);
                document.getElementById('snakeInstructions').style.display = "block";
                break;
            default:
                clearGame();
                console.log("Invalid game selected.");
        }
    }
}
/**
 * Alchemy game for CSC481 assignment.
 * Group Members:
 *     Andrew Shryock      (ajshryoc)
 *     Chris Miller        (cjmille7)
 *     Colleen Britt       (cbritt)
 *     John-Michael Caskey (jmcaskey)
 */
var AlchemyGame = function() {
    this.allElements = [];
    this.unlockedElements = [];
    this.recipes = [];
    this.defaultElement = "black";
    this.activeObjectIndex;

    // Create a recipe object
    function Recipe(input1, input2, output) {
        this.input1 = input1;
        this.input2 = input2;
        this.output = output;
    }

    // Acts as a user putting information into the game engine.
    this.createGame = function() {
        // load images into an array
        // TODO implement sprite sheet instead of imgur links
        var images = [];
        images.push("http://i.imgur.com/JNn8XXv.png"); // white
        images.push("http://i.imgur.com/X1m87mx.png"); // red
        images.push("http://i.imgur.com/exZ0frA.png"); // yellow
        images.push("http://i.imgur.com/lxf6ZHo.png"); // blue
        images.push("http://i.imgur.com/LgcC3zP.png"); // light green
        images.push("http://i.imgur.com/jyUkk8D.png"); // orange
        images.push("http://i.imgur.com/v9svHUO.png"); // purple
        images.push("http://i.imgur.com/vmffEa9.png"); // cyan
        images.push("http://i.imgur.com/LxzxUEy.png"); // dark green
        images.push("http://i.imgur.com/oQbdQ1R.png"); // pink
        images.push("http://i.imgur.com/7fHiPDr.png"); // black

        // load color names into an array
        var colorNames = [];
        colorNames.push("white");
        colorNames.push("red");
        colorNames.push("yellow");
        colorNames.push("blue");
        colorNames.push("light green");
        colorNames.push("orange");
        colorNames.push("purple");
        colorNames.push("cyan");
        colorNames.push("dark green");
        colorNames.push("pink");
        colorNames.push("black");

        // Dimensions for the element sprites
        var elementWidth = 80;
        var elementHeight = 80;
        
        for (var i = 0; i < images.length; i++) {
            addGameObjectWithSprite(colorNames[i], 20 + (elementWidth * i) + 10, 20, elementWidth, elementHeight, images[i]);
        }
        
        // load recipes
        this.recipes.push(new Recipe(getGameObject("red"), getGameObject("yellow"), getGameObject("orange")));
        this.recipes.push(new Recipe(getGameObject("red"), getGameObject("blue"), getGameObject("purple")));
        this.recipes.push(new Recipe(getGameObject("yellow"), getGameObject("blue"), getGameObject("dark green")));
        this.recipes.push(new Recipe(getGameObject("blue"), getGameObject("light green"), getGameObject("cyan")));
        this.recipes.push(new Recipe(getGameObject("black"), getGameObject("light green"), getGameObject("dark green")));
        this.recipes.push(new Recipe(getGameObject("white"), getGameObject("dark green"), getGameObject("light green")));
        this.recipes.push(new Recipe(getGameObject("white"), getGameObject("red"), getGameObject("pink")));
        this.recipes.push(new Recipe(getGameObject("white"), getGameObject("blue"), getGameObject("cyan")));
        this.recipes.push(new Recipe(getGameObject("black"), getGameObject("pink"), getGameObject("red")));
        this.recipes.push(new Recipe(getGameObject("black"), getGameObject("cyan"), getGameObject("blue")));

        this.unlockedElements.push(getGameObject("white"));
        this.unlockedElements.push(getGameObject("red"));
        this.unlockedElements.push(getGameObject("yellow"));
        this.unlockedElements.push(getGameObject("blue"));

        for (var i = 0; i < colorNames.length; i++) {
            this.allElements.push(getGameObject(colorNames[i]));
        }
    }

    this.update = function() {
        if (this.activeObjectIndex >= 0) {
            var firstElement = this.allElements[this.activeObjectIndex];
            var secondElement;

            var objects = getObjectsAtPoint(firstElement.sprite.X + firstElement.sprite.image.width / 2,
                                            firstElement.sprite.Y + firstElement.sprite.image.height / 2);

            // If there are multiple objects overlapping
            if (objects.length > 1) {
                // Get the second object by excluding the one equal to firstElement
                for (var object of objects) {
                    if (object !== firstElement) {
                        secondElement = object;
                    }
                }
            }

            // If firstElement and secondElement are defined, we can check for a recipe
            if (firstElement !== undefined && secondElement !== undefined) {
                if (canCombine(firstElement, secondElement)) {
                    var output = this.getCombination(firstElement, secondElement);
                    if (output === null) {
                        output = getGameObject("black");
                    }
                    setNewColor(output.name);
                    this.unlockedElements.push(output);
                    firstElement.resetPosition();
                    secondElement.resetPosition();
                    this.setActiveObjectIndex(-1);
                }
            }
        }
    }

    // Returns true if the element can be draw (is contained in unlockedElements array)
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

    // Setter for the activeObjectIndex field; use this to maintain the selected object index
    this.setActiveObjectIndex = function(index) {
        this.activeObjectIndex = index;
    }

    // Getter for the activeObjectIndex field; use this to get the selected object index
    this.getActiveObjectIndex = function() {
        return this.activeObjectIndex;
    }

    this.getAllElements = function() {
        return this.allElements;
    }

    this.getUnlockedElements = function() {
        return this.unlockedElements;
    }

    // Returns the recipe for the input elements
    this.getCombination = function(element1, element2) {
        var color;

        for (var recipe of this.recipes) {
            if ((recipe.input1.name === element1.name  &&
                 recipe.input2.name === element2.name) ||
                (recipe.input2.name === element1.name  &&
                 recipe.input1.name === element2.name)) {
                color = recipe.output;
                break;
            } else {
                color = null;
            }
        }

        return color;
    }

    // Function to check if the given GameObject is inside the box
    function isInBox(element) {
      return (element.sprite.Y < window.innerHeight / 5);
    }

    function canCombine(element1, element2) {
      var spritesOutOfBox = !isInBox(element1) && !isInBox(element2);
      var areColliding = checkCollision(element1.sprite, element2.sprite);
      return spritesOutOfBox && areColliding;
    }
}

startGame(new AlchemyGame());

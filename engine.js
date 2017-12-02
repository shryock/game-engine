/**
 * Game engine for CSC481 assignment.
 * Group Members:
 *     Andrew Shryock      (ajshryoc)
 *     Chris Miller        (cjmille7)
 *     Colleen Britt       (cbritt)
 *     John-Michael Caskey (jmcaskey)
 *
 * Main engine module. This defines the global API for referenceing the engine.
 */
var assets = new Assets();
var collisions;
var game;
var gameObjects = [];
var gameLoopInterval;
var keyMap = {};

var canvas;
var context;

window.addEventListener("keydown", handleKeyPress);
window.addEventListener("keyup", handleKeyPress);

function GameObject(name, sprite) {
    this.name = name;
    this.sprite = sprite;
    this.draggable = false;
    this.visible = false;
    this.collidable = false;

    this.resetPosition = function() {
        this.sprite.X = this.sprite.origX;
        this.sprite.Y = this.sprite.origY;
    };

    this.cloneElement = function() {
        return new(assets.createAsset("GameObject"))(this.name, this.sprite);
    };

    this.draw = function() {
        if (this.isVisible()) {
            this.sprite.draw(context, canvas);
        }
    };

    this.setDraggable = function(draggable) {
        this.draggable = draggable;
    };

    this.isDraggable = function() {
        return this.draggable;
    };

    this.setVisibility = function(visible) {
        this.visible = visible;
    };

    this.isVisible = function() {
        return this.visible;
    };

    this.setCollidability = function(collidable) {
        this.collidable = collidable;
    };

    this.isCollidable = function() {
        return this.collidable;
    };
}

function getGameObject(name) {
    return assets.getAssetByFunction("GameObject", (function(element) {
        return element.name === name;
    }));
}

function addSprite(x, y, width, height, src) {
    return assets.addSprite(x, y, width, height, src);
}

function addSpriteFromSheet(x, y, width, height, frames, src, tileWidth, tileHeight, srcWidth, srcHeight, offsetX, offsetY) {
    return assets.addSpriteFromSheet(x, y, width, height, frames, src, tileWidth, tileHeight, srcWidth, srcHeight, offsetX, offsetY);
}

function addGameObject(name, sprite) {
    var gameObject = new GameObject(name, sprite);
    assets.addAsset("GameObject", gameObject);
    gameObjects.push(gameObject);
    return gameObject;
}

function addCreatedGameObject(gameObject) {
    assets.addAsset("GameObject", gameObject);
    gameObjects.push(gameObject);
}

function addGameObjectWithSprite(name, x, y, width, height, src) {
    var gameObjectSprite = addSprite(x, y, width, height, src);
    return addGameObject(name, gameObjectSprite);
}

function addGameObjectWithSpriteFromSheet(name, x, y, width, height, frames, src, tileWidth, tileHeight, srcWidth, srcHeight, offsetX, offsetY) {
    var gameObjectSprite = addSpriteFromSheet(x, y, width, height, frames, src, tileWidth, tileHeight, srcWidth, srcHeight, offsetX, offsetY);
    return addGameObject(name, gameObjectSprite);
}

function removeGameObject(name) {
    for (var i = 0; i < gameObjects.length; i++) {
        if (gameObjects[i].name === name) {
            gameObjects.splice(i, 1);
            assets.removeAsset("GameObject", i);
        }
    }
}

// Returns an array of all GameObjects with a specified name
function getGameObjectsWithName(name) {
    var commonlyNamedObjects = [];
    for (var object of gameObjects) {
        if (object.name === name) {
            commonlyNamedObjects.push(object);
        }
    }
    return commonlyNamedObjects;
}

// Returns an array of all GameObject with names that include a passed-in string
function searchForObjectsByName(name) {
    var objectsWithNameIncluded = [];
    for (var object of gameObjects) {
        if (object.name.includes(name)) {
            objectsWithNameIncluded.push(object);
        }
    }
    return objectsWithNameIncluded;
}

/*function getGameObject(name) {
  for (var i = 0; i < gameObjects.length; i++) {
    if (name === gameObjects[i].name) {
      return gameObjects[i];
    }
  }
}*/

function getGameObjects() {
    return gameObjects;
}

function handleMouseDown(e) {
    var rect = canvas.getBoundingClientRect();
    // Set selected image
    for (var iter = 0; iter < gameObjects.length; iter++) {
        if (gameObjects[iter].isDraggable() &&
            checkSprite(gameObjects[iter].sprite, e.clientX - rect.left, e.clientY - rect.top)) {
            game.setActiveObjectIndex(iter);
        }
    }

    // Set the canvas' onmousemove listener to the handleMouseMove function
    canvas.onmousemove = handleMouseMove;
}

function handleMouseUp(e) {
    // Remove the onmousemove listener once the mouse button is released
    canvas.onmousemove = null;
    game.setActiveObjectIndex(-1);
}

function handleMouseMove(e) {
    var activeObjectIndex = game.getActiveObjectIndex();
    var rect = canvas.getBoundingClientRect();
    // Translate the image's x and y components to the page coordinate minus
    // the canvas offset plus half of the width/height (to center on the mouse)
    if (activeObjectIndex >= 0) {
        gameObjects[activeObjectIndex].sprite.X = (e.clientX - rect.left) - (gameObjects[activeObjectIndex].sprite.width / 2);
        gameObjects[activeObjectIndex].sprite.Y = (e.clientY - rect.top) - (gameObjects[activeObjectIndex].sprite.height / 2);
    }
}

function handleKeyPress(e) {
    e = e || event;
    keyMap[e.keyCode] = e.type == 'keydown';
}

/**
 * Returns true if the passed in key is pressed.
 * Takes in a keyCode. I have hardcoded some strings that can be passed
 * in that will translate to a keyCode (left, up, right, down, space).
 * We can easily add more here to act as shortcuts rather than using keyCodes.
 */
function isKeyDown(key) {
    var keyCode;
    switch (key) {
        case "left":
            keyCode = 37;
            break;
        case "up":
            keyCode = 38;
            break;
        case "right":
            keyCode = 39;
            break;
        case "down":
            keyCode = 40
            break;
        case "space":
            keyCode = 32;
            break;
        case "w":
            keyCode = 87;
            break;
        case "a":
            keyCode = 65;
            break;
        case "s":
            keyCode = 83;
            break;
        case "d":
            keyCode = 68;
            break;
        case "shift":
            keyCode = 16;
            break;

        default:
            keyCode = key;
    }
    return keyMap[keyCode];
}

function checkCollision(object1, object2) {
    return collisions.checkCollision(object1, object2);
}

// Returns true if the object is out of bounds
function checkBounds(gameObject) {
    var objectWidth = gameObject.sprite.width;
    var objectHeight = gameObject.sprite.height;

    return gameObject.sprite.X < (0 - objectWidth) ||
        gameObject.sprite.X > (canvas.width + objectWidth) ||
        gameObject.sprite.Y < (0 - objectHeight) ||
        gameObject.sprite.Y > (canvas.height + objectHeight);
}

// Returns all GameObjects at a point in the canvas
function getObjectsAtPoint(x, y) {
    var objects = [];
    for (var object of gameObjects) {
        if (checkSprite(object.sprite, x, y)) {
            objects.push(object);
        }
    }

    return objects;
}

// Returns true if the sprite overlaps with the coordinates
function checkSprite(sprite, x, y) {
    var minX = sprite.X;
    var maxX = sprite.X + sprite.width;
    var minY = sprite.Y;
    var maxY = sprite.Y + sprite.height;
    var mx = x;
    var my = y;
    if (mx >= minX && mx <= maxX && my >= minY && my <= maxY) {
        return true;
    }
    return false;
}

function getContext() {
    return context;
}

// Calls callback n number of times with a delay in between
function setTimer(callback, delay, n) {
    var i = 0;
    var interval = setInterval(function() {
        callback();

        if (++i === n) {
            clearInterval(interval);
        }
    }, delay);
}

function update() {
    game.update();

    this.collisions.clear();
    for (var gameObject of gameObjects) {
        if (gameObject.isCollidable()) {
            collisions.registerObject(gameObject);
        }
    }
}

function draw() {
    canvas.width = canvas.width;

    game.draw();

    assets.updateSprites();
    for (var gameObject of gameObjects) {
        gameObject.draw();
    }

    UIComponents.getInstance().draw();

    if (isKeyDown("shift")) {
        renderQuadTree(this.collisions.quadTree);
    }
}

function move(object, direction, speed, spin) {
    var angularDirection = direction;
    var velocity = speed;
    var velocityX = Math.sin(angularDirection * (Math.PI / 180)) * velocity;
    var velocityY = -Math.cos(angularDirection * (Math.PI / 180)) * velocity;

    object.sprite.X += velocityX;
    object.sprite.Y += velocityY;
};

function clearGame() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    var lastKeyDown = null;
    game = null;
    gameObjects = [];
    UIComponents.getInstance().clearUIComponents();
    clearInterval(gameLoopInterval);
}

function startGame(newGame, gameLoopSpeed, gameCanvas) {
    game = newGame;
    canvas = gameCanvas;
    context = canvas.getContext('2d');
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);

    collisions = new CollisionSystem(canvas.width, canvas.height);

    loadContent();
    gameLoopInterval = setInterval(game_loop, gameLoopSpeed);
}

function loadContent() {
    assets.newAsset("GameObject", GameObject);
    game.createGame();
}

function game_loop() {
    update();
    draw();
}

// Debug feature; visually renders the CollisionSystem's QuadTree. Press shift to activate
var renderQuadTree = function(quadTree) {
    // Draw a rectangle for the node
    context.beginPath();
    context.rect(quadTree.aabb.center.x - quadTree.aabb.half.x, quadTree.aabb.center.y - quadTree.aabb.half.y,
        quadTree.aabb.half.x * 2, quadTree.aabb.half.y * 2);
    context.lineWidth = 1;
    context.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    context.stroke();

    context.beginPath();
    context.fillStyle = 'white';
    context.fillText(quadTree.points.length, quadTree.aabb.center.x, quadTree.aabb.center.y);
    context.fill();

    // Recursive end case; hitting a node with no sub-QuadTrees
    if (!quadTree.nw) return;

    // Recursively render all sub-QuadTrees
    renderQuadTree(quadTree.nw);
    renderQuadTree(quadTree.ne);
    renderQuadTree(quadTree.sw);
    renderQuadTree(quadTree.se);
}

// create a node for linked lists
function Node(parent, x, y) {
    var newNode = {
        parent: parent,
        x: x,
        y: y,
        expanded: false,
        // direction taken to get to this tile
        direction: "",
        // heuristic cost
        f: 0,
        // distance from start
        g: 0,
        // f+g, used for sorting
        fg: 0
    };

    return newNode;
}

// calculate the distance to the root
function distanceToRoot(root, node) {
    var count = 0;
    while (root != node) {
        node = node.parent;
        count++;
    }

    return count;
}

//// sort by heuristic + distance from start
//function addSort(root, node) {
//  var curNode = root;
//  if ((curNode.f+curNode.g) > (node.f+node.g)) {
//    
//  }
//  
//  
//}
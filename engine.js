/**
 * Alchemy game for CSC481 assignment.
 * Group Members:
 *     Andrew Shryock      (ajshryoc)
 *     Chris Miller        (cjmille7)
 *     Colleen Britt       (cbritt)
 *     John-Michael Caskey (jmcaskey)
 */
var assets = new Assets();
var game;
var gameObjects = [];
var lastKeyDown = null;
var gameLoopInterval;

canvas = document.getElementById("gamespace");
context = canvas.getContext('2d');

canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mouseup", handleMouseUp);
window.addEventListener("keydown", handleKeyDown);

function GameObject(name, sprite) {
  this.name = name;
  this.sprite = sprite;

  this.resetPosition = function() {
    this.sprite.X = this.sprite.origX;
    this.sprite.Y = this.sprite.origY;
  };

  this.cloneElement = function() {
    return new (assets.createAsset("GameObject"))(this.name, this.sprite);
  };

  this.draw = function() {
    if (game.canDrawObject(this)) {
    	this.sprite.draw(context);
    }
  };
}

function getGameObject(name) {
  return assets.getAssetByFunction("GameObject", (function(element) {return element.name === name;}));
}

function addSprite(x, y, width, height,  src) {
  return assets.addSprite(x, y, width, height, src);
}

function addSpriteFromSheet(x, y, width, height, frames, src, tileWidth, tileHeight, srcWidth, srcHeight, offsetX, offsetY) {
  return assets.addSpriteFromSheet(x, y, width, height, frames, src, tileWidth, tileHeight, srcWidth, srcHeight, offsetX, offsetY);
}

function addGameObject(name, sprite) {
  var gameObject = new GameObject(name, sprite);
  assets.addAsset("GameObject", gameObject);
  gameObjects.push(gameObject);
}

function addGameObjectWithSprite(name, x, y, width, height, src) {
  var gameObjectSprite = addSprite(x, y, width, height, src);
  addGameObject(name, gameObjectSprite);
}

function addGameObjectWithSpriteFromSheet(name, x, y, width, height, frames, src, tileWidth, tileHeight, srcWidth, srcHeight, offsetX, offsetY) {
	  var gameObjectSprite = addSpriteFromSheet(x, y, width, height, frames, src, tileWidth, tileHeight, srcWidth, srcHeight, offsetX, offsetY);
	  addGameObject(name, gameObjectSprite);
}

function getGameObject(name) {
  for (var i = 0; i < gameObjects.length; i++) {
    if (name === gameObjects[i].name) {
      return gameObjects[i];
    }
  }
}

function getGameObjects() {
  return gameObjects;
}

function handleMouseDown(e) {
  var element = document.getElementById('gallery-button-bar');
  // Set selected image
  for (var iter = 0; iter < gameObjects.length; iter++) {
    if (checkSprite(gameObjects[iter].sprite, e.clientX, e.clientY - element.clientHeight)) {
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
  // Translate the image's x and y components to the page coordinate minus
  // the canvas offset plus half of the width/height (to center on the mouse)
  if (activeObjectIndex >= 0) {
    gameObjects[activeObjectIndex].sprite.X = e.pageX -
      (canvas.offsetLeft + (gameObjects[activeObjectIndex].sprite.width / 2));
    gameObjects[activeObjectIndex].sprite.Y = e.pageY -
      (canvas.offsetTop + (gameObjects[activeObjectIndex].sprite.height / 2));
  }
}

function handleKeyDown(e) {
  // Switch on the key code for the key being held down
  switch (e.which) {
    // Left arrow key
    case 37:
      lastKeyDown = "left";
      break;
    // Up arrow key
    case 38:
      lastKeyDown = "up";
      break;
    // Right arrow key
    case 39:
      lastKeyDown = "right";
      break;
    // Down arrow key
    case 40:
      lastKeyDown = "down";
      break;
    // Any behavior needed for the rest of the key set
    // For snake, we may need to add some more
    default:
  }
}

function getLastKeyDown() {
  return lastKeyDown;
}

// Basically, there is a collision if:
//     right of sprite1 < left of sprite2
//     left of sprite1 > right of sprite2
//     bottom of sprite1 < top of sprite2
//     top of sprite1 > bottom of sprite2
function checkCollision(sprite1, sprite2, array) {
  if (array != undefined) {
    for(var i = 0; i < array.length; i++) {
      if(array[i].x === sprite1 && array[i].y === sprite2) // sprite1 is x, sprite2 is y
      return true;
    } 
    return false;
  } else {
    return !((sprite1.X + sprite1.width) < sprite2.X    ||
    sprite1.X > (sprite2.X + sprite2.width)     ||
   (sprite1.Y + sprite1.height) < sprite2.Y   ||
    sprite1.Y > (sprite2.Y + sprite2.height));
  }
  
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

function update() {
  game.update();
}

function draw() {
  canvas.width = canvas.width;

  UIComponents.getInstance().draw();
  game.draw();

  assets.updateSprites();
  for (var gameObject of gameObjects) {
    gameObject.draw();
  }
}

function clearGame() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  var lastKeyDown = null;
  game = null;
  gameObjects = [];
  clearInterval(gameLoopInterval);
}

function startGame(newGame, gameLoopSpeed) {
  game = newGame;
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

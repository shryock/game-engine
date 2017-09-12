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
var newColor = undefined;

canvas = document.getElementById("gamespace");
context = canvas.getContext('2d');

canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mouseup", handleMouseUp);

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
      context.drawImage(this.sprite.image, this.sprite.X, this.sprite.Y,
                        this.sprite.image.width, this.sprite.image.height);
    }
  };
}

function setNewColor(color) {
  newColor = color;
}

function getGameObject(name) {
  return assets.getAssetByFunction("GameObject", (function(element) {return element.name === name;}));
}

function addSprite(x, y, width, height, src) {
  assets.addSprite(x, y, width, height, src);
}

function addGameObject(name, sprite) {
  var gameObject = new GameObject(name, sprite);
  assets.addAsset("GameObject", gameObject);
  gameObjects.push(gameObject);
}

function addGameObjectWithSprite(name, x, y, width, height, src) {
  assets.addSprite(x, y, width, height, src);
  var gameObjectSprite = assets.getAsset("Sprite", assets.getList("Sprite").length - 1);
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
  // Set selected image
  for (var iter = 0; iter < gameObjects.length; iter++) {
    if (checkSprite(gameObjects[iter].sprite, e.clientX, e.clientY)) {
      game.setActiveObjectIndex(iter);
    }
  }

  // Set the canvas' onmousemove listener to the handleMouseMove function
  canvas.onmousemove = handleMouseMove;
}

function handleMouseUp(e) {
  // Remove the onmousemove listener once the mouse button is released
  canvas.onmousemove = null;
}

function handleMouseMove(e) {
  var activeObjectIndex = game.getActiveObjectIndex();
  // Translate the image's x and y components to the page coordinate minus
  // the canvas offset plus half of the width/height (to center on the mouse)
  if (activeObjectIndex >= 0) {
    gameObjects[activeObjectIndex].sprite.X = e.pageX -
      (canvas.offsetLeft + (gameObjects[activeObjectIndex].sprite.image.width / 2));
    gameObjects[activeObjectIndex].sprite.Y = e.pageY -
      (canvas.offsetTop + (gameObjects[activeObjectIndex].sprite.image.height / 2));
  }
}

// Basically, there is a collision if:
//     right of sprite1 < left of sprite2
//     left of sprite1 > right of sprite2
//     bottom of sprite1 < top of sprite2
//     top of sprite1 > bottom of sprite2
function checkCollision(sprite1, sprite2) {
  return !((sprite1.X + sprite1.image.width) < sprite2.X    ||
            sprite1.X > (sprite2 + sprite2.image.width)     ||
           (sprite1.Y + sprite1.image.height) < sprite2.Y   ||
            sprite1.Y > (sprite2.Y + sprite2.image.height));
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
  var maxX = sprite.X + sprite.image.width;
  var minY = sprite.Y;
  var maxY = sprite.Y + sprite.image.height;
  var mx = x;
  var my = y;
  if (mx >= minX && mx <= maxX && my >= minY && my <= maxY) {
    return true;
  }
  return false;
}

function update() {
  game.update();
}

function draw() {
  canvas.width = canvas.width;

  context.font = "30px Verdana";

  if (newColor != undefined) {
    context.fillText("Created Color: " + newColor, 100, 400);
  }

  context.beginPath();
  context.lineWidth = "6";
  context.strokeStyle = "black";
  context.rect(0, 0, 950, window.innerHeight / 5);
  context.stroke();

  for (var gameObject of gameObjects) {
    gameObject.draw();
  }
}

function startGame(newGame) {
  game = newGame;
  loadContent();
  setInterval(game_loop, 30);
}

function loadContent() {
  assets.newAsset("GameObject", GameObject);
  game.createGame();
}

function game_loop() {
  update();
  draw();
}

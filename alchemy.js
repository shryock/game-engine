/**
 * Alchemy game for CSC481 assignment.
 * Group Members:
 *     Andrew Shryock      (ajshryoc)
 *     Chris Miller        (cjmille7)
 *     Colleen Britt       (cbritt)
 *     John-Michael Caskey (jmcaskey)
 *
 * JSFiddle: https://jsfiddle.net/shryock/1b1vfjhp/
 *
 * JSFiddle's output window is not big enough to display
 * the entire game and results in weird behavior (clicks
 * not being registered to the correct sprite). Please open
 * and run in a full browser window.
 */

// Constants defining the size of the element icons; we want squares
var ELEMENT_WIDTH = 80;
var ELEMENT_HEIGHT = 80;

canvas = document.getElementById("alchemy");
context = canvas.getContext('2d');

var sources = [];
var pictures = [];
var elementToolBox = [];
var recipes = [];
var colors = [];
var newColor = undefined;

var selectedImage = -1;

function Sprite(x, y, width, height, src) {
  this.X = x;
  this.Y = y;
  this.origX = x;
  this.origY = y;
  this.image = new Image();
  this.image.width = width;
  this.image.height = height;
  this.image.src = src;
}

function Element(name, sprite) {
  this.name = name;
  this.sprite = sprite;
  this.resetPosition = function() {
    this.sprite.X = this.sprite.origX;
    this.sprite.Y = this.sprite.origY;
  }
}

function cloneElement(element) {
  return new Element(element.name, element.sprite);
}

function Recipe(input1, input2, output) {
  this.input1 = input1;
  this.input2 = input2;
  this.output = output;
}

var defaultElement;

function loadContent() {
  sources.push("http://i.imgur.com/JNn8XXv.png"); // white
  sources.push("http://i.imgur.com/X1m87mx.png"); // red
  sources.push("http://i.imgur.com/exZ0frA.png"); // yellow
  sources.push("http://i.imgur.com/lxf6ZHo.png"); // blue
  sources.push("http://i.imgur.com/LgcC3zP.png"); // light green
  sources.push("http://i.imgur.com/jyUkk8D.png"); // orange
  sources.push("http://i.imgur.com/v9svHUO.png"); // purple
  sources.push("http://i.imgur.com/vmffEa9.png"); // cyan
  sources.push("http://i.imgur.com/LxzxUEy.png"); // dark green
  sources.push("http://i.imgur.com/oQbdQ1R.png"); // pink
  sources.push("http://i.imgur.com/7fHiPDr.png"); // black
  for (var i = 0; i < sources.length; i++) {
    pictures.push(new Sprite(20 + (ELEMENT_WIDTH * i) + 10, 20, ELEMENT_WIDTH, ELEMENT_HEIGHT, sources[i]));
  }
  var i = 0;
  var white = new Element("white", pictures[i++]);
  var red = new Element("red", pictures[i++]);
  var yellow = new Element("yellow", pictures[i++]);
  var blue = new Element("blue", pictures[i++]);
  var lightGreen = new Element("lightGreen", pictures[i++]);
  var orange = new Element("orange", pictures[i++]);
  var purple = new Element("purple", pictures[i++]);
  var cyan = new Element("cyan", pictures[i++]);
  var darkGreen = new Element("darkGreen", pictures[i++]);
  var pink = new Element("pink", pictures[i++]);
  var black = new Element("black", pictures[i++]);
  
  colors.push("white");
  colors.push("red");
  colors.push("yellow");
  colors.push("blue");
  
  defaultElement = black;
  
  recipes.push(new Recipe(red, yellow, orange));
  recipes.push(new Recipe(red, blue, purple));
  recipes.push(new Recipe(yellow, blue, darkGreen));
  recipes.push(new Recipe(blue, lightGreen, cyan));
  recipes.push(new Recipe(black, lightGreen, darkGreen));
  recipes.push(new Recipe(white, darkGreen, lightGreen));
  recipes.push(new Recipe(white, red, pink));
  recipes.push(new Recipe(white, blue, cyan));
  recipes.push(new Recipe(black, pink, red));
  recipes.push(new Recipe(black, cyan, blue));
  
  
  elementToolBox.push(white);
  elementToolBox.push(red);
  elementToolBox.push(yellow);
  elementToolBox.push(blue);
}

canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mouseup", handleMouseUp);

function handleMouseDown(e) {
  // Set selected image
  for (var iter = 0; iter < elementToolBox.length; iter++) {
    if (checkSprite(elementToolBox[iter].sprite, e.clientX, e.clientY)) {
      selectedImage = iter;
    }
  }

  // Set the canvas' onmousemove listener to the handleMouseMove function
  canvas.onmousemove = handleMouseMove;
}

function handleMouseUp(e) {
  // Remove the onmousemove listener once the mouse button is released
  canvas.onmousemove = null;
  selectedImage = -1;
}

function handleMouseMove(e) {
  // Translate the image's x and y components to the page coordinate minus
  // the canvas offset plus half of the width/height (to center on the mouse)
  if (selectedImage >= 0) {
    elementToolBox[selectedImage].sprite.X = e.pageX -
      (canvas.offsetLeft + (elementToolBox[selectedImage].sprite.image.width / 2));
    elementToolBox[selectedImage].sprite.Y = e.pageY -
      (canvas.offsetTop + (elementToolBox[selectedImage].sprite.image.height / 2));
  }
}

// Function to check if the given element is inside the box
function isInBox(element) {
  return (element.sprite.Y < window.innerHeight / 5);
}

// Basically, there is a collision if:
//     right of sprite1 < left of sprite2
//     left of sprite1 > right of sprite2
//     bottom of sprite1 < top of sprite2
//     top of sprite1 > bottom of sprite2
function checkCollision(sprite1, sprite2) {
  return !((sprite1.X + sprite1.image.width) < sprite2.X ||
    sprite1.X > (sprite2 + sprite2.image.width) ||
    (sprite1.Y + sprite1.image.height) < sprite2.Y ||
    sprite1.Y > (sprite2.Y + sprite2.image.height));
}

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

function getCombination(element1, element2) {
  for (recipe of recipes) {
    if ((recipe.input1.name === element1.name &&
        recipe.input2.name === element2.name) ||
      (recipe.input2.name === element1.name &&
        recipe.input1.name === element2.name)) {
      newColor = recipe.output.name;
      return recipe.output;
    }
  }
  newColor = "black";
  return null;
}

function canCombine(element1, element2) {
  var spritesOutOfBox = !isInBox(element1) && !isInBox(element2);
  var areColliding = checkCollision(element1.sprite, element2.sprite);
  return spritesOutOfBox && areColliding;
}

function update() {
  if (selectedImage >= 0) {
    var firstElement = elementToolBox[selectedImage];
    var secondElement;
    for (var element of elementToolBox) {
      if (checkSprite(element.sprite, firstElement.sprite.X + firstElement.sprite.image.width / 2, firstElement.sprite.Y + firstElement.sprite.image.height / 2) &&
        firstElement.name !== element.name) {
        secondElement = element;
      }
    }

    if (firstElement !== undefined && secondElement !== undefined) {
      if (canCombine(firstElement, secondElement)) {
        var output = getCombination(firstElement, secondElement);
        if (output === null) {
          output = defaultElement;
        }
        elementToolBox.push(output);
        firstElement.resetPosition();
        secondElement.resetPosition();
        selectedImage = -1;
      }
    }
  }
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

  //draw selected outline
  if (selectedImage >= 0) {
    context.beginPath();
    context.lineWidth = "6";
    context.strokeStyle = "red";
    context.rect(elementToolBox[selectedImage].sprite.X,
      elementToolBox[selectedImage].sprite.Y,
      elementToolBox[selectedImage].sprite.image.width,
      elementToolBox[selectedImage].sprite.image.height);
    context.stroke();
  }

  for (var element of elementToolBox) {
    var elementSprite = element.sprite;
    context.drawImage(elementSprite.image, elementSprite.X, elementSprite.Y,
      elementSprite.image.width, elementSprite.image.height);
  }
}

function game_loop() {
  update();
  draw();
}

loadContent();

setInterval(game_loop, 30);

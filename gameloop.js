/*
pong-almost-from-scratch
This is an attempt of making the game pong using modern programming languages

Copyright (C) 2016  Luiz Eduardo Amaral - <luizamaral306@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
"use strict"
// game object
let Game = {
  fps: 60,
  width: 800,
  height: 600
};
// keyboard handler
var Key = {
  _pressed: {},
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,

  isDown: function(keyCode) {return this._pressed[keyCode]},
  onKeydown: function(event) {this._pressed[event.keyCode] = true},
  onKeyup: function(event) {delete this._pressed[event.keyCode]}
};
window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

Game._onEachFrame = (function() {
  if (window.RequestAnimationFrame) {
   return (cb) => {
      let _cb = () => { cb(); window.RequestAnimationFrame(_cb)}
      _cb();
    };
  } else {
    return (cb) => {setInterval(cb, 1000 / Game.fps)}
  }
})();
Game.start = function() {
  Game.canvas = document.createElement("canvas"); // Create canvas
  Game.canvas.setAttribute("id", "game");
  Game.canvas.width = Game.width;
  Game.canvas.height = Game.height;

  document.getElementById("game-frame").appendChild(Game.canvas); // Add canvas to game-frame

  Game.context = Game.canvas.getContext("2d"); // Get canvas context

  Game.player = new Player(50, 50);
  Game.score = new Score(Game.width/2-5.5*gridSize, 5*gridSize, 0, 0);

  Game._onEachFrame(Game.run);
};

Game.run = (function() {
  let loops = 0, skipTicks = 1000 / Game.fps,
      maxFrameSkip = 10,
      nextGameTick = (new Date).getTime(),
      lastGameTick;

  return () => {
    loops = 0;

    while ((new Date).getTime() > nextGameTick) {
      Game.update();
      nextGameTick += skipTicks;
      loops++;
    }

    if (loops) Game.draw();
  }
})();

Game.draw = function() {
  Game.context.clearRect(0, 0, Game.width, Game.height);
  // horizontal lines
  drawLine(gridSize, 3*gridSize, Game.width-gridSize, 3*gridSize)
  drawLine(gridSize, Game.height-4*gridSize, Game.width-gridSize, Game.height-4*gridSize)
  // dashed line
  for (let i=3.5*gridSize; i<Game.height-4*gridSize; i+= 2*gridSize) {drawSquare(Game.width/2-gridSize/2, i)}
  // draw score
  Game.score.draw(Game.context);
  // Game.player.draw(Game.context);
};

Game.update = function() {
  Game.player.update();
};

class baseSprite {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  draw() {}
  update() {}
}

class Score extends baseSprite {
  constructor(x, y, p1, p2) {
    super(x, y);
    this.p1 = p1;
    this.p2 = p2;
  }
  draw() {
    let offset = (""+this.p1).split("").length - 1;
    writeText(this.x-(4*gridSize*offset), this.y, this.p1+" "+this.p2)
  }
}

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

Player.prototype.draw = function() {
  Game.context.fillStyle = "#FFF";
  Game.context.fillRect(this.x, this.y, 32, 32);
};

Player.prototype.moveLeft = function() {
  this.x -= 1;
};

Player.prototype.moveRight = function() {
  this.x += 1;
};

Player.prototype.moveUp = function() {
  this.y -= 1;
};

Player.prototype.moveDown = function() {
  this.y += 1;
};

Player.prototype.update = function() {
  if (Key.isDown(Key.UP)) this.moveUp();
  if (Key.isDown(Key.LEFT)) this.moveLeft();
  if (Key.isDown(Key.DOWN)) this.moveDown();
  if (Key.isDown(Key.RIGHT)) this.moveRight();
};

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

  // add sprites
  Game.player1 = new Paddle(2*gridSize, (Game.height-8*gridSize)/2, paddleLength, 87, 83, 4*gridSize, Game.height-4*gridSize);
  Game.player2 = new Paddle(Game.width-3*gridSize, (Game.height-8*gridSize)/2, paddleLength, 38, 40, 4*gridSize, Game.height-4*gridSize);
  Game.score = new Score(Game.width/2-5.5*gridSize, 5*gridSize, 0, 0);
  Game.spawnBall();

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
  for (let i=3.5*gridSize; i<Game.height-4*gridSize; i+= 2*gridSize) {
    drawSquare(Game.width/2-gridSize/2, i)
  }
  // draw score
  Game.score.draw();
  Game.ball.draw();
  Game.player1.draw();
  Game.player2.draw();
};

Game.update = function() {
  Game.ball.update();
  Game.player1.update();
  Game.player2.update();
  // collision ball-paddles
  if (Game.ball.x <= 3*gridSize && Game.ball.y+gridSize >= Game.player1.y && Game.ball.y <= Game.player1.y+paddleLength) {
    let dy = (Game.ball.y-Game.player1.y+gridSize/2-paddleLength/2)/(paddleLength+2*gridSize)
    let angle = dy*Math.PI;
    Game.ball.direction = angle;
    Game.ball.speed +=0.5;
  } else if (Game.ball.x >= Game.width-4*gridSize && Game.ball.y+gridSize >= Game.player2.y && Game.ball.y <= Game.player2.y+paddleLength) {
    let dy = (Game.ball.y-Game.player2.y+gridSize/2-paddleLength/2)/(paddleLength+2*gridSize)
    let angle = (1-dy)*Math.PI;
    Game.ball.direction = angle;
    Game.ball.speed +=0.5;
  }
  // point score and respawn
  if (Game.ball.x >= Game.width-2*gridSize) {
    Game.score.p1 += 1;
    Game.spawnBall("player2");
  }
  else if (Game.ball.x <= 2*gridSize) {
    Game.score.p2 += 1;
    Game.spawnBall("player1")
  }
};

Game.spawnBall = function(side) {
  let angle;
  if (side === "player1") {
    angle = (1+(Math.random()*1.6-0.8))*Math.PI/2;
  } else if (side === "player2") {
    angle = (Math.random()*1.6-0.8)*Math.PI/2;
  } else {
    angle = ((Math.random()>=0.5)+(Math.random()*1.6-0.8))*Math.PI/2;
  }
  let center = Game.width/2-gridSize/2;
  let randomHeight = Math.random()*(Game.height-8*gridSize)+4*gridSize
  Game.ball = new Ball(center, randomHeight, ballSpeed, angle, 4*gridSize, Game.height-5*gridSize);
}

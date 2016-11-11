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
"use strict";

const VERSION = "v1.1";
// keyboard handler
let Key = {
  _pressed: {},
  _single: {},
  isDown: function(keyCode) {return this._pressed[keyCode]},
  onKeydown: function(event) {this._pressed[event.keyCode] = true},
  onKeyup: function(event) {delete this._pressed[event.keyCode]},
};
window.addEventListener('keyup', (event) => { Key.onKeyup(event) }, false);
window.addEventListener("keydown", (event) => {
  Key.onKeydown(event);
  if([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1) {event.preventDefault()}
}, false);

// Game object
let Game = {
  fps: 60,
  width: 804,
  height: 600
};

// sound assets URL
let blip1URL = "assets/4391__noisecollector__pongblipf-5.wav";
let blip2URL = "assets/4390__noisecollector__pongblipf-4.wav";
let blip3URL = "assets/333785__projectsu012__8-bit-failure-sound.wav";
let blip4URL = "assets/275896__n-audioman__coin02.wav";

// Game states
let startScreen = {}
let enemyScreen = {}
let versusScreen = {}
let creditsScreen = {}
let gameoverScreen = {}
let roundsScreen = {}

let gameMode = "versus";
let difficultyArr = ["n00b", "medium", "unfair"];
let difficulty = difficultyArr[1];
let winner = false;
let rounds = 5;

// sound factory
function soundFactory(audio, start, stop) {
    return () => {audio.play();
      setTimeout(()=>{
        audio.pause();
        audio.currentTime = start;
      }, stop);}
}

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

// Game methods
Game.start = function() {
  Game.canvas = document.createElement("canvas"); // Create canvas
  Game.canvas.setAttribute("id", "game");
  Game.canvas.width = Game.width;
  Game.canvas.height = Game.height;

  // add sounds
  Game.blip1Sound = new Audio(blip1URL);
  Game.blip2Sound = new Audio(blip2URL);
  Game.blip3Sound = new Audio(blip3URL);
  Game.blip4Sound = new Audio(blip4URL);
  Game.blip1 = soundFactory(Game.blip1Sound, 100, 100);
  Game.blip2 = soundFactory(Game.blip2Sound, 100, 100);
  Game.blip3 = soundFactory(Game.blip3Sound, 0, 200);
  Game.blip4 = soundFactory(Game.blip4Sound, 0, 200);

  document.getElementById("game-frame").appendChild(Game.canvas); // Add canvas to game-frame

  Game.context = Game.canvas.getContext("2d"); // Get canvas
  Game.context.shadowOffsetX = 0;
  Game.context.shadowOffsetY = 0;
  Game.context.shadowBlur = 5;
  Game.changeState(startScreen)
  Game._onEachFrame(Game.run);
};

Game.changeState = function(screen) {
  Game.keyTimeout = Date.now() + 200;
  screen.init();
  Game.draw = screen.draw;
  Game.update = screen.update;
}

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

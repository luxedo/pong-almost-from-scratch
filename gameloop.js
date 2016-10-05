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
// keyboard handler
var Key = {
  _pressed: {},
  isDown: function(keyCode) {return this._pressed[keyCode]},
  onKeydown: function(event) {this._pressed[event.keyCode] = true},
  onKeyup: function(event) {delete this._pressed[event.keyCode]}
};
window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

// Game object
let Game = {
  fps: 60,
  width: 800,
  height: 600
};
let blip1URL = "https://www.freesound.org/people/NoiseCollector/sounds/4391/download/4391__noisecollector__pongblipf-5.wav";
let blip2URL = "https://www.freesound.org/people/NoiseCollector/sounds/4390/download/4390__noisecollector__pongblipf-4.wav";
let blip3URL = "https://www.freesound.org/people/ProjectsU012/sounds/333785/download/333785__projectsu012__8-bit-failure-sound.wav";
let blip4URL = "https://www.freesound.org/people/n_audioman/sounds/275896/download/275896__n-audioman__coin02.wav";

// Game states
let startScreen = {}
let enemyScreen = {}
let versusScreen = {}
let creditsScreen = {}

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
  Game.blip1 = () => {
    Game.blip1Sound.play();
    setTimeout(()=>{
      Game.blip1Sound.pause();
      Game.blip1Sound.currentTime = 100;
    }, 100);
  }
  Game.blip2 = () => {
    Game.blip2Sound.play();
    setTimeout(()=>{
      Game.blip2Sound.pause();
      Game.blip2Sound.currentTime = 100;
    }, 100);
  }
  Game.blip3 = () => {
    Game.blip3Sound.play();
    setTimeout(()=>{
      Game.blip3Sound.pause();
      Game.blip3Sound.currentTime = 0;
    }, 200);
  }
  Game.blip4 = () => {
    Game.blip4Sound.play();
    setTimeout(()=>{
      Game.blip4Sound.pause();
      Game.blip4Sound.currentTime = -200;
    }, 200);
  }

  document.getElementById("game-frame").appendChild(Game.canvas); // Add canvas to game-frame

  Game.context = Game.canvas.getContext("2d"); // Get canvas context
  Game.changeState(startScreen)
  Game._onEachFrame(Game.run);
};

Game.changeState = function(screen) {
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

// main game screen
versusScreen.init = function() {
  Game.player1 = new Paddle(2*gridSize, (Game.height-8*gridSize)/2, paddleLength, 87, 83, 4*gridSize, Game.height-4*gridSize);
  Game.player2 = new Paddle(Game.width-3*gridSize, (Game.height-8*gridSize)/2, paddleLength, 38, 40, 4*gridSize, Game.height-4*gridSize);
  Game.score = new Score(Game.width/2-5.5*gridSize, 5*gridSize, 0, 0);
  versusScreen.spawnBall();
}
versusScreen.draw = function() {
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
versusScreen.update = function() {
  if (Key.isDown(27)) {
    Game.changeState(startScreen)
    Game.blip4();
  };
  Game.ball.update();
  Game.player1.update();
  Game.player2.update();

  // ball-paddles collision
  if (Game.ball.x <= 3*gridSize && Game.ball.y+gridSize >= Game.player1.y && Game.ball.y <= Game.player1.y+paddleLength) {
    let dy = (Game.ball.y-Game.player1.y+gridSize/2-paddleLength/2)/(paddleLength+2*gridSize)
    let angle = dy*Math.PI;
    Game.ball.direction = angle;
    Game.ball.speed +=0.5;
    Game.blip2()
  } else if (Game.ball.x >= Game.width-4*gridSize && Game.ball.y+gridSize >= Game.player2.y && Game.ball.y <= Game.player2.y+paddleLength) {
    let dy = (Game.ball.y-Game.player2.y+gridSize/2-paddleLength/2)/(paddleLength+2*gridSize)
    let angle = (1-dy)*Math.PI;
    Game.ball.direction = angle;
    Game.ball.speed +=0.5;
    Game.blip2()
  }

  // score and respawn
  if (Game.ball.x >= Game.width-2*gridSize) {
    Game.score.p1 += 1;
    versusScreen.spawnBall("player2");
    Game.blip3();
  }
  else if (Game.ball.x <= 2*gridSize) {
    Game.score.p2 += 1;
    versusScreen.spawnBall("player1")
    Game.blip3();
  }
};
versusScreen.spawnBall = function(side) {
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
  Game.ball = new Ball(center, randomHeight, 0, angle, 4*gridSize, Game.height-5*gridSize);
  setTimeout(() => Game.ball.speed = ballSpeed, 500)
}

// start screen
startScreen.init = function() {
  let cursorWidth = gridSize*20;
  let cursorHeight = gridSize*4;
  let cursorThickness = 5;
  let positions = [
    [(Game.width-cursorWidth-2*cursorThickness)/2, gridSize*23.5],
    [(Game.width-cursorWidth-2*cursorThickness)/2, gridSize*28.5],
    [(Game.width-cursorWidth-2*cursorThickness)/2, gridSize*33.5]
  ]
  startScreen.cursor = new Cursor(cursorWidth, cursorHeight, positions, cursorThickness)
}

startScreen.draw = function() {
  Game.context.clearRect(0, 0, Game.width, Game.height);
  let t1 = "PONG ALMOST";
  let t2 = "FROM SCRATCH";
  let o1 = "1P START";
  let o2 = "2P START";
  let o3 = "CREDITS";
  let b1 = "ENTER - GO                       ESC - GO BACK"
  let b2 = "PLAYER1 - W/S                PLAYER2 - UP/DOWN"
  let menuSize = 5;
  let hintSize = 3;
  writeText((Game.width-t1.length*4*gridSize)/2, gridSize*5, t1);
  writeText((Game.width-t2.length*4*gridSize)/2, gridSize*12, t2);
  writeText((Game.width-o1.length*4*menuSize)/2, gridSize*25, o1, menuSize);
  writeText((Game.width-o2.length*4*menuSize)/2, gridSize*30, o2, menuSize);
  writeText((Game.width-o3.length*4*menuSize)/2, gridSize*35, o3, menuSize);
  writeText((Game.width-b1.length*4*hintSize)/2, Game.height-gridSize*7, b1, hintSize);
  writeText((Game.width-b2.length*4*hintSize)/2, Game.height-gridSize*5, b2, hintSize);
  startScreen.cursor.draw();
}

startScreen.update = function() {
  startScreen.cursor.update()
  if (Key.isDown(13)) {
    Game.blip4();
    if (startScreen.cursor.current === 0) Game.changeState(enemyScreen);
    else if (startScreen.cursor.current === 1) Game.changeState(versusScreen);
    else if (startScreen.cursor.current === 2) Game.changeState(creditsScreen);
  }
}

// credits screen
creditsScreen.init = () => {
  Game.context.clearRect(0, 0, Game.width, Game.height);
  let t1 = "PONG ALMOST FROM SCRATCH"
  let m1 = "This is an attempt of making the game pong using modern";
  let m2 = "programming languages. The AI enemy is vicious!"
  let m3 = "You can find more information about the project in it's";
  let m4 = "github page:";
  let m5 = "https://github.com/ArmlessJohn404/pong-almost-from-scratch"
  let m6 = "Thanks to noisecollector, projectsu012 and n-audioman for"
  let m7 = "the sounds."
  let b1 = "Copyright (C) 2016  Luiz Eduardo Amaral"
  let b2 = "<luizamaral306(at)gmail.com>"
  let b3 = "This software is under a GNU GPL3 license. Have fun! :)"
  let creditsTitleSize = 5;
  let creditsSize = 3;
  writeText(50, gridSize*5, t1, creditsTitleSize);
  writeText(50, gridSize*5+creditsTitleSize*21, m1, creditsSize);
  writeText(50, gridSize*5+creditsTitleSize*21+creditsSize*7, m2, creditsSize);
  writeText(50, gridSize*5+creditsTitleSize*21+creditsSize*21, m3, creditsSize);
  writeText(50, gridSize*5+creditsTitleSize*21+creditsSize*28, m4, creditsSize);
  writeText(50, gridSize*5+creditsTitleSize*21+creditsSize*42, m5, creditsSize);
  writeText(50, gridSize*5+creditsTitleSize*21+creditsSize*56, m6, creditsSize);
  writeText(50, gridSize*5+creditsTitleSize*21+creditsSize*63, m7, creditsSize);
  writeText(50, Game.height-(gridSize*5+creditsSize*21), b1, creditsSize);
  writeText(50, Game.height-(gridSize*5+creditsSize*14), b2, creditsSize);
  writeText(50, Game.height-(gridSize*5+creditsSize*7), b3, creditsSize);
}

creditsScreen.update = () => {if (Key.isDown(27)) {
  Game.blip4();
  Game.changeState(startScreen);
}}
creditsScreen.draw = () => {}

// enemy screen
enemyScreen.init = () => {
  versusScreen.init()
  Game.player2.keyUp = undefined;
  Game.player2.keyDown = undefined;
};
enemyScreen.draw = versusScreen.draw;
enemyScreen.update = () => {
  let centerDelta = Game.ball.y+gridSize/2 - Game.player2.y - paddleLength/2
  if (Math.abs(centerDelta) > 10) {
    Game.player2.y += paddleStep*(centerDelta>0?1:-1);
  } else {
    Game.player2.y += centerDelta;
  }
  versusScreen.update()
};

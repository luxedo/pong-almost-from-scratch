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
// Globals
let gridSize = 12;
let Game = {
  fps: 60,
  width: 800,
  height: 600
};

// Functions
function drawSquare(x, y, color="#FFF") {
  Game.context.fillStyle = color;
  Game.context.fillRect(x, y, gridSize, gridSize);
}

function drawMatrix(matrix, x, y) {
  matrix.forEach((row, index0) => {
    row.forEach((value, index1) => {
      if (value === 1) {
        let xf = x + index1*gridSize, yf = y+index0*gridSize;
        drawSquare(xf, yf);
      }
    });
  });
}

function writeText(text, x, y) {
  text
    .split("")
    .forEach((letter, index) =>
      drawMatrix(alphabeth[letter.toUpperCase()], x+(index*4*gridSize), y))
}

function drawLine(x0, y0, x1, y1) {
  let length = Math.sqrt(Math.pow(x1-x0, 2)+Math.pow(y1-y0, 2));
  let sin = (y1-y0)/length
  let cos = (x1-x0)/length
  for (let i=0; i<length; i+=gridSize){
    drawSquare(x0+cos*i, y0+sin*i)
  }
}

function startGame() {
  Game.canvas = document.createElement("canvas"); // Create canvas
  Game.canvas.setAttribute("id", "game");
  Game.canvas.width = Game.width;
  Game.canvas.height = Game.height;

  document.getElementById("game-frame").appendChild(Game.canvas); // Add canvas to game-frame

  Game.context = Game.canvas.getContext("2d"); // Get canvas context

  writeText("hello world!", 50, 50)
  writeText("abcdefghijklm", 50, 120)
  writeText("nopqrstuvyxwz", 50, 190)
  writeText("1234567890", 50, 260)
  writeText("! .,'_-+/*=?()", 50, 330)
  drawLine(50, 400, 750, 400)
  drawLine(50, 400, 50, 550)
  drawLine(50, 400, 750, 550)
}


// Classes

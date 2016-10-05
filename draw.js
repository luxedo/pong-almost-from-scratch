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
// Globals
let gridSize = 12;
let paddleStep = 10;
let paddleLength = 8*gridSize;
let ballSpeed = 10;
let marginSize = 3*gridSize;
let letterSpacing = 4*gridSize;

// Functions
function drawSquare(x, y, size=gridSize, color="#FFF") {
  Game.context.fillStyle = color;
  Game.context.fillRect(x, y, size, size);
}

function drawMatrix(x, y, matrix, size=gridSize, color="#FFF") {
  matrix.forEach((row, index0) => {
    row.forEach((value, index1) => {
      if (value === 1) {drawSquare(x + index1*size, y+index0*size, size, color)}
    });
  });
}

function writeText(x, y, text, size=gridSize, color="#FFF") {
  text
    .split("")
    .forEach((letter, index) => {
      drawMatrix(x+(index*4*size), y, alphabeth[letter.toUpperCase()], size, color)})
}

function drawLine(x0, y0, x1, y1, size=gridSize, color="#FFF") {
  let length = Math.sqrt(Math.pow(x1-x0, 2)+Math.pow(y1-y0, 2));
  let sin = (y1-y0)/length
  let cos = (x1-x0)/length
  for (let i=0; i<=length; i+=size){
    drawSquare(x0+cos*i, y0+sin*i, size, color)
  }
}

// Classes
class BaseSprite {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  draw() {}
  update() {}
}

class Score extends BaseSprite {
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

class Paddle extends BaseSprite {
  constructor(x, y, size, keyUp, keyDown, top, bottom) {
    super(x, y);
    this.size = size;
    this.keyUp = keyUp;
    this.keyDown = keyDown;
    this.top = top;
    this.bottom = bottom;
  }
  draw() {
    drawLine(this.x, this.y, this.x, this.y+this.size)
  }
  update() {
    if (Key.isDown(this.keyUp)) this.y -= paddleStep;
    if (Key.isDown(this.keyDown)) this.y += paddleStep;
    if (this.y <= this.top) this.y = this.top;
    else if (this.y+this.size >= this.bottom) this.y = this.bottom-this.size;
  }
}

class Ball extends BaseSprite {
  constructor(x, y, speed, direction, top, bottom) {
    super(x, y);
    this.speed = speed
    this.direction = direction
    this.top = top;
    this.bottom = bottom;
  }
  draw() {
    drawSquare(this.x, this.y)
  }
  update() {
    this.x += this.speed*Math.cos(this.direction)
    this.y += this.speed*Math.sin(this.direction)
    if (this.y >= this.bottom || this.y <= this.top) {
      this.direction *= -1
      this.x += this.speed*Math.cos(this.direction)
      this.y += this.speed*Math.sin(this.direction)
      Game.blip1()
    }
  }
}

class Cursor {
  constructor(w, h, positions, size=gridSize, color="#FFF") {
    this.w = w;
    this.h = h;
    this.size = size;
    this.color = color;
    this.positions = positions;
    this.current = 0;
    this.timeout = Date.now()+200
  }
  draw() {
    let x = this.positions[this.current][0];
    let y = this.positions[this.current][1];
    drawLine(x, y, x+this.w, y, this.size, this.color);
    drawLine(x, y, x, y+this.h, this.size, this.color);
    drawLine(x+this.w, y+this.h, x, y+this.h, this.size, this.color);
    drawLine(x+this.w, y+this.h, x+this.w, y, this.size, this.color);
  }
  update() {
    if (Date.now()>this.timeout) {
      if (Key.isDown(38) || Key.isDown(87)) {
        this.current-=1
        this.timeout = Date.now()+200
        Game.blip1();
      };
      if (Key.isDown(40) || Key.isDown(83)) {
        this.current+=1
        this.timeout = Date.now()+200
        Game.blip2();
      };
      if (this.current >= this.positions.length) this.current = 0;
      if (this.current < 0) this.current = this.positions.length-1;
    }
  }
}

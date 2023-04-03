// Setting up Canvas //
const canvas = document.getElementById("canvas"); // calls the ID and gives it a variable
canvas.width = 200; // in pixels
canvas.height = window.innerHeight; // height is according to browser size

// Get 2D Context //
/*  <canvas> element does not provide drawing capabilities. 
    getContext() is a method that returns a 2D rendering context for the specified canvas element.  
    once 2D context is obtained, we can use various methods and properties to draw shapes, text and images on the canvas. */
const ctx = canvas.getContext("2d");

// Creating Cars //
class Car {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  draw(ctx) {
    ctx.beginPath(); // clears any existing path and begins a new path. a path is a sequence of points that is used to define a shape or a line.
    ctx.rect(
      // used to define a rectangle path. takes in 4 arguments (x, y, width, height). this method does not draw, it only defines.
      this.x - this.width / 2, // x will be located at the center of the drawing
      this.y - this.width / 2, // y will be located at the center of the drawing
      this.width,
      this.height
    );
    ctx.fill(); // this methods fills the current path with color
  }
}

const car = new Car(100, 300, 30, 50); // new Car object (pos X, pos Y, width, height)
car.draw(ctx);

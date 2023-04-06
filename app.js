// Setting up Canvas //
const canvas = document.getElementById("canvas"); // calls the ID and gives it a variable
canvas.width = 200; // in pixels
canvas.height = window.innerHeight; // height is set according to browser size (this code will be shifted to the animation function)

// Get 2D Context //
/*  <canvas> element does not provide drawing capabilities. 
    getContext() is a method that returns a 2D rendering context for the specified canvas element.  
    once 2D context is obtained, we can use various methods and properties to draw shapes, text and images on the canvas. */
const ctx = canvas.getContext("2d");

// Assigning Controls //
class Controls {
  // constructor parameters left empty as there is no initial value or data to be passed in. proceed straight to functions for execution.
  constructor() {
    this.forward = false;
    this.backward = false;
    this.left = false;
    this.right = false;
    // in default state, none of the controls are active because all are set to "false".

    this.#arrowKeyListeners(); // creates a private "#" method defined as arrowKeyListeners. private methods cannot be accessed outside of the class.
  }

  // an event listener waits for user interaction like a click or keypress and run codes based on that action
  #arrowKeyListeners() {
    document.onkeydown = (event) => {
      // `onkeydown` is an event listener. `(event) => {}` means that a function will be executed when an event occurs.
      switch (event.key) {
        /* `switch` is a control statement that evaluates an expression `(event.key)` and executes a block of code (case) depending on the value 
        of the expression. it will search through each `case` for a match and executes the block of code. 
        
        `event.key` is a property of `KeyboardEvent` object.
        when the Up key is pressed, it becomes `switch (ArrowUp)`. switch will look for a case containing the same `KeyboardEvent` and executes the code block. */
        case "ArrowUp":
          this.forward = true;
          break;
        case "ArrowDown": // `case` specifies the possible value of expression being evaluated. "ArrowDown" is a `case` label. the colon `:` separates `case` label from codes
          this.backward = true;
          break; // terminates the execution of the `switch` statement code block and also marks the end of the code within `case` block.
        case "ArrowLeft":
          this.left = true;
          break;
        case "ArrowRight":
          this.right = true;
          break;
      }
      console.table(this); // a method that logs an array or object in a table format. it takes object as argument and display its properties and values in a tabular form.
    };

    document.onkeyup = (event) => {
      // `onkeyup` is when the user stops pressing a key. when the `event` happens, it triggers the following callback function.
      // when using `(event) => {}`, the `this` would refer to the constructor `this`. when using `function(event) {}`, `this` would only refer to within its own {}.
      switch (event.key) {
        case "ArrowUp":
          this.forward = false;
          break;
        case "ArrowDown":
          this.backward = false;
          break;
        case "ArrowLeft":
          this.left = false;
          break;
        case "ArrowRight":
          this.right = false;
          break;
      }
      console.table(this);
    };
  }
}

// Creating Cars //
class Car {
  // 4 parameters which is required to create a rectangle path.
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    // "this" keyword refers to the instance being created and set its properties. e.g. new Car (100, 100, 30, 50)

    this.controls = new Controls(); // creating a new Controls object and assigning it to "controls" property.
  }

  updateMovement() {
    // an object method that updates the car movements.
    if (this.controls.forward) {
      // refers to `this.controls` in line 83 which refers to `this.forward` in the Controls class.
      this.y -= 2;
    }
    if (this.controls.backward) {
      this.y += 2;
    }
  }

  drawRaceCar(ctx) {
    // an object method that draws and colors the car.
    ctx.beginPath(); // clears any existing path and begins a new path. a path is a sequence of points that is used to define a shape or a line.
    ctx.rect(
      // .rect() used to define a rectangle path. takes in 4 arguments (x, y, width, height). this method does not draw, it only defines.
      this.x - this.width / 2, // x will be located at the center of the drawing
      this.y - this.width / 2, // y will be located at the center of the drawing
      this.width,
      this.height
    );
    ctx.fill(); // this methods fills the current path with color
  }
}

function redrawCanvas() {
  canvas.height = window.innerHeight; // reassigns the window height so that users are able to adjust their window size
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clears the canvas
  raceCar.drawRaceCar(ctx); // redraw the canvas with the updated state of your program
}

// Creating a function that creates an animation loop //
function animate() {
  // animate() is not a built-in function. it's a common description for a function to create animation on canvas
  raceCar.updateMovement(); // invoking updateMovement() in Car class
  raceCar.drawRaceCar(ctx); // invoking draw (based on 2D context) for the raceCar (drawRaceCar() in Car Class)
  redrawCanvas(); // a shortcut method is just to write `canvas.height = window.innerHeight`. it works the same.
  requestAnimationFrame(animate);
}

// Creating the Player's Race Car //
const raceCar = new Car(100, 300, 30, 50); // creating a new Car object (pos X, pos Y, width, height)
animate();

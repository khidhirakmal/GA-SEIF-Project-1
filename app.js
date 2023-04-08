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
      //   console.table(this); // a method that logs an array or object in a table format. it takes object as argument and display its properties and values in a tabular form.
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
      //   console.table(this); // removing console.table(this) this is useful for debugging but better to clean up
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

    this.speed = 0;
    this.acceleration = 0.2;
    this.maxSpeed = 4;
    this.friction = 0.05;

    this.controls = new Controls(); // creating a new Controls object and assigning it to "controls" property.
  }

  updateMovement() {
    // an object method that updates the car movements.
    if (this.controls.forward) {
      // refers to `this.controls` in line 83 which refers to `this.forward` in the Controls class.
      // this.y -= 2;
      this.speed += this.acceleration; // speed increases by 0.2
    }
    if (this.controls.backward) {
      // this.y += 2;
      this.speed -= this.acceleration;
    }

    // Capping the max speed for forward and reverse movement
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2; // negative sign is important to indicate that the car is reversing
      /* this.y = this.y - (-1.5)
         this.y = 0 + 1.5
         this.y = 1.5 (positive Y value, means car is reversing at a cap of 1.5 pixels)
       */
    }

    // Applying friction to stop the car
    if (this.speed > 0) {
      this.speed -= this.friction;
    }
    if (this.speed < 0) {
      this.speed += this.friction;
    }
    // Refining friction values to prevent micro movements
    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }

    // Creating left and right movements
    if (this.controls.left) {
      // negative X value will shift animation to the left
      this.x -= 2;
    }
    if (this.controls.right) {
      // positive X value will shift animation to the right
      this.x += 2;
    }

    // Making the car move
    this.y -= this.speed; // for the car to move forward, it will be going against Y axis. therefore it has to be in negative value. things are inverted in this method.
  }

  draw(ctx) {
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

// Creating the Player's Race Car //
const raceCar = new Car(100, 300, 30, 50); // creating a new Car object (pos X, pos Y, width, height)

// Creating a Road Class //
class Road {
  constructor(x, width) {
    this.x = x; // road centered within X value
    this.width = width;
    this.laneCount = 3; // assiging a default value of 3

    this.left = x - width / 2;
    this.right = x + width / 2;

    // Endless Road
    const infinity = 1000000; // we are not using infinity javascript
    this.top = -infinity; // going against Y-axis
    this.bottom = infinity; // going along Y-axis
  }

  // Drawing the road
  draw(ctx) {
    ctx.lineWidth = 4;
    ctx.strokeStyle = "white";

    for (let i = 0; i <= this.laneCount; i++) {
      const x = lerp(
        // linear interpolation
        this.left,
        this.right,
        i / this.laneCount
      );
      // Creating road shoulders and lanes //
      if (i > 0 && i < this.laneCount) {
        ctx.setLineDash([20, 20]); // method to set line dash pattern. takes an array of values as argument. even indices specifices length of solid segments. odd indices specifies length of transparent segments.
      } else {
        ctx.setLineDash([]); // empty arguments = solid line
      }
      ctx.beginPath(); // clears any existing path and begins a new path. a path is a sequence of points that is used to define a shape or a line.
      ctx.moveTo(x, this.top);
      ctx.lineTo(x, this.bottom);
      ctx.stroke();
    }
  }

  // Creating road shoulders //
  // ctx.beginPath(); // clears any existing path and begins a new path. a path is a sequence of points that is used to define a shape or a line.
  // ctx.moveTo(this.left, this.top);
  // ctx.lineTo(this.left, this.bottom);
  // ctx.stroke();

  // ctx.beginPath(); // clears any existing path and begins a new path. a path is a sequence of points that is used to define a shape or a line.
  // ctx.moveTo(this.right, this.top);
  // ctx.lineTo(this.right, this.bottom);
  // ctx.stroke();
}

// Linear Interpolation //
function lerp(A, B, t) {
  return A + (B - A) * t;
}

// Creating the Road
const road = new Road(canvas.width / 2, canvas.width * 0.9);

// Creating a function that creates an animation loop (Part 1) //
function redrawCanvas() {
  canvas.height = window.innerHeight; // reassigns the window height so that users are able to adjust their window size
  ctx.clearRect(0, 0, canvas.width / 2, canvas.height); // clears the canvas
  raceCar.draw(ctx); // redraw the canvas with the updated state of your program
}
// Creating a function that creates an animation loop (Part 2) //
function animate() {
  // animate() is not a built-in function. it's a common description for a function to create animation on canvas
  raceCar.updateMovement(); // invoking updateMovement() in Car class

  redrawCanvas(); // a shortcut method is just to write `canvas.height = window.innerHeight`. it works the same.
  road.draw(ctx); // invokes draw for Road before the raceCar gets drawn
  raceCar.draw(ctx); // invoking draw (based on 2D context) for the raceCar (draw() in Car Class)
  requestAnimationFrame(animate); // a method provided by browsers that schedules a function to run before the next repaint of the browser window. it takes a single argument.
  /* In the context of a canvas animation, requestAnimationFrame() is typically used to schedule a function to update the 
  canvas state and render the next frame of the animation. This function can include calculations to update the position 
  or appearance of objects on the canvas, and then call the appropriate methods to draw those objects on the canvas.*/
}

// Calling animate function //
animate();

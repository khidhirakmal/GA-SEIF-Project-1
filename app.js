// Setting up Canvas //
const canvas = document.getElementById("canvas"); // calls the ID and gives it a variable
canvas.width = 200; // in pixels
canvas.height = window.innerHeight; // height is set according to browser size (this code will be shifted to the animation function)

// Get 2D Context //
/*  <canvas> element does not provide drawing capabilities. 
    getContext() is a method that returns a 2D rendering context for the specified canvas element.  
    once 2D context is obtained, we can use various methods and properties to draw shapes, text and images on the canvas. */
const ctx = canvas.getContext("2d");

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

    // Borders
    const topLeft = { x: this.left, y: this.top };
    const topRight = { x: this.right, y: this.top };
    const bottomLeft = { x: this.left, y: this.bottom };
    const bottomRight = { x: this.right, y: this.bottom };
    // Array for borders
    this.borders = [
      [topLeft, bottomLeft],
      [topRight, bottomRight],
    ];
  }

  // Drawing the road //
  draw(ctx) {
    ctx.lineWidth = 4;
    ctx.strokeStyle = "white";
    // Creating road lanes
    for (let i = 1; i <= this.laneCount - 1; i++) {
      const x = lerp(this.left, this.right, i / this.laneCount); // refer to line 158, linear interpolation

      ctx.setLineDash([20, 20]); // takes an array of values as arguments. even indices specifies length of solid segments. odd indices specifies length of transparent segments.
      ctx.beginPath(); // clears existing path and creates new path.
      ctx.moveTo(x, this.top);
      ctx.lineTo(x, this.bottom);
      ctx.stroke();
    }

    // Creating road shoulders
    ctx.setLineDash([]); // empty arguments = solid line
    this.borders.forEach((border) => {
      ctx.beginPath(); // clears existing path and creates new path.
      ctx.moveTo(border[0].x, border[0].y);
      ctx.lineTo(border[1].x, border[1].y);
      ctx.stroke();
    });
  }
}

// Creating the Road //
const road = new Road(canvas.width / 2, canvas.width * 0.9);

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

// Poly Intersection and Damage Detection
function polysIntersect(poly1, poly2) {
  for (let i = 0; i < poly1.length; i++) {
    for (let j = 0; j < poly2.length; j++) {
      const touch = getIntersection(poly1[i], poly1[(i + 1) % poly1.length], poly2[j], poly2[(j + 1) % poly2.length]);
      if (touch) {
        return true;
      }
    }
  }
  return false;
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
    this.maxSpeed = 5;
    this.friction = 0.05;
    this.damaged = false;

    this.controls = new Controls(); // creating a new Controls object and assigning it to "controls" property.
    this.polygon = this.createPolygon();
  }

  // Car Movements //
  movements() {
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
    // Object method that draws and colors the car.
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

// Creating a function that creates an animation loop //
function animate() {
  // animate() is not a built-in function. it's a common description for a function to create animation on canvas
  raceCar.movements(); // invoking movements() in Car class

  canvas.height = window.innerHeight; // reassigns canvas.height during animate call, it will refresh everything

  // Overhead camera //
  ctx.save(); // saves the current state of the canvas context, including transformations, styles, and other properties so that they can be restored later using `ctx.restore()`.
  /* at this point, it saves the state of the canvas where the car was assigned to be located in the middle of the road. means that it will be the origin point when using translate(). 
     thus, if it was `translate(0,0)`, the car will still be in the middle of the road and canvas.*/
  ctx.translate(0, -raceCar.y + canvas.height * 0.8); // takes 2 arguments, horizontal and vertical distances.
  //   `-raceCar.y` assigns the car to be at the of the window. canvas.height * 0.8 assigns the car to be at 80% height at any window size.

  /* ctx.translate() is a method that moves the origin point (0,0) of the canvas context (in this case the raceCar) to a new location. 
     The code translates the canvas context (raceCar) by the distance equal to raceCar.y pixels in the upward direction. This means 
     that all subsequent drawing operations will be shifted vertically by that amount.*/

  // Drawing road and car //
  road.draw(ctx); // invokes draw for Road before the raceCar gets drawn
  raceCar.draw(ctx); // invoking draw (based on 2D context) for the raceCar (draw() in Car Class)
  requestAnimationFrame(animate); // a method provided by browsers that schedules a function to run before the next repaint of the browser window. it takes a single argument.
  /* In the context of a canvas animation, requestAnimationFrame() is typically used to schedule a function to update the 
  canvas state and render the next frame of the animation. This function can include calculations to update the position 
  or appearance of objects on the canvas, and then call the appropriate methods to draw those objects on the canvas.*/
}

// Calling animate function //
animate();

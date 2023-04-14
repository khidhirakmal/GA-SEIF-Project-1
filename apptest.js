const canvas = document.getElementById("canvas");
canvas.width = 200;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

// Creating a Road Class //
class Road {
  constructor(x, width) {
    this.x = x;
    this.width = width;
    this.laneCount = 3;

    // Endless Road
    const infinity = 100000;
    this.top = -infinity;
    this.bottom = infinity;

    // Road Shoulders Dimensions
    this.left = x - width / 2;
    this.right = x + width / 2;

    // Road Shoulder Markings
    const topLeft = { x: this.left, y: this.top };
    const topRight = { x: this.right, y: this.top };
    const bottomLeft = { x: this.left, y: this.bottom };
    const bottomRight = { x: this.right, y: this.bottom };
    this.borders = [
      [topLeft, bottomLeft],
      [topRight, bottomRight],
    ];
  }

  // Getting center positions for each lane //
  getLaneCenter(laneIndex) {
    const laneWidth = this.width / this.laneCount;
    return this.left + laneWidth / 2 + laneIndex * laneWidth;
  }

  // Drawing the road //
  draw(ctx) {
    // Creating lanes and Linear Interpolation formula //
    ctx.lineWidth = 4;
    ctx.strokeStyle = "white";
    function lerp(A, B, t) {
      return A + (B - A) * t;
    }

    // Creating lanes
    for (let i = 1; i <= this.laneCount - 1; i++) {
      const x = lerp(this.left, this.right, i / this.laneCount);
      ctx.setLineDash([20, 20]);
      ctx.beginPath();
      ctx.moveTo(x, this.top);
      ctx.lineTo(x, this.bottom);
      ctx.stroke();
    }

    // Creating road shoulders
    ctx.setLineDash([]);
    this.borders.forEach((border) => {
      ctx.beginPath();
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
  constructor() {
    this.forward = false;
    this.backward = false;
    this.left = false;
    this.right = false;
    this.arrowKeyListeners();
  }

  arrowKeyListeners() {
    document.onkeydown = (event) => {
      switch (event.key) {
        case "ArrowUp":
          this.forward = true;
          break;
        case "ArrowDown":
          this.backward = true;
          break;
        case "ArrowLeft":
          this.left = true;
          break;
        case "ArrowRight":
          this.right = true;
          break;
      }
    };

    document.onkeyup = (event) => {
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
    };
  }
}

// Creating Cars //
class Car {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.speed = 0;
    this.acceleration = 0.2;
    this.maxSpeed = 13;
    this.friction = 0.05;

    this.controls = new Controls();
  }

  // Car Movements //
  movements() {
    if (this.controls.forward) {
      this.speed += this.acceleration;
    }
    if (this.controls.backward) {
      this.speed -= this.acceleration;
    }

    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
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
      this.x -= 3;
    }

    if (this.controls.right) {
      // positive X value will shift animation to the right
      this.x += 3;
    }
    // Constrain to road shoulders
    if (this.x < 30) {
      this.x = 30;
    } else if (this.x > canvas.width - 30) {
      this.x = canvas.width - 30;
    }

    // Making the car move
    this.y -= this.speed;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.rect(this.x - this.width / 2, this.y - this.width / 2, this.width, this.height);
    ctx.fill();
  }
}

// Creating the Player's Race Car //
const raceCar = new Car(road.getLaneCenter(1), 100, 30, 50);

// Creating Traffic Class//
class TrafficCar {
  constructor(x, y, width, height, speed) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
  }

  update() {
    this.y -= this.speed;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.rect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    ctx.fillStyle = "red";
    ctx.fill();
  }
}

// Generating Random Traffic //
let trafficCars = [];

function generateTraffic(numCars) {
  for (let i = 0; i < numCars; i++) {
    const lane = Math.floor(Math.random() * road.laneCount);
    const x = road.getLaneCenter(lane);
    const y = raceCar.y - canvas.height;
    const width = 30;
    const height = 50;
    const speed = 5;
    const car = new TrafficCar(x, y, width, height, speed);
    trafficCars.push(car);
  }
}

// Drawing traffic //
function updateTrafficCars(ctx) {
  for (let i = 0; i < trafficCars.length; i++) {
    trafficCars[i].update(ctx);
  }
}
function drawTrafficCars(ctx) {
  for (let i = 0; i < trafficCars.length; i++) {
    trafficCars[i].draw(ctx);
  }
}

// Creating a function that creates an animation loop //
function update() {
  canvas.height = window.innerHeight;
  raceCar.movements();
  ctx.save();
  ctx.translate(0, -raceCar.y + canvas.height * 0.8);
  
  // Collision with traffic //
  for (let i = 0; i < trafficCars.length; i++) {
    let trafficCol = trafficCars[i];
    if (detectCollision(trafficCol, raceCar)) {
      console.log("hit!");
    }
  }
  
  // Detecting Collision //
  function detectCollision(a, b) {
    // Check for horizontal collision
    if (a.x < b.x + b.width && a.x + a.width > b.x) {
      // Check for vertical collision
      if (a.y < b.y + b.height && a.y + a.height > b.y) {
        // Collision detected
        return true;
      }
    }
    // No collision detected
    return false;
  }

  updateTrafficCars();
  road.draw(ctx);
  raceCar.draw(ctx);
  drawTrafficCars(ctx);
  ctx.restore();
  requestAnimationFrame(update);
}

// Generate traffic //
setInterval(() => {
  generateTraffic(Math.floor(Math.random() * 2) + 1);
}, 500);


// Calling update function //
update();

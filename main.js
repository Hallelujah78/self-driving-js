const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;

const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

const traffic = [];
generateTraffic(20);

const N = 2000;

const cars = generateCars(N);

// store best car globally
let bestCar = cars[0];

// Initialize our cars from local storage if it exists
if (localStorage.getItem("bestBrain")) {
  // For all cars
  for (let i = 0; i < cars.length; i++) {
    // Load the best brain from local storage into each car
    cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
    // Retain the previous best brain for car at cars[0] - don't mutate it
    if (i != 0) {
      NeuralNetwork.mutate(cars[i].brain, 0.3);
    }
  }
}

// Custom animate function
animate();

document.getElementById("saveBtn").addEventListener("click", () => {
  // calculate fitness for all cars
  for (let i = 0; i < cars.length; i++) {
    calculateFitness(cars[i]);
  }

  fittestCar = cars.reduce((best, car) =>
    car.fitness > best.fitness ? car : best,
  );
  console.log(fittestCar.fitness);
  localStorage.setItem("bestBrain", JSON.stringify(fittestCar.brain));
});

document.getElementById("discardBtn").addEventListener("click", () => {
  localStorage.removeItem("bestBrain");
});

function generateCars(N) {
  const cars = [];
  for (let i = 0; i <= N; i++) {
    cars.push(new Car(road.getLaneCenter(1), 300, 30, 50, "AI", 3, "blue"));
  }
  return cars;
}

function generateTraffic(N) {
  const laneIndices = [0, 1, 2];
  const colors = ["red", "green", "purple", "orange", "brown", "pink"];

  let y = -100;
  const spacing = 170; // >150px to be safe

  for (let i = 0; i < N; i++) {
    // Decide how many lanes to block this "row" (1 or 2)
    const lanesToBlock = Math.random() < 0.5 ? 1 : 2;

    // Shuffle lanes and take the first N
    const shuffledLanes = laneIndices
      .slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, lanesToBlock);

    for (const lane of shuffledLanes) {
      const color = colors[Math.floor(Math.random() * colors.length)];

      traffic.push(
        new Car(road.getLaneCenter(lane), y, 30, 50, "DUMMY", 2, color),
      );
    }

    y -= spacing;
  }
}

/**
 * A function to update and draw the car with
 * animation.
 *
 */
function animate(time) {
  // Animate the traffic cars
  for (let i = 0; i < traffic.length; i++) {
    // Pass empty array - traffic cannot interact with itself
    traffic[i].update(road.borders, []);
  }

  // Update the position of the car
  // By passing road.borders, car sensor can detect intersection of sensor ray with road border
  // By passing traffic, car/sensor can interact with other cars
  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic);
  }

  // Get the best car to follow, the one that has made the most upward progress (lowest y value)
  bestCar = cars.find((car) => car.y == Math.min(...cars.map((car) => car.y)));

  /* Set the canvas height - allows window
   * resizing. Setting the height clears all
   * drawings on the canvas.
   */
  carCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;
  // Save so we can translate
  carCtx.save();

  /* Translate entire canvas y val by neg car y val
   * Creates illusion that road is moving while car remains still.
   * Another way to think about it - the view hovers over the car like a camera.
   */
  carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

  // Draw the road
  road.draw(carCtx);

  // Draw the traffic
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCtx);
  }

  // fade alpha before drawing all cars
  carCtx.globalAlpha = 0.2;
  // Draw the cars at the updated position
  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(carCtx);
  }
  // set alpha to 1 again so we don't affect anything else
  carCtx.globalAlpha = 1;

  bestCar.draw(carCtx, true);

  // Restore the saved canvas state
  carCtx.restore();

  networkCtx.lineDashOffset = -time / 50;
  // visualize the network
  Visualizer.drawNetwork(networkCtx, bestCar.brain);

  // Calls animate many times per second giving illusion of movement
  requestAnimationFrame(animate);
}

function calculateFitness(car) {
  const MAX_DISTANCE = 7500;
  normDistance = Math.min((300 - car.y) / MAX_DISTANCE, 1);

  const avgSpeed = car.totalSpeed / car.framesAlive;
  const normSpeed = avgSpeed / 3; // 0-1
  car.fitness = 1000 * normDistance + 500 * normSpeed;
}

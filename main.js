const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;

const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

// Add another car
const traffic = [
  new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2, "red"),
  new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2, "green"),
  new Car(road.getLaneCenter(1), -450, 30, 50, "DUMMY", 2, "red"),
  new Car(road.getLaneCenter(2), -600, 30, 50, "DUMMY", 2, "purple"),
  new Car(road.getLaneCenter(1), -750, 30, 50, "DUMMY", 2, "red"),
  new Car(road.getLaneCenter(0), -900, 30, 50, "DUMMY", 2, "green"),
  new Car(road.getLaneCenter(1), -1050, 30, 50, "DUMMY", 2, "red"),
  new Car(road.getLaneCenter(2), -1150, 30, 50, "DUMMY", 2, "purple"),
  new Car(road.getLaneCenter(2), -1300, 30, 50, "DUMMY", 2, "red"),
  new Car(road.getLaneCenter(1), -1450, 30, 50, "DUMMY", 2, "green"),
  new Car(road.getLaneCenter(0), -1590, 30, 50, "DUMMY", 2, "red"),
  new Car(road.getLaneCenter(1), -1740, 30, 50, "DUMMY", 2, "purple"),
  new Car(road.getLaneCenter(1), -2000, 30, 50, "DUMMY", 2, "purple"),
  new Car(road.getLaneCenter(1), -2200, 30, 50, "DUMMY", 2, "purple"),
];

const N = 2000;

const cars = generateCars(N);

// store best car globally
let bestCar = cars[0];

if (localStorage.getItem("bestBrain")) {
  // For all cars
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
    NeuralNetwork.mutate(cars[i].brain, 0);
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

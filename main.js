const canvas = document.getElementById("myCanvas");
console.log(canvas);

canvas.width = 200;

const ctx = canvas.getContext("2d");

const road = new Road(canvas.width / 2, canvas.width * 0.9);

// Add another car
const traffic = [
  new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2, "red"),
];

const car = new Car(road.getLaneCenter(1), 300, 30, 50, "KEYS", 3, "blue");

// Custom animate function
animate();

/**
 * A function to update and draw the car with
 * animation.
 *
 */
function animate() {
  // Animate the traffic cars
  for (let i = 0; i < traffic.length; i++) {
    // Pass empty array - traffic cannot interact with itself
    traffic[i].update(road.borders, []);
  }

  // Update the position of the car
  // By passing road.borders, car sensor can detect intersection of sensor ray with road border
  // By passing traffic, car/sensor can interact with other cars
  car.update(road.borders, traffic);
  /* Set the canvas height - allows window
   * resizing. Setting the height clears all
   * drawings on the canvas.
   */
  canvas.height = window.innerHeight;
  // Save so we can translate
  ctx.save();

  /* Translate entire canvas y val by neg car y val
   * Creates illusion that road is moving while car remains still.
   * Another way to think about it - the view hovers over the car like a camera.
   */
  ctx.translate(0, -car.y + canvas.height * 0.7);

  // Draw the road
  road.draw(ctx);

  // Draw the traffic
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(ctx);
  }

  // Draw the car at the updated position
  car.draw(ctx);

  // Restore the saved canvas state
  ctx.restore();

  // Calls animate many times per second giving illusion of movement
  requestAnimationFrame(animate);
}

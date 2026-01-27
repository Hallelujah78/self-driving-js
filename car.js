class Car {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.speed = 0;
    this.acceleration = 0.2;
    this.maxSpeed = 3;
    // Friction halts the car when in motion but neither forward or reverse controls are active
    this.friction = 0.05;
    // Turn angle
    this.angle = 0;
    // Is the car damaged
    this.damaged = false;
    // Instantiate sensor
    this.sensor = new Sensor(this); // passing car

    this.controls = new Controls();
  }

  #move() {
    // The forward control is active
    if (this.controls.forward) {
      // speed increases by acceleration - limited by maxSpeed
      this.speed += this.acceleration;
    }
    // The reverse control is active
    if (this.controls.reverse) {
      // reverse speed increases by acceleration
      this.speed -= this.acceleration;
    }

    // Limit forward speed to maxSpeed
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }

    // Limit reverse speed to half maxSpeed
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }

    // Friction
    if (this.speed > 0) {
      this.speed -= this.friction;
    }
    if (this.speed < 0) {
      this.speed += this.friction;
    }
    // Stop movement if speed less than friction
    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }

    /* Picture a right-angled triangle inside a unit circle. The hypotenuse is the radius of the circle. The angle, c, is measured between the x-axis and the hypotenuse. sin(c) gives the ratio of the side opposite c to the length of the hypotenuse. cosine(c) gives the ratio of the adjacent side (on the x-axis) to the hypotenuse. Thus, cos(angle) and sin(angle) can be used to tell how much you 'move' horizontally and vertically when facing at a given angle.
     */
    // Update the x coord - given by x minus the change in x for a given speed
    this.x -= Math.sin(this.angle) * this.speed;
    // Update the y coord - given by the change in y for a given speed
    this.y -= Math.cos(this.angle) * this.speed;

    // Allow turning only if speed is not 0
    if (this.speed != 0) {
      // Flip controls when reversing (left/right)
      const flip = this.speed > 0 ? 1 : -1;

      // Left arrow - turn left
      if (this.controls.left) {
        this.angle += 0.03 * flip;
      }

      // Right control - turn right
      if (this.controls.right) {
        this.angle -= 0.03 * flip;
      }
    }
  }

  /**
   * A function to update the position of the car if the car is moving forward, left, right or in reverse.
   *
   * @memberof Car
   */
  update(roadBorders) {
    if (!this.damaged) {
      this.#move();
      this.polygon = this.#createPolygon();
      this.damaged = this.#assessDamage(roadBorders);
      // update the sensor
      this.sensor.update(roadBorders);
    }
  }

  #assessDamage(roadBorders) {
    // For every road border
    for (let i = 0; i < roadBorders.length; i++) {
      if (polysIntersect(this.polygon, roadBorders[i])) {
        return true;
      }
    }
    return false;
  }

  #createPolygon() {
    const points = [];
    // get the length of the hypot - distance from center of rect to any corner
    const radius = Math.hypot(this.width / 2, this.height / 2);
    // get the angle between the y axis and the top right corner of our rectangle (car)
    const alpha = Math.atan2(this.width, this.height);

    points.push({
      x: this.x - Math.sin(this.angle - alpha) * radius,
      y: this.y - Math.cos(this.angle - alpha) * radius,
    });
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * radius,
      y: this.y - Math.cos(this.angle + alpha) * radius,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * radius,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * radius,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * radius,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * radius,
    });
    return points;
  }

  /**
   *
   *
   * @param {CanvasRenderingContext2D} ctx
   * @memberof Car
   */
  draw(ctx) {
    // If car is damaged, color it gray
    if (this.damaged) {
      ctx.fillStyle = "gray";
    } else {
      // Otherwise color it black
      ctx.fillStyle = "black";
    }
    ctx.beginPath();
    ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
    for (let i = 1; i < this.polygon.length; i++) {
      ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
    }
    ctx.fill();
    // draw the sensor for the car
    this.sensor.draw(ctx);
  }

  drawOld() {
    // Save canvas state before translation/rotation
    ctx.save();
    // Move the 'pen' to x,y
    ctx.translate(this.x, this.y);
    // Rotate the entire canvas by -this.angle
    ctx.rotate(-this.angle);

    // Draw the object
    ctx.beginPath();
    // Draw the rect centered at x,y
    ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.fill();
    // Restore the canvas to the pre translated/rotated state
    ctx.restore();
    // draw the sensor for the car
    this.sensor.draw(ctx);
  }
}

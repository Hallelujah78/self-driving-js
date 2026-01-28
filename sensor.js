class Sensor {
  constructor(car) {
    this.car = car;
    this.rayCount = 5; // a ray is a beam sent out by a 'sensor'
    this.rayLength = 200; // sensor "range"
    this.raySpread = Math.PI / 2; // 45deg
    this.rays = [];
    this.readings = []; // readings from sensors
  }

  #castRays() {
    this.rays = [];

    for (let i = 0; i < this.rayCount; i++) {
      // Calculate the angle for each ray.
      const rayAngle =
        lerp(
          this.raySpread / 2,
          -this.raySpread / 2,
          this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1), // 0, 0.5, 1 for 3 rays
        ) + this.car.angle; // so ray rotates with car

      /*
       * Construct the start and end point of each
       * ray segment.
       */
      const start = { x: this.car.x, y: this.car.y };
      const end = {
        x: this.car.x - Math.sin(rayAngle) * this.rayLength,
        y: this.car.y - Math.cos(rayAngle) * this.rayLength,
      };
      this.rays.push([start, end]);
    }
  }

  /**
   * A method that takes the start and end point  * of two line segments. Returns the point at
   * which they intersect (if they do).
   *
   * @param {*} roadBorders
   * @memberof Sensor
   */
  #getReading(ray, segments, traffic) {
    /* a ray may 'touch' or intersect with multiple objects. It may intersect with multiple segments of another car and one or more road borders.
    We keep the intersection or touch that is closest to the sensor as it is the most relevant.
    */

    // Store touches in array
    let touches = [];

    // For each road border
    for (let i = 0; i < segments.length; i++) {
      // getIntersection returns x, y, offset (dist from rayStart)

      const touch = getIntersection(
        ray[0],
        ray[1],
        segments[i][0],
        segments[i][1],
      );
      if (touch) {
        touches.push(touch);
      }
    }

    // For each car in traffic
    for (let i = 0; i < traffic.length; i++) {
      const poly = traffic[i].polygon;
      // For each point in poly
      for (let j = 0; j < poly.length; j++) {
        const touch = getIntersection(
          ray[0],
          ray[1],
          poly[j],
          poly[(j + 1) % poly.length],
        );
        if (touch) {
          touches.push(touch);
        }
      }
    }

    // If touches empty, there are no readings
    if (touches.length == 0) {
      return null;
    } else {
      // otherwise return the touch that is closest to the ray start - lowest offset
      const offsets = touches.map((touch) => touch.offset);
      // Get the minimum offset (closest touch)
      const minOffset = Math.min(...offsets);
      // Return touch with matching offset
      return touches.find((touch) => touch.offset == minOffset);
    }
  }

  /**
   * Update the sensor object. Allows drawing of * rays and detecting if the road border is close.
   *
   * @param {*} roadBorders
   * @memberof Sensor
   */
  update(roadBorders, traffic) {
    this.#castRays();
    // Reset the readings
    this.readings = [];
    // For each ray
    for (let i = 0; i < this.rays.length; i++) {
      this.readings.push(this.#getReading(this.rays[i], roadBorders, traffic));
    }
  }

  draw(ctx) {
    for (let i = 0; i < this.rayCount; i++) {
      // Get the end of the ray
      let end = this.rays[i][1];

      // The reading at readings[i] is the reading for the ray at rays[i]
      if (this.readings[i]) {
        // Set end to the touch point
        end = this.readings[i];
      }

      // The yellow portion of the line up to the touch - or to the end if there is no touch
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "yellow";
      // Move to start of ray
      ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
      // Draw line to end of ray
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      // Remainder of the ray
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "black";
      // Move to start of ray
      ctx.moveTo(end.x, end.y);
      // Draw line to end of ray
      ctx.lineTo(this.rays[i][1].x, this.rays[i][1].y);
      ctx.stroke();
    }
  }
}

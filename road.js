class Road {
  /**
   * Creates an instance of Road.
   * @param {*} x - center x value for the road
   * @param {*} width - width of the road
   * @param {number} [laneCount=3]
   * @memberof Road
   */
  constructor(x, width, laneCount = 3) {
    this.x = x;
    this.width = width;
    this.laneCount = laneCount;

    this.left = x - width / 2;
    this.right = x + width / 2;
    const infinity = 1000000;
    this.top = -infinity; // y grows down
    this.bottom = infinity;

    /* Define x,y coords for road borders
     * These are the solid lines at the edge of
     * the road.
     */
    const topLeft = { x: this.left, y: this.top };
    const bottomLeft = { x: this.left, y: this.bottom };
    const topRight = { x: this.right, y: this.top };
    const bottomRight = { x: this.right, y: this.bottom };
    this.borders = [
      [topLeft, bottomLeft],
      [topRight, bottomRight],
    ];
  } // end constructor

  /**
   * Return the x value of the center point of the lane at the given laneIndex
   *
   * @param {*} laneIndex - the index of the lane
   * @return {*} - x value of the center point of the lane
   * @memberof Road
   */
  getLaneCenter(laneIndex) {
    // Calc width of each lane
    const laneWidth = this.width / this.laneCount;
    // Return x value of the center of the lane at laneIndex
    return (
      this.left +
      laneWidth / 2 +
      laneWidth * Math.min(laneIndex, this.laneCount - 1)
    );
  }

  draw(ctx) {
    ctx.lineWidth = 5;
    ctx.strokeStyle = "white";

    for (let i = 1; i < this.laneCount; i++) {
      // Get interpolated value for x
      const x = lerp(this.left, this.right, i / this.laneCount);

      // line & gap length for dashed lines
      ctx.setLineDash([20, 20]);

      // Draw the line at x
      ctx.beginPath();
      ctx.moveTo(x, this.top);
      ctx.lineTo(x, this.bottom);
      ctx.stroke();
    }
    // Remove line dash for borders
    ctx.setLineDash([0, 0]);

    // For each border in borders, draw it
    this.borders.forEach((border) => {
      ctx.beginPath();
      ctx.moveTo(border[0].x, border[0].y);
      ctx.lineTo(border[1].x, border[1].y);
      ctx.stroke();
    });

    //  this.borders = [
    //    [topLeft, bottomLeft],
    //    [topRight, bottomRight],
    //  ];
  }
}

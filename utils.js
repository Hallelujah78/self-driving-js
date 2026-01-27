// https://chatgpt.com/c/6977ad49-b30c-8389-ac24-88d8af589fda

/* lerp - move smoothly from A to B
 * B-A is distance from A to B
 * (B-A)*t is a fraction of the distance between * A and B
 */

/**
 * A function to interpolate values between a starting point and an end point (A and B respectively).
 *
 * @param {*} A - the starting value
 * @param {*} B - the ending value
 * @param {*} t - how far you are between A and B
 * @return {*} - the fraction we have move between A and B
 */
function lerp(A, B, t) {
  return A + (B - A) * t;
}

/**
 *
 *
 * @param {*} A
 * @param {*} B
 * @param {*} C
 * @param {*} D
 * @return {{x: int, y: int, offset: float}} - the intersecting point with an offset. The offset is the distance from the rayStart to the point.
 */
function getIntersection(A, B, C, D) {
  // This methods uses the method to find intersections on a line segment: https://wikimedia.org/api/rest_v1/media/math/render/svg/3037b45bc402892dc1273dc0c3b70532f3bcda39
  const tTop = (A.x - C.x) * (C.y - D.y) - (A.y - C.y) * (C.x - D.x);
  const uTop = (A.x - B.x) * (A.y - C.y) - (A.y - B.y) * (A.x - C.x);
  const bottom = (A.x - B.x) * (C.y - D.y) - (A.y - B.y) * (C.x - D.x);

  // Can't divide by zero
  if (bottom != 0) {
    // Find t - see image
    const t = tTop / bottom;
    // Find u - see image
    const u = -uTop / bottom;

    if (t >= 0 && 1 >= t && u >= 0 && 1 >= u) {
      return {
        x: lerp(A.x, B.x, t),
        y: lerp(A.y, B.y, t),
        offset: t,
      };
    }
  }

  return null;
}

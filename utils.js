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

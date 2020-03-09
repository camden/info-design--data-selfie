import { PointObj } from '../types';

// https://stackoverflow.com/a/17191557/2399208
const interpolate = (a: PointObj, b: PointObj, frac: number) => {
  // points A and B, frac between 0 and 1
  var nx = a.x + (b.x - a.x) * frac;
  var ny = a.y + (b.y - a.y) * frac;
  return { x: nx, y: ny };
};

export default interpolate;

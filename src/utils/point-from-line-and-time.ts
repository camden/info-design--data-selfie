import interpolate from './interpolate';
import { PointObj } from '../types';

const getLengthBetween = (p1: PointObj, p2: PointObj): number => {
  const a = p1.x - p2.x;
  const b = p1.y - p2.y;

  return Math.hypot(a, b);
};

interface LineSegment {
  p1: PointObj;
  p2: PointObj;
  length: number;
}

const pointFromLineAndTime = (line: number[], percent: number): PointObj => {
  let allPoints = [];
  for (let i = 0; i < line.length; i += 2) {
    const point = { x: line[i], y: line[i + 1] };
    allPoints.push(point);
  }

  if (allPoints.length === 1) {
    return allPoints[0];
  }

  let totalLength = 0;
  let lineSegments: LineSegment[] = [];
  for (let i = 0; i < allPoints.length; i++) {
    const p1 = allPoints[i];
    const p2 = allPoints[(i + 1) % allPoints.length];

    const line: LineSegment = { p1, p2, length: getLengthBetween(p1, p2) };

    lineSegments.push(line);
    totalLength += line.length;
  }

  let targetDistance = totalLength * percent;

  let indexOfCurrentLineSegment = 0;
  let curDistance = 0;
  for (let i = 0; i < lineSegments.length; i++) {
    const curLine = lineSegments[i];
    curDistance += curLine.length;
    if (targetDistance < curDistance) {
      indexOfCurrentLineSegment = i;
      break;
    }
  }

  const previousLength =
    indexOfCurrentLineSegment > 0
      ? curDistance - lineSegments[indexOfCurrentLineSegment].length
      : 0;

  const distanceAlongCurrentSegment = targetDistance - previousLength;

  const targetLine = lineSegments[indexOfCurrentLineSegment];
  const percentOfTargetLine = distanceAlongCurrentSegment / targetLine.length;
  const interpolated = interpolate(
    targetLine.p1,
    targetLine.p2,
    percentOfTargetLine
  );

  if (isNaN(interpolated.x) || isNaN(interpolated.y)) {
    return allPoints[0];
  }

  return interpolated;
};

export default pointFromLineAndTime;

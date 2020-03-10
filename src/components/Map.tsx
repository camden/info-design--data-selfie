import React, { useState, useEffect } from 'react';
import { Image, Layer, Line, Stage } from 'react-konva';
import useImage from 'use-image';
import WorldMapSVG from '../assets/world-map2.svg';
import birdData from '../data/birds';
import { scaleX, scaleY } from '../utils/scale';
import Point from './Point';
import interpolate from '../utils/interpolate';
import { PointObj } from '../types';
import stringToColor from '../utils/string-to-color';

const DRAW_LINES = false;
const DRAW_POINTS = false;
const INCREMENT = 1;
const DELAY_MS = 200;
const CANVAS_WIDTH = 550;
const CANVAS_HEIGHT = 740;

interface BirdObj {
  seasons: {
    prebreeding_migration?: BirdSeasonEntry;
    postbreeding_migration?: BirdSeasonEntry;
    nonbreeding?: BirdSeasonEntry;
    breeding?: BirdSeasonEntry;
  };
  common_name: string;
}

interface BirdSeasonEntry {
  season: string;
  region: string;
  x: number;
  y: number;
}

const pointsArrayFromBirdObj = (b: BirdObj, scaled?: boolean): number[] => {
  return Object.values(b.seasons).reduce<number[]>((arr, cur) => {
    if (!cur) {
      return arr;
    }

    const nx = scaled ? scaleX(cur.x) : cur.x;
    const ny = scaled ? scaleY(cur.y) : cur.y;

    return [...arr, nx, ny];
  }, []);
};

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
  for (let i = 0; i < allPoints.length - 1; i++) {
    const p1 = allPoints[i];
    const p2 = allPoints[i + 1];

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

const Map = () => {
  const [time, setTime] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      // TODO this is slightly flawed bc it repeats 0, 1 and 100
      // not a big deal tho.
      if (isCountingDown) {
        setTime(time - INCREMENT);
      } else {
        setTime(time + INCREMENT);
      }

      if (time + INCREMENT >= 99) {
        setIsCountingDown(true);
      } else if (time - INCREMENT < 0) {
        setIsCountingDown(false);
      }
    }, DELAY_MS);
    return () => clearInterval(timer);
  });

  const [img] = useImage(WorldMapSVG);

  const birds = Object.values(birdData);

  let animatedPoints: { [name: string]: PointObj } = {};
  birds.forEach(bird => {
    animatedPoints[bird.common_name] = pointFromLineAndTime(
      pointsArrayFromBirdObj(bird),
      time / 100
    );
  });

  return (
    <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
      <Layer>
        <Image
          image={img}
          height={1000}
          width={550}
          crop={{
            x: 0,
            y: 0,
            width: 260,
            height: 500,
          }}
        />
      </Layer>
      <Layer>
        {birds.map(bird => (
          <>
            {DRAW_LINES && (
              <Line
                key={`${bird.common_name} line`}
                points={pointsArrayFromBirdObj(bird, true)}
                stroke={stringToColor(bird.common_name)}
                opacity={0.1}
              />
            )}
            {DRAW_POINTS &&
              Object.values(bird.seasons).map(s => (
                <Point
                  key={`${bird.common_name} ${s.season}`}
                  x={s.x}
                  y={s.y}
                  color={stringToColor(bird.common_name)}
                />
              ))}
            <Point
              key={`${bird.common_name} point`}
              x={animatedPoints[bird.common_name].x}
              y={animatedPoints[bird.common_name].y}
              color={stringToColor(bird.common_name)}
              radius={10}
              opacity={0.1}
            />
          </>
        ))}
      </Layer>
    </Stage>
  );
};

export default Map;

import React, { useState, useEffect } from 'react';
import { Image, Layer, Line, Stage } from 'react-konva';
import useImage from 'use-image';
import WorldMapSVG from '../assets/world-map2.svg';
import birdData from '../data/birds';
import Point from './Point';
import { PointObj } from '../types';
import stringToColor from '../utils/string-to-color';
import pointFromLineAndTime from '../utils/point-from-line-and-time';
import pointsArrayFromBirdObj from '../utils/points-array-from-bird-obj';

const DRAW_LINES = false;
const DRAW_POINTS = false;
const INCREMENT = 1;
const DELAY_MS = 200;
const CANVAS_WIDTH = 550;
const CANVAS_HEIGHT = 740;

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

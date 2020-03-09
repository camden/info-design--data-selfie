import React, { useState, useEffect } from 'react';
import { Image, Layer, Line, Stage } from 'react-konva';
import useImage from 'use-image';
import WorldMapSVG from '../assets/world-map2.svg';
import birdData from '../data/birds-subset';
import { scaleX, scaleY } from '../utils/scale';
import Point from './Point';
import interpolate from '../utils/interpolate';
import { PointObj } from '../types';
import stringToColor from '../utils/string-to-color';

interface BirdObj {
  prebreeding_migration?: BirdSeasonEntry;
  postbreeding_migration?: BirdSeasonEntry;
  nonbreeding?: BirdSeasonEntry;
  breeding?: BirdSeasonEntry;
}

interface BirdSeasonEntry {
  common_name: string;
  season: string;
  region: string;
  x: number;
  y: number;
}

const pointsArrayFromBirdObj = (b: BirdObj, scaled?: boolean): number[] => {
  return Object.values(b).reduce((arr, cur) => {
    const nx = scaled ? scaleX(cur.x) : cur.x;
    const ny = scaled ? scaleY(cur.y) : cur.y;

    return [...arr, nx, ny];
  }, []);
};

const pointFromLineAndTime = (line: number[], percent: number): PointObj => {
  const numberOfPoints = line.length / 2;
  const firstPoint = { x: line[0], y: line[1] };
  const secondPoint = { x: line[2], y: line[3] };
  const interpolated = interpolate(firstPoint, secondPoint, percent);

  return interpolated;
};

const Map = () => {
  const [time, setTime] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      // TODO this is slightly flawed bc it repeats 0, 1 and 100
      // not a big deal tho.
      if (time >= 99) {
        setIsCountingDown(true);
      } else if (time <= 1) {
        setIsCountingDown(false);
      }

      if (isCountingDown) {
        setTime(time - 1);
      } else {
        setTime(time + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  });

  const [img] = useImage(WorldMapSVG);

  const CANVAS_WIDTH = 1000;
  const CANVAS_HEIGHT = 740;

  const birds = Object.values(birdData);

  const animatedPoint = pointFromLineAndTime(
    pointsArrayFromBirdObj(birds[0]),
    time / 100
  );

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
        {birds.map(obj => (
          <>
            <Line
              key={Object.values(obj)[0].common_name}
              points={pointsArrayFromBirdObj(obj, true)}
              stroke={stringToColor(Object.values(obj)[0].common_name)}
            />
            {Object.values(obj).map(s => (
              <Point
                key={`${s.common_name} ${s.season}`}
                x={s.x}
                y={s.y}
                color={stringToColor(s.common_name)}
              />
            ))}
          </>
        ))}
        <Point
          x={animatedPoint.x}
          y={animatedPoint.y}
          color={'red'}
          radius={5}
        />
      </Layer>
    </Stage>
  );
};

export default Map;

import React from 'react';
import { Stage, Line, Layer } from 'react-konva';
import Locations from '../data/location-data';
import Point from './Point';

const START_DATE_MS = 1580083200; // 1/27 at midnight
const END_DATE_MS = 1585531182; // 3/29 at 6:19pm
const DIST_MAX_MILES = 3000;

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const SHOW_BASELINE = false;

const distanceToChartY = (dist: number): number => {
  // https://math.stackexchange.com/questions/970094/convert-a-linear-scale-to-a-logarithmic-scale
  const result = (3000 / 3.47) * Math.log10(1 + dist);

  return (1 - result / DIST_MAX_MILES) * (HEIGHT / 2);
};

const getPercentOfDateBetween = (
  timestamp: number,
  start: number,
  end: number
): number => {
  if (end <= start) {
    throw new Error('end cannot be less than start.');
  }

  if (timestamp > end || timestamp < start) {
    throw new Error('invalid timestamp; must be within range.');
  }

  const percentage = (timestamp - start) / (end - start);

  return percentage;
};

const distanceToColor = (dist: number): string => {
  if (dist === 0) {
    return 'blue';
  }

  return 'red';
};

const Chart = () => {
  const percentages = Locations.map(l => {
    const datePercent = getPercentOfDateBetween(
      l.arrivalDateTime,
      START_DATE_MS,
      END_DATE_MS
    );
    const key = l.leavingDateTime;
    return {
      key,
      datePercent,
      distance: l.distanceFromHomeMiles,
    };
  });

  return (
    <Stage width={WIDTH} height={HEIGHT}>
      <Layer>
        {SHOW_BASELINE && (
          <Line
            points={[0, HEIGHT / 2, WIDTH, HEIGHT / 2]}
            stroke="black"
            strokeWidth={0.1}
          ></Line>
        )}
      </Layer>
      <Layer>
        {percentages.map(
          (p, index, arr) =>
            index !== arr.length - 1 && (
              <Line
                points={[
                  p.datePercent * WIDTH,
                  distanceToChartY(p.distance),
                  arr[index + 1].datePercent * WIDTH,
                  distanceToChartY(arr[index + 1].distance),
                ]}
                stroke="black"
                strokeWidth={0.1}
              ></Line>
            )
        )}
      </Layer>
      <Layer>
        {percentages.map(p => (
          <Point
            color={distanceToColor(p.distance)}
            radius={0.5}
            key={p.key}
            x={p.datePercent * WIDTH}
            y={distanceToChartY(p.distance)}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default Chart;

import React from 'react';
import { Stage, Line, Layer, Text } from 'react-konva';
import Locations from '../data/location-data';
import Point from './Point';
import useMousePosition, { MousePosition } from '@react-hook/mouse-position';
import styles from './Chart.module.css';

const START_DATE_MS = 1580083200; // 1/27 at midnight
const END_DATE_MS = 1585531182; // 3/29 at 6:19pm
const DIST_MAX_MILES = 3000;

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const VERT_OFFSET_PX = 100;
const BASELINE_X = HEIGHT - VERT_OFFSET_PX;

const MOUSE_X_RADIUS = 4;
const MOUSE_Y_RADIUS = 6;

const SHOW_BASELINE = false;

const distanceToChartY = (dist: number): number => {
  // https://math.stackexchange.com/questions/970094/convert-a-linear-scale-to-a-logarithmic-scale
  const result = (3000 / 3.47) * Math.log10(1 + dist);

  return (1 - result / DIST_MAX_MILES) * BASELINE_X;
};

const inverseOfDistanceToChartY = (y: number): number => {
  const tmp = DIST_MAX_MILES * (3.47 / 3000) * (1 - y / BASELINE_X);
  return Math.pow(10, tmp);
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

  return 'lightgrey';
};

interface DataPoint {
  location: string;
  time: number;
  distance: number;
  method: string | null;
  key: string;
  datePercent: number;
  x: number;
  y: number;
}

const getLineStyleForDataPoint = (dataPoint: DataPoint) => {
  if (!dataPoint.method) {
    return {
      stroke: 'black',
      strokeWidth: 0.1,
    };
  }

  if (dataPoint.method === 'walk') {
    return {
      stroke: 'orange',
      dash: [2, 4],
    };
  }

  if (dataPoint.method === 'flight') {
    return {
      stroke: 'purple',
    };
  }

  if (dataPoint.method === 'car' || dataPoint.method === 'van') {
    return {
      stroke: 'blue',
    };
  }

  if (dataPoint.method === 'uber' || dataPoint.method === 'lyft') {
    return {
      stroke: 'red',
    };
  }

  if (dataPoint.method.includes('bike')) {
    return {
      stroke: 'orange',
    };
  }

  const isPublicTransit =
    dataPoint.method.includes('bus') ||
    dataPoint.method.includes('train') ||
    dataPoint.method.includes('sl') ||
    dataPoint.method.includes('shuttle') ||
    dataPoint.method.includes('line');

  if (isPublicTransit) {
    return {
      stroke: 'green',
    };
  }

  return {
    stroke: 'red',
  };
};

const isMousePositionWithinRadius = (
  mouse: MousePosition,
  point: DataPoint
): boolean => {
  if (!mouse.x || !mouse.y) {
    return false;
  }

  const withinXBounds =
    point.x > mouse.x - MOUSE_X_RADIUS && point.x < mouse.x + MOUSE_X_RADIUS;
  const withinYBounds =
    point.y > mouse.y - MOUSE_Y_RADIUS && point.y < mouse.y + MOUSE_Y_RADIUS;

  return withinXBounds && withinYBounds;
};

const Chart = () => {
  const [mousePosition, ref] = useMousePosition(0, 0, 30);

  const percentages = Locations.map(l => {
    const datePercent = getPercentOfDateBetween(
      l.time,
      START_DATE_MS,
      END_DATE_MS
    );
    const key = l.time + ' ' + l.location + ' ' + l.method;
    return {
      ...l,
      key,
      datePercent,
      x: datePercent * WIDTH,
      y: distanceToChartY(l.distance),
    };
  });

  const labelLocations = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875].map(
    y => y * BASELINE_X
  );

  return (
    <div ref={ref}>
      <Stage width={WIDTH} height={HEIGHT}>
        <Layer>
          {labelLocations.map(y => (
            <Line
              key={y}
              points={[0, y, WIDTH, y]}
              stroke="lightgrey"
              strokeWidth={0.5}
            ></Line>
          ))}
          {labelLocations.map(y => (
            <Text
              x={10}
              y={y - 14}
              fill={'lightgrey'}
              text={`${Math.round(inverseOfDistanceToChartY(y))} miles`}
            />
          ))}
        </Layer>
        <Layer>
          {SHOW_BASELINE && (
            <Line
              points={[0, BASELINE_X, WIDTH, BASELINE_X]}
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
                  points={[p.x, p.y, arr[index + 1].x, arr[index + 1].y]}
                  stroke="black"
                  strokeWidth={2}
                  {...getLineStyleForDataPoint(p)}
                ></Line>
              )
          )}
        </Layer>
        <Layer>
          {percentages.map(
            p =>
              isMousePositionWithinRadius(mousePosition, p) && (
                <Point
                  color={distanceToColor(p.distance)}
                  opacity={0.2}
                  radius={10}
                  key={p.key}
                  x={p.x}
                  y={p.y}
                />
              )
          )}
        </Layer>
      </Stage>
      {percentages.map(p => (
        <>
          {isMousePositionWithinRadius(mousePosition, p) && (
            <div className={styles.locationBox}>
              <div className={styles.locationName}>{p.location}</div>
            </div>
          )}
        </>
      ))}
    </div>
  );
};

export default Chart;

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Line, Text, FastLayer } from 'react-konva';
import Locations from '../data/location-data';
import Point from './Point';
import useMousePosition, { MousePosition } from '@react-hook/mouse-position';
import styles from './Chart.module.css';
import { KonvaEventObject } from 'konva/types/Node';
import { format, fromUnixTime } from 'date-fns';

const START_DATE_MS = 1580083200; // 1/27 at midnight
const END_DATE_MS = 1585531182; // 3/29 at 6:19pm
const DIST_MAX_MILES = 3000;

const WIDTH = document.documentElement.clientWidth * 1;
const HEIGHT = document.documentElement.clientHeight * 1;
const STAGE_WIDTH = window.innerWidth;
const STAGE_HEIGHT = window.innerHeight;
const VERT_OFFSET_PX = 100;
const BASELINE_Y = HEIGHT - VERT_OFFSET_PX;

const MOUSE_X_RADIUS = 4;
const MOUSE_Y_RADIUS = 6;

const SHOW_BASELINE = false;
const SHOW_DATE_LABELS = false;
const SHOW_MILES_LABELS = false;

const distanceToChartY = (dist: number): number => {
  // https://math.stackexchange.com/questions/970094/convert-a-linear-scale-to-a-logarithmic-scale
  const result = (3000 / 3.47) * Math.log10(1 + dist);

  return (1 - result / DIST_MAX_MILES) * BASELINE_Y;
};

const inverseOfDistanceToChartY = (y: number): number => {
  const tmp = DIST_MAX_MILES * (3.47 / 3000) * (1 - y / BASELINE_Y);
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
      // strokeWidth: 0.1,
    };
  }

  if (dataPoint.method === 'walk') {
    return {
      stroke: 'orange',
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

const getDateFromX = (x: number): string => {
  const xPercent = x / WIDTH;
  const dateFromPercent = Math.floor(
    START_DATE_MS + xPercent * (END_DATE_MS - START_DATE_MS)
  );
  const date = format(fromUnixTime(dateFromPercent), 'M-d-yy');
  return date;
};

const Chart = () => {
  const [mousePosition, mousePositionRef] = useMousePosition(0, 0, 30);

  const percentages = Locations.map((l) => {
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
    (y) => y * BASELINE_Y
  );

  const labelXLocations = [10].concat(
    [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
    ].map((x) => x * 1000)
  );

  const dateLabelXLocations: number[] = [];
  for (let i = 0; i < 100; i++) {
    dateLabelXLocations.push(370 * i);
  }

  useEffect(() => {
    const handleScroll = () => {};

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const stageRef = useRef<Stage>(null);

  const onDragEnd = useCallback((evt: KonvaEventObject<DragEvent>) => {
    const s = stageRef.current as any;
    setMouseOffset({
      x: -s.attrs.x,
      y: -s.attrs.y,
    });
  }, []);

  const adjustedMousePosition = {
    ...mousePosition,
    x: (mousePosition.x || 0) + mouseOffset.x,
    y: (mousePosition.y || 0) + mouseOffset.y,
  };

  return (
    <div ref={mousePositionRef}>
      <div className={styles.wrapper}>
        <Stage
          ref={stageRef}
          width={STAGE_WIDTH}
          height={STAGE_HEIGHT}
          onDragEnd={onDragEnd}
        >
          {SHOW_MILES_LABELS && (
            <FastLayer>
              {labelLocations.map((y) => (
                <Line
                  key={y}
                  points={[0, y, WIDTH, y]}
                  stroke="lightgrey"
                  strokeWidth={0.5}
                ></Line>
              ))}
              {labelXLocations.map((x) =>
                labelLocations.map((y) => (
                  <Text
                    x={x}
                    y={y - 14}
                    fill={'lightgrey'}
                    text={`${Math.round(inverseOfDistanceToChartY(y))} miles`}
                  />
                ))
              )}
            </FastLayer>
          )}
          <FastLayer>
            {SHOW_BASELINE && (
              <Line
                points={[0, BASELINE_Y, WIDTH, BASELINE_Y]}
                stroke="black"
                strokeWidth={0.1}
              ></Line>
            )}
            {SHOW_DATE_LABELS &&
              dateLabelXLocations.map((x) => (
                <>
                  <Line
                    points={[x, BASELINE_Y, x, BASELINE_Y + 8]}
                    stroke="grey"
                    strokeWidth={2}
                  />
                  <Text
                    text={getDateFromX(x)}
                    x={x}
                    fill="grey"
                    y={BASELINE_Y + 10}
                    rotation={45}
                  />
                </>
              ))}
          </FastLayer>
          <FastLayer>
            {percentages.map(
              (p, index, arr) =>
                index !== arr.length - 1 && (
                  <Line
                    points={[p.x, p.y, arr[index + 1].x, arr[index + 1].y]}
                    stroke="black"
                    strokeWidth={10}
                    lineCap="round"
                    opacity={0.5}
                    {...getLineStyleForDataPoint(p)}
                  ></Line>
                )
            )}
          </FastLayer>
          <FastLayer>
            {percentages.map(
              (p) =>
                isMousePositionWithinRadius(adjustedMousePosition, p) && (
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
          </FastLayer>
        </Stage>
      </div>
      {percentages.map((p) => (
        <>
          {isMousePositionWithinRadius(adjustedMousePosition, p) && (
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

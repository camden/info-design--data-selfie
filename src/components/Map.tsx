import React, { useState, useCallback } from 'react';
import { Image, Layer, Line, Stage } from 'react-konva';
import useImage from 'use-image';
import WorldMapSVG from '../assets/world-map2.svg';
import birdData from '../data/birds';
import Point from './Point';
import { PointObj } from '../types';
import stringToColor from '../utils/string-to-color';
import pointFromLineAndTime from '../utils/point-from-line-and-time';
import pointsArrayFromBirdObj from '../utils/points-array-from-bird-obj';
/// <reference path="../react-control-panel.d.ts"/>
import ControlPanel, { Checkbox, Range } from 'react-control-panel';
import useInterval from '../utils/use-interval';
import styles from './Map.module.css';

const CANVAS_WIDTH = 550;
const CANVAS_HEIGHT = 740;

const Map = () => {
  const [drawLines, setDrawLines] = useState(false);
  const [drawPoints, setDrawPoints] = useState(false);
  const [birdRadius, setBirdRadius] = useState(2);
  const [birdOpacity, setBirdOpacity] = useState(0.7);
  const [delayMs, setDelayMs] = useState(100);
  const [birdMovementIncrement, setBirdMovementIncrement] = useState(0.1);

  const onControlChange = useCallback((label, newValue) => {
    switch (label) {
      case 'draw_lines':
        setDrawLines(newValue);
        break;
      case 'draw_points':
        setDrawPoints(newValue);
        break;
      case 'bird_radius':
        setBirdRadius(newValue);
        break;
      case 'bird_opacity':
        setBirdOpacity(newValue);
        break;
      case 'delay_ms':
        setDelayMs(newValue);
        break;
      case 'bird_movement_increment':
        setBirdMovementIncrement(newValue);
        break;
    }
  }, []);

  const [time, setTime] = useState(0);

  useInterval(() => {
    if (time >= 99) {
      setTime(1);
    } else {
      setTime(time + birdMovementIncrement);
    }
  }, delayMs);

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
    <div className={styles.main}>
      <ControlPanel onChange={onControlChange}>
        <Checkbox label="draw_lines" initial={drawLines}></Checkbox>
        <Checkbox label="draw_points" initial={drawPoints}></Checkbox>
        <Range
          label="bird_radius"
          min={1}
          max={20}
          initial={birdRadius}
        ></Range>
        <Range
          label="bird_opacity"
          min={0.1}
          max={1}
          initial={birdOpacity}
        ></Range>
        <Range
          label="bird_movement_increment"
          min={0.1}
          max={2}
          initial={birdMovementIncrement}
        ></Range>
        <Range
          label="delay_ms"
          min={10}
          max={500}
          initial={delayMs}
          step={1}
        ></Range>
      </ControlPanel>
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
              {drawLines && (
                <Line
                  key={`${bird.common_name} line`}
                  points={pointsArrayFromBirdObj(bird, true)}
                  stroke={stringToColor(bird.common_name)}
                  closed
                  opacity={0.2}
                />
              )}
              {drawPoints &&
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
                radius={birdRadius}
                opacity={birdOpacity}
              />
            </>
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Map;

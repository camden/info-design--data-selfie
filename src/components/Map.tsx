import React, { useState, useEffect } from 'react';
import { Stage, Rect, Layer, Circle, Line, Image } from 'react-konva';
import birdData from '../data/birds-subset';
import WorldMapSVG from '../assets/world-map2.svg';
import useImage from 'use-image';

export interface PointProps {
  x: number;
  y: number;
  color?: string;
}

// https://stackoverflow.com/a/16348977/2399208
const stringToColor = function(str: string) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xff;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
};

const Point: React.FC<PointProps> = ({ x, y, color }) => {
  return (
    <Circle
      x={x * POINT_SCALE + X_ADJUST}
      y={y * POINT_SCALE + Y_ADJUST}
      radius={5}
      fill={color || 'red'}
    />
  );
};

const POINT_SCALE = 0.5;
const X_ADJUST = 0;
const Y_ADJUST = 200;

const Map = () => {
  const [img] = useImage(WorldMapSVG);

  const CANVAS_WIDTH = 1000;
  const CANVAS_HEIGHT = 740;

  const birds = Object.values(birdData);

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
        {birds.map(obj =>
          Object.values(obj).map(s => (
            <Point x={s.x} y={s.y} color={stringToColor(s.common_name)} />
          ))
        )}
      </Layer>
    </Stage>
  );
};

export default Map;

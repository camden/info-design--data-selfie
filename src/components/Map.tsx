import React, { useState, useEffect } from 'react';
import { Stage, Rect, Layer, Circle, Line, Image } from 'react-konva';
import birdData from '../data/birds';
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

const scaleX = (x: number) => x * POINT_SCALE + X_ADJUST;
const scaleY = (y: number) => y * POINT_SCALE + Y_ADJUST;

const Point: React.FC<PointProps> = ({ x, y, color }) => {
  return (
    <Circle x={scaleX(x)} y={scaleY(y)} radius={2} fill={color || 'red'} />
  );
};

const POINT_SCALE = 0.5;
const X_ADJUST = 0;
const Y_ADJUST = 200;

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

const pointsArrayFromBirdObj = (b: BirdObj): number[] => {
  return Object.values(b).reduce((arr, cur) => {
    return [...arr, scaleX(cur.x), scaleY(cur.y)];
  }, []);
};

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
        {birds.map(obj => (
          <>
            <Line
              key={Object.values(obj)[0].common_name}
              points={pointsArrayFromBirdObj(obj)}
              stroke={stringToColor(Object.values(obj)[0].common_name)}
              tension={0.3}
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
      </Layer>
    </Stage>
  );
};

export default Map;

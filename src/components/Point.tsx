import React from 'react';
import { Circle } from 'react-konva';
import { scaleX, scaleY } from '../utils/scale';

export interface PointProps {
  x: number;
  y: number;
  color?: string;
  radius?: number;
}

const Point: React.FC<PointProps> = ({ x, y, color, radius }) => {
  return (
    <Circle
      x={scaleX(x)}
      y={scaleY(y)}
      radius={radius || 2}
      fill={color || 'red'}
    />
  );
};

export default Point;

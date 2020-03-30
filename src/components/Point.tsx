import React from 'react';
import { Circle } from 'react-konva';

export interface PointProps {
  x: number;
  y: number;
  color?: string;
  radius?: number;
  opacity?: number;
}

const Point: React.FC<PointProps> = ({ x, y, color, radius, opacity }) => {
  return (
    <Circle
      x={x}
      y={y}
      radius={radius || 2}
      fill={color || 'red'}
      opacity={opacity}
    />
  );
};

export default Point;

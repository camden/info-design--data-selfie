const POINT_SCALE = 0.5;
const X_ADJUST = 0;
const Y_ADJUST = 200;

export const scaleX = (x: number) => x * POINT_SCALE + X_ADJUST;
export const scaleY = (y: number) => y * POINT_SCALE + Y_ADJUST;

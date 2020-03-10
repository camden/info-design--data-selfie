import { scaleX, scaleY } from '../utils/scale';
import { BirdObj } from '../types';

const pointsArrayFromBirdObj = (b: BirdObj, scaled?: boolean): number[] => {
  return Object.values(b.seasons).reduce<number[]>((arr, cur) => {
    if (!cur) {
      return arr;
    }

    const nx = scaled ? scaleX(cur.x) : cur.x;
    const ny = scaled ? scaleY(cur.y) : cur.y;

    return [...arr, nx, ny];
  }, []);
};

export default pointsArrayFromBirdObj;

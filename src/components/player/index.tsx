import React, {
  forwardRef,
  FC,
} from 'react';
import { Song } from './player';
import './style.scss';

function timeFormat(t = 0) {
  const m = Math.round(t % 60);
  return `${Math.floor(t / 60)}:${m < 10 ? '0' + m : m}`;
}

export type PlayModes = 'loop' | 'sequence' | 'random';
interface PlayerProps {
  className?: string;
}
const Player: FC<PlayerProps> = function(props) {

  return (
    <div>Hello World</div>
  );
};
export function getRandom(current: number, total: number): number {
  const random = Math.floor(Math.random() * total);
  if (random >= current) {
    return random - 1;
  }
  return random;
}

export { Player };

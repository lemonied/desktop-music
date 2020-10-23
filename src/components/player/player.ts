import { Observable } from 'rxjs';
import { Record, fromJS } from 'immutable';
import { store } from '../../store';
import { PLAYER_INFO } from './store/types';

export const audioService = new Audio();

export interface Song {
  duration: number; // seconds
  image: string; // image url
  name: string; // song name
  singer: string; // singer name
  url?: string; // play url
  like?: boolean; // like or dislike
}
export type SongState = Record<Song>;
interface PlayerStatesObj {
  playing: boolean;
  percent: number;
  list: Song[];
  currentSong?: Song;
}
export type PlayerStates = Record<PlayerStatesObj>;

export const defaultPlayerInfo = fromJS({
  playing: false,
  percent: 0,
  list: []
});
export const audioListener = (): Observable<PlayerStates> => {
  return new Observable<PlayerStates>(subscriber => {
    audioService.onpause = () => {
      subscriber.next(
        store.getState().setIn([PLAYER_INFO, 'playing'], false)
      );
    };
    audioService.onplay = () => {
      subscriber.next(
        store.getState().setIn([PLAYER_INFO, 'playing'], true)
      );
    };
  });
};

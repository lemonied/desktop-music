import {
  PlayerStates,
  SongState,
  Song,
  PlayModes,
  usePlayingList,
  useCurrentSong,
  useCurrentSongLoading,
  usePlayMode
} from './reducers';
import {
  SET_CURRENT_LYRIC,
  SET_CURRENT_LYRIC_NUM,
  SET_CURRENT_SONG,
  SET_CURRENT_SONG_LOADING,
  SET_CURRENT_SONG_PLAYING,
  SET_DURATION,
  SET_FULLSCREEN,
  SET_LYRIC,
  SET_NOW,
  SET_PLAY_MODE,
  SET_PLAYER_INFO,
  SET_PLAYING_LIST,
  SET_VOLUME,
  TOGGLE_FULLSCREEN
} from './types';
import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { fromJS, List } from 'immutable';
import { LyricLine } from '../lyric';
import { audioService, getRandom } from '../player';

export const setPlayerInfo = (value: PlayerStates) => {
  return {
    type: SET_PLAYER_INFO,
    value
  };
};
export const setPlayingList = (value: List<SongState>) => {
  return {
    type: SET_PLAYING_LIST,
    value
  };
};
export const setCurrentSong = (value?: SongState) => {
  return {
    type: SET_CURRENT_SONG,
    value
  };
};
export const setCurrentSongLoading = (value: boolean) => {
  return {
    type: SET_CURRENT_SONG_LOADING,
    value
  };
};
export const setCurrentSongPlaying = (value: boolean) => {
  return {
    type: SET_CURRENT_SONG_PLAYING,
    value
  };
};
export const setLyric = (value: List<LyricLine>) => {
  return {
    type: SET_LYRIC,
    value
  };
};
export const setCurrentLyric = (value: string) => {
  return {
    type: SET_CURRENT_LYRIC,
    value
  };
};
export const setCurrentLyricNum = (value: number) => {
  return {
    type: SET_CURRENT_LYRIC_NUM,
    value
  };
};
export const setNow = (value: number) => {
  return {
    type: SET_NOW,
    value
  };
};
export const setDuration = (value: number) => {
  return {
    type: SET_DURATION,
    value
  };
};
export const setPlayMode = (value: PlayModes) => {
  return {
    type: SET_PLAY_MODE,
    value
  };
};
export const setVolume = (value: number) => {
  return {
    type: SET_VOLUME,
    value
  };
};
export const setFullscreen = (value: boolean) => {
  return {
    type: SET_FULLSCREEN,
    value
  };
};
export const toggleFullscreen = () => {
  return { type: TOGGLE_FULLSCREEN };
};

export const useSetPlayerInfo = () => {
  const dispatch = useDispatch();
  return useCallback((playerStates: PlayerStates) => {
    dispatch(
      setPlayerInfo(fromJS(playerStates))
    );
  }, [dispatch]);
};
export const useSetPlayingList = () => {
  const dispatch = useDispatch();
  const setCurrentSong = useSetCurrentSong();
  return useCallback((songs: Song[], defaultIndex = 0) => {
    const formatted = fromJS(songs);
    dispatch(
      setPlayingList(formatted)
    );
    setCurrentSong(formatted.get(defaultIndex));
  }, [dispatch, setCurrentSong]);
};
export const useSetCurrentSong = () => {
  const dispatch = useDispatch();
  const playingList = usePlayingList();
  const setDuration = useSetDuration();
  return useCallback((song: SongState | number = 0) => {
    const s = typeof song === 'number' ?
      playingList.get(song) : song;
    dispatch(setCurrentSong(s));
    if (s) {
      setDuration(s.get('duration'));
    }
  }, [dispatch, playingList, setDuration]);
};
export const useSetCurrentSongLoading = () => {
  const dispatch = useDispatch();
  return useCallback((loading: boolean) => {
    dispatch(
      setCurrentSongLoading(loading)
    );
  }, [dispatch]);
};
export const useSetCurrentSongPlaying = () => {
  const dispatch = useDispatch();
  return useCallback((playing: boolean) => {
    dispatch(
      setCurrentSongPlaying(playing)
    );
  }, [dispatch]);
};
export const useSetLyric = () => {
  const dispatch = useDispatch();
  return useCallback((lyric: LyricLine[]) => {
    dispatch(
      setLyric(List(lyric))
    );
  }, [dispatch]);
};
export const useSetCurrentLyric = () => {
  const dispatch = useDispatch();
  return useCallback((lyric: string) => {
    dispatch(
      setCurrentLyric(lyric)
    );
  }, [dispatch]);
};
export const useSetCurrentLyricNum = () => {
  const dispatch = useDispatch();
  return useCallback((num: number) => {
    dispatch(
      setCurrentLyricNum(num)
    );
  }, [dispatch]);
};
export const useSetNow = () => {
  const dispatch = useDispatch();
  return useCallback((time: number) => {
    dispatch(
      setNow(time)
    );
  }, [dispatch]);
};
export const useSetDuration = () => {
  const dispatch = useDispatch();
  return useCallback((time: number) => {
    dispatch(
      setDuration(time)
    );
  }, [dispatch]);
};
export const useSetPlayMode = () => {
  const dispatch = useDispatch();
  return useCallback((mode: PlayModes) => {
    dispatch(
      setPlayMode(mode)
    );
  }, [dispatch]);
};
export const useSetVolume = () => {
  const dispatch = useDispatch();
  return useCallback((volume: number) => {
    dispatch(
      setVolume(volume)
    );
  }, [dispatch]);
};
export const useNextSong = () => {
  const setCurrentSong = useSetCurrentSong();
  const playingList = usePlayingList();
  const currentSong = useCurrentSong();
  const currentSongLoading = useCurrentSongLoading();
  const playMode = usePlayMode();
  return useCallback(() => {
    if (currentSongLoading) { return; }
    if (playingList.size <= 0) { return; }
    let index = playingList.findIndex(v => v === currentSong);
    switch (playMode) {
      case 'loop':
        break;
      case 'sequence':
        index = (index + 1) % playingList.size;
        break;
      case 'random':
        index = getRandom(index, playingList.size);
        break;
    }
    const target = playingList.get(index);
    if (target === currentSong) {
      audioService.play();
    } else {
      setCurrentSong(target);
    }

  }, [playingList, setCurrentSong, currentSong, currentSongLoading, playMode]);
};
export const usePreviousSong = () => {
  const setCurrentSong = useSetCurrentSong();
  const playingList = usePlayingList();
  const currentSong = useCurrentSong();
  const currentSongLoading = useCurrentSongLoading();
  const playMode = usePlayMode();
  return useCallback(() => {
    if (currentSongLoading) { return; }
    if (playingList.size <= 0) { return; }
    let index = playingList.findIndex(v => v === currentSong);
    switch (playMode) {
      case 'random':
        index = getRandom(index, playingList.size);
        break;
      case 'loop':
        break;
      case 'sequence':
        index = index > 0 ?
          index - 1 :
          playingList.size - 1;
        break;
    }
    const target = playingList.get(index);
    if (target === currentSong) {
      audioService.play();
    } else {
      setCurrentSong(index);
    }
  }, [playingList, setCurrentSong, currentSong, currentSongLoading, playMode]);
};
export const useSetFullscreen = () => {
  const dispatch = useDispatch();
  return useCallback((fullscreen: boolean) => {
    dispatch(
      setFullscreen(fullscreen)
    );
  }, [dispatch]);
};
export const useToggleFullscreen = () => {
  const dispatch = useDispatch();
  return useCallback(() => {
    dispatch(
      toggleFullscreen()
    );
  }, [dispatch]);
};

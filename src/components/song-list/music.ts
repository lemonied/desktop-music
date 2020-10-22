export interface Music {
  name: string;
  singer: string;
  album: string;
  vip: boolean;
  songmid: string;
  songid: string;
  // seconds
  duration: number;
  image: string;
}

export interface Singer {
  name: string;
  id: string;
  index: string;
  avatar: string;
}

export const getImgByMid = (mid: string | number): string => {
  return `https://y.gtimg.cn/music/photo_new/T002R300x300M000${mid}.jpg?max_age=2592000`;
};

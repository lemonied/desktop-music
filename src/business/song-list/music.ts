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
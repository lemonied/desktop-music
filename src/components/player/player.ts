export const audioService: HTMLAudioElement = new Audio();

export function audioTimeFormat(t = 0): string {
  const m = Math.round(t % 60);
  return `${Math.floor(t / 60)}:${m < 10 ? '0' + m : m}`;
}

export function getRandom(current: number, total: number): number {
  const random = Math.floor(Math.random() * (total - 1));
  if (random >= current) {
    return Math.min(random + 1, total - 1);
  }
  return random;
}

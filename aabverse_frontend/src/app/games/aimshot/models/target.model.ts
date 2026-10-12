export type TargetType = 'standard' | 'golden' | 'penalty';

export interface Target {
  id: string;
  type: TargetType;
  x: number;
  y: number;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  points: number;
  durationMs: number;
  sizePx: number;
  createdAt: number;
  isHit?: boolean;
}

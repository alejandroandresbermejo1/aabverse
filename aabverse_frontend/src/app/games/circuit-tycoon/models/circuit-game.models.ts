export type GamePhase = 'iniciacion' | 'amateur' | 'profesional' | 'elite';

export interface UpgradeItem {
  id: string;
  name: string;
  description: string;
  category: 'car' | 'team';
  level: number;
  maxLevel: number;
  baseCostMoney: number;
  baseCostResearch: number;
  unlockedInPhase: GamePhase;
  currentCostMoney: number;
  currentCostResearch: number;
  multiplierEffect: number;
}

export interface CircuitGameState {
  playerCarColor: string;
  money: number;
  researchPoints: number;
  phase: GamePhase;
  totalTimePlayedSeconds: number;
  lastSaveTimestamp: number;
  lapsCompleted: number;
  clickBonusPower: number;
  passiveMoneyPerSecond: number;
  passiveResearchPerSecond: number;
  upgrades: Record<string, number>;
}

export interface OfflineEarningsReport {
  secondsOffline: number;
  moneyEarned: number;
  researchEarned: number;
}

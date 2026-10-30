import { Injectable, signal, computed } from '@angular/core';
import { CircuitGameState, GamePhase, OfflineEarningsReport, UpgradeItem } from '../models/circuit-game.models';
import { BASE_UPGRADES } from '../data/upgrades.data';

const STORAGE_KEY = 'circuit_tycoon_save';
const COST_GROWTH_FACTOR = 1.25;

@Injectable({
  providedIn: 'root'
})
export class CircuitGameService {
  private defaultState: CircuitGameState = {
    playerCarColor: '#e10600',
    money: 10,
    researchPoints: 0,
    phase: 'iniciacion',
    totalTimePlayedSeconds: 0,
    lastSaveTimestamp: Date.now(),
    lapsCompleted: 0,
    clickBonusPower: 1,
    passiveMoneyPerSecond: 0,
    passiveResearchPerSecond: 0,
    upgrades: {}
  };

  state = signal<CircuitGameState>(this.defaultState);
  offlineReport = signal<OfflineEarningsReport | null>(null);

  upgradesList = computed<UpgradeItem[]>(() => {
    const currentUpgrades = this.state().upgrades;
    return BASE_UPGRADES.map(item => {
      const level = currentUpgrades[item.id] || 0;
      const currentCostMoney = Math.round(item.baseCostMoney * Math.pow(COST_GROWTH_FACTOR, level));
      const currentCostResearch = item.baseCostResearch > 0
        ? Math.round(item.baseCostResearch * Math.pow(COST_GROWTH_FACTOR, level))
        : 0;

      return {
        ...item,
        level,
        currentCostMoney,
        currentCostResearch
      };
    });
  });

  playerSpeedMultiplier = computed(() => {
    const list = this.upgradesList();
    let speedBonus = 1;
    for (const item of list) {
      if (item.category === 'car' && item.level > 0) {
        speedBonus += (item.level * 0.08);
      }
    }
    return Math.min(speedBonus, 4.5);
  });

  playerSpeedKmh = computed(() => {
    const mult = this.playerSpeedMultiplier();
    const progress = Math.min(Math.max((mult - 1) / 3.5, 0), 1);
    const speed = 90 + progress * (345 - 90);
    return Math.round(speed);
  });

  private gameInterval?: any;
  private saveInterval?: any;

  constructor() {
    this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('circuit_tycoon_save_v1');
      if (saved) {
        const parsed: any = JSON.parse(saved);
        this.state.set({
          ...this.defaultState,
          money: Number(parsed.dinero ?? parsed.money ?? this.defaultState.money),
          researchPoints: Number(parsed.puntosInvestigacion ?? parsed.researchPoints ?? this.defaultState.researchPoints),
          phase: parsed.faseActual ?? parsed.phase ?? this.defaultState.phase,
          playerCarColor: parsed.colorCoche ?? parsed.playerCarColor ?? this.defaultState.playerCarColor,
          lapsCompleted: Number(parsed.vueltasCompletadas ?? parsed.lapsCompleted ?? this.defaultState.lapsCompleted),
          totalTimePlayedSeconds: Number(parsed.tiempoJugadoSegundos ?? parsed.totalTimePlayedSeconds ?? this.defaultState.totalTimePlayedSeconds),
          clickBonusPower: Number(parsed.potenciaClic ?? parsed.clickBonusPower ?? this.defaultState.clickBonusPower),
          passiveMoneyPerSecond: Number(parsed.dineroPorSegundo ?? parsed.passiveMoneyPerSecond ?? this.defaultState.passiveMoneyPerSecond),
          passiveResearchPerSecond: Number(parsed.investigacionPorSegundo ?? parsed.passiveResearchPerSecond ?? this.defaultState.passiveResearchPerSecond),
          upgrades: parsed.mejoras ?? parsed.upgrades ?? {},
          lastSaveTimestamp: Date.now()
        });
        this.recalculateProduction();
        return;
      }
    } catch {
      this.state.set(this.defaultState);
    }

    this.recalculateProduction();
  }

  closeOfflineModal() {
    this.offlineReport.set(null);
  }

  startGameLoop() {
    if (this.gameInterval) return;
    this.gameInterval = setInterval(() => {
      this.tick();
    }, 1000);

    if (!this.saveInterval) {
      this.saveInterval = setInterval(() => {
        this.saveState();
      }, 5000);
    }
  }

  stopGameLoop() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = undefined;
    }
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = undefined;
    }
    this.saveState();
  }

  private tick() {
    this.state.update(s => ({
      ...s,
      money: s.money + s.passiveMoneyPerSecond,
      researchPoints: s.researchPoints + s.passiveResearchPerSecond,
      totalTimePlayedSeconds: s.totalTimePlayedSeconds + 1,
      lastSaveTimestamp: Date.now()
    }));
  }

  recalculateProduction() {
    const list = this.upgradesList();
    let moneyPerSec = 0;
    let researchPerSec = 0;
    let clickPower = 1;

    let totalUpgradeLevels = 0;
    for (const item of list) {
      totalUpgradeLevels += item.level;
      if (item.level === 0) continue;

      if (item.id === 'engine_power') {
        moneyPerSec += item.level * 2;
      } else if (item.id === 'aero_wings') {
        moneyPerSec += item.level * 3.5;
      } else if (item.id === 'brakes_cooling') {
        moneyPerSec += item.level * 4;
      } else if (item.id === 'pit_mechanics') {
        moneyPerSec += item.level * 2.5;
      } else if (item.id === 'box_tools') {
        moneyPerSec += item.level * 4.5;
      } else if (item.id === 'driver_training') {
        clickPower += item.level * 1;
        moneyPerSec += item.level * 2;
      } else if (item.id === 'tires_compound') {
        moneyPerSec += item.level * 8;
      } else if (item.id === 'telemetry_box') {
        clickPower += item.level * 2.5;
      } else if (item.id === 'gearbox_quick') {
        moneyPerSec += item.level * 18;
      } else if (item.id === 'local_sponsors') {
        moneyPerSec += item.level * 12;
      } else if (item.id === 'motorhome_base') {
        moneyPerSec += item.level * 25;
        researchPerSec += item.level * 0.5;
      } else if (item.id === 'ers_hybrid') {
        moneyPerSec += item.level * 55;
        clickPower += item.level * 6;
      } else if (item.id === 'carbon_brakes_pro') {
        moneyPerSec += item.level * 90;
      } else if (item.id === 'engineers_hire') {
        researchPerSec += item.level * 1.5;
        moneyPerSec += item.level * 30;
      } else if (item.id === 'wind_tunnel') {
        researchPerSec += item.level * 4;
      } else if (item.id === 'global_brands') {
        moneyPerSec += item.level * 180;
      } else if (item.id === 'carbon_chassis') {
        moneyPerSec += item.level * 400;
        researchPerSec += item.level * 6;
      } else if (item.id === 'ai_race_strategy') {
        moneyPerSec += item.level * 850;
        researchPerSec += item.level * 16;
      } else if (item.id === 'f1_factory') {
        moneyPerSec += item.level * 1800;
        researchPerSec += item.level * 35;
      } else if (item.id === 'legend_wind_tunnel') {
        moneyPerSec += item.level * 3500;
        clickPower += item.level * 25;
      }
    }

    let calculatedPhase: GamePhase = 'iniciacion';
    if (totalUpgradeLevels >= 360) {
      calculatedPhase = 'elite';
    } else if (totalUpgradeLevels >= 250) {
      calculatedPhase = 'profesional';
    } else if (totalUpgradeLevels >= 145) {
      calculatedPhase = 'amateur';
    }

    this.state.update(s => ({
      ...s,
      phase: calculatedPhase,
      clickBonusPower: Math.round(clickPower),
      passiveMoneyPerSecond: Math.round(moneyPerSec * 10) / 10,
      passiveResearchPerSecond: Math.round(researchPerSec * 10) / 10
    }));
  }

  manualTrackClick() {
    const reward = this.state().clickBonusPower;
    this.state.update(s => ({
      ...s,
      money: s.money + reward
    }));
    return reward;
  }

  recordLapCompleted() {
    const lapBonus = Math.max(1, Math.round(this.state().clickBonusPower * 2.5));
    this.state.update(s => ({
      ...s,
      lapsCompleted: s.lapsCompleted + 1,
      money: s.money + lapBonus
    }));
    return lapBonus;
  }

  buyUpgrade(upgradeId: string): boolean {
    const item = this.upgradesList().find(u => u.id === upgradeId);
    if (!item || item.level >= item.maxLevel) return false;

    const s = this.state();
    if (s.money < item.currentCostMoney || s.researchPoints < item.currentCostResearch) {
      return false;
    }

    this.state.update(curr => {
      const currentLevel = curr.upgrades[upgradeId] || 0;
      return {
        ...curr,
        money: curr.money - item.currentCostMoney,
        researchPoints: curr.researchPoints - item.currentCostResearch,
        upgrades: {
          ...curr.upgrades,
          [upgradeId]: currentLevel + 1
        }
      };
    });

    this.recalculateProduction();
    this.saveState();
    return true;
  }

  updateCarColor(color: string) {
    this.state.update(s => ({ ...s, playerCarColor: color }));
    this.saveState();
  }

  saveState() {
    try {
      const s = this.state();
      const saveSpanish = {
        dinero: s.money,
        puntosInvestigacion: s.researchPoints,
        faseActual: s.phase,
        colorCoche: s.playerCarColor,
        vueltasCompletadas: s.lapsCompleted,
        tiempoJugadoSegundos: s.totalTimePlayedSeconds,
        potenciaClic: s.clickBonusPower,
        dineroPorSegundo: s.passiveMoneyPerSecond,
        investigacionPorSegundo: s.passiveResearchPerSecond,
        mejoras: s.upgrades,
        ultimoGuardadoTimestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveSpanish));
    } catch {
    }
  }

  exportSaveToFile() {
    const s = this.state();
    const saveSpanish = {
      juego: 'Circuit Tycoon',
      version: '1.0',
      fechaGuardado: new Date().toLocaleString('es-ES'),
      dinero: s.money,
      puntosInvestigacion: s.researchPoints,
      faseActual: s.phase,
      colorCoche: s.playerCarColor,
      vueltasCompletadas: s.lapsCompleted,
      tiempoJugadoSegundos: s.totalTimePlayedSeconds,
      potenciaClic: s.clickBonusPower,
      dineroPorSegundo: s.passiveMoneyPerSecond,
      investigacionPorSegundo: s.passiveResearchPerSecond,
      mejoras: s.upgrades
    };

    const dataStr = JSON.stringify(saveSpanish, null, 2);
    const blob = new Blob([dataStr], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timeStr = `${pad(now.getHours())}-${pad(now.getMinutes())}`;
    const dateStr = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
    const fileName = `partida_guardada_circuit_${timeStr}_${dateStr}.txt`;
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importSaveFromJson(jsonString: string): boolean {
    try {
      const parsed: any = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return false;
      }

      const money = parsed.dinero ?? parsed.money;
      const phase = parsed.faseActual ?? parsed.phase;
      if (money === undefined || !phase) {
        return false;
      }

      this.state.set({
        ...this.defaultState,
        money: Number(money) || 0,
        researchPoints: Number(parsed.puntosInvestigacion ?? parsed.researchPoints) || 0,
        phase: phase,
        playerCarColor: parsed.colorCoche ?? parsed.playerCarColor ?? '#e10600',
        lapsCompleted: Number(parsed.vueltasCompletadas ?? parsed.lapsCompleted) || 0,
        totalTimePlayedSeconds: Number(parsed.tiempoJugadoSegundos ?? parsed.totalTimePlayedSeconds) || 0,
        clickBonusPower: Number(parsed.potenciaClic ?? parsed.clickBonusPower) || 1,
        passiveMoneyPerSecond: Number(parsed.dineroPorSegundo ?? parsed.passiveMoneyPerSecond) || 0,
        passiveResearchPerSecond: Number(parsed.investigacionPorSegundo ?? parsed.passiveResearchPerSecond) || 0,
        upgrades: parsed.mejoras ?? parsed.upgrades ?? {},
        lastSaveTimestamp: Date.now()
      });
      this.recalculateProduction();
      this.saveState();
      return true;
    } catch {
      return false;
    }
  }

  resetGame() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
    }
    this.state.set(this.defaultState);
    this.recalculateProduction();
  }
}

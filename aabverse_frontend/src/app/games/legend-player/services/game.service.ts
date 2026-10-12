import { Injectable, signal, computed } from '@angular/core';
import { 
  GameState, 
  PlayerProfile, 
  SimulationSpeed, 
  ContractOption, 
  SeasonRecord, 
  CareerEvent, 
  EventChoice,
  Position,
  Foot,
  Team,
  Award
} from '../models/game.models';
import { TEAMS_DATABASE, CAREER_EVENTS_DATABASE, getNationalTeamInfo, getTeamBadgeUrl, getTrophyEmoji } from '../data/game-data';

export function getTrophyIconUrl(name: string, fallbackEmoji: string = ''): string {
  return getTrophyEmoji(name);
}

const STORAGE_KEY = 'legend_player_career_save_v1';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  readonly state = signal<GameState>({
    speed: 'slow',
    screen: 'setup-creation',
    player: null,
    seasonHistory: [],
    currentOffers: [],
    pendingEvent: null,
    activeEventResult: null,
    activeEventDetails: null,
    isSpinningRoulette: false,
    isSimulating: false,
    allTimeAwards: []
  });

  readonly isGameOver = computed(() => {
    const player = this.state().player;
    return player ? player.currentAge >= 40 : false;
  });

  constructor() {
    this.loadFromStorage();
  }

  setSimulationSpeed(speed: SimulationSpeed) {
    this.state.update(s => ({ ...s, speed }));
    this.saveToStorage();
  }


  createPlayer(data: {
    nickname: string;
    number: number;
    preferredFoot: Foot;
    position: Position;
    nationality: string;
    nationalityFlag: string;
  }) {
    const baseOvr = 50;

    const freeAgentTeam: Team = {
      id: 'free_agent',
      name: 'Agente Libre',
      badge: '🆓',
      league: 'Sin equipo',
      division: 3,
      country: data.nationality,
      countryFlag: data.nationalityFlag,
      prestige: 50
    };

    const natInfo = getNationalTeamInfo(data.nationality, data.nationalityFlag);

    const newPlayer: PlayerProfile = {
      nickname: data.nickname,
      number: data.number,
      preferredFoot: data.preferredFoot,
      position: data.position,
      nationality: data.nationality,
      nationalityFlag: data.nationalityFlag,
      currentAge: 16,
      ovr: baseOvr,
      marketValue: this.calculateMarketValue(baseOvr, 16),
      currentTeam: freeAgentTeam,
      trophies: [],
      careerStats: {
        matchesPlayed: 0,
        goals: 0,
        saves: 0,
        assists: 0,
        defensiveActions: 0,
        titlesWon: 0
      },
      nationalTeamStats: {
        teamName: natInfo.officialName,
        flag: natInfo.badge || natInfo.flag,
        callups: 0,
        matchesPlayed: 0,
        goals: 0,
        saves: 0,
        assists: 0,
        defensiveActions: 0,
        titles: []
      }
    };

    const initialOffers = this.generateContractOffers(newPlayer);

    this.state.update(s => ({
      ...s,
      player: newPlayer,
      currentOffers: initialOffers,
      screen: 'career-main',
      seasonHistory: [],
      allTimeAwards: []
    }));

    this.saveToStorage();
  }

  private pendingContractOffer?: ContractOption;
  private currentEventTriggerPercent: number = 50;

  selectContract(offer: ContractOption) {
    const currentState = this.state();
    if (!currentState.player || currentState.isSimulating) return;

    this.pendingContractOffer = offer;

    const player = currentState.player;
    const hasRandomEvent = player.currentAge < 40 && Math.random() < 0.35;
    const randomEvent = hasRandomEvent
      ? CAREER_EVENTS_DATABASE[Math.floor(Math.random() * CAREER_EVENTS_DATABASE.length)]
      : null;

    if (randomEvent) {
      this.currentEventTriggerPercent = Math.floor(20 + Math.random() * 60);
      const pauseTime = Math.floor((this.currentEventTriggerPercent / 100) * 2800);

      this.state.update(s => ({
        ...s,
        isSimulating: true,
        simProgressWidth: 0,
        simProgressDuration: 0,
        activeEventResult: null,
        activeEventDetails: null,
        pendingEvent: null
      }));

      setTimeout(() => {
        this.state.update(s => ({
          ...s,
          simProgressWidth: this.currentEventTriggerPercent,
          simProgressDuration: pauseTime
        }));
      }, 40);

      setTimeout(() => {
        this.state.update(s => ({
          ...s,
          pendingEvent: randomEvent
        }));
      }, pauseTime + 50);
    } else {
      this.state.update(s => ({
        ...s,
        isSimulating: true,
        simProgressWidth: 0,
        simProgressDuration: 0,
        activeEventResult: null,
        activeEventDetails: null,
        pendingEvent: null
      }));

      setTimeout(() => {
        this.state.update(s => ({
          ...s,
          simProgressWidth: 100,
          simProgressDuration: 2800
        }));
      }, 40);

      setTimeout(() => {
        this.simulateSeason(offer);
      }, 2850);
    }
  }

  private simulateSeason(offer: ContractOption) {
    const currentState = this.state();
    const player = { ...currentState.player! };
    const speed = currentState.speed;
    const yearsToAdvance = speed === 'fast' ? 3 : speed === 'normal' ? 2 : 1;
    const isLoan = offer.type === 'Loan';

    player.currentTeam = offer.team;
    if (isLoan) {
      player.parentTeam = offer.originTeam || currentState.player?.currentTeam;
    } else {
      player.parentTeam = undefined;
    }

    const newRecords: SeasonRecord[] = [];
    const newAwards: Award[] = [];

    const startAge = player.currentAge;
    const startYear = 2026 + (startAge - 16);
    const clubAwards: Award[] = [];
    let totalMatches = 0;
    let totalGoals = 0;
    let totalSaves = 0;
    let totalCleanSheets = 0;
    let totalAssists = 0;
    let totalDefensiveActions = 0;
    let totalRatingSum = 0;

    for (let y = 0; y < yearsToAdvance; y++) {
      if (player.currentAge >= 40) break;

      const age = player.currentAge;
      const position = player.position;
      const teamPrestige = offer.team.prestige;
      
      let ovrVsTeamRatio = player.ovr / Math.max(50, teamPrestige);
      
      let starterFactor = 1.0;
      if (ovrVsTeamRatio >= 1.05) {
        starterFactor = 0.95 + Math.random() * 0.1;
      } else if (ovrVsTeamRatio >= 0.90) {
        starterFactor = 0.80 + Math.random() * 0.15;
      } else if (ovrVsTeamRatio >= 0.75) {
        starterFactor = 0.60 + Math.random() * 0.2;
      } else {
        starterFactor = 0.40 + Math.random() * 0.25;
      }

      if (age <= 18 && starterFactor > 0.8) {
        starterFactor *= 0.85;
      } else if (age >= 36) {
        starterFactor *= 0.7;
      }

      const totalTeamMatches = 50;
      const matchesPlayed = Math.max(10, Math.min(50, Math.floor(totalTeamMatches * starterFactor)));

      let goals = 0;
      let saves = 0;
      let assists = 0;
      let defensiveActions = 0;

      const isAttacker = ['DC', 'EI', 'ED'].includes(position);
      const isMidfielder = ['MC', 'MI', 'MD', 'MCD', 'MCO'].includes(position);
      const isDefender = ['DFC', 'LD', 'LI'].includes(position);

      const teamDominance = teamPrestige / 100;

      if (position === 'POR') {
        const savesPerMatch = (2.2 + (1 - teamDominance) * 2.8) * (0.85 + (player.ovr / 100) * 0.3);
        const shotsStoppedPerMatch = (1.5 + (1 - teamDominance) * 2.0) * (0.85 + (player.ovr / 100) * 0.25);
        saves = Math.floor(matchesPlayed * savesPerMatch * (0.85 + Math.random() * 0.3));
        defensiveActions = Math.floor(matchesPlayed * shotsStoppedPerMatch * (0.85 + Math.random() * 0.3));
        goals = 0;
        assists = Math.random() < 0.05 ? 1 : 0;
      } else if (isAttacker) {
        const goalRatioPerMatch = (0.35 + teamDominance * 0.55) * (player.ovr / 75);
        const assistRatioPerMatch = (0.1 + teamDominance * 0.25) * (player.ovr / 85);
        goals = Math.floor(matchesPlayed * goalRatioPerMatch * (0.8 + Math.random() * 0.4));
        assists = Math.floor(matchesPlayed * assistRatioPerMatch * (0.8 + Math.random() * 0.4));
        defensiveActions = Math.floor(Math.random() * 4);
      } else if (isMidfielder) {
        const assistRatioPerMatch = (0.3 + teamDominance * 0.5) * (player.ovr / 75);
        const goalRatioPerMatch = (0.12 + teamDominance * 0.28) * (player.ovr / 85);
        assists = Math.floor(matchesPlayed * assistRatioPerMatch * (0.8 + Math.random() * 0.4));
        goals = Math.floor(matchesPlayed * goalRatioPerMatch * (0.8 + Math.random() * 0.4));
        defensiveActions = Math.floor(matchesPlayed * (0.3 + Math.random() * 0.4));
      } else if (isDefender) {
        const defActionsPerMatch = (2.0 + teamDominance * 1.5) * (player.ovr / 75);
        const assistRatioPerMatch = (0.05 + teamDominance * 0.15) * (player.ovr / 85);
        const goalRatioPerMatch = (0.02 + teamDominance * 0.07);
        defensiveActions = Math.floor(matchesPlayed * defActionsPerMatch * (0.85 + Math.random() * 0.3));
        assists = Math.floor(matchesPlayed * assistRatioPerMatch * (0.8 + Math.random() * 0.4));
        goals = Math.floor(matchesPlayed * goalRatioPerMatch * (0.8 + Math.random() * 0.4));
      }

      let seasonRating = 6.5;
      if (position === 'POR') {
        seasonRating = Number((6.2 + (matchesPlayed / 50) * 1.2 + (saves / Math.max(1, matchesPlayed)) * 0.4 + (Math.random() * 0.6 - 0.3)).toFixed(1));
      } else if (isDefender) {
        seasonRating = Number((6.2 + (matchesPlayed / 50) * 1.2 + (defensiveActions / Math.max(1, matchesPlayed)) * 0.5 + (assists * 0.4) / Math.max(1, matchesPlayed) + (Math.random() * 0.6 - 0.3)).toFixed(1));
      } else if (isMidfielder) {
        seasonRating = Number((6.2 + (matchesPlayed / 50) * 1.2 + (assists * 1.0 + goals * 0.8) / Math.max(1, matchesPlayed) * 2.5 + (Math.random() * 0.6 - 0.3)).toFixed(1));
      } else {
        seasonRating = Number((6.2 + (matchesPlayed / 50) * 1.2 + (goals * 1.0 + assists * 0.6) / Math.max(1, matchesPlayed) * 2.5 + (Math.random() * 0.6 - 0.3)).toFixed(1));
      }

      let ovrChange = 0;
      if (age <= 22) {
        if (seasonRating >= 7.0) {
          ovrChange = player.ovr < 78 ? (3 + Math.floor(Math.random() * 2)) : (2 + Math.floor(Math.random() * 2));
        } else if (seasonRating >= 6.4) {
          ovrChange = player.ovr < 78 ? (2 + Math.floor(Math.random() * 2)) : (1 + Math.floor(Math.random() * 2));
        } else if (seasonRating >= 5.8) {
          ovrChange = 1;
        } else {
          ovrChange = 0;
        }
      } else if (age <= 28) {
        if (seasonRating >= 7.6) {
          ovrChange = player.ovr >= 95 ? 1 : 2;
        } else if (seasonRating >= 7.0) {
          ovrChange = player.ovr >= 94 ? 1 : 2;
        } else if (seasonRating >= 6.4) {
          ovrChange = player.ovr >= 92 ? 0 : 1;
        } else if (seasonRating >= 5.8) {
          ovrChange = 0;
        } else {
          ovrChange = -1;
        }
      } else if (age <= 32) {
        if (seasonRating >= 7.4) {
          ovrChange = player.ovr < 94 ? 1 : 0;
        } else if (seasonRating >= 6.5) {
          ovrChange = 0;
        } else {
          ovrChange = -1;
        }
      } else if (age <= 35) {
        if (seasonRating >= 8.0) {
          ovrChange = 0;
        } else if (seasonRating >= 6.8) {
          ovrChange = -1;
        } else {
          ovrChange = -2;
        }
      } else if (age <= 37) {
        if (seasonRating >= 8.1) {
          ovrChange = -1;
        } else if (seasonRating >= 6.8) {
          ovrChange = -2;
        } else {
          ovrChange = -3;
        }
      } else {
        if (seasonRating >= 8.1) {
          ovrChange = -2;
        } else if (seasonRating >= 6.8) {
          ovrChange = -3;
        } else {
          ovrChange = -4;
        }
      }

      if (player.ovr >= 96 && ovrChange > 1) {
        ovrChange = 1;
      }

      player.ovr = Math.min(99, Math.max(50, player.ovr + ovrChange));
      player.marketValue = this.calculateMarketValue(player.ovr, age + 1);

      const seasonAwards: Award[] = [];
      const year = 2026 + (age - 16);
      const division = player.currentTeam.division || 3;
      const isFreeAgent = player.currentTeam.id === 'free_agent';

      if (!isFreeAgent && division === 1) {
        if (teamPrestige >= 86 && player.ovr >= 89 && seasonRating >= 8.5) {
          const winProb = (teamPrestige - 85) * 0.035 + (seasonRating - 8.4) * 0.2 + (player.ovr - 88) * 0.02;
          if (Math.random() < Math.min(0.45, winProb)) {
            seasonAwards.push({
              id: `award_ballondor_${age}_${y}`,
              year,
              age,
              name: 'Balón de Oro',
              icon: getTrophyEmoji('Balón de Oro'),
              type: 'individual',
              teamName: player.currentTeam.name,
              teamBadge: player.currentTeam.badge,
              description: `Ganador del Balón de Oro`
            });
          }
        }

        if (teamPrestige >= 84 && player.ovr >= 87 && seasonRating >= 8.3 && !seasonAwards.some(a => a.name === 'Balón de Oro')) {
          if (Math.random() < 0.20) {
            seasonAwards.push({
              id: `award_thebest_${age}_${y}`,
              year,
              age,
              name: 'The Best FIFA',
              icon: getTrophyEmoji('The Best FIFA'),
              type: 'individual',
              teamName: player.currentTeam.name,
              teamBadge: player.currentTeam.badge,
              description: `Premio The Best FIFA Player`
            });
          }
        }

        if (['DC', 'EI', 'ED'].includes(position) && goals >= 25) {
          const cleanLeagueName = player.currentTeam.league.split(' (')[0];
          let pichichiName = `Máximo Goleador de ${cleanLeagueName}`;
          if (player.currentTeam.country === 'España') pichichiName = 'Trofeo Pichichi';
          else if (player.currentTeam.country === 'Inglaterra') pichichiName = 'Bota de Oro Premier League';
          else if (player.currentTeam.country === 'Italia') pichichiName = 'Capocannoniere Serie A';
          else if (player.currentTeam.country === 'Alemania') pichichiName = 'Torjägerkanone Bundesliga';
          else if (player.currentTeam.country === 'Francia') pichichiName = 'Máximo Goleador Ligue 1';
          else if (player.currentTeam.country === 'Portugal') pichichiName = 'Bola de Prata';

          seasonAwards.push({
            id: `award_pichichi_${age}_${y}`,
            year,
            age,
            name: pichichiName,
            icon: getTrophyEmoji(pichichiName),
            type: 'individual',
            teamName: player.currentTeam.name,
            teamBadge: player.currentTeam.badge,
            description: `${pichichiName} con ${goals} goles`
          });
        }

        if (['DC', 'EI', 'ED'].includes(position) && goals >= 36) {
          seasonAwards.push({
            id: `award_bota_${age}_${y}`,
            year,
            age,
            name: 'Bota de Oro Europa',
            icon: getTrophyEmoji('Bota de Oro Europa'),
            type: 'individual',
            teamName: player.currentTeam.name,
            teamBadge: player.currentTeam.badge,
            description: `Máximo goleador de Europa (${goals} goles)`
          });
        }

        if (['MC', 'MI', 'MD', 'MCD', 'MCO'].includes(position) && assists >= 22) {
          seasonAwards.push({
            id: `award_ast_${age}_${y}`,
            year,
            age,
            name: 'Máximo Asistente',
            icon: getTrophyEmoji('Máximo Asistente'),
            type: 'individual',
            teamName: player.currentTeam.name,
            teamBadge: player.currentTeam.badge,
            description: `Líder de asistencias (${assists} asistencias)`
          });
        }

        if (position === 'POR' && saves >= 140 && seasonRating >= 8.3) {
          const zamoraName = player.currentTeam.country === 'España' ? 'Trofeo Zamora' : 'Guante de Oro';
          seasonAwards.push({
            id: `award_zamora_${age}_${y}`,
            year,
            age,
            name: zamoraName,
            icon: getTrophyEmoji(zamoraName),
            type: 'individual',
            teamName: player.currentTeam.name,
            teamBadge: player.currentTeam.badge,
            description: `Mejor Portero de la Temporada (${saves} paradas)`
          });
        }

        if (['DFC', 'LD', 'LI'].includes(position) && defensiveActions >= 120 && seasonRating >= 8.3) {
          seasonAwards.push({
            id: `award_def_${age}_${y}`,
            year,
            age,
            name: 'Mejor Defensor de la Liga',
            icon: getTrophyEmoji('Mejor Defensor'),
            type: 'individual',
            teamName: player.currentTeam.name,
            teamBadge: player.currentTeam.badge,
            description: `Mejor defensa de la temporada (${defensiveActions} acciones defensivas)`
          });
        }

        if (seasonRating >= 8.4 && player.ovr >= 87 && seasonAwards.length === 0) {
          if (Math.random() < 0.20) {
            seasonAwards.push({
              id: `award_fifpro_${age}_${y}`,
              year,
              age,
              name: 'FIFA FIFPro XI',
              icon: getTrophyEmoji('FIFA FIFPro XI'),
              type: 'individual',
              teamName: player.currentTeam.name,
              teamBadge: player.currentTeam.badge,
              description: `Incluido en el XI Ideal del Año`
            });
          }
        }
      }

      if (age <= 21 && division <= 2 && seasonRating >= 8.4 && player.ovr >= 82) {
        if (Math.random() < 0.15) {
          seasonAwards.push({
            id: `award_gb_${age}_${y}`,
            year,
            age,
            name: 'Golden Boy',
            icon: getTrophyEmoji('Golden Boy'),
            type: 'individual',
            teamName: player.currentTeam.name,
            teamBadge: player.currentTeam.badge,
            description: `Mejor jugador joven del mundo (Golden Boy)`
          });
        }
      }

      if (!isFreeAgent) {
        if (division === 1) {
          let leagueProb = 0.02;
          if (teamPrestige >= 90) leagueProb = 0.50 + (seasonRating > 8.0 ? 0.15 : 0);
          else if (teamPrestige >= 85) leagueProb = 0.25 + (seasonRating > 8.0 ? 0.10 : 0);
          else if (teamPrestige >= 80) leagueProb = 0.12;

          const cleanLeagueName = player.currentTeam.league.split(' (')[0];
          let cupName = `Copa de ${player.currentTeam.country}`;
          let supercupName = `Supercopa de ${player.currentTeam.country}`;
          if (player.currentTeam.country === 'España') {
            cupName = 'Copa del Rey';
            supercupName = 'Supercopa de España';
          } else if (player.currentTeam.country === 'Inglaterra') {
            cupName = 'FA Cup';
            supercupName = 'Community Shield';
          } else if (player.currentTeam.country === 'Italia') {
            cupName = 'Coppa Italia';
            supercupName = 'Supercoppa Italiana';
          } else if (player.currentTeam.country === 'Alemania') {
            cupName = 'DFB-Pokal';
            supercupName = 'DFL-Supercup';
          } else if (player.currentTeam.country === 'Francia') {
            cupName = 'Coupe de France';
            supercupName = 'Trophée des Champions';
          } else if (player.currentTeam.country === 'Portugal') {
            cupName = 'Taça de Portugal';
            supercupName = 'Supertaça Cândido de Oliveira';
          } else if (player.currentTeam.country === 'Argentina') {
            cupName = 'Copa Argentina';
            supercupName = 'Supercopa Argentina';
          } else if (player.currentTeam.country === 'Brasil') {
            cupName = 'Copa do Brasil';
            supercupName = 'Supercopa do Brasil';
          }

          let wonLeague = false;
          let wonUcl = false;

          if (Math.random() < leagueProb) {
            wonLeague = true;
            const titleName = `Campeón de ${cleanLeagueName}`;
            seasonAwards.push({
              id: `trophy_league_${age}_${y}`,
              year,
              age,
              name: titleName,
              icon: getTrophyIconUrl(titleName, ''),
              type: 'team',
              teamName: player.currentTeam.name,
              teamBadge: player.currentTeam.badge,
              description: `Título de ${cleanLeagueName} con ${player.currentTeam.name}`
            });
            player.trophies.push(titleName);
            player.careerStats.titlesWon += 1;
          }

          if (teamPrestige >= 78) {
            let uclProb = 0.03;
            if (teamPrestige >= 92) uclProb = 0.30 + (player.ovr >= 88 ? 0.10 : 0);
            else if (teamPrestige >= 85) uclProb = 0.15;

            if (Math.random() < uclProb) {
              wonUcl = true;
              seasonAwards.push({
                id: `trophy_ucl_${age}_${y}`,
                year,
                age,
                name: 'UEFA Champions League',
                icon: getTrophyIconUrl('UEFA Champions League', ''),
                type: 'team',
                teamName: player.currentTeam.name,
                teamBadge: player.currentTeam.badge,
                description: `Campeón de la UEFA Champions League con ${player.currentTeam.name}`
              });
              player.trophies.push('UEFA Champions League');
              player.careerStats.titlesWon += 1;
            }
          } else if (teamPrestige >= 70 && !wonUcl) {
            if (Math.random() < (teamPrestige >= 75 ? 0.20 : 0.10)) {
              seasonAwards.push({
                id: `trophy_uel_${age}_${y}`,
                year,
                age,
                name: 'UEFA Europa League',
                icon: getTrophyIconUrl('UEFA Europa League', ''),
                type: 'team',
                teamName: player.currentTeam.name,
                teamBadge: player.currentTeam.badge,
                description: `Campeón de la UEFA Europa League con ${player.currentTeam.name}`
              });
              player.trophies.push('UEFA Europa League');
              player.careerStats.titlesWon += 1;
            }
          } else if (teamPrestige >= 60 && !wonUcl) {
            if (Math.random() < 0.12) {
              seasonAwards.push({
                id: `trophy_uecl_${age}_${y}`,
                year,
                age,
                name: 'UEFA Conference League',
                icon: getTrophyIconUrl('UEFA Conference League', ''),
                type: 'team',
                teamName: player.currentTeam.name,
                teamBadge: player.currentTeam.badge,
                description: `Campeón de la UEFA Conference League con ${player.currentTeam.name}`
              });
              player.trophies.push('UEFA Conference League');
              player.careerStats.titlesWon += 1;
            }
          }

          if (wonUcl && Math.random() < 0.45) {
            seasonAwards.push({
              id: `trophy_supercup_eu_${age}_${y}`,
              year,
              age,
              name: 'Supercopa de Europa',
              icon: getTrophyIconUrl('Supercopa de Europa', ''),
              type: 'team',
              teamName: player.currentTeam.name,
              teamBadge: player.currentTeam.badge,
              description: `Campeón de la Supercopa de Europa con ${player.currentTeam.name}`
            });
            player.trophies.push('Supercopa de Europa');
            player.careerStats.titlesWon += 1;
          }

          if (wonUcl && Math.random() < 0.50) {
            seasonAwards.push({
              id: `trophy_cwc_${age}_${y}`,
              year,
              age,
              name: 'Mundial de Clubes FIFA',
              icon: getTrophyIconUrl('Mundial de Clubes FIFA', ''),
              type: 'team',
              teamName: player.currentTeam.name,
              teamBadge: player.currentTeam.badge,
              description: `Campeón del Mundial de Clubes FIFA con ${player.currentTeam.name}`
            });
            player.trophies.push('Mundial de Clubes FIFA');
            player.careerStats.titlesWon += 1;
          }

          if (Math.random() < (teamPrestige >= 85 ? 0.35 : 0.15)) {
            seasonAwards.push({
              id: `trophy_cup_${age}_${y}`,
              year,
              age,
              name: cupName,
              icon: getTrophyIconUrl(cupName, ''),
              type: 'team',
              teamName: player.currentTeam.name,
              teamBadge: player.currentTeam.badge,
              description: `Campeón de ${cupName} con ${player.currentTeam.name}`
            });
            player.trophies.push(cupName);
            player.careerStats.titlesWon += 1;
          }

          if ((wonLeague || Math.random() < 0.25) && Math.random() < 0.30) {
            seasonAwards.push({
              id: `trophy_supercup_nat_${age}_${y}`,
              year,
              age,
              name: supercupName,
              icon: getTrophyIconUrl(supercupName, ''),
              type: 'team',
              teamName: player.currentTeam.name,
              teamBadge: player.currentTeam.badge,
              description: `Campeón de la ${supercupName} con ${player.currentTeam.name}`
            });
            player.trophies.push(supercupName);
            player.careerStats.titlesWon += 1;
          }

        } else if (division === 2) {
          const div2Prob = 0.25 + (teamPrestige - 67) * 0.05 + (seasonRating > 7.5 ? 0.20 : 0);
          const cleanLeagueName = player.currentTeam.league.split(' (')[0];
          if (Math.random() < Math.min(0.65, div2Prob)) {
            const titleName = `Campeón de ${cleanLeagueName}`;
            seasonAwards.push({
              id: `trophy_div2_${age}_${y}`,
              year,
              age,
              name: titleName,
              icon: getTrophyIconUrl(titleName, ''),
              type: 'team',
              teamName: player.currentTeam.name,
              teamBadge: player.currentTeam.badge,
              description: `Campeón de ${cleanLeagueName} con ${player.currentTeam.name}`
            });
            player.trophies.push(titleName);
            player.careerStats.titlesWon += 1;
          }
        } else if (division === 3) {
          const div3Prob = 0.30 + (teamPrestige - 54) * 0.04 + (seasonRating > 7.5 ? 0.20 : 0);
          const cleanLeagueName = player.currentTeam.league.split(' (')[0];
          if (Math.random() < Math.min(0.70, div3Prob)) {
            const titleName = `Campeón de ${cleanLeagueName}`;
            seasonAwards.push({
              id: `trophy_div3_${age}_${y}`,
              year,
              age,
              name: titleName,
              icon: getTrophyIconUrl(titleName, ''),
              type: 'team',
              teamName: player.currentTeam.name,
              teamBadge: player.currentTeam.badge,
              description: `Campeón de ${cleanLeagueName} con ${player.currentTeam.name}`
            });
            player.trophies.push(titleName);
            player.careerStats.titlesWon += 1;
          }
        }
      }

      const natInfo = getNationalTeamInfo(player.nationality, player.nationalityFlag);

      if (age >= 20 && (year - 2026) % 4 === 0 && player.ovr >= 78) {
        let wcProb = (natInfo.prestige / 100) * 0.28;
        if (player.ovr >= 88) wcProb *= 1.25;
        if (seasonRating >= 8.2) wcProb *= 1.30;

        if (Math.random() < Math.min(0.60, wcProb)) {
          seasonAwards.push({
            id: `trophy_wc_${age}_${y}`,
            year,
            age,
            name: `Copa del Mundo FIFA`,
            icon: getTrophyIconUrl('Copa del Mundo FIFA', ''),
            type: 'team',
            isNational: true,
            teamName: natInfo.officialName,
            teamBadge: natInfo.badge || natInfo.flag,
            description: `Campeón del Mundo con la ${natInfo.officialName}`
          });
          player.nationalTeamStats.titles.push(`Copa del Mundo FIFA`);
          player.trophies.push(`Copa del Mundo FIFA`);
          player.careerStats.titlesWon += 1;
        }
      } else if (age >= 19 && (year - 2028) % 4 === 0 && player.ovr >= 76) {
        let contProb = (natInfo.prestige / 100) * 0.38;
        if (player.ovr >= 85) contProb *= 1.25;
        if (seasonRating >= 8.0) contProb *= 1.25;

        if (Math.random() < Math.min(0.65, contProb)) {
          seasonAwards.push({
            id: `trophy_cont_${age}_${y}`,
            year,
            age,
            name: natInfo.continentalTournamentName,
            icon: getTrophyIconUrl(natInfo.continentalTournamentName, ''),
            type: 'team',
            isNational: true,
            teamName: natInfo.officialName,
            teamBadge: natInfo.badge || natInfo.flag,
            description: `Campeón de la ${natInfo.continentalTournamentName} con la ${natInfo.officialName}`
          });
          player.nationalTeamStats.titles.push(natInfo.continentalTournamentName);
          player.trophies.push(natInfo.continentalTournamentName);
          player.careerStats.titlesWon += 1;
        }
      } else if (age >= 20 && (year - 2026) % 2 === 1 && natInfo.prestige >= 85 && player.ovr >= 80) {
        const titleName = natInfo.confederation === 'UEFA' ? 'UEFA Nations League' : 'Finalissima';
        let nlProb = 0.25 + (seasonRating >= 8.0 ? 0.15 : 0);
        if (Math.random() < nlProb) {
          seasonAwards.push({
            id: `trophy_nl_${age}_${y}`,
            year,
            age,
            name: titleName,
            icon: getTrophyIconUrl(titleName, ''),
            type: 'team',
            isNational: true,
            teamName: natInfo.officialName,
            teamBadge: natInfo.badge || natInfo.flag,
            description: `Campeón de la ${titleName} con la ${natInfo.officialName}`
          });
          player.nationalTeamStats.titles.push(titleName);
          player.trophies.push(titleName);
          player.careerStats.titlesWon += 1;
        }
      }

      newAwards.push(...seasonAwards);

      const cleanSheetsThisYear = player.position === 'POR' ? Math.floor(matchesPlayed * 0.4) : 0;

      totalMatches += matchesPlayed;
      totalGoals += goals;
      totalSaves += saves;
      totalCleanSheets += cleanSheetsThisYear;
      totalAssists += assists;
      totalDefensiveActions += defensiveActions;
      totalRatingSum += seasonRating;

      const clubYearAwards = seasonAwards.filter(a => !a.name.includes('Copa del Mundo') && (!a.teamName || !a.teamName.includes('Selección')));
      clubAwards.push(...clubYearAwards);

      if (player.ovr >= 75) {
        player.nationalTeamStats.callups += 1;
        const natMatches = Math.floor(4 + Math.random() * 6);
        let natGoals = 0;
        let natSaves = 0;
        let natAssists = 0;
        let natDefActions = 0;

        if (position === 'POR') {
          natSaves = Math.floor(natMatches * (2.2 + Math.random() * 1.5));
          natDefActions = Math.floor(natMatches * 1.1);
        } else if (isAttacker) {
          natGoals = Math.floor(natMatches * (0.35 + (player.ovr / 100) * 0.45) * (0.8 + Math.random() * 0.4));
          natAssists = Math.floor(natMatches * (0.15 + Math.random() * 0.15));
          natDefActions = Math.floor(Math.random() * 3);
        } else if (isMidfielder) {
          natAssists = Math.floor(natMatches * (0.25 + (player.ovr / 100) * 0.35) * (0.8 + Math.random() * 0.4));
          natGoals = Math.floor(natMatches * (0.12 + Math.random() * 0.18));
          natDefActions = Math.floor(natMatches * (0.3 + Math.random() * 0.3));
        } else {
          natDefActions = Math.floor(natMatches * (1.8 + Math.random() * 0.5));
          natAssists = Math.floor(natMatches * (0.05 + Math.random() * 0.1));
          natGoals = Math.floor(natMatches * (0.02 + Math.random() * 0.05));
        }

        player.nationalTeamStats.matchesPlayed += natMatches;
        player.nationalTeamStats.goals += natGoals;
        player.nationalTeamStats.saves += natSaves;
        player.nationalTeamStats.assists = (player.nationalTeamStats.assists || 0) + natAssists;
        player.nationalTeamStats.defensiveActions = (player.nationalTeamStats.defensiveActions || 0) + natDefActions;

        const natTeamObj: Team = {
          id: `nat_${player.nationality}`,
          name: natInfo.officialName,
          badge: natInfo.badge || natInfo.flag,
          league: 'Internacional',
          division: 1,
          country: player.nationality,
          countryFlag: natInfo.flag,
          prestige: natInfo.prestige
        };

        const natRating = Number((7.0 + (natGoals * 0.7 + natAssists * 0.5 + natSaves * 0.2) / Math.max(1, natMatches) + (Math.random() * 0.4 - 0.2)).toFixed(1));

        const natRecord: SeasonRecord = {
          age,
          year,
          team: natTeamObj,
          isLoan: false,
          isNationalTeam: true,
          ovr: player.ovr,
          rating: natRating,
          matchesPlayed: natMatches,
          goals: natGoals,
          saves: natSaves,
          cleanSheets: position === 'POR' ? Math.floor(natMatches * 0.4) : 0,
          assists: natAssists,
          defensiveActions: natDefActions,
          awards: seasonAwards.filter(a => a.name.includes('Copa del Mundo') || (a.teamName && a.teamName.includes('Selección'))),
          marketValue: player.marketValue
        };

        newRecords.push(natRecord);
      }

      player.careerStats.matchesPlayed += matchesPlayed;
      player.careerStats.goals += goals;
      player.careerStats.saves += saves;
      player.careerStats.assists += assists;
      player.careerStats.defensiveActions = (player.careerStats.defensiveActions || 0) + defensiveActions;

      player.currentAge += 1;
    }

    const actualYearsSimulated = player.currentAge - startAge;
    if (actualYearsSimulated > 0) {
      const avgRating = Number((totalRatingSum / actualYearsSimulated).toFixed(1));

      const clubRecord: SeasonRecord = {
        age: startAge,
        year: startYear,
        team: offer.team,
        isLoan,
        parentTeam: player.parentTeam,
        ovr: player.ovr,
        rating: avgRating,
        matchesPlayed: totalMatches,
        goals: totalGoals,
        saves: totalSaves,
        cleanSheets: totalCleanSheets,
        assists: totalAssists,
        defensiveActions: totalDefensiveActions,
        awards: clubAwards,
        marketValue: player.marketValue
      };

      newRecords.push(clubRecord);
    }

    if (isLoan && player.parentTeam) {
      player.currentTeam = player.parentTeam;
      player.parentTeam = undefined;
    }

    const nextOffers = player.currentAge < 40 ? this.generateContractOffers(player) : [];
    const isFinished = player.currentAge >= 40;

    this.state.update(s => ({
      ...s,
      player,
      isSimulating: false,
      seasonHistory: [...s.seasonHistory, ...newRecords],
      allTimeAwards: [...s.allTimeAwards, ...newAwards],
      currentOffers: nextOffers,
      pendingEvent: null,
      screen: isFinished ? 'game-over' : 'career-main'
    }));

    this.saveToStorage();
  }

  resolveEventChoice(choice: EventChoice) {
    const currentState = this.state();
    const player = currentState.player;
    if (!player || currentState.isSpinningRoulette) return;

    const eventTitle = currentState.pendingEvent?.title || 'Decisión de Carrera';
    const roll = Math.random() * 100;
    const isSuccess = roll <= choice.riskPercent;
    const outcome = isSuccess ? choice.successOutcome : choice.failureOutcome;

    this.state.update(s => ({
      ...s,
      isSpinningRoulette: true,
      activeEventDetails: {
        eventTitle,
        choiceLabel: choice.text,
        riskPercent: choice.riskPercent,
        isSuccess,
        message: outcome.message,
        ovrDelta: outcome.ovrDelta,
        marketValueDeltaPercent: outcome.marketValueDeltaPercent,
        isFired: !isSuccess && !!choice.failureOutcome.isFired
      }
    }));

    setTimeout(() => {
      const stateNow = this.state();
      const currPlayer = stateNow.player;
      if (!currPlayer) return;
      const updatedPlayer = { ...currPlayer };
      updatedPlayer.ovr = Math.min(99, Math.max(50, updatedPlayer.ovr + outcome.ovrDelta));
      updatedPlayer.marketValue = Number((updatedPlayer.marketValue * (1 + outcome.marketValueDeltaPercent / 100)).toFixed(2));

      if (!isSuccess && choice.failureOutcome.isFired) {
        this.pendingContractOffer = undefined;
        const freeAgentTeam: Team = {
          id: 'free_agent',
          name: 'Agente Libre',
          badge: '🆓',
          league: 'Sin equipo',
          division: 3,
          country: updatedPlayer.nationality,
          countryFlag: updatedPlayer.nationalityFlag,
          prestige: 45
        };

        updatedPlayer.currentTeam = freeAgentTeam;
        updatedPlayer.parentTeam = undefined;

        const firedRecord: SeasonRecord = {
          age: updatedPlayer.currentAge,
          year: 2026 + (updatedPlayer.currentAge - 16),
          team: freeAgentTeam,
          isLoan: false,
          ovr: updatedPlayer.ovr,
          rating: 4.5,
          matchesPlayed: 0,
          goals: 0,
          saves: 0,
          cleanSheets: 0,
          assists: 0,
          defensiveActions: 0,
          awards: [],
          marketValue: updatedPlayer.marketValue
        };

        updatedPlayer.currentAge += 1;
        const nextOffers = updatedPlayer.currentAge < 40 ? this.generateContractOffers(updatedPlayer) : [];

        this.state.update(s => ({
          ...s,
          player: updatedPlayer,
          pendingEvent: null,
          isSimulating: false,
          isSpinningRoulette: false,
          seasonHistory: [...s.seasonHistory, firedRecord],
          currentOffers: nextOffers,
          activeEventResult: `Despido: ${outcome.message}`
        }));
      } else {
        this.state.update(s => ({
          ...s,
          player: updatedPlayer,
          pendingEvent: null,
          isSpinningRoulette: false,
          activeEventResult: `${isSuccess ? 'Triunfo' : 'Contratiempo'}: ${outcome.message}`
        }));
      }

      this.saveToStorage();
    }, 6000);
  }

  dismissEventResult() {
    const pendingOffer = this.pendingContractOffer;
    this.pendingContractOffer = undefined;

    if (pendingOffer) {
      const startPercent = this.currentEventTriggerPercent;
      const remainingPercent = 100 - startPercent;
      const remainingTime = Math.max(600, Math.floor((remainingPercent / 100) * 2800));

      this.state.update(s => ({ 
        ...s, 
        activeEventResult: null,
        activeEventDetails: null,
        isSpinningRoulette: false,
        isSimulating: true,
        simProgressWidth: startPercent,
        simProgressDuration: 0
      }));

      setTimeout(() => {
        this.state.update(s => ({
          ...s,
          simProgressWidth: 100,
          simProgressDuration: remainingTime
        }));
      }, 40);

      setTimeout(() => {
        this.simulateSeason(pendingOffer);
      }, remainingTime + 50);
    } else {
      this.state.update(s => ({ 
        ...s, 
        activeEventResult: null,
        activeEventDetails: null,
        isSpinningRoulette: false,
        isSimulating: false 
      }));
    }
  }

  private canTeamOfferContract(team: Team, playerOvr: number, rating: number, isSuperOffer: boolean = false, age: number = 20): boolean {
    if (isSuperOffer && age <= 30) {
      const maxPrestige = Math.min(95, playerOvr + 16);
      const minPrestige = playerOvr + 5;
      if (team.prestige >= 90 && playerOvr < 74) return false;
      return team.prestige <= maxPrestige && team.prestige >= minPrestige;
    }

    let maxPrestige = playerOvr + (rating >= 8.2 ? 10 : 6);
    if (age >= 33) {
      maxPrestige = Math.min(maxPrestige, playerOvr + 2);
    }
    if (age >= 36) {
      maxPrestige = Math.min(maxPrestige, playerOvr);
    }

    const minPrestige = Math.max(45, playerOvr - 25);

    if (team.prestige >= 90 && (playerOvr < 82 || age >= 35)) return false;
    if (team.prestige >= 84 && (playerOvr < 76 || (age >= 36 && playerOvr < 84))) return false;
    if (team.prestige >= 78 && playerOvr < 68) return false;

    return team.prestige <= maxPrestige && team.prestige >= minPrestige;
  }

  private generateContractOffers(player: PlayerProfile): ContractOption[] {
    const currentState = this.state();

    if (currentState.seasonHistory.length === 0) {
      const suitableClubs = TEAMS_DATABASE.filter(t => 
        t.division === 3 && 
        this.canTeamOfferContract(t, player.ovr, 7.0, false, player.currentAge)
      );
      const nationalityClubs = suitableClubs.filter(t => t.country === player.nationality);
      const otherClubs = suitableClubs.filter(t => t.country !== player.nationality);

      const shuffledNat = [...nationalityClubs].sort(() => Math.random() - 0.5);
      const shuffledOther = [...otherClubs].sort(() => Math.random() - 0.5);

      const selectedStartingTeams: Team[] = [];

      if (shuffledNat.length >= 2 && shuffledOther.length >= 1) {
        selectedStartingTeams.push(shuffledNat[0], shuffledNat[1], shuffledOther[0]);
      } else {
        const pool = [...shuffledNat, ...shuffledOther].sort(() => Math.random() - 0.5);
        selectedStartingTeams.push(...pool.slice(0, 3));
      }

      return selectedStartingTeams.map(team => ({
        team: { ...team, badge: getTeamBadgeUrl(team.id, team.badge) },
        type: 'Transfer' as const,
        wageMultiplier: Number((0.8 + (team.prestige / 100)).toFixed(2))
      }));
    }

    const lastRecord = currentState.seasonHistory[currentState.seasonHistory.length - 1];
    const lastRating = lastRecord ? lastRecord.rating : 7.2;
    const currentOvr = player.ovr;
    const age = player.currentAge;

    const offers: ContractOption[] = [];
    const usedTeamIds = new Set<string>([player.currentTeam.id]);
    const currentCountry = player.currentTeam.country;

    const canRenew = age < 34 ? (lastRating >= 7.2) : (lastRating >= 7.6 && currentOvr >= 70);
    if (player.currentTeam.id !== 'free_agent' && canRenew && Math.random() < 0.35) {
      const renewedTeam = { ...player.currentTeam, badge: getTeamBadgeUrl(player.currentTeam.id, player.currentTeam.badge) };
      offers.push({
        team: renewedTeam,
        type: 'Renewal',
        isRenewal: true,
        wageMultiplier: Number((0.9 + (lastRating / 10)).toFixed(2))
      });
    }

    const neededExternalCount = 3 - offers.length;
    const canGetSuperOffer = age <= 30 && lastRating >= 8.2 && Math.random() < 0.15;
    let superOfferGranted = false;

    for (let i = 0; i < neededExternalCount; i++) {
      const trySuperOffer = canGetSuperOffer && !superOfferGranted;
      let divCandidates = TEAMS_DATABASE.filter(t => 
        !usedTeamIds.has(t.id) && 
        this.canTeamOfferContract(t, currentOvr, lastRating, trySuperOffer, age)
      );
      
      let isCurrentChoiceSuperOffer = false;
      if (trySuperOffer && divCandidates.length > 0) {
        isCurrentChoiceSuperOffer = true;
        superOfferGranted = true;
      } else {
        divCandidates = TEAMS_DATABASE.filter(t => 
          !usedTeamIds.has(t.id) && 
          this.canTeamOfferContract(t, currentOvr, lastRating, false, age)
        );
      }

      if (i === 1 && !isCurrentChoiceSuperOffer) {
        const intlCandidates = divCandidates.filter(t => t.country !== currentCountry);
        if (intlCandidates.length > 0) {
          divCandidates = intlCandidates;
        }
      } else if (i === 0 && !isCurrentChoiceSuperOffer) {
        const domesticCandidates = divCandidates.filter(t => t.country === currentCountry);
        if (domesticCandidates.length > 0) {
          divCandidates = domesticCandidates;
        }
      }

      if (divCandidates.length === 0) {
        divCandidates = TEAMS_DATABASE.filter(t => !usedTeamIds.has(t.id));
      }

      if (age >= 33) {
        divCandidates.sort((a, b) => (a.prestige - b.prestige));
      } else {
        divCandidates.sort((a, b) => Math.abs(a.prestige - currentOvr) - Math.abs(b.prestige - currentOvr));
      }
      
      const topSlice = divCandidates.slice(0, Math.min(3, divCandidates.length));
      const chosen = topSlice.length > 0 ? topSlice[Math.floor(Math.random() * topSlice.length)] : undefined;
      
      if (chosen) {
        usedTeamIds.add(chosen.id);
        const formattedTeam = { ...chosen, badge: getTeamBadgeUrl(chosen.id, chosen.badge) };
        const isLoan = offers.length === 2 && age <= 22 && chosen.prestige > currentOvr;
        offers.push({
          team: formattedTeam,
          type: isLoan ? 'Loan' : 'Transfer',
          loanYears: isLoan ? 1 : undefined,
          wageMultiplier: Number((chosen.prestige / 100).toFixed(2)),
          originTeam: isLoan ? player.currentTeam : undefined,
          isSuperOffer: isCurrentChoiceSuperOffer
        });
      }
    }

    return offers;
  }

  private calculateMarketValue(ovr: number, age: number): number {
    if (ovr < 60) return Number(Math.max(0.3, 0.5 - (age > 30 ? (age - 30) * 0.03 : 0)).toFixed(1));
    let base = Math.pow(1.15, ovr - 60) * 1.2;
    if (age <= 21) {
      base *= 1.35;
    } else if (age <= 27) {
      base *= 1.15;
    } else if (age <= 31) {
      base *= 1.0;
    } else {
      const agePenalty = Math.max(0.35, 1 - (age - 31) * 0.07);
      base *= agePenalty;
    }
    return Number(Math.max(0.4, base).toFixed(1));
  }

  resetGame() {
    sessionStorage.removeItem(STORAGE_KEY);
    this.state.set({
      speed: 'normal',
      screen: 'setup-creation',
      player: null,
      seasonHistory: [],
      currentOffers: [],
      pendingEvent: null,
      activeEventResult: null,
      activeEventDetails: null,
      isSpinningRoulette: false,
      isSimulating: false,
      allTimeAwards: []
    });
  }

  private saveToStorage() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.state()));
    } catch (e) {
      console.warn('SessionStorage save error', e);
    }
  }

  private loadFromStorage() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.player && parsed.player.currentTeam) {
          parsed.player.currentTeam.badge = getTeamBadgeUrl(parsed.player.currentTeam.id, parsed.player.currentTeam.badge);
        }
        if (parsed.player && parsed.player.nationality) {
          const natInfo = getNationalTeamInfo(parsed.player.nationality, parsed.player.nationalityFlag);
          if (parsed.player.nationalTeamStats) {
            parsed.player.nationalTeamStats.teamName = natInfo.officialName;
            parsed.player.nationalTeamStats.flag = natInfo.badge || natInfo.flag;
          }
        }
        if (parsed.currentOffers && Array.isArray(parsed.currentOffers)) {
          parsed.currentOffers = parsed.currentOffers.map((o: any) => ({
            ...o,
            team: { ...o.team, badge: getTeamBadgeUrl(o.team.id, o.team.badge) }
          }));
        }
        if (parsed.seasonHistory && Array.isArray(parsed.seasonHistory)) {
          parsed.seasonHistory = parsed.seasonHistory.map((r: any) => ({
            ...r,
            team: r.isNationalTeam
              ? { ...r.team, badge: getNationalTeamInfo(parsed.player?.nationality || r.team.country, r.team.countryFlag).badge || r.team.badge }
              : { ...r.team, badge: getTeamBadgeUrl(r.team.id, r.team.badge) }
          }));
        }
        if (parsed.allTimeAwards && Array.isArray(parsed.allTimeAwards)) {
          parsed.allTimeAwards = parsed.allTimeAwards.map((a: any) => ({
            ...a,
            icon: (a.icon && a.icon.startsWith('http')) ? a.icon : ''
          }));
        }
        this.state.set(parsed);
      }
    } catch (e) {
      console.warn('SessionStorage load error', e);
    }
  }

  setScreen(screen: 'setup-creation' | 'career-main' | 'game-over' | 'report') {
    this.state.update(s => {
      if (screen === 'report') {
        const prev = s.screen !== 'report' ? (s.screen as 'setup-creation' | 'career-main' | 'game-over') : s.previousScreen;
        return { ...s, screen, previousScreen: prev };
      }
      return { ...s, screen };
    });
  }
}

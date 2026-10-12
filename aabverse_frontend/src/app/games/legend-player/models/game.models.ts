export type Position = 'EI' | 'DC' | 'ED' | 'MCO' | 'MI' | 'MC' | 'MD' | 'MCD' | 'LI' | 'DFC' | 'LD' | 'POR';
export type Foot = 'Izquierda' | 'Derecha' | 'Ambas';
export type SimulationSpeed = 'slow' | 'normal' | 'fast';
export type ContractType = 'Transfer' | 'Loan' | 'Renewal';

export interface Team {
  id: string;
  name: string;
  badge: string;
  badgeUrl?: string;
  league: string;
  division: 1 | 2 | 3;
  country: string;
  countryFlag: string;
  prestige: number;
}

export interface ContractOption {
  team: Team;
  type: ContractType;
  loanYears?: number;
  wageMultiplier: number;
  originTeam?: Team;
  isRenewal?: boolean;
  isSuperOffer?: boolean;
}

export interface CareerEvent {
  id: string;
  title: string;
  description: string;
  icon: string;
  choices: EventChoice[];
}

export interface EventChoice {
  text: string;
  riskPercent: number;
  successOutcome: {
    ovrDelta: number;
    marketValueDeltaPercent: number;
    message: string;
  };
  failureOutcome: {
    ovrDelta: number;
    marketValueDeltaPercent: number;
    missedGamesPercent?: number;
    isFired?: boolean;
    message: string;
  };
}

export interface Award {
  id: string;
  year?: number | string;
  age: number | string;
  name: string;
  icon: string;
  type: 'individual' | 'team';
  isNational?: boolean;
  description: string;
  teamName?: string;
  teamBadge?: string;
}

export interface SeasonRecord {
  age: number | string;
  year: number | string;
  team: Team;
  isLoan: boolean;
  isNationalTeam?: boolean;
  parentTeam?: Team;
  ovr: number;
  rating: number;
  matchesPlayed: number;
  goals: number;
  saves: number;
  cleanSheets: number;
  assists: number;
  defensiveActions: number;
  awards: Award[];
  marketValue: number;
}

export interface NationalTeamRecord {
  teamName: string;
  flag: string;
  callups: number;
  matchesPlayed: number;
  goals: number;
  saves: number;
  assists: number;
  defensiveActions: number;
  titles: string[];
}

export interface PlayerProfile {
  nickname: string;
  number: number;
  preferredFoot: Foot;
  position: Position;
  nationality: string;
  nationalityFlag: string;
  currentAge: number;
  ovr: number;
  marketValue: number;
  currentTeam: Team;
  parentTeam?: Team;
  trophies: string[];
  careerStats: {
    matchesPlayed: number;
    goals: number;
    saves: number;
    assists: number;
    defensiveActions: number;
    titlesWon: number;
  };
  nationalTeamStats: NationalTeamRecord;
}

export interface EventResultDetails {
  eventTitle?: string;
  choiceLabel?: string;
  riskPercent?: number;
  isSuccess: boolean;
  message: string;
  ovrDelta: number;
  marketValueDeltaPercent: number;
  isFired?: boolean;
}

export interface GameState {
  speed: SimulationSpeed;
  screen: 'setup-creation' | 'career-main' | 'game-over' | 'report';
  previousScreen?: 'setup-creation' | 'career-main' | 'game-over';
  player: PlayerProfile | null;
  seasonHistory: SeasonRecord[];
  currentOffers: ContractOption[];
  pendingEvent: CareerEvent | null;
  activeEventResult: string | null;
  activeEventDetails: EventResultDetails | null;
  isSpinningRoulette: boolean;
  isSimulating: boolean;
  simProgressWidth?: number;
  simProgressDuration?: number;
  allTimeAwards: Award[];
}

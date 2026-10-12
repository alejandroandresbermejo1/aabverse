import { Team, CareerEvent } from '../models/game.models';

export interface NationalTeamData {
  officialName: string;
  flag: string;
  badge: string;
  prestige: number;
  confederation: 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC';
  continentalTournamentName: string;
}

export const NATIONAL_TEAMS_DATABASE: Record<string, NationalTeamData> = {
  'España': { officialName: 'Selección de España', flag: 'https://flagcdn.com/w40/es.png', badge: 'https://assets.footylogos.com/logos/spain-national-team/spain-national-team-logo-footylogos.svg', prestige: 94, confederation: 'UEFA', continentalTournamentName: 'Eurocopa UEFA' },
  'Inglaterra': { officialName: 'Selección de Inglaterra', flag: 'https://flagcdn.com/w40/gb-eng.png', badge: 'https://assets.footylogos.com/logos/england-national-team/england-national-team-logo-footylogos.svg', prestige: 91, confederation: 'UEFA', continentalTournamentName: 'Eurocopa UEFA' },
  'Italia': { officialName: 'Selección de Italia', flag: 'https://flagcdn.com/w40/it.png', badge: 'https://assets.footylogos.com/logos/italy-national-team/italy-national-team-logo-footylogos.svg', prestige: 90, confederation: 'UEFA', continentalTournamentName: 'Eurocopa UEFA' },
  'Alemania': { officialName: 'Selección de Alemania', flag: 'https://flagcdn.com/w40/de.png', badge: 'https://assets.footylogos.com/logos/germany-national-team/germany-national-team-logo-footylogos.svg', prestige: 92, confederation: 'UEFA', continentalTournamentName: 'Eurocopa UEFA' },
  'Francia': { officialName: 'Selección de Francia', flag: 'https://flagcdn.com/w40/fr.png', badge: 'https://assets.footylogos.com/logos/france-national-team/france-national-team-logo-footylogos.svg', prestige: 94, confederation: 'UEFA', continentalTournamentName: 'Eurocopa UEFA' },
  'Portugal': { officialName: 'Selección de Portugal', flag: 'https://flagcdn.com/w40/pt.png', badge: 'https://assets.footylogos.com/logos/portugal-national-team/portugal-national-team-logo-footylogos.svg', prestige: 89, confederation: 'UEFA', continentalTournamentName: 'Eurocopa UEFA' },
  'Argentina': { officialName: 'Selección de Argentina', flag: 'https://flagcdn.com/w40/ar.png', badge: 'https://assets.footylogos.com/logos/argentina-national-team/argentina-national-team-logo-footylogos.svg', prestige: 95, confederation: 'CONMEBOL', continentalTournamentName: 'Copa América' },
  'Brasil': { officialName: 'Selección de Brasil', flag: 'https://flagcdn.com/w40/br.png', badge: 'https://assets.footylogos.com/logos/brazil-national-team/brazil-national-team-logo-footylogos.svg', prestige: 95, confederation: 'CONMEBOL', continentalTournamentName: 'Copa América' }
};

export function getNationalTeamInfo(nationality: string, flagFallback: string): NationalTeamData {
  if (NATIONAL_TEAMS_DATABASE[nationality]) {
    return NATIONAL_TEAMS_DATABASE[nationality];
  }
  return {
    officialName: `Selección de ${nationality}`,
    flag: flagFallback,
    badge: flagFallback,
    prestige: 72,
    confederation: 'UEFA',
    continentalTournamentName: 'Torneo Continental'
  };
}

export function getTrophyEmoji(name: string): string {
  if (!name) return '🏆';
  const n = name.toLowerCase();

  if (n.includes('balón de oro') || n.includes('ballon')) return '🥇';
  if (n.includes('the best')) return '👑';
  if (n.includes('golden boy')) return '⭐';
  if (n.includes('fifpro') || n.includes('xi')) return '🎖️';
  if (n.includes('bota de oro')) return '👟';
  if (n.includes('pichichi') || n.includes('capocannoniere') || n.includes('torjägerkanone') || n.includes('goleador')) return '⚽';
  if (n.includes('asistente')) return '🎯';
  if (n.includes('zamora') || n.includes('guante')) return '🧤';
  if (n.includes('defensor') || n.includes('defensa')) return '🛡️';

  if (n.includes('champions league') || n.includes('champions')) return '🏆';
  if (n.includes('europa league')) return '🥈';
  if (n.includes('conference league')) return '🥉';
  if (n.includes('supercopa de europa') || n.includes('super cup')) return '🎖️';
  if (n.includes('mundial de clubes')) return '🌍';

  if (n.includes('copa del mundo') || n.includes('world cup')) return '🌍';
  if (n.includes('eurocopa') || n.includes('uefa euro') || n.includes('copa américa') || n.includes('copa america')) return '🏆';
  if (n.includes('nations league') || n.includes('finalissima')) return '🥇';

  if (n.includes('copa del rey') || n.includes('fa cup') || n.includes('coppa italia') || n.includes('dfb-pokal') || n.includes('coupe') || n.includes('copa')) return '🏆';
  if (n.includes('supercopa') || n.includes('supercup') || n.includes('supercoppa') || n.includes('shield')) return '🥇';

  if (n.includes('laliga') || n.includes('premier') || n.includes('serie a') || n.includes('bundesliga') || n.includes('ligue 1') || n.includes('campeón')) return '🏆';

  return '🏆';
}

export function getTeamBadgeUrl(teamId: string, fallbackBadge: string): string {
  const team = TEAMS_DATABASE.find(t => t.id === teamId);
  return team ? team.badge : fallbackBadge;
}

export const TEAMS_DATABASE: Team[] = [
  { id: 'rma', name: 'Real Madrid', badge: 'https://crests.football-data.org/86.png', league: 'LaLiga EA Sports (1ª)', division: 1, country: 'España', countryFlag: '🇪🇸', prestige: 95 },
  { id: 'fcb', name: 'FC Barcelona', badge: 'https://crests.football-data.org/81.png', league: 'LaLiga EA Sports (1ª)', division: 1, country: 'España', countryFlag: '🇪🇸', prestige: 94 },
  { id: 'atm', name: 'Atlético de Madrid', badge: 'https://crests.football-data.org/78.png', league: 'LaLiga EA Sports (1ª)', division: 1, country: 'España', countryFlag: '🇪🇸', prestige: 88 },
  { id: 'ath', name: 'Athletic Club', badge: 'https://crests.football-data.org/77.png', league: 'LaLiga EA Sports (1ª)', division: 1, country: 'España', countryFlag: '🇪🇸', prestige: 84 },
  { id: 'rso', name: 'Real Sociedad', badge: 'https://crests.football-data.org/92.png', league: 'LaLiga EA Sports (1ª)', division: 1, country: 'España', countryFlag: '🇪🇸', prestige: 80 },
  { id: 'vcf', name: 'Villarreal CF', badge: 'https://crests.football-data.org/94.png', league: 'LaLiga EA Sports (1ª)', division: 1, country: 'España', countryFlag: '🇪🇸', prestige: 80 },
  { id: 'bet', name: 'Real Betis', badge: 'https://crests.football-data.org/90.png', league: 'LaLiga EA Sports (1ª)', division: 1, country: 'España', countryFlag: '🇪🇸', prestige: 79 },
  { id: 'sev', name: 'Sevilla FC', badge: 'https://crests.football-data.org/559.png', league: 'LaLiga EA Sports (1ª)', division: 1, country: 'España', countryFlag: '🇪🇸', prestige: 81 },
  { id: 'gir', name: 'Girona FC', badge: 'https://crests.football-data.org/298.png', league: 'LaLiga EA Sports (1ª)', division: 1, country: 'España', countryFlag: '🇪🇸', prestige: 78 },
  { id: 'val', name: 'Valencia CF', badge: 'https://crests.football-data.org/95.png', league: 'LaLiga EA Sports (1ª)', division: 1, country: 'España', countryFlag: '🇪🇸', prestige: 76 },
  { id: 'esp', name: 'RCD Espanyol', badge: 'https://crests.football-data.org/89.png', league: 'LaLiga EA Sports (1ª)', division: 1, country: 'España', countryFlag: '🇪🇸', prestige: 76 },
  { id: 'osa', name: 'CA Osasuna', badge: 'https://crests.football-data.org/79.png', league: 'LaLiga EA Sports (1ª)', division: 1, country: 'España', countryFlag: '🇪🇸', prestige: 75 },
  { id: 'cel', name: 'RC Celta de Vigo', badge: 'https://crests.football-data.org/87.png', league: 'LaLiga EA Sports (1ª)', division: 1, country: 'España', countryFlag: '🇪🇸', prestige: 75 },
  { id: 'get', name: 'Getafe CF', badge: 'https://crests.football-data.org/82.png', league: 'LaLiga EA Sports (1ª)', division: 1, country: 'España', countryFlag: '🇪🇸', prestige: 74 },
  { id: 'ray', name: 'Rayo Vallecano', badge: 'https://crests.football-data.org/870.png', league: 'LaLiga EA Sports (1ª)', division: 1, country: 'España', countryFlag: '🇪🇸', prestige: 74 },
  { id: 'ala', name: 'Deportivo Alavés', badge: 'https://crests.football-data.org/263.png', league: 'LaLiga EA Sports (1ª)', division: 1, country: 'España', countryFlag: '🇪🇸', prestige: 73 },
  { id: 'mll', name: 'RCD Mallorca', badge: 'https://crests.football-data.org/84.png', league: 'LaLiga EA Sports (1ª)', division: 1, country: 'España', countryFlag: '🇪🇸', prestige: 73 },
  { id: 'lpa', name: 'UD Las Palmas', badge: 'https://crests.football-data.org/275.png', league: 'LaLiga EA Sports (1ª)', division: 1, country: 'España', countryFlag: '🇪🇸', prestige: 72 },
  { id: 'leg', name: 'CD Leganés', badge: 'https://crests.football-data.org/745.png', league: 'LaLiga EA Sports (1ª)', division: 1, country: 'España', countryFlag: '🇪🇸', prestige: 71 },
  { id: 'vll', name: 'Real Valladolid', badge: 'https://crests.football-data.org/250.png', league: 'LaLiga EA Sports (1ª)', division: 1, country: 'España', countryFlag: '🇪🇸', prestige: 71 },

  { id: 'gra', name: 'Granada CF', badge: 'https://crests.football-data.org/267.png', league: 'LaLiga Hypermotion (2ª)', division: 2, country: 'España', countryFlag: '🇪🇸', prestige: 73 },
  { id: 'alm', name: 'UD Almería', badge: 'https://crests.football-data.org/267.png', league: 'LaLiga Hypermotion (2ª)', division: 2, country: 'España', countryFlag: '🇪🇸', prestige: 72 },
  { id: 'cad', name: 'Cádiz CF', badge: 'https://crests.football-data.org/264.png', league: 'LaLiga Hypermotion (2ª)', division: 2, country: 'España', countryFlag: '🇪🇸', prestige: 71 },
  { id: 'eib', name: 'SD Eibar', badge: 'https://crests.football-data.org/278.png', league: 'LaLiga Hypermotion (2ª)', division: 2, country: 'España', countryFlag: '🇪🇸', prestige: 70 },
  { id: 'lev', name: 'Levante UD', badge: 'https://crests.football-data.org/88.png', league: 'LaLiga Hypermotion (2ª)', division: 2, country: 'España', countryFlag: '🇪🇸', prestige: 70 },
  { id: 'rac', name: 'Racing de Santander', badge: 'https://assets.footylogos.com/logos/racing-santander/racing-santander-logo-footylogos.svg', league: 'LaLiga Hypermotion (2ª)', division: 2, country: 'España', countryFlag: '🇪🇸', prestige: 69 },
  { id: 'zar', name: 'Real Zaragoza', badge: 'https://crests.football-data.org/272.png', league: 'LaLiga Hypermotion (2ª)', division: 2, country: 'España', countryFlag: '🇪🇸', prestige: 69 },
  { id: 'spo', name: 'Real Sporting', badge: 'https://crests.football-data.org/270.png', league: 'LaLiga Hypermotion (2ª)', division: 2, country: 'España', countryFlag: '🇪🇸', prestige: 69 },
  { id: 'ovi', name: 'Real Oviedo', badge: 'https://crests.football-data.org/268.png', league: 'LaLiga Hypermotion (2ª)', division: 2, country: 'España', countryFlag: '🇪🇸', prestige: 69 },
  { id: 'dep', name: 'Deportivo de La Coruña', badge: 'https://crests.football-data.org/260.png', league: 'LaLiga Hypermotion (2ª)', division: 2, country: 'España', countryFlag: '🇪🇸', prestige: 68 },
  { id: 'mal', name: 'Málaga CF', badge: 'https://crests.football-data.org/266.png', league: 'LaLiga Hypermotion (2ª)', division: 2, country: 'España', countryFlag: '🇪🇸', prestige: 67 },
  { id: 'cas', name: 'CD Castellón', badge: 'https://crests.football-data.org/274.png', league: 'LaLiga Hypermotion (2ª)', division: 2, country: 'España', countryFlag: '🇪🇸', prestige: 66 },
  { id: 'elc', name: 'Elche CF', badge: 'https://crests.football-data.org/285.png', league: 'LaLiga Hypermotion (2ª)', division: 2, country: 'España', countryFlag: '🇪🇸', prestige: 71 },
  { id: 'ten', name: 'CD Tenerife', badge: 'https://crests.football-data.org/271.png', league: 'LaLiga Hypermotion (2ª)', division: 2, country: 'España', countryFlag: '🇪🇸', prestige: 68 },
  { id: 'bur', name: 'Burgos CF', badge: 'https://crests.football-data.org/290.png', league: 'LaLiga Hypermotion (2ª)', division: 2, country: 'España', countryFlag: '🇪🇸', prestige: 67 },
  { id: 'mir', name: 'CD Mirandés', badge: 'https://crests.football-data.org/289.png', league: 'LaLiga Hypermotion (2ª)', division: 2, country: 'España', countryFlag: '🇪🇸', prestige: 66 },
  { id: 'hue', name: 'SD Huesca', badge: 'https://crests.football-data.org/299.png', league: 'LaLiga Hypermotion (2ª)', division: 2, country: 'España', countryFlag: '🇪🇸', prestige: 66 },
  { id: 'eld', name: 'CD Eldense', badge: 'https://assets.footylogos.com/logos/cd-eldense/cd-eldense-logo-footylogos.svg', league: 'LaLiga Hypermotion (2ª)', division: 2, country: 'España', countryFlag: '🇪🇸', prestige: 65 },
  { id: 'alb', name: 'Albacete BP', badge: 'https://crests.football-data.org/283.png', league: 'LaLiga Hypermotion (2ª)', division: 2, country: 'España', countryFlag: '🇪🇸', prestige: 66 },
  { id: 'car', name: 'FC Cartagena', badge: 'https://crests.football-data.org/295.png', league: 'LaLiga Hypermotion (2ª)', division: 2, country: 'España', countryFlag: '🇪🇸', prestige: 65 },
  { id: 'fer', name: 'Racing de Ferrol', badge: 'https://crests.football-data.org/269.png', league: 'LaLiga Hypermotion (2ª)', division: 2, country: 'España', countryFlag: '🇪🇸', prestige: 65 },
  { id: 'cor', name: 'Córdoba CF', badge: 'https://crests.football-data.org/280.png', league: 'LaLiga Hypermotion (2ª)', division: 2, country: 'España', countryFlag: '🇪🇸', prestige: 66 },

  { id: 'nas', name: 'Nàstic de Tarragona', badge: 'https://www.bibliotecariodelfutbol.com/api/logo/gimnastic-de-tarragona?t=1777803269&dpl=dpl_BDtShSUwE44b5oqasnK6er1DHNRT', league: 'Primera RFEF (3ª)', division: 3, country: 'España', countryFlag: '🇪🇸', prestige: 62 },
  { id: 'pon', name: 'SD Ponferradina', badge: 'https://assets.footylogos.com/logos/sd-ponferradina-logo-footylogos.svg', league: 'Primera RFEF (3ª)', division: 3, country: 'España', countryFlag: '🇪🇸', prestige: 61 },
  { id: 'ibi', name: 'UD Ibiza', badge: 'https://crests.football-data.org/275.png', league: 'Primera RFEF (3ª)', division: 3, country: 'España', countryFlag: '🇪🇸', prestige: 61 },
  { id: 'cul', name: 'Cultural Leonesa', badge: 'https://assets.footylogos.com/logos/cultural-leonesa/cultural-leonesa-logo-footylogos.svg', league: 'Primera RFEF (3ª)', division: 3, country: 'España', countryFlag: '🇪🇸', prestige: 60 },
  { id: 'mur', name: 'Real Murcia CF', badge: 'https://assets.footylogos.com/logos/real-murcia-cf-logo-footylogos.svg', league: 'Primera RFEF (3ª)', division: 3, country: 'España', countryFlag: '🇪🇸', prestige: 60 },
  { id: 'ceu', name: 'AD Ceuta FC', badge: 'https://crests.football-data.org/280.png', league: 'Primera RFEF (3ª)', division: 3, country: 'España', countryFlag: '🇪🇸', prestige: 59 },
  { id: 'rec', name: 'Recreativo de Huelva', badge: 'https://assets.footylogos.com/logos/recreativo-huelva-logo-footylogos.svg', league: 'Primera RFEF (3ª)', division: 3, country: 'España', countryFlag: '🇪🇸', prestige: 59 },
  { id: 'bar-b', name: 'Barça Atlètic', badge: 'https://crests.football-data.org/81.png', league: 'Primera RFEF (3ª)', division: 3, country: 'España', countryFlag: '🇪🇸', prestige: 58 },
  { id: 'rma-c', name: 'Real Madrid Castilla', badge: 'https://crests.football-data.org/86.png', league: 'Primera RFEF (3ª)', division: 3, country: 'España', countryFlag: '🇪🇸', prestige: 58 },
  { id: 'cel-b', name: 'Celta Fortuna', badge: 'https://crests.football-data.org/87.png', league: 'Primera RFEF (3ª)', division: 3, country: 'España', countryFlag: '🇪🇸', prestige: 57 },
  { id: 'lug', name: 'CD Lugo', badge: 'https://crests.football-data.org/288.png', league: 'Primera RFEF (3ª)', division: 3, country: 'España', countryFlag: '🇪🇸', prestige: 56 },
  { id: 'and', name: 'FC Andorra', badge: 'https://crests.football-data.org/298.png', league: 'Primera RFEF (3ª)', division: 3, country: 'España', countryFlag: '🇪🇸', prestige: 55 },
  { id: 'uni', name: 'Unionistas de Salamanca', badge: 'https://crests.football-data.org/281.png', league: 'Primera RFEF (3ª)', division: 3, country: 'España', countryFlag: '🇪🇸', prestige: 55 },
  { id: 'ant', name: 'Antequera CF', badge: 'https://assets.footylogos.com/logos/antequera-cf-logo-footylogos.svg', league: 'Primera RFEF (3ª)', division: 3, country: 'España', countryFlag: '🇪🇸', prestige: 54 },
  { id: 'itc', name: 'CF Intercity', badge: 'https://crests.football-data.org/285.png', league: 'Primera RFEF (3ª)', division: 3, country: 'España', countryFlag: '🇪🇸', prestige: 54 },
  { id: 'mer', name: 'Mérida AD', badge: 'https://crests.football-data.org/295.png', league: 'Primera RFEF (3ª)', division: 3, country: 'España', countryFlag: '🇪🇸', prestige: 54 },
  { id: 'alg', name: 'Algeciras CF', badge: 'https://crests.football-data.org/280.png', league: 'Primera RFEF (3ª)', division: 3, country: 'España', countryFlag: '🇪🇸', prestige: 54 },
  { id: 'avi', name: 'Real Avilés Industrial', badge: 'https://crests.football-data.org/268.png', league: 'Primera RFEF (3ª)', division: 3, country: 'España', countryFlag: '🇪🇸', prestige: 53 },
  { id: 'tar', name: 'SD Tarazona', badge: 'https://crests.football-data.org/299.png', league: 'Primera RFEF (3ª)', division: 3, country: 'España', countryFlag: '🇪🇸', prestige: 53 },
  { id: 'zam', name: 'Zamora CF', badge: 'https://crests.football-data.org/272.png', league: 'Primera RFEF (3ª)', division: 3, country: 'España', countryFlag: '🇪🇸', prestige: 53 },

  { id: 'mci', name: 'Manchester City', badge: 'https://crests.football-data.org/65.png', league: 'Premier League (1ª)', division: 1, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 96 },
  { id: 'liv', name: 'Liverpool FC', badge: 'https://crests.football-data.org/64.png', league: 'Premier League (1ª)', division: 1, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 93 },
  { id: 'ars', name: 'Arsenal FC', badge: 'https://crests.football-data.org/57.png', league: 'Premier League (1ª)', division: 1, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 91 },
  { id: 'mun', name: 'Manchester United', badge: 'https://crests.football-data.org/66.png', league: 'Premier League (1ª)', division: 1, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 87 },
  { id: 'che', name: 'Chelsea FC', badge: 'https://crests.football-data.org/61.png', league: 'Premier League (1ª)', division: 1, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 86 },
  { id: 'tot', name: 'Tottenham Hotspur', badge: 'https://crests.football-data.org/73.png', league: 'Premier League (1ª)', division: 1, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 84 },
  { id: 'new', name: 'Newcastle United', badge: 'https://crests.football-data.org/67.png', league: 'Premier League (1ª)', division: 1, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 84 },
  { id: 'ast', name: 'Aston Villa', badge: 'https://crests.football-data.org/58.png', league: 'Premier League (1ª)', division: 1, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 83 },
  { id: 'bha', name: 'Brighton & Hove Albion', badge: 'https://crests.football-data.org/397.png', league: 'Premier League (1ª)', division: 1, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 81 },
  { id: 'whu', name: 'West Ham United', badge: 'https://crests.football-data.org/563.png', league: 'Premier League (1ª)', division: 1, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 80 },
  { id: 'ful', name: 'Fulham FC', badge: 'https://crests.football-data.org/63.png', league: 'Premier League (1ª)', division: 1, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 78 },
  { id: 'wob', name: 'Wolverhampton Wanderers', badge: 'https://crests.football-data.org/76.png', league: 'Premier League (1ª)', division: 1, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 77 },
  { id: 'eve', name: 'Everton FC', badge: 'https://crests.football-data.org/62.png', league: 'Premier League (1ª)', division: 1, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 77 },
  { id: 'bre', name: 'Brentford FC', badge: 'https://crests.football-data.org/402.png', league: 'Premier League (1ª)', division: 1, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 77 },
  { id: 'cry', name: 'Crystal Palace', badge: 'https://crests.football-data.org/354.png', league: 'Premier League (1ª)', division: 1, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 77 },
  { id: 'bou', name: 'AFC Bournemouth', badge: 'https://crests.football-data.org/1044.png', league: 'Premier League (1ª)', division: 1, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 76 },
  { id: 'nfo', name: 'Nottingham Forest', badge: 'https://crests.football-data.org/351.png', league: 'Premier League (1ª)', division: 1, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 76 },
  { id: 'lei', name: 'Leicester City', badge: 'https://crests.football-data.org/338.png', league: 'Premier League (1ª)', division: 1, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 76 },
  { id: 'ipsw', name: 'Ipswich Town', badge: 'https://crests.football-data.org/349.png', league: 'Premier League (1ª)', division: 1, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 73 },
  { id: 'sot', name: 'Southampton FC', badge: 'https://assets.footylogos.com/previews/southampton/southampton-logo-footylogos-320.webp', league: 'Premier League (1ª)', division: 1, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 73 },

  { id: 'lee', name: 'Leeds United', badge: 'https://crests.football-data.org/341.png', league: 'EFL Championship (2ª)', division: 2, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 77 },
  { id: 'bur-e', name: 'Burnley FC', badge: 'https://crests.football-data.org/328.png', league: 'EFL Championship (2ª)', division: 2, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 76 },
  { id: 'shu', name: 'Sheffield United', badge: 'https://crests.football-data.org/356.png', league: 'EFL Championship (2ª)', division: 2, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 75 },
  { id: 'lut', name: 'Luton Town', badge: 'https://crests.football-data.org/389.png', league: 'EFL Championship (2ª)', division: 2, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 74 },
  { id: 'wba', name: 'West Bromwich Albion', badge: 'https://crests.football-data.org/74.png', league: 'EFL Championship (2ª)', division: 2, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 72 },
  { id: 'sun', name: 'Sunderland AFC', badge: 'https://crests.football-data.org/71.png', league: 'EFL Championship (2ª)', division: 2, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 70 },
  { id: 'mid', name: 'Middlesbrough FC', badge: 'https://crests.football-data.org/68.png', league: 'EFL Championship (2ª)', division: 2, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 70 },
  { id: 'wat', name: 'Watford FC', badge: 'https://crests.football-data.org/346.png', league: 'EFL Championship (2ª)', division: 2, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 69 },
  { id: 'cov', name: 'Coventry City', badge: 'https://crests.football-data.org/388.png', league: 'EFL Championship (2ª)', division: 2, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 71 },
  { id: 'nor', name: 'Norwich City', badge: 'https://crests.football-data.org/68.png', league: 'EFL Championship (2ª)', division: 2, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 72 },
  { id: 'hul', name: 'Hull City', badge: 'https://crests.football-data.org/322.png', league: 'EFL Championship (2ª)', division: 2, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 70 },
  { id: 'pne', name: 'Preston North End', badge: 'https://crests.football-data.org/1081.png', league: 'EFL Championship (2ª)', division: 2, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 69 },
  { id: 'bci', name: 'Bristol City', badge: 'https://crests.football-data.org/387.png', league: 'EFL Championship (2ª)', division: 2, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 69 },
  { id: 'bla', name: 'Blackburn Rovers', badge: 'https://crests.football-data.org/59.png', league: 'EFL Championship (2ª)', division: 2, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 69 },
  { id: 'sto', name: 'Stoke City', badge: 'https://crests.football-data.org/70.png', league: 'EFL Championship (2ª)', division: 2, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 69 },
  { id: 'swa', name: 'Swansea City', badge: 'https://crests.football-data.org/72.png', league: 'EFL Championship (2ª)', division: 2, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 69 },
  { id: 'ply', name: 'Plymouth Argyle', badge: 'https://crests.football-data.org/1138.png', league: 'EFL Championship (2ª)', division: 2, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 67 },
  { id: 'por-e', name: 'Portsmouth FC', badge: 'https://crests.football-data.org/343.png', league: 'EFL Championship (2ª)', division: 2, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 68 },
  { id: 'der', name: 'Derby County', badge: 'https://crests.football-data.org/342.png', league: 'EFL Championship (2ª)', division: 2, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 68 },
  { id: 'oxf', name: 'Oxford United', badge: 'https://crests.football-data.org/1082.png', league: 'EFL Championship (2ª)', division: 2, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 66 },

  { id: 'bhm', name: 'Birmingham City', badge: 'https://crests.football-data.org/332.png', league: 'EFL League One (3ª)', division: 3, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 63 },
  { id: 'wre', name: 'Wrexham AFC', badge: 'https://crests.football-data.org/1084.png', league: 'EFL League One (3ª)', division: 3, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 62 },
  { id: 'hud', name: 'Huddersfield Town', badge: 'https://crests.football-data.org/394.png', league: 'EFL League One (3ª)', division: 3, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 61 },
  { id: 'bol', name: 'Bolton Wanderers', badge: 'https://crests.football-data.org/60.png', league: 'EFL League One (3ª)', division: 3, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 60 },
  { id: 'rot', name: 'Rotherham United', badge: 'https://crests.football-data.org/385.png', league: 'EFL League One (3ª)', division: 3, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 60 },
  { id: 'rea', name: 'Reading FC', badge: 'https://crests.football-data.org/355.png', league: 'EFL League One (3ª)', division: 3, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 56 },
  { id: 'cha', name: 'Charlton Athletic', badge: 'https://crests.football-data.org/348.png', league: 'EFL League One (3ª)', division: 3, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 55 },
  { id: 'wig', name: 'Wigan Athletic', badge: 'https://crests.football-data.org/75.png', league: 'EFL League One (3ª)', division: 3, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 54 },
  { id: 'bar-e', name: 'Barnsley FC', badge: 'https://crests.football-data.org/357.png', league: 'EFL League One (3ª)', division: 3, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 59 },
  { id: 'lin', name: 'Lincoln City', badge: 'https://crests.football-data.org/389.png', league: 'EFL League One (3ª)', division: 3, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 57 },
  { id: 'pet', name: 'Peterborough United', badge: 'https://crests.football-data.org/348.png', league: 'EFL League One (3ª)', division: 3, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 58 },
  { id: 'blp', name: 'Blackpool FC', badge: 'https://crests.football-data.org/355.png', league: 'EFL League One (3ª)', division: 3, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 58 },
  { id: 'wyc', name: 'Wycombe Wanderers', badge: 'https://crests.football-data.org/388.png', league: 'EFL League One (3ª)', division: 3, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 56 },
  { id: 'stk', name: 'Stockport County', badge: 'https://crests.football-data.org/70.png', league: 'EFL League One (3ª)', division: 3, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 56 },
  { id: 'man-e', name: 'Mansfield Town', badge: 'https://crests.football-data.org/342.png', league: 'EFL League One (3ª)', division: 3, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 54 },
  { id: 'ste', name: 'Stevenage FC', badge: 'https://crests.football-data.org/389.png', league: 'EFL League One (3ª)', division: 3, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 54 },
  { id: 'ley', name: 'Leyton Orient', badge: 'https://crests.football-data.org/348.png', league: 'EFL League One (3ª)', division: 3, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 53 },
  { id: 'brr', name: 'Bristol Rovers', badge: 'https://crests.football-data.org/387.png', league: 'EFL League One (3ª)', division: 3, country: 'Inglaterra', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prestige: 53 },

  { id: 'int', name: 'Inter de Milán', badge: 'https://crests.football-data.org/108.png', league: 'Serie A (1ª)', division: 1, country: 'Italia', countryFlag: '🇮🇹', prestige: 89 },
  { id: 'juv', name: 'Juventus FC', badge: 'https://crests.football-data.org/109.png', league: 'Serie A (1ª)', division: 1, country: 'Italia', countryFlag: '🇮🇹', prestige: 88 },
  { id: 'acm', name: 'AC Milan', badge: 'https://crests.football-data.org/98.png', league: 'Serie A (1ª)', division: 1, country: 'Italia', countryFlag: '🇮🇹', prestige: 87 },
  { id: 'nap', name: 'SSC Napoli', badge: 'https://crests.football-data.org/113.png', league: 'Serie A (1ª)', division: 1, country: 'Italia', countryFlag: '🇮🇹', prestige: 86 },
  { id: 'ata', name: 'Atalanta BC', badge: 'https://crests.football-data.org/102.png', league: 'Serie A (1ª)', division: 1, country: 'Italia', countryFlag: '🇮🇹', prestige: 85 },
  { id: 'rom', name: 'AS Roma', badge: 'https://crests.football-data.org/100.png', league: 'Serie A (1ª)', division: 1, country: 'Italia', countryFlag: '🇮🇹', prestige: 84 },
  { id: 'laz', name: 'SS Lazio', badge: 'https://crests.football-data.org/110.png', league: 'Serie A (1ª)', division: 1, country: 'Italia', countryFlag: '🇮🇹', prestige: 83 },
  { id: 'fio', name: 'ACF Fiorentina', badge: 'https://crests.football-data.org/99.png', league: 'Serie A (1ª)', division: 1, country: 'Italia', countryFlag: '🇮🇹', prestige: 81 },
  { id: 'bol-i', name: 'Bologna FC', badge: 'https://crests.football-data.org/103.png', league: 'Serie A (1ª)', division: 1, country: 'Italia', countryFlag: '🇮🇹', prestige: 80 },
  { id: 'tor', name: 'Torino FC', badge: 'https://crests.football-data.org/115.png', league: 'Serie A (1ª)', division: 1, country: 'Italia', countryFlag: '🇮🇹', prestige: 78 },
  { id: 'udn', name: 'Udinese Calcio', badge: 'https://crests.football-data.org/112.png', league: 'Serie A (1ª)', division: 1, country: 'Italia', countryFlag: '🇮🇹', prestige: 76 },
  { id: 'gen', name: 'Genoa CFC', badge: 'https://crests.football-data.org/107.png', league: 'Serie A (1ª)', division: 1, country: 'Italia', countryFlag: '🇮🇹', prestige: 76 },
  { id: 'mon', name: 'AC Monza', badge: 'https://crests.football-data.org/5911.png', league: 'Serie A (1ª)', division: 1, country: 'Italia', countryFlag: '🇮🇹', prestige: 75 },
  { id: 'par-i', name: 'Parma Calcio', badge: 'https://crests.football-data.org/112.png', league: 'Serie A (1ª)', division: 1, country: 'Italia', countryFlag: '🇮🇹', prestige: 74 },
  { id: 'com-i', name: 'Como 1907', badge: 'https://crests.football-data.org/1077.png', league: 'Serie A (1ª)', division: 1, country: 'Italia', countryFlag: '🇮🇹', prestige: 74 },
  { id: 'ver', name: 'Hellas Verona', badge: 'https://crests.football-data.org/103.png', league: 'Serie A (1ª)', division: 1, country: 'Italia', countryFlag: '🇮🇹', prestige: 74 },
  { id: 'cag', name: 'Cagliari Calcio', badge: 'https://crests.football-data.org/107.png', league: 'Serie A (1ª)', division: 1, country: 'Italia', countryFlag: '🇮🇹', prestige: 73 },
  { id: 'emp', name: 'Empoli FC', badge: 'https://crests.football-data.org/108.png', league: 'Serie A (1ª)', division: 1, country: 'Italia', countryFlag: '🇮🇹', prestige: 73 },
  { id: 'lec', name: 'US Lecce', badge: 'https://crests.football-data.org/115.png', league: 'Serie A (1ª)', division: 1, country: 'Italia', countryFlag: '🇮🇹', prestige: 72 },
  { id: 'ven', name: 'Venezia FC', badge: 'https://crests.football-data.org/112.png', league: 'Serie A (1ª)', division: 1, country: 'Italia', countryFlag: '🇮🇹', prestige: 72 },

  { id: 'sas', name: 'US Sassuolo', badge: 'https://crests.football-data.org/488.png', league: 'Serie B (2ª)', division: 2, country: 'Italia', countryFlag: '🇮🇹', prestige: 75 },
  { id: 'fro', name: 'Frosinone Calcio', badge: 'https://crests.football-data.org/470.png', league: 'Serie B (2ª)', division: 2, country: 'Italia', countryFlag: '🇮🇹', prestige: 73 },
  { id: 'sal', name: 'US Salernitana', badge: 'https://crests.football-data.org/457.png', league: 'Serie B (2ª)', division: 2, country: 'Italia', countryFlag: '🇮🇹', prestige: 72 },
  { id: 'pal', name: 'Palermo FC', badge: 'https://crests.football-data.org/114.png', league: 'Serie B (2ª)', division: 2, country: 'Italia', countryFlag: '🇮🇹', prestige: 71 },
  { id: 'sam', name: 'UC Sampdoria', badge: 'https://crests.football-data.org/104.png', league: 'Serie B (2ª)', division: 2, country: 'Italia', countryFlag: '🇮🇹', prestige: 70 },
  { id: 'bre-i', name: 'Brescia Calcio', badge: 'https://crests.football-data.org/440.png', league: 'Serie B (2ª)', division: 2, country: 'Italia', countryFlag: '🇮🇹', prestige: 69 },
  { id: 'spe', name: 'Spezia Calcio', badge: 'https://crests.football-data.org/488.png', league: 'Serie B (2ª)', division: 2, country: 'Italia', countryFlag: '🇮🇹', prestige: 66 },
  { id: 'bar', name: 'AS Bari', badge: 'https://crests.football-data.org/465.png', league: 'Serie B (2ª)', division: 2, country: 'Italia', countryFlag: '🇮🇹', prestige: 65 },
  { id: 'cre', name: 'US Cremonese', badge: 'https://crests.football-data.org/471.png', league: 'Serie B (2ª)', division: 2, country: 'Italia', countryFlag: '🇮🇹', prestige: 72 },
  { id: 'ctz', name: 'US Catanzaro', badge: 'https://crests.football-data.org/465.png', league: 'Serie B (2ª)', division: 2, country: 'Italia', countryFlag: '🇮🇹', prestige: 69 },
  { id: 'mod', name: 'Modena FC', badge: 'https://crests.football-data.org/478.png', league: 'Serie B (2ª)', division: 2, country: 'Italia', countryFlag: '🇮🇹', prestige: 67 },
  { id: 'pis', name: 'Pisa SC', badge: 'https://crests.football-data.org/480.png', league: 'Serie B (2ª)', division: 2, country: 'Italia', countryFlag: '🇮🇹', prestige: 68 },
  { id: 'reg', name: 'AC Reggiana', badge: 'https://crests.football-data.org/470.png', league: 'Serie B (2ª)', division: 2, country: 'Italia', countryFlag: '🇮🇹', prestige: 66 },
  { id: 'sud', name: 'FC Südtirol', badge: 'https://crests.football-data.org/471.png', league: 'Serie B (2ª)', division: 2, country: 'Italia', countryFlag: '🇮🇹', prestige: 66 },
  { id: 'ces', name: 'Cesena FC', badge: 'https://crests.football-data.org/480.png', league: 'Serie B (2ª)', division: 2, country: 'Italia', countryFlag: '🇮🇹', prestige: 66 },
  { id: 'man-i', name: 'Mantova 1911', badge: 'https://crests.football-data.org/478.png', league: 'Serie B (2ª)', division: 2, country: 'Italia', countryFlag: '🇮🇹', prestige: 65 },
  { id: 'car-i', name: 'Carrarese Calcio', badge: 'https://crests.football-data.org/465.png', league: 'Serie B (2ª)', division: 2, country: 'Italia', countryFlag: '🇮🇹', prestige: 64 },
  { id: 'cos', name: 'Cosenza Calcio', badge: 'https://crests.football-data.org/470.png', league: 'Serie B (2ª)', division: 2, country: 'Italia', countryFlag: '🇮🇹', prestige: 65 },
  { id: 'jsb', name: 'Juve Stabia', badge: 'https://crests.football-data.org/457.png', league: 'Serie B (2ª)', division: 2, country: 'Italia', countryFlag: '🇮🇹', prestige: 64 },
  { id: 'cit', name: 'AS Cittadella', badge: 'https://crests.football-data.org/488.png', league: 'Serie B (2ª)', division: 2, country: 'Italia', countryFlag: '🇮🇹', prestige: 65 },

  { id: 'spa', name: 'SPAL', badge: 'https://crests.football-data.org/445.png', league: 'Serie C (3ª)', division: 3, country: 'Italia', countryFlag: '🇮🇹', prestige: 62 },
  { id: 'vic', name: 'LR Vicenza', badge: 'https://crests.football-data.org/472.png', league: 'Serie C (3ª)', division: 3, country: 'Italia', countryFlag: '🇮🇹', prestige: 61 },
  { id: 'pad', name: 'Padova Calcio', badge: 'https://crests.football-data.org/473.png', league: 'Serie C (3ª)', division: 3, country: 'Italia', countryFlag: '🇮🇹', prestige: 60 },
  { id: 'tri', name: 'Triestina', badge: 'https://crests.football-data.org/472.png', league: 'Serie C (3ª)', division: 3, country: 'Italia', countryFlag: '🇮🇹', prestige: 60 },
  { id: 'ave', name: 'US Avellino', badge: 'https://crests.football-data.org/450.png', league: 'Serie C (3ª)', division: 3, country: 'Italia', countryFlag: '🇮🇹', prestige: 58 },
  { id: 'ben', name: 'Benevento Calcio', badge: 'https://crests.football-data.org/1106.png', league: 'Serie C (3ª)', division: 3, country: 'Italia', countryFlag: '🇮🇹', prestige: 58 },
  { id: 'pes', name: 'Pescara Calcio', badge: 'https://crests.football-data.org/450.png', league: 'Serie C (3ª)', division: 3, country: 'Italia', countryFlag: '🇮🇹', prestige: 57 },
  { id: 'cat', name: 'Catania FC', badge: 'https://crests.football-data.org/455.png', league: 'Serie C (3ª)', division: 3, country: 'Italia', countryFlag: '🇮🇹', prestige: 55 },
  { id: 'fog', name: 'Foggia Calcio', badge: 'https://crests.football-data.org/468.png', league: 'Serie C (3ª)', division: 3, country: 'Italia', countryFlag: '🇮🇹', prestige: 57 },
  { id: 'cro', name: 'FC Crotone', badge: 'https://crests.football-data.org/454.png', league: 'Serie C (3ª)', division: 3, country: 'Italia', countryFlag: '🇮🇹', prestige: 58 },
  { id: 'tor-i', name: 'SEF Torres', badge: 'https://crests.football-data.org/473.png', league: 'Serie C (3ª)', division: 3, country: 'Italia', countryFlag: '🇮🇹', prestige: 56 },
  { id: 'per', name: 'Perugia Calcio', badge: 'https://crests.football-data.org/442.png', league: 'Serie C (3ª)', division: 3, country: 'Italia', countryFlag: '🇮🇹', prestige: 58 },
  { id: 'ent', name: 'Virtus Entella', badge: 'https://crests.football-data.org/472.png', league: 'Serie C (3ª)', division: 3, country: 'Italia', countryFlag: '🇮🇹', prestige: 57 },
  { id: 'pve', name: 'Pro Vercelli', badge: 'https://crests.football-data.org/473.png', league: 'Serie C (3ª)', division: 3, country: 'Italia', countryFlag: '🇮🇹', prestige: 55 },
  { id: 'tar-i', name: 'Taranto FC', badge: 'https://crests.football-data.org/455.png', league: 'Serie C (3ª)', division: 3, country: 'Italia', countryFlag: '🇮🇹', prestige: 54 },
  { id: 'pot', name: 'Potenza Calcio', badge: 'https://crests.football-data.org/454.png', league: 'Serie C (3ª)', division: 3, country: 'Italia', countryFlag: '🇮🇹', prestige: 53 },
  { id: 'mnp', name: 'SS Monopoli', badge: 'https://crests.football-data.org/468.png', league: 'Serie C (3ª)', division: 3, country: 'Italia', countryFlag: '🇮🇹', prestige: 53 },
  { id: 'luc', name: 'Lucchese Libertas', badge: 'https://crests.football-data.org/442.png', league: 'Serie C (3ª)', division: 3, country: 'Italia', countryFlag: '🇮🇹', prestige: 53 },

  { id: 'bay', name: 'Bayern München', badge: 'https://crests.football-data.org/5.png', league: 'Bundesliga (1ª)', division: 1, country: 'Alemania', countryFlag: '🇩🇪', prestige: 94 },
  { id: 'b04', name: 'Bayer Leverkusen', badge: 'https://crests.football-data.org/3.png', league: 'Bundesliga (1ª)', division: 1, country: 'Alemania', countryFlag: '🇩🇪', prestige: 88 },
  { id: 'bvb', name: 'Borussia Dortmund', badge: 'https://crests.football-data.org/4.png', league: 'Bundesliga (1ª)', division: 1, country: 'Alemania', countryFlag: '🇩🇪', prestige: 87 },
  { id: 'rbl', name: 'RB Leipzig', badge: 'https://crests.football-data.org/721.png', league: 'Bundesliga (1ª)', division: 1, country: 'Alemania', countryFlag: '🇩🇪', prestige: 86 },
  { id: 'vfb', name: 'VfB Stuttgart', badge: 'https://crests.football-data.org/10.png', league: 'Bundesliga (1ª)', division: 1, country: 'Alemania', countryFlag: '🇩🇪', prestige: 83 },
  { id: 'ein', name: 'Eintracht Frankfurt', badge: 'https://crests.football-data.org/19.png', league: 'Bundesliga (1ª)', division: 1, country: 'Alemania', countryFlag: '🇩🇪', prestige: 82 },
  { id: 'svw', name: 'Werder Bremen', badge: 'https://crests.football-data.org/12.png', league: 'Bundesliga (1ª)', division: 1, country: 'Alemania', countryFlag: '🇩🇪', prestige: 78 },
  { id: 'scf', name: 'SC Freiburg', badge: 'https://crests.football-data.org/17.png', league: 'Bundesliga (1ª)', division: 1, country: 'Alemania', countryFlag: '🇩🇪', prestige: 78 },
  { id: 'wob-g', name: 'VfL Wolfsburg', badge: 'https://crests.football-data.org/11.png', league: 'Bundesliga (1ª)', division: 1, country: 'Alemania', countryFlag: '🇩🇪', prestige: 78 },
  { id: 'bmg', name: 'Borussia Mönchengladbach', badge: 'https://crests.football-data.org/18.png', league: 'Bundesliga (1ª)', division: 1, country: 'Alemania', countryFlag: '🇩🇪', prestige: 77 },
  { id: 'm05', name: '1. FSV Mainz 05', badge: 'https://crests.football-data.org/15.png', league: 'Bundesliga (1ª)', division: 1, country: 'Alemania', countryFlag: '🇩🇪', prestige: 76 },
  { id: 'fca', name: 'FC Augsburg', badge: 'https://crests.football-data.org/16.png', league: 'Bundesliga (1ª)', division: 1, country: 'Alemania', countryFlag: '🇩🇪', prestige: 75 },
  { id: 'tsg', name: 'TSG 1899 Hoffenheim', badge: 'https://crests.football-data.org/2.png', league: 'Bundesliga (1ª)', division: 1, country: 'Alemania', countryFlag: '🇩🇪', prestige: 76 },
  { id: 'fch', name: '1. FC Heidenheim', badge: 'https://crests.football-data.org/20.png', league: 'Bundesliga (1ª)', division: 1, country: 'Alemania', countryFlag: '🇩🇪', prestige: 75 },
  { id: 'fcub', name: '1. FC Union Berlin', badge: 'https://crests.football-data.org/28.png', league: 'Bundesliga (1ª)', division: 1, country: 'Alemania', countryFlag: '🇩🇪', prestige: 76 },
  { id: 'boc-g', name: 'VfL Bochum', badge: 'https://crests.football-data.org/36.png', league: 'Bundesliga (1ª)', division: 1, country: 'Alemania', countryFlag: '🇩🇪', prestige: 73 },
  { id: 'stp', name: 'FC St. Pauli', badge: 'https://crests.football-data.org/24.png', league: 'Bundesliga (1ª)', division: 1, country: 'Alemania', countryFlag: '🇩🇪', prestige: 74 },
  { id: 'ksv', name: 'Holstein Kiel', badge: 'https://crests.football-data.org/26.png', league: 'Bundesliga (1ª)', division: 1, country: 'Alemania', countryFlag: '🇩🇪', prestige: 72 },

  { id: 'koe', name: '1. FC Köln', badge: 'https://crests.football-data.org/1.png', league: '2. Bundesliga (2ª)', division: 2, country: 'Alemania', countryFlag: '🇩🇪', prestige: 76 },
  { id: 'hsv', name: 'Hamburger SV', badge: 'https://crests.football-data.org/2.png', league: '2. Bundesliga (2ª)', division: 2, country: 'Alemania', countryFlag: '🇩🇪', prestige: 75 },
  { id: 'dar', name: 'SV Darmstadt 98', badge: 'https://crests.football-data.org/28.png', league: '2. Bundesliga (2ª)', division: 2, country: 'Alemania', countryFlag: '🇩🇪', prestige: 74 },
  { id: 'f95', name: 'Fortuna Düsseldorf', badge: 'https://crests.football-data.org/24.png', league: '2. Bundesliga (2ª)', division: 2, country: 'Alemania', countryFlag: '🇩🇪', prestige: 73 },
  { id: 'bsc', name: 'Hertha BSC', badge: 'https://crests.football-data.org/9.png', league: '2. Bundesliga (2ª)', division: 2, country: 'Alemania', countryFlag: '🇩🇪', prestige: 72 },
  { id: 's04', name: 'FC Schalke 04', badge: 'https://crests.football-data.org/6.png', league: '2. Bundesliga (2ª)', division: 2, country: 'Alemania', countryFlag: '🇩🇪', prestige: 72 },
  { id: 'fck', name: '1. FC Kaiserslautern', badge: 'https://crests.football-data.org/31.png', league: '2. Bundesliga (2ª)', division: 2, country: 'Alemania', countryFlag: '🇩🇪', prestige: 69 },
  { id: 'h96', name: 'Hannover 96', badge: 'https://crests.football-data.org/8.png', league: '2. Bundesliga (2ª)', division: 2, country: 'Alemania', countryFlag: '🇩🇪', prestige: 68 },
  { id: 'scp-g', name: 'SC Paderborn 07', badge: 'https://crests.football-data.org/26.png', league: '2. Bundesliga (2ª)', division: 2, country: 'Alemania', countryFlag: '🇩🇪', prestige: 70 },
  { id: 'ksc', name: 'Karlsruher SC', badge: 'https://crests.football-data.org/26.png', league: '2. Bundesliga (2ª)', division: 2, country: 'Alemania', countryFlag: '🇩🇪', prestige: 71 },
  { id: 'sgf', name: 'SpVgg Greuther Fürth', badge: 'https://crests.football-data.org/32.png', league: '2. Bundesliga (2ª)', division: 2, country: 'Alemania', countryFlag: '🇩🇪', prestige: 69 },
  { id: 'fcm', name: '1. FC Magdeburg', badge: 'https://crests.football-data.org/36.png', league: '2. Bundesliga (2ª)', division: 2, country: 'Alemania', countryFlag: '🇩🇪', prestige: 68 },
  { id: 'sve', name: 'SV Elversberg', badge: 'https://crests.football-data.org/27.png', league: '2. Bundesliga (2ª)', division: 2, country: 'Alemania', countryFlag: '🇩🇪', prestige: 67 },
  { id: 'fcn-g', name: '1. FC Nürnberg', badge: 'https://crests.football-data.org/38.png', league: '2. Bundesliga (2ª)', division: 2, country: 'Alemania', countryFlag: '🇩🇪', prestige: 69 },
  { id: 'ebs', name: 'Eintracht Braunschweig', badge: 'https://crests.football-data.org/31.png', league: '2. Bundesliga (2ª)', division: 2, country: 'Alemania', countryFlag: '🇩🇪', prestige: 66 },
  { id: 'prm', name: 'Preußen Münster', badge: 'https://crests.football-data.org/27.png', league: '2. Bundesliga (2ª)', division: 2, country: 'Alemania', countryFlag: '🇩🇪', prestige: 65 },
  { id: 'ulm', name: 'SSV Ulm 1846', badge: 'https://crests.football-data.org/38.png', league: '2. Bundesliga (2ª)', division: 2, country: 'Alemania', countryFlag: '🇩🇪', prestige: 65 },
  { id: 'reg-g', name: 'SSV Jahn Regensburg', badge: 'https://crests.football-data.org/28.png', league: '2. Bundesliga (2ª)', division: 2, country: 'Alemania', countryFlag: '🇩🇪', prestige: 65 },

  { id: 'ddr', name: 'Dynamo Dresden', badge: 'https://crests.football-data.org/36.png', league: '3. Liga (3ª)', division: 3, country: 'Alemania', countryFlag: '🇩🇪', prestige: 62 },
  { id: 'fcs', name: '1. FC Saarbrücken', badge: 'https://crests.football-data.org/32.png', league: '3. Liga (3ª)', division: 3, country: 'Alemania', countryFlag: '🇩🇪', prestige: 61 },
  { id: 'svs', name: 'SV Sandhausen', badge: 'https://crests.football-data.org/28.png', league: '3. Liga (3ª)', division: 3, country: 'Alemania', countryFlag: '🇩🇪', prestige: 60 },
  { id: 'm60', name: 'TSV 1860 München', badge: 'https://crests.football-data.org/32.png', league: '3. Liga (3ª)', division: 3, country: 'Alemania', countryFlag: '🇩🇪', prestige: 60 },
  { id: 'ros', name: 'FC Hansa Rostock', badge: 'https://crests.football-data.org/27.png', league: '3. Liga (3ª)', division: 3, country: 'Alemania', countryFlag: '🇩🇪', prestige: 59 },
  { id: 'vfl', name: 'VfL Osnabrück', badge: 'https://crests.football-data.org/38.png', league: '3. Liga (3ª)', division: 3, country: 'Alemania', countryFlag: '🇩🇪', prestige: 58 },
  { id: 'rwe', name: 'Rot-Weiss Essen', badge: 'https://crests.football-data.org/31.png', league: '3. Liga (3ª)', division: 3, country: 'Alemania', countryFlag: '🇩🇪', prestige: 57 },
  { id: 'bie', name: 'Arminia Bielefeld', badge: 'https://crests.football-data.org/38.png', league: '3. Liga (3ª)', division: 3, country: 'Alemania', countryFlag: '🇩🇪', prestige: 56 },
  { id: 'wehen', name: 'SV Wehen Wiesbaden', badge: 'https://crests.football-data.org/28.png', league: '3. Liga (3ª)', division: 3, country: 'Alemania', countryFlag: '🇩🇪', prestige: 58 },
  { id: 'fci', name: 'FC Ingolstadt 04', badge: 'https://crests.football-data.org/27.png', league: '3. Liga (3ª)', division: 3, country: 'Alemania', countryFlag: '🇩🇪', prestige: 57 },
  { id: 'vkt', name: 'FC Viktoria Köln', badge: 'https://crests.football-data.org/26.png', league: '3. Liga (3ª)', division: 3, country: 'Alemania', countryFlag: '🇩🇪', prestige: 55 },
  { id: 'ver-g', name: 'SC Verl', badge: 'https://crests.football-data.org/36.png', league: '3. Liga (3ª)', division: 3, country: 'Alemania', countryFlag: '🇩🇪', prestige: 55 },
  { id: 'bvb-b', name: 'Borussia Dortmund II', badge: 'https://crests.football-data.org/4.png', league: '3. Liga (3ª)', division: 3, country: 'Alemania', countryFlag: '🇩🇪', prestige: 54 },
  { id: 'h96-b', name: 'Hannover 96 II', badge: 'https://crests.football-data.org/8.png', league: '3. Liga (3ª)', division: 3, country: 'Alemania', countryFlag: '🇩🇪', prestige: 53 },
  { id: 'cot', name: 'Energie Cottbus', badge: 'https://crests.football-data.org/31.png', league: '3. Liga (3ª)', division: 3, country: 'Alemania', countryFlag: '🇩🇪', prestige: 55 },
  { id: 'aac', name: 'Alemannia Aachen', badge: 'https://crests.football-data.org/32.png', league: '3. Liga (3ª)', division: 3, country: 'Alemania', countryFlag: '🇩🇪', prestige: 54 },
  { id: 'wma', name: 'SV Waldhof Mannheim', badge: 'https://crests.football-data.org/26.png', league: '3. Liga (3ª)', division: 3, country: 'Alemania', countryFlag: '🇩🇪', prestige: 54 },
  { id: 'aue', name: 'FC Erzgebirge Aue', badge: 'https://crests.football-data.org/27.png', league: '3. Liga (3ª)', division: 3, country: 'Alemania', countryFlag: '🇩🇪', prestige: 56 },

  { id: 'psg', name: 'Paris Saint-Germain', badge: 'https://crests.football-data.org/524.png', league: 'Ligue 1 (1ª)', division: 1, country: 'Francia', countryFlag: '🇫🇷', prestige: 92 },
  { id: 'asm', name: 'AS Monaco', badge: 'https://crests.football-data.org/548.png', league: 'Ligue 1 (1ª)', division: 1, country: 'Francia', countryFlag: '🇫🇷', prestige: 84 },
  { id: 'los', name: 'LOSC Lille', badge: 'https://crests.football-data.org/521.png', league: 'Ligue 1 (1ª)', division: 1, country: 'Francia', countryFlag: '🇫🇷', prestige: 83 },
  { id: 'om', name: 'Olympique de Marseille', badge: 'https://crests.football-data.org/516.png', league: 'Ligue 1 (1ª)', division: 1, country: 'Francia', countryFlag: '🇫🇷', prestige: 82 },
  { id: 'ol', name: 'Olympique Lyonnais', badge: 'https://crests.football-data.org/523.png', league: 'Ligue 1 (1ª)', division: 1, country: 'Francia', countryFlag: '🇫🇷', prestige: 81 },
  { id: 'rcl', name: 'RC Lens', badge: 'https://crests.football-data.org/547.png', league: 'Ligue 1 (1ª)', division: 1, country: 'Francia', countryFlag: '🇫🇷', prestige: 80 },
  { id: 'ogcn', name: 'OGC Nice', badge: 'https://crests.football-data.org/522.png', league: 'Ligue 1 (1ª)', division: 1, country: 'Francia', countryFlag: '🇫🇷', prestige: 80 },
  { id: 'ren', name: 'Stade Rennais', badge: 'https://crests.football-data.org/529.png', league: 'Ligue 1 (1ª)', division: 1, country: 'Francia', countryFlag: '🇫🇷', prestige: 79 },
  { id: 'sdr', name: 'Stade de Reims', badge: 'https://crests.football-data.org/547.png', league: 'Ligue 1 (1ª)', division: 1, country: 'Francia', countryFlag: '🇫🇷', prestige: 77 },
  { id: 'rcsa', name: 'RC Strasbourg', badge: 'https://crests.football-data.org/514.png', league: 'Ligue 1 (1ª)', division: 1, country: 'Francia', countryFlag: '🇫🇷', prestige: 76 },
  { id: 'sb29', name: 'Stade Brestois 29', badge: 'https://crests.football-data.org/512.png', league: 'Ligue 1 (1ª)', division: 1, country: 'Francia', countryFlag: '🇫🇷', prestige: 76 },
  { id: 'tfc', name: 'Toulouse FC', badge: 'https://crests.football-data.org/511.png', league: 'Ligue 1 (1ª)', division: 1, country: 'Francia', countryFlag: '🇫🇷', prestige: 75 },
  { id: 'mhsc', name: 'Montpellier HSC', badge: 'https://crests.football-data.org/518.png', league: 'Ligue 1 (1ª)', division: 1, country: 'Francia', countryFlag: '🇫🇷', prestige: 74 },
  { id: 'fcn', name: 'FC Nantes', badge: 'https://crests.football-data.org/519.png', league: 'Ligue 1 (1ª)', division: 1, country: 'Francia', countryFlag: '🇫🇷', prestige: 74 },
  { id: 'aja', name: 'AJ Auxerre', badge: 'https://crests.football-data.org/525.png', league: 'Ligue 1 (1ª)', division: 1, country: 'Francia', countryFlag: '🇫🇷', prestige: 73 },
  { id: 'asse', name: 'AS Saint-Étienne', badge: 'https://crests.football-data.org/527.png', league: 'Ligue 1 (1ª)', division: 1, country: 'Francia', countryFlag: '🇫🇷', prestige: 73 },
  { id: 'sco', name: 'Angers SCO', badge: 'https://crests.football-data.org/532.png', league: 'Ligue 1 (1ª)', division: 1, country: 'Francia', countryFlag: '🇫🇷', prestige: 72 },
  { id: 'hac', name: 'Le Havre AC', badge: 'https://crests.football-data.org/530.png', league: 'Ligue 1 (1ª)', division: 1, country: 'Francia', countryFlag: '🇫🇷', prestige: 72 },

  { id: 'fcl', name: 'FC Lorient', badge: 'https://crests.football-data.org/525.png', league: 'Ligue 2 (2ª)', division: 2, country: 'Francia', countryFlag: '🇫🇷', prestige: 74 },
  { id: 'met', name: 'FC Metz', badge: 'https://crests.football-data.org/545.png', league: 'Ligue 2 (2ª)', division: 2, country: 'Francia', countryFlag: '🇫🇷', prestige: 72 },
  { id: 'cle', name: 'Clermont Foot', badge: 'https://crests.football-data.org/541.png', league: 'Ligue 2 (2ª)', division: 2, country: 'Francia', countryFlag: '🇫🇷', prestige: 72 },
  { id: 'pfc', name: 'Paris FC', badge: 'https://crests.football-data.org/547.png', league: 'Ligue 2 (2ª)', division: 2, country: 'Francia', countryFlag: '🇫🇷', prestige: 71 },
  { id: 'cae', name: 'SM Caen', badge: 'https://crests.football-data.org/514.png', league: 'Ligue 2 (2ª)', division: 2, country: 'Francia', countryFlag: '🇫🇷', prestige: 70 },
  { id: 'eag', name: 'EA Guingamp', badge: 'https://crests.football-data.org/518.png', league: 'Ligue 2 (2ª)', division: 2, country: 'Francia', countryFlag: '🇫🇷', prestige: 68 },
  { id: 'rod', name: 'Rodez AF', badge: 'https://crests.football-data.org/541.png', league: 'Ligue 2 (2ª)', division: 2, country: 'Francia', countryFlag: '🇫🇷', prestige: 69 },
  { id: 'pau', name: 'Pau FC', badge: 'https://crests.football-data.org/545.png', league: 'Ligue 2 (2ª)', division: 2, country: 'Francia', countryFlag: '🇫🇷', prestige: 67 },
  { id: 'lav', name: 'Stade Lavallois', badge: 'https://crests.football-data.org/531.png', league: 'Ligue 2 (2ª)', division: 2, country: 'Francia', countryFlag: '🇫🇷', prestige: 68 },
  { id: 'bas', name: 'SC Bastia', badge: 'https://crests.football-data.org/528.png', league: 'Ligue 2 (2ª)', division: 2, country: 'Francia', countryFlag: '🇫🇷', prestige: 68 },
  { id: 'aca', name: 'AC Ajaccio', badge: 'https://crests.football-data.org/515.png', league: 'Ligue 2 (2ª)', division: 2, country: 'Francia', countryFlag: '🇫🇷', prestige: 67 },
  { id: 'dun', name: 'USL Dunkerque', badge: 'https://crests.football-data.org/550.png', league: 'Ligue 2 (2ª)', division: 2, country: 'Francia', countryFlag: '🇫🇷', prestige: 66 },
  { id: 'ann', name: 'FC Annecy', badge: 'https://crests.football-data.org/522.png', league: 'Ligue 2 (2ª)', division: 2, country: 'Francia', countryFlag: '🇫🇷', prestige: 66 },
  { id: 'g38', name: 'Grenoble Foot 38', badge: 'https://crests.football-data.org/519.png', league: 'Ligue 2 (2ª)', division: 2, country: 'Francia', countryFlag: '🇫🇷', prestige: 67 },
  { id: 'ami', name: 'Amiens SC', badge: 'https://crests.football-data.org/528.png', league: 'Ligue 2 (2ª)', division: 2, country: 'Francia', countryFlag: '🇫🇷', prestige: 67 },
  { id: 'tro', name: 'ES Troyes AC', badge: 'https://crests.football-data.org/531.png', league: 'Ligue 2 (2ª)', division: 2, country: 'Francia', countryFlag: '🇫🇷', prestige: 68 },
  { id: 'red', name: 'Red Star FC', badge: 'https://crests.football-data.org/515.png', league: 'Ligue 2 (2ª)', division: 2, country: 'Francia', countryFlag: '🇫🇷', prestige: 65 },
  { id: 'mar-f', name: 'FC Martigues', badge: 'https://crests.football-data.org/550.png', league: 'Ligue 2 (2ª)', division: 2, country: 'Francia', countryFlag: '🇫🇷', prestige: 64 },

  { id: 'vfc', name: 'Valenciennes FC', badge: 'https://crests.football-data.org/528.png', league: 'National 1 (3ª)', division: 3, country: 'Francia', countryFlag: '🇫🇷', prestige: 61 },
  { id: 'soc', name: 'FC Sochaux-Montbéliard', badge: 'https://crests.football-data.org/515.png', league: 'National 1 (3ª)', division: 3, country: 'Francia', countryFlag: '🇫🇷', prestige: 60 },
  { id: 'nim', name: 'Nîmes Olympique', badge: 'https://crests.football-data.org/550.png', league: 'National 1 (3ª)', division: 3, country: 'Francia', countryFlag: '🇫🇷', prestige: 59 },
  { id: 'dij', name: 'Dijon FCO', badge: 'https://crests.football-data.org/522.png', league: 'National 1 (3ª)', division: 3, country: 'Francia', countryFlag: '🇫🇷', prestige: 58 },
  { id: 'nan', name: 'AS Nancy Lorraine', badge: 'https://crests.football-data.org/519.png', league: 'National 1 (3ª)', division: 3, country: 'Francia', countryFlag: '🇫🇷', prestige: 57 },
  { id: 'cht', name: 'LB Châteauroux', badge: 'https://crests.football-data.org/528.png', league: 'National 1 (3ª)', division: 3, country: 'Francia', countryFlag: '🇫🇷', prestige: 56 },
  { id: 'lmc', name: 'Le Mans FC', badge: 'https://crests.football-data.org/531.png', league: 'National 1 (3ª)', division: 3, country: 'Francia', countryFlag: '🇫🇷', prestige: 56 },
  { id: 'orl', name: 'US Orléans', badge: 'https://crests.football-data.org/515.png', league: 'National 1 (3ª)', division: 3, country: 'Francia', countryFlag: '🇫🇷', prestige: 55 },
  { id: 'rou', name: 'FC Rouen 1899', badge: 'https://crests.football-data.org/550.png', league: 'National 1 (3ª)', division: 3, country: 'Francia', countryFlag: '🇫🇷', prestige: 55 },
  { id: 'ver-f', name: 'FC Versailles', badge: 'https://crests.football-data.org/522.png', league: 'National 1 (3ª)', division: 3, country: 'Francia', countryFlag: '🇫🇷', prestige: 54 },
  { id: 'cnc', name: 'US Concarneau', badge: 'https://crests.football-data.org/519.png', league: 'National 1 (3ª)', division: 3, country: 'Francia', countryFlag: '🇫🇷', prestige: 56 },
  { id: 'avr', name: 'US Avranches', badge: 'https://crests.football-data.org/528.png', league: 'National 1 (3ª)', division: 3, country: 'Francia', countryFlag: '🇫🇷', prestige: 53 },
  { id: 'bpe', name: 'Football Bourg-en-Bresse', badge: 'https://crests.football-data.org/531.png', league: 'National 1 (3ª)', division: 3, country: 'Francia', countryFlag: '🇫🇷', prestige: 53 },
  { id: 'aub', name: 'Aubagne FC', badge: 'https://crests.football-data.org/515.png', league: 'National 1 (3ª)', division: 3, country: 'Francia', countryFlag: '🇫🇷', prestige: 52 },
  { id: 'p13', name: 'Paris 13 Atletico', badge: 'https://crests.football-data.org/550.png', league: 'National 1 (3ª)', division: 3, country: 'Francia', countryFlag: '🇫🇷', prestige: 52 },
  { id: 'vfr', name: 'FC Villefranche Beaujolais', badge: 'https://crests.football-data.org/522.png', league: 'National 1 (3ª)', division: 3, country: 'Francia', countryFlag: '🇫🇷', prestige: 53 },

  { id: 'scp', name: 'Sporting CP', badge: 'https://crests.football-data.org/498.png', league: 'Primeira Liga (1ª)', division: 1, country: 'Portugal', countryFlag: '🇵🇹', prestige: 90 },
  { id: 'slb', name: 'SL Benfica', badge: 'https://crests.football-data.org/1903.png', league: 'Primeira Liga (1ª)', division: 1, country: 'Portugal', countryFlag: '🇵🇹', prestige: 89 },
  { id: 'fcp', name: 'FC Porto', badge: 'https://crests.football-data.org/503.png', league: 'Primeira Liga (1ª)', division: 1, country: 'Portugal', countryFlag: '🇵🇹', prestige: 88 },
  { id: 'bra', name: 'SC Braga', badge: 'https://crests.football-data.org/5613.png', league: 'Primeira Liga (1ª)', division: 1, country: 'Portugal', countryFlag: '🇵🇹', prestige: 82 },
  { id: 'vgu', name: 'Vitória Guimarães', badge: 'https://crests.football-data.org/5601.png', league: 'Primeira Liga (1ª)', division: 1, country: 'Portugal', countryFlag: '🇵🇹', prestige: 77 },
  { id: 'stc', name: 'CD Santa Clara', badge: 'https://crests.football-data.org/5602.png', league: 'Primeira Liga (1ª)', division: 1, country: 'Portugal', countryFlag: '🇵🇹', prestige: 75 },
  { id: 'fam', name: 'FC Famalicão', badge: 'https://crests.football-data.org/507.png', league: 'Primeira Liga (1ª)', division: 1, country: 'Portugal', countryFlag: '🇵🇹', prestige: 75 },
  { id: 'mor', name: 'Moreirense FC', badge: 'https://crests.football-data.org/499.png', league: 'Primeira Liga (1ª)', division: 1, country: 'Portugal', countryFlag: '🇵🇹', prestige: 74 },
  { id: 'gvc', name: 'Gil Vicente FC', badge: 'https://crests.football-data.org/5613.png', league: 'Primeira Liga (1ª)', division: 1, country: 'Portugal', countryFlag: '🇵🇹', prestige: 73 },
  { id: 'rio', name: 'Rio Ave FC', badge: 'https://crests.football-data.org/5601.png', league: 'Primeira Liga (1ª)', division: 1, country: 'Portugal', countryFlag: '🇵🇹', prestige: 73 },
  { id: 'aro', name: 'FC Arouca', badge: 'https://crests.football-data.org/5602.png', league: 'Primeira Liga (1ª)', division: 1, country: 'Portugal', countryFlag: '🇵🇹', prestige: 73 },
  { id: 'boa', name: 'Boavista FC', badge: 'https://crests.football-data.org/507.png', league: 'Primeira Liga (1ª)', division: 1, country: 'Portugal', countryFlag: '🇵🇹', prestige: 72 },
  { id: 'est-p', name: 'GD Estoril Praia', badge: 'https://crests.football-data.org/499.png', league: 'Primeira Liga (1ª)', division: 1, country: 'Portugal', countryFlag: '🇵🇹', prestige: 72 },
  { id: 'cas-p', name: 'Casa Pia AC', badge: 'https://crests.football-data.org/5613.png', league: 'Primeira Liga (1ª)', division: 1, country: 'Portugal', countryFlag: '🇵🇹', prestige: 72 },
  { id: 'far', name: 'SC Farense', badge: 'https://crests.football-data.org/5601.png', league: 'Primeira Liga (1ª)', division: 1, country: 'Portugal', countryFlag: '🇵🇹', prestige: 71 },
  { id: 'avs', name: 'AVS Futebol SAD', badge: 'https://crests.football-data.org/5602.png', league: 'Primeira Liga (1ª)', division: 1, country: 'Portugal', countryFlag: '🇵🇹', prestige: 71 },
  { id: 'nac', name: 'CD Nacional', badge: 'https://crests.football-data.org/507.png', league: 'Primeira Liga (1ª)', division: 1, country: 'Portugal', countryFlag: '🇵🇹', prestige: 71 },
  { id: 'est-a', name: 'CF Estrela da Amadora', badge: 'https://crests.football-data.org/499.png', league: 'Primeira Liga (1ª)', division: 1, country: 'Portugal', countryFlag: '🇵🇹', prestige: 71 },

  { id: 'viz', name: 'FC Vizela', badge: 'https://crests.football-data.org/5613.png', league: 'Liga Portugal 2 (2ª)', division: 2, country: 'Portugal', countryFlag: '🇵🇹', prestige: 72 },
  { id: 'por-t', name: 'Portimonense SC', badge: 'https://crests.football-data.org/5601.png', league: 'Liga Portugal 2 (2ª)', division: 2, country: 'Portugal', countryFlag: '🇵🇹', prestige: 71 },
  { id: 'cha-p', name: 'GD Chaves', badge: 'https://crests.football-data.org/5602.png', league: 'Liga Portugal 2 (2ª)', division: 2, country: 'Portugal', countryFlag: '🇵🇹', prestige: 70 },
  { id: 'mar', name: 'CS Marítimo', badge: 'https://crests.football-data.org/507.png', league: 'Liga Portugal 2 (2ª)', division: 2, country: 'Portugal', countryFlag: '🇵🇹', prestige: 69 },
  { id: 'lei', name: 'Leixões SC', badge: 'https://crests.football-data.org/499.png', league: 'Liga Portugal 2 (2ª)', division: 2, country: 'Portugal', countryFlag: '🇵🇹', prestige: 67 },
  { id: 'fei', name: 'CD Feirense', badge: 'https://crests.football-data.org/5613.png', league: 'Liga Portugal 2 (2ª)', division: 2, country: 'Portugal', countryFlag: '🇵🇹', prestige: 67 },
  { id: 'oli', name: 'UD Oliveirense', badge: 'https://crests.football-data.org/5601.png', league: 'Liga Portugal 2 (2ª)', division: 2, country: 'Portugal', countryFlag: '🇵🇹', prestige: 66 },
  { id: 'pen', name: 'FC Penafiel', badge: 'https://crests.football-data.org/5602.png', league: 'Liga Portugal 2 (2ª)', division: 2, country: 'Portugal', countryFlag: '🇵🇹', prestige: 66 },
  { id: 'vis', name: 'Académico de Viseu', badge: 'https://crests.football-data.org/507.png', league: 'Liga Portugal 2 (2ª)', division: 2, country: 'Portugal', countryFlag: '🇵🇹', prestige: 67 },
  { id: 'tor-p', name: 'CD Torreense', badge: 'https://crests.football-data.org/499.png', league: 'Liga Portugal 2 (2ª)', division: 2, country: 'Portugal', countryFlag: '🇵🇹', prestige: 66 },
  { id: 'maf', name: 'CD Mafra', badge: 'https://crests.football-data.org/5613.png', league: 'Liga Portugal 2 (2ª)', division: 2, country: 'Portugal', countryFlag: '🇵🇹', prestige: 66 },
  { id: 'paf', name: 'FC Paços de Ferreira', badge: 'https://crests.football-data.org/5601.png', league: 'Liga Portugal 2 (2ª)', division: 2, country: 'Portugal', countryFlag: '🇵🇹', prestige: 68 },
  { id: 'ton', name: 'CD Tondela', badge: 'https://crests.football-data.org/5602.png', league: 'Liga Portugal 2 (2ª)', division: 2, country: 'Portugal', countryFlag: '🇵🇹', prestige: 67 },
  { id: 'alv', name: 'FC Alverca', badge: 'https://crests.football-data.org/507.png', league: 'Liga Portugal 2 (2ª)', division: 2, country: 'Portugal', countryFlag: '🇵🇹', prestige: 65 },
  { id: 'fel', name: 'Felgueiras 1932', badge: 'https://crests.football-data.org/499.png', league: 'Liga Portugal 2 (2ª)', division: 2, country: 'Portugal', countryFlag: '🇵🇹', prestige: 64 },
  { id: 'lei-u', name: 'UD Leiria', badge: 'https://crests.football-data.org/5613.png', league: 'Liga Portugal 2 (2ª)', division: 2, country: 'Portugal', countryFlag: '🇵🇹', prestige: 67 },

  { id: 'bel', name: 'CF Os Belenenses', badge: 'https://crests.football-data.org/499.png', league: 'Liga 3 (3ª)', division: 3, country: 'Portugal', countryFlag: '🇵🇹', prestige: 60 },
  { id: 'var', name: 'Varzim SC', badge: 'https://crests.football-data.org/507.png', league: 'Liga 3 (3ª)', division: 3, country: 'Portugal', countryFlag: '🇵🇹', prestige: 58 },
  { id: 'aca', name: 'Académica de Coimbra', badge: 'https://crests.football-data.org/5602.png', league: 'Liga 3 (3ª)', division: 3, country: 'Portugal', countryFlag: '🇵🇹', prestige: 57 },
  { id: 'cov', name: 'SC Covilhã', badge: 'https://crests.football-data.org/5601.png', league: 'Liga 3 (3ª)', division: 3, country: 'Portugal', countryFlag: '🇵🇹', prestige: 57 },
  { id: 'amo', name: 'Amora FC', badge: 'https://crests.football-data.org/5613.png', league: 'Liga 3 (3ª)', division: 3, country: 'Portugal', countryFlag: '🇵🇹', prestige: 55 },
  { id: 'cal', name: 'Caldas SC', badge: 'https://crests.football-data.org/499.png', league: 'Liga 3 (3ª)', division: 3, country: 'Portugal', countryFlag: '🇵🇹', prestige: 54 },
  { id: 'atc-p', name: 'Atlético CP', badge: 'https://crests.football-data.org/507.png', league: 'Liga 3 (3ª)', division: 3, country: 'Portugal', countryFlag: '🇵🇹', prestige: 55 },
  { id: 'dez', name: '1º de Dezembro', badge: 'https://crests.football-data.org/5602.png', league: 'Liga 3 (3ª)', division: 3, country: 'Portugal', countryFlag: '🇵🇹', prestige: 53 },
  { id: 'snj', name: 'SC Sanjoanense', badge: 'https://crests.football-data.org/5601.png', league: 'Liga 3 (3ª)', division: 3, country: 'Portugal', countryFlag: '🇵🇹', prestige: 54 },
  { id: 'trf', name: 'CD Trofense', badge: 'https://crests.football-data.org/5613.png', league: 'Liga 3 (3ª)', division: 3, country: 'Portugal', countryFlag: '🇵🇹', prestige: 55 },
  { id: 'brg-b', name: 'SC Braga B', badge: 'https://crests.football-data.org/5613.png', league: 'Liga 3 (3ª)', division: 3, country: 'Portugal', countryFlag: '🇵🇹', prestige: 56 },
  { id: 'scp-b', name: 'Sporting CP B', badge: 'https://crests.football-data.org/498.png', league: 'Liga 3 (3ª)', division: 3, country: 'Portugal', countryFlag: '🇵🇹', prestige: 56 },
  { id: 'lus-l', name: 'Lusitânia Lourosa', badge: 'https://crests.football-data.org/507.png', league: 'Liga 3 (3ª)', division: 3, country: 'Portugal', countryFlag: '🇵🇹', prestige: 55 },
  { id: 'ana', name: 'Anadia FC', badge: 'https://crests.football-data.org/499.png', league: 'Liga 3 (3ª)', division: 3, country: 'Portugal', countryFlag: '🇵🇹', prestige: 53 },

  { id: 'riv', name: 'River Plate', badge: 'https://assets.footylogos.com/logos/river-plate/river-plate-logo-footylogos.svg', league: 'Liga Profesional (1ª)', division: 1, country: 'Argentina', countryFlag: '🇦🇷', prestige: 88 },
  { id: 'boc', name: 'Boca Juniors', badge: 'https://crests.football-data.org/2064.png', league: 'Liga Profesional (1ª)', division: 1, country: 'Argentina', countryFlag: '🇦🇷', prestige: 87 },
  { id: 'rac-a', name: 'Racing Club', badge: 'https://crests.football-data.org/2072.png', league: 'Liga Profesional (1ª)', division: 1, country: 'Argentina', countryFlag: '🇦🇷', prestige: 81 },
  { id: 'ind', name: 'CA Independiente', badge: 'https://crests.football-data.org/2069.png', league: 'Liga Profesional (1ª)', division: 1, country: 'Argentina', countryFlag: '🇦🇷', prestige: 79 },
  { id: 'slo', name: 'San Lorenzo', badge: 'https://crests.football-data.org/2073.png', league: 'Liga Profesional (1ª)', division: 1, country: 'Argentina', countryFlag: '🇦🇷', prestige: 78 },
  { id: 'est-arg', name: 'Estudiantes de La Plata', badge: 'https://crests.football-data.org/2066.png', league: 'Liga Profesional (1ª)', division: 1, country: 'Argentina', countryFlag: '🇦🇷', prestige: 80 },
  { id: 'vel', name: 'Vélez Sarsfield', badge: 'https://crests.football-data.org/2075.png', league: 'Liga Profesional (1ª)', division: 1, country: 'Argentina', countryFlag: '🇦🇷', prestige: 80 },
  { id: 'tal', name: 'Talleres de Córdoba', badge: 'https://crests.football-data.org/2072.png', league: 'Liga Profesional (1ª)', division: 1, country: 'Argentina', countryFlag: '🇦🇷', prestige: 79 },
  { id: 'ros-c', name: 'Rosario Central', badge: 'https://crests.football-data.org/2069.png', league: 'Liga Profesional (1ª)', division: 1, country: 'Argentina', countryFlag: '🇦🇷', prestige: 78 },
  { id: 'nob', name: "Newell's Old Boys", badge: 'https://crests.football-data.org/2073.png', league: 'Liga Profesional (1ª)', division: 1, country: 'Argentina', countryFlag: '🇦🇷', prestige: 77 },
  { id: 'aaj', name: 'Argentinos Juniors', badge: 'https://crests.football-data.org/2066.png', league: 'Liga Profesional (1ª)', division: 1, country: 'Argentina', countryFlag: '🇦🇷', prestige: 77 },
  { id: 'dyj', name: 'Defensa y Justicia', badge: 'https://crests.football-data.org/2075.png', league: 'Liga Profesional (1ª)', division: 1, country: 'Argentina', countryFlag: '🇦🇷', prestige: 77 },
  { id: 'lan', name: 'CA Lanús', badge: 'https://crests.football-data.org/2065.png', league: 'Liga Profesional (1ª)', division: 1, country: 'Argentina', countryFlag: '🇦🇷', prestige: 77 },
  { id: 'hur', name: 'CA Huracán', badge: 'https://crests.football-data.org/2070.png', league: 'Liga Profesional (1ª)', division: 1, country: 'Argentina', countryFlag: '🇦🇷', prestige: 76 },
  { id: 'bel-a', name: 'CA Belgrano', badge: 'https://crests.football-data.org/2064.png', league: 'Liga Profesional (1ª)', division: 1, country: 'Argentina', countryFlag: '🇦🇷', prestige: 76 },
  { id: 'god', name: 'Godoy Cruz', badge: 'https://crests.football-data.org/2072.png', league: 'Liga Profesional (1ª)', division: 1, country: 'Argentina', countryFlag: '🇦🇷', prestige: 76 },
  { id: 'gim-l', name: 'Gimnasia La Plata', badge: 'https://crests.football-data.org/2069.png', league: 'Liga Profesional (1ª)', division: 1, country: 'Argentina', countryFlag: '🇦🇷', prestige: 75 },
  { id: 'ban', name: 'CA Banfield', badge: 'https://crests.football-data.org/2073.png', league: 'Liga Profesional (1ª)', division: 1, country: 'Argentina', countryFlag: '🇦🇷', prestige: 74 },
  { id: 'uni-a', name: 'Unión de Santa Fe', badge: 'https://crests.football-data.org/2066.png', league: 'Liga Profesional (1ª)', division: 1, country: 'Argentina', countryFlag: '🇦🇷', prestige: 74 },
  { id: 'cco', name: 'Central Córdoba', badge: 'https://crests.football-data.org/2075.png', league: 'Liga Profesional (1ª)', division: 1, country: 'Argentina', countryFlag: '🇦🇷', prestige: 73 },

  { id: 'col', name: 'Colón de Santa Fe', badge: 'https://crests.football-data.org/2065.png', league: 'Primera Nacional (2ª)', division: 2, country: 'Argentina', countryFlag: '🇦🇷', prestige: 72 },
  { id: 'ars-a', name: 'Arsenal de Sarandí', badge: 'https://crests.football-data.org/2070.png', league: 'Primera Nacional (2ª)', division: 2, country: 'Argentina', countryFlag: '🇦🇷', prestige: 70 },
  { id: 'qui', name: 'Quilmes AC', badge: 'https://crests.football-data.org/2064.png', league: 'Primera Nacional (2ª)', division: 2, country: 'Argentina', countryFlag: '🇦🇷', prestige: 68 },
  { id: 'cha-a', name: 'Chacarita Juniors', badge: 'https://crests.football-data.org/2072.png', league: 'Primera Nacional (2ª)', division: 2, country: 'Argentina', countryFlag: '🇦🇷', prestige: 66 },
  { id: 'smt', name: 'San Martín de Tucumán', badge: 'https://crests.football-data.org/2069.png', league: 'Primera Nacional (2ª)', division: 2, country: 'Argentina', countryFlag: '🇦🇷', prestige: 69 },
  { id: 'nch', name: 'Nueva Chicago', badge: 'https://crests.football-data.org/2073.png', league: 'Primera Nacional (2ª)', division: 2, country: 'Argentina', countryFlag: '🇦🇷', prestige: 67 },
  { id: 'fco', name: 'Ferro Carril Oeste', badge: 'https://crests.football-data.org/2066.png', league: 'Primera Nacional (2ª)', division: 2, country: 'Argentina', countryFlag: '🇦🇷', prestige: 68 },
  { id: 'mor-a', name: 'Deportivo Morón', badge: 'https://crests.football-data.org/2075.png', league: 'Primera Nacional (2ª)', division: 2, country: 'Argentina', countryFlag: '🇦🇷', prestige: 66 },
  { id: 'ald', name: 'CA Aldosivi', badge: 'https://crests.football-data.org/2065.png', league: 'Primera Nacional (2ª)', division: 2, country: 'Argentina', countryFlag: '🇦🇷', prestige: 68 },
  { id: 'all', name: 'CA All Boys', badge: 'https://crests.football-data.org/2070.png', league: 'Primera Nacional (2ª)', division: 2, country: 'Argentina', countryFlag: '🇦🇷', prestige: 66 },
  { id: 'atl-a', name: 'CA Atlanta', badge: 'https://crests.football-data.org/2064.png', league: 'Primera Nacional (2ª)', division: 2, country: 'Argentina', countryFlag: '🇦🇷', prestige: 66 },
  { id: 'alm-a', name: 'Club Almagro', badge: 'https://crests.football-data.org/2072.png', league: 'Primera Nacional (2ª)', division: 2, country: 'Argentina', countryFlag: '🇦🇷', prestige: 65 },
  { id: 'gim-m', name: 'Gimnasia de Mendoza', badge: 'https://crests.football-data.org/2069.png', league: 'Primera Nacional (2ª)', division: 2, country: 'Argentina', countryFlag: '🇦🇷', prestige: 67 },
  { id: 'smj', name: 'San Martín de San Juan', badge: 'https://crests.football-data.org/2073.png', league: 'Primera Nacional (2ª)', division: 2, country: 'Argentina', countryFlag: '🇦🇷', prestige: 67 },
  { id: 'pat', name: 'CA Patronato', badge: 'https://crests.football-data.org/2066.png', league: 'Primera Nacional (2ª)', division: 2, country: 'Argentina', countryFlag: '🇦🇷', prestige: 67 },
  { id: 'raf', name: 'Atlético de Rafaela', badge: 'https://crests.football-data.org/2075.png', league: 'Primera Nacional (2ª)', division: 2, country: 'Argentina', countryFlag: '🇦🇷', prestige: 66 },
  { id: 'tem', name: 'CA Temperley', badge: 'https://crests.football-data.org/2065.png', league: 'Primera Nacional (2ª)', division: 2, country: 'Argentina', countryFlag: '🇦🇷', prestige: 65 },
  { id: 'def-b', name: 'Defensores de Belgrano', badge: 'https://crests.football-data.org/2070.png', league: 'Primera Nacional (2ª)', division: 2, country: 'Argentina', countryFlag: '🇦🇷', prestige: 66 },
  { id: 'agr', name: 'Agropecuario Argentino', badge: 'https://crests.football-data.org/2064.png', league: 'Primera Nacional (2ª)', division: 2, country: 'Argentina', countryFlag: '🇦🇷', prestige: 65 },
  { id: 'cfe', name: 'Chaco For Ever', badge: 'https://crests.football-data.org/2072.png', league: 'Primera Nacional (2ª)', division: 2, country: 'Argentina', countryFlag: '🇦🇷', prestige: 64 },

  { id: 'lan-a', name: 'CA Los Andes', badge: 'https://crests.football-data.org/2069.png', league: 'Primera B (3ª)', division: 3, country: 'Argentina', countryFlag: '🇦🇷', prestige: 59 },
  { id: 'com-a', name: 'Club Comunicaciones', badge: 'https://crests.football-data.org/2073.png', league: 'Primera B (3ª)', division: 3, country: 'Argentina', countryFlag: '🇦🇷', prestige: 56 },
  { id: 'fla-a', name: 'Club Flandria', badge: 'https://crests.football-data.org/2066.png', league: 'Primera B (3ª)', division: 3, country: 'Argentina', countryFlag: '🇦🇷', prestige: 54 },
  { id: 'laf', name: 'Deportivo Laferrere', badge: 'https://crests.football-data.org/2075.png', league: 'Primera B (3ª)', division: 3, country: 'Argentina', countryFlag: '🇦🇷', prestige: 54 },
  { id: 'aca-a', name: 'CR Acassuso', badge: 'https://crests.football-data.org/2065.png', league: 'Primera B (3ª)', division: 3, country: 'Argentina', countryFlag: '🇦🇷', prestige: 55 },
  { id: 'col-a', name: 'Club Colegiales', badge: 'https://crests.football-data.org/2070.png', league: 'Primera B (3ª)', division: 3, country: 'Argentina', countryFlag: '🇦🇷', prestige: 56 },
  { id: 'exc', name: 'CA Excursionistas', badge: 'https://crests.football-data.org/2064.png', league: 'Primera B (3ª)', division: 3, country: 'Argentina', countryFlag: '🇦🇷', prestige: 55 },
  { id: 'vda', name: 'Villa Dálmine', badge: 'https://crests.football-data.org/2072.png', league: 'Primera B (3ª)', division: 3, country: 'Argentina', countryFlag: '🇦🇷', prestige: 55 },
  { id: 'doc', name: 'CA Dock Sud', badge: 'https://crests.football-data.org/2069.png', league: 'Primera B (3ª)', division: 3, country: 'Argentina', countryFlag: '🇦🇷', prestige: 54 },
  { id: 'arq', name: 'Argentino de Quilmes', badge: 'https://crests.football-data.org/2073.png', league: 'Primera B (3ª)', division: 3, country: 'Argentina', countryFlag: '🇦🇷', prestige: 55 },
  { id: 'smb', name: 'San Martín de Burzaco', badge: 'https://crests.football-data.org/2066.png', league: 'Primera B (3ª)', division: 3, country: 'Argentina', countryFlag: '🇦🇷', prestige: 53 },
  { id: 'uai', name: 'UAI Urquiza', badge: 'https://crests.football-data.org/2075.png', league: 'Primera B (3ª)', division: 3, country: 'Argentina', countryFlag: '🇦🇷', prestige: 53 },
  { id: 'sac', name: 'Sacachispas FC', badge: 'https://crests.football-data.org/2065.png', league: 'Primera B (3ª)', division: 3, country: 'Argentina', countryFlag: '🇦🇷', prestige: 53 },
  { id: 'arm', name: 'Deportivo Armenio', badge: 'https://crests.football-data.org/2070.png', league: 'Primera B (3ª)', division: 3, country: 'Argentina', countryFlag: '🇦🇷', prestige: 54 },
  { id: 'spi', name: 'Sportivo Italiano', badge: 'https://crests.football-data.org/2064.png', league: 'Primera B (3ª)', division: 3, country: 'Argentina', countryFlag: '🇦🇷', prestige: 52 },
  { id: 'lin-a', name: 'CSD Liniers', badge: 'https://crests.football-data.org/2072.png', league: 'Primera B (3ª)', division: 3, country: 'Argentina', countryFlag: '🇦🇷', prestige: 52 },

  { id: 'pal-b', name: 'SE Palmeiras', badge: 'https://crests.football-data.org/1775.png', league: 'Brasileirão Série A (1ª)', division: 1, country: 'Brasil', countryFlag: '🇧🇷', prestige: 90 },
  { id: 'fla-b', name: 'CR Flamengo', badge: 'https://crests.football-data.org/1772.png', league: 'Brasileirão Série A (1ª)', division: 1, country: 'Brasil', countryFlag: '🇧🇷', prestige: 89 },
  { id: 'bot-b', name: 'Botafogo FR', badge: 'https://crests.football-data.org/1765.png', league: 'Brasileirão Série A (1ª)', division: 1, country: 'Brasil', countryFlag: '🇧🇷', prestige: 85 },
  { id: 'cam', name: 'Atlético Mineiro', badge: 'https://crests.football-data.org/1778.png', league: 'Brasileirão Série A (1ª)', division: 1, country: 'Brasil', countryFlag: '🇧🇷', prestige: 84 },
  { id: 'sao', name: 'São Paulo FC', badge: 'https://crests.football-data.org/1771.png', league: 'Brasileirão Série A (1ª)', division: 1, country: 'Brasil', countryFlag: '🇧🇷', prestige: 83 },
  { id: 'san-b', name: 'Santos FC', badge: 'https://crests.football-data.org/1779.png', league: 'Brasileirão Série A (1ª)', division: 1, country: 'Brasil', countryFlag: '🇧🇷', prestige: 82 },
  { id: 'flu', name: 'Fluminense FC', badge: 'https://crests.football-data.org/1775.png', league: 'Brasileirão Série A (1ª)', division: 1, country: 'Brasil', countryFlag: '🇧🇷', prestige: 84 },
  { id: 'cor-a', name: 'SC Corinthians', badge: 'https://crests.football-data.org/1772.png', league: 'Brasileirão Série A (1ª)', division: 1, country: 'Brasil', countryFlag: '🇧🇷', prestige: 83 },
  { id: 'int-b', name: 'SC Internacional', badge: 'https://crests.football-data.org/1765.png', league: 'Brasileirão Série A (1ª)', division: 1, country: 'Brasil', countryFlag: '🇧🇷', prestige: 83 },
  { id: 'gre', name: 'Grêmio FBPA', badge: 'https://crests.football-data.org/1779.png', league: 'Brasileirão Série A (1ª)', division: 1, country: 'Brasil', countryFlag: '🇧🇷', prestige: 83 },
  { id: 'cru', name: 'Cruzeiro EC', badge: 'https://crests.football-data.org/1771.png', league: 'Brasileirão Série A (1ª)', division: 1, country: 'Brasil', countryFlag: '🇧🇷', prestige: 82 },
  { id: 'bah', name: 'EC Bahia', badge: 'https://crests.football-data.org/1778.png', league: 'Brasileirão Série A (1ª)', division: 1, country: 'Brasil', countryFlag: '🇧🇷', prestige: 80 },
  { id: 'cap', name: 'Athletico Paranaense', badge: 'https://crests.football-data.org/1775.png', league: 'Brasileirão Série A (1ª)', division: 1, country: 'Brasil', countryFlag: '🇧🇷', prestige: 81 },
  { id: 'rbb', name: 'Red Bull Bragantino', badge: 'https://crests.football-data.org/1772.png', league: 'Brasileirão Série A (1ª)', division: 1, country: 'Brasil', countryFlag: '🇧🇷', prestige: 80 },
  { id: 'vas', name: 'CR Vasco da Gama', badge: 'https://crests.football-data.org/1778.png', league: 'Brasileirão Série A (1ª)', division: 1, country: 'Brasil', countryFlag: '🇧🇷', prestige: 81 },
  { id: 'for', name: 'Fortaleza EC', badge: 'https://crests.football-data.org/1765.png', league: 'Brasileirão Série A (1ª)', division: 1, country: 'Brasil', countryFlag: '🇧🇷', prestige: 81 },
  { id: 'juv-b', name: 'EC Juventude', badge: 'https://crests.football-data.org/1771.png', league: 'Brasileirão Série A (1ª)', division: 1, country: 'Brasil', countryFlag: '🇧🇷', prestige: 76 },
  { id: 'cui', name: 'Cuiabá EC', badge: 'https://crests.football-data.org/1779.png', league: 'Brasileirão Série A (1ª)', division: 1, country: 'Brasil', countryFlag: '🇧🇷', prestige: 75 },
  { id: 'vit', name: 'EC Vitória', badge: 'https://crests.football-data.org/1775.png', league: 'Brasileirão Série A (1ª)', division: 1, country: 'Brasil', countryFlag: '🇧🇷', prestige: 76 },
  { id: 'acg', name: 'Atlético Goianiense', badge: 'https://crests.football-data.org/1772.png', league: 'Brasileirão Série A (1ª)', division: 1, country: 'Brasil', countryFlag: '🇧🇷', prestige: 75 },

  { id: 'ame', name: 'América Mineiro', badge: 'https://crests.football-data.org/1765.png', league: 'Brasileirão Série B (2ª)', division: 2, country: 'Brasil', countryFlag: '🇧🇷', prestige: 71 },
  { id: 'cor-b', name: 'Coritiba FCF', badge: 'https://crests.football-data.org/1778.png', league: 'Brasileirão Série B (2ª)', division: 2, country: 'Brasil', countryFlag: '🇧🇷', prestige: 70 },
  { id: 'spo-b', name: 'Sport Recife', badge: 'https://crests.football-data.org/1771.png', league: 'Brasileirão Série B (2ª)', division: 2, country: 'Brasil', countryFlag: '🇧🇷', prestige: 69 },
  { id: 'goi', name: 'Goiás EC', badge: 'https://crests.football-data.org/1779.png', league: 'Brasileirão Série B (2ª)', division: 2, country: 'Brasil', countryFlag: '🇧🇷', prestige: 71 },
  { id: 'cea', name: 'Ceará SC', badge: 'https://crests.football-data.org/1775.png', league: 'Brasileirão Série B (2ª)', division: 2, country: 'Brasil', countryFlag: '🇧🇷', prestige: 71 },
  { id: 'vil', name: 'Vila Nova FC', badge: 'https://crests.football-data.org/1772.png', league: 'Brasileirão Série B (2ª)', division: 2, country: 'Brasil', countryFlag: '🇧🇷', prestige: 68 },
  { id: 'nov', name: 'Gremio Novorizontino', badge: 'https://crests.football-data.org/1765.png', league: 'Brasileirão Série B (2ª)', division: 2, country: 'Brasil', countryFlag: '🇧🇷', prestige: 68 },
  { id: 'mir-b', name: 'Mirassol FC', badge: 'https://crests.football-data.org/1778.png', league: 'Brasileirão Série B (2ª)', division: 2, country: 'Brasil', countryFlag: '🇧🇷', prestige: 68 },
  { id: 'ava', name: 'Avaí FC', badge: 'https://crests.football-data.org/1771.png', league: 'Brasileirão Série B (2ª)', division: 2, country: 'Brasil', countryFlag: '🇧🇷', prestige: 68 },
  { id: 'crb', name: 'CRB', badge: 'https://crests.football-data.org/1779.png', league: 'Brasileirão Série B (2ª)', division: 2, country: 'Brasil', countryFlag: '🇧🇷', prestige: 67 },
  { id: 'ope', name: 'Operário Ferroviário', badge: 'https://crests.football-data.org/1775.png', league: 'Brasileirão Série B (2ª)', division: 2, country: 'Brasil', countryFlag: '🇧🇷', prestige: 66 },
  { id: 'bru', name: 'Brusque FC', badge: 'https://crests.football-data.org/1772.png', league: 'Brasileirão Série B (2ª)', division: 2, country: 'Brasil', countryFlag: '🇧🇷', prestige: 65 },
  { id: 'cha-b', name: 'Chapecoense', badge: 'https://crests.football-data.org/1765.png', league: 'Brasileirão Série B (2ª)', division: 2, country: 'Brasil', countryFlag: '🇧🇷', prestige: 67 },
  { id: 'itu', name: 'Ituano FC', badge: 'https://crests.football-data.org/1778.png', league: 'Brasileirão Série B (2ª)', division: 2, country: 'Brasil', countryFlag: '🇧🇷', prestige: 65 },
  { id: 'bsp', name: 'Botafogo-SP', badge: 'https://crests.football-data.org/1771.png', league: 'Brasileirão Série B (2ª)', division: 2, country: 'Brasil', countryFlag: '🇧🇷', prestige: 66 },
  { id: 'pay', name: 'Paysandu SC', badge: 'https://crests.football-data.org/1779.png', league: 'Brasileirão Série B (2ª)', division: 2, country: 'Brasil', countryFlag: '🇧🇷', prestige: 66 },
  { id: 'ama', name: 'Amazonas FC', badge: 'https://crests.football-data.org/1775.png', league: 'Brasileirão Série B (2ª)', division: 2, country: 'Brasil', countryFlag: '🇧🇷', prestige: 65 },
  { id: 'pon-b', name: 'AA Ponte Preta', badge: 'https://crests.football-data.org/1772.png', league: 'Brasileirão Série B (2ª)', division: 2, country: 'Brasil', countryFlag: '🇧🇷', prestige: 67 },

  { id: 'fig', name: 'Figueirense FC', badge: 'https://crests.football-data.org/1765.png', league: 'Brasileirão Série C (3ª)', division: 3, country: 'Brasil', countryFlag: '🇧🇷', prestige: 60 },
  { id: 'nau', name: 'Clube Náutico Capibaribe', badge: 'https://crests.football-data.org/1778.png', league: 'Brasileirão Série C (3ª)', division: 3, country: 'Brasil', countryFlag: '🇧🇷', prestige: 58 },
  { id: 'sam-b', name: 'Sampaio Corrêa FC', badge: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Sampaio_Corr%C3%AAa_FC.png', league: 'Brasileirão Série C (3ª)', division: 3, country: 'Brasil', countryFlag: '🇧🇷', prestige: 55 },
  { id: 'abc', name: 'ABC FC', badge: 'https://crests.football-data.org/1779.png', league: 'Brasileirão Série C (3ª)', division: 3, country: 'Brasil', countryFlag: '🇧🇷', prestige: 57 },
  { id: 'csa', name: 'CSA', badge: 'https://crests.football-data.org/1775.png', league: 'Brasileirão Série C (3ª)', division: 3, country: 'Brasil', countryFlag: '🇧🇷', prestige: 57 },
  { id: 'rem', name: 'Clube do Remo', badge: 'https://crests.football-data.org/1772.png', league: 'Brasileirão Série C (3ª)', division: 3, country: 'Brasil', countryFlag: '🇧🇷', prestige: 58 },
  { id: 'vrd', name: 'Volta Redonda FC', badge: 'https://crests.football-data.org/1765.png', league: 'Brasileirão Série C (3ª)', division: 3, country: 'Brasil', countryFlag: '🇧🇷', prestige: 56 },
  { id: 'cnf', name: 'AD Confiança', badge: 'https://crests.football-data.org/1778.png', league: 'Brasileirão Série C (3ª)', division: 3, country: 'Brasil', countryFlag: '🇧🇷', prestige: 55 },
  { id: 'ypi', name: 'Ypiranga FC', badge: 'https://crests.football-data.org/1771.png', league: 'Brasileirão Série C (3ª)', division: 3, country: 'Brasil', countryFlag: '🇧🇷', prestige: 55 },
  { id: 'sbn', name: 'São Bernardo FC', badge: 'https://crests.football-data.org/1779.png', league: 'Brasileirão Série C (3ª)', division: 3, country: 'Brasil', countryFlag: '🇧🇷', prestige: 56 },
  { id: 'bpb', name: 'Botafogo-PB', badge: 'https://crests.football-data.org/1775.png', league: 'Brasileirão Série C (3ª)', division: 3, country: 'Brasil', countryFlag: '🇧🇷', prestige: 55 },
  { id: 'lon', name: 'Londrina EC', badge: 'https://crests.football-data.org/1772.png', league: 'Brasileirão Série C (3ª)', division: 3, country: 'Brasil', countryFlag: '🇧🇷', prestige: 57 },
  { id: 'cax', name: 'SER Caxias', badge: 'https://crests.football-data.org/1765.png', league: 'Brasileirão Série C (3ª)', division: 3, country: 'Brasil', countryFlag: '🇧🇷', prestige: 54 },
  { id: 'fer-b', name: 'Ferroviário AC', badge: 'https://crests.football-data.org/1778.png', league: 'Brasileirão Série C (3ª)', division: 3, country: 'Brasil', countryFlag: '🇧🇷', prestige: 53 },
  { id: 'ath-c', name: 'Athletic Club (MG)', badge: 'https://www.bibliotecariodelfutbol.com/api/logo/athletic-club-mg?t=1786735614&dpl=dpl_BDtShSUwE44b5oqasnK6er1DHNRT', league: 'Brasileirão Série C (3ª)', division: 3, country: 'Brasil', countryFlag: '🇧🇷', prestige: 54 },
  { id: 'tom', name: 'Tombense FC', badge: 'https://crests.football-data.org/1779.png', league: 'Brasileirão Série C (3ª)', division: 3, country: 'Brasil', countryFlag: '🇧🇷', prestige: 55 }
];

export const CAREER_EVENTS_DATABASE: CareerEvent[] = [
  {
    id: 'pubalgia_injury',
    title: 'Molestias en la Pubis y Trastorno Físico',
    description: 'Arrastras molestias severas en la zona pubiana antes del tramo decisivo de la temporada. Los médicos te proponen infiltrarte o pasar por quirófano y parar 3 meses.',
    icon: '🏥',
    choices: [
      {
        text: 'Infiltrarse y forzar para jugar las finales',
        riskPercent: 40,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 15,
          message: '¡Heroico! Soportaste el dolor, fuiste clave en los títulos y te consagraste.'
        },
        failureOutcome: {
          ovrDelta: -3,
          marketValueDeltaPercent: -25,
          missedGamesPercent: 45,
          message: '¡Recaída grave de pubalgia! Tuviste que parar medio año y perdiste la titularidad.'
        }
      },
      {
        text: 'Operarse y hacer rehabilitación completa',
        riskPercent: 90,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 0,
          message: 'Recuperación limpia y sin dolor. Volviste al 100% de forma física.'
        },
        failureOutcome: {
          ovrDelta: -1,
          marketValueDeltaPercent: -10,
          missedGamesPercent: 20,
          message: 'Te perdiste partidos clave y el equipo contrató a otro en tu puesto.'
        }
      }
    ]
  },
  {
    id: 'contract_rebeldia',
    title: 'Renovación de Contrato y Tensión con la Directiva',
    description: 'Tu contrato vence pronto y el club te ofrece una renovación a la baja. Tu agente te sugiere declararte en rebeldía y no entrenar para forzar un traspaso.',
    icon: '✍️',
    choices: [
      {
        text: 'Forzar la salida y presionar a la directiva',
        riskPercent: 45,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 35,
          message: 'Conseguiste un contrato millonario y el traspaso a un club superior.'
        },
        failureOutcome: {
          ovrDelta: -3,
          marketValueDeltaPercent: -35,
          isFired: true,
          message: '¡Despedido por indisciplina! La directiva rescindió tu contrato unilateralmente y pasas 1 año sin equipo como Agente Libre.'
        }
      },
      {
        text: 'Aceptar la oferta del club y mantener la calma',
        riskPercent: 85,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 5,
          message: 'La afición valora tu compromiso y te conviertes en referente del vestuario.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -5,
          missedGamesPercent: 10,
          message: 'Firmaste por debajo de tu valor real de mercado.'
        }
      }
    ]
  },
  {
    id: 'night_scandal',
    title: 'Polémica Nocturna antes del Derbi',
    description: 'Filtran fotos tuyas en una discoteca a altas horas de la noche dos días antes del derbi decisivo. El entrenador pide explicaciones inmediatas.',
    icon: '📸',
    choices: [
      {
        text: 'Pedir disculpas públicas y aceptar la multa del club',
        riskPercent: 80,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 0,
          message: 'Tu humildad cerró la polémica. Entraste desde el banquillo y marcaste.'
        },
        failureOutcome: {
          ovrDelta: -1,
          marketValueDeltaPercent: -10,
          missedGamesPercent: 25,
          message: 'El técnico te sancionó sin convocar durante 4 jornadas consecutivas.'
        }
      },
      {
        text: 'Negar los hechos y culpar a la prensa',
        riskPercent: 30,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 10,
          message: 'Demostraste que era una foto antigua. Respondiste con un partidazo.'
        },
        failureOutcome: {
          ovrDelta: -3,
          marketValueDeltaPercent: -40,
          isFired: true,
          message: '¡Despido por falta grave! Descubrieron la mentira, rescindieron tu contrato y estás 1 año sin equipo como Agente Libre.'
        }
      }
    ]
  },
  {
    id: 'disciplina_vestuario',
    title: 'Enfrentamiento en el Vestuario',
    description: 'Discutiste acaloradamente con el entrenador tras ser sustituido en el descanso de un partido vital. Te exigen disculpas públicas o sanción ejemplar.',
    icon: '🗯️',
    choices: [
      {
        text: 'Desafiar al técnico ante toda la plantilla',
        riskPercent: 25,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 20,
          message: 'El vestuario respaldó tu liderazgo y el entrenador se vio obligado a ceder.'
        },
        failureOutcome: {
          ovrDelta: -4,
          marketValueDeltaPercent: -45,
          isFired: true,
          message: '¡Despido fulminante! El club rescinde tu contrato por falta grave de disciplina y pasas 1 año como Agente Libre perdiendo ritmo.'
        }
      },
      {
        text: 'Aceptar el error y disculparse en privado',
        riskPercent: 85,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 0,
          message: 'Madurez profesional. El técnico apreció la actitud y mantienes la titularidad.'
        },
        failureOutcome: {
          ovrDelta: -1,
          marketValueDeltaPercent: -10,
          missedGamesPercent: 20,
          message: 'Fuiste relegado al banquillo durante un mes.'
        }
      }
    ]
  },
  {
    id: 'national_team_risk',
    title: 'Convocatoria Selección vs Partido del Club',
    description: 'Llegas justo tras un viaje transoceánico con tu selección nacional. El entrenador del club te pregunta si estás listo para jugar de titular.',
    icon: '✈️',
    choices: [
      {
        text: 'Pedir jugar de titular pese al cansancio',
        riskPercent: 55,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 15,
          message: 'Físico achicado e imponente. Marcaste diferencias y te ganaste el respeto.'
        },
        failureOutcome: {
          ovrDelta: -2,
          marketValueDeltaPercent: -10,
          missedGamesPercent: 30,
          message: 'Agotamiento extremo y sobrecarga muscular a mitad del partido.'
        }
      },
      {
        text: 'Pedir rotar e iniciar en el banquillo',
        riskPercent: 90,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 0,
          message: 'Decisión madura. Entraste fresco en la segunda parte y diste el triunfo.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -5,
          missedGamesPercent: 15,
          message: 'El sustituto aprovechó la oportunidad y se quedó con tu puesto.'
        }
      }
    ]
  },
  {
    id: 'captaincy_dilemma',
    title: 'Propuesta de Capitanía y Liderazgo',
    description: 'El capitán veterano sufre una lesión grave de larga duración. El técnico te propone llevar el brazalete para encarrilar al equipo en el momento más crítico de la temporada.',
    icon: '👑',
    choices: [
      {
        text: 'Aceptar el brazalete y asumir el liderazgo',
        riskPercent: 65,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 20,
          message: 'Lideraste con garra y carisma. El grupo te reconoció como el nuevo gran referente del club.'
        },
        failureOutcome: {
          ovrDelta: -1,
          marketValueDeltaPercent: -10,
          message: 'La presión mediática pesó en tus actuaciones individuales.'
        }
      },
      {
        text: 'Rechazar la capitanía para centrarte en tu rendimiento',
        riskPercent: 85,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 5,
          message: 'Mantuviste la concentración y tus números individuales fueron excelentes.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -5,
          message: 'Parte de la afición cuestionó tu falta de galones en momentos clave.'
        }
      }
    ]
  },
  {
    id: 'tactical_disagree',
    title: 'Guerra Táctica con el Nuevo Entrenador',
    description: 'El nuevo míster implanta un sistema muy defensivo que limita tus libertades ofensivas. Te pide que sacrifiques tus cifras por el bien colectivo.',
    icon: '📋',
    choices: [
      {
        text: 'Cumplir a rajatabla el plan táctico del entrenador',
        riskPercent: 75,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 10,
          message: 'Mejoraste tu disciplina táctica y lectura defensiva del juego.'
        },
        failureOutcome: {
          ovrDelta: -1,
          marketValueDeltaPercent: -15,
          message: 'Tus cifras de gol y asistencia cayeron drásticamente.'
        }
      },
      {
        text: 'Desobedecer el esquema y jugar con total libertad',
        riskPercent: 40,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 25,
          message: '¡Genio indomable! Marcaste dos goles antológicos rompiendo el esquema previsto.'
        },
        failureOutcome: {
          ovrDelta: -2,
          marketValueDeltaPercent: -20,
          message: 'El entrenador te castigó enviándote al banquillo durante un mes.'
        }
      }
    ]
  },
  {
    id: 'champions_penalty_pressure',
    title: 'Penalti Decisivo en el Minuto 90',
    description: 'Partido de vuelta de eliminatoria europea o final de Copa. Penalti a favor en el descuento. El tirador oficial está con molestias y te mira.',
    icon: '⚽',
    choices: [
      {
        text: 'Coger el balón y asumir el lanzamiento histórico',
        riskPercent: 60,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 30,
          message: '¡Golazo a la escuadra! Sangre fría de súper estrella consagrada mundialmente.'
        },
        failureOutcome: {
          ovrDelta: -2,
          marketValueDeltaPercent: -20,
          message: '¡Al palo! El fallo costó la eliminación y sufriste duras críticas mediáticas.'
        }
      },
      {
        text: 'Ceder el penalti a un compañero especialista',
        riskPercent: 85,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 5,
          message: 'Decisión inteligente. Tu compañero convirtió y festejasteis juntos la clasificación.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -10,
          message: 'Tu compañero erró el tiro y la prensa te reprochó esconderte en el momento decisivo.'
        }
      }
    ]
  },
  {
    id: 'personal_trainer_regimen',
    title: 'Plan de Rendimiento de Vanguardia',
    description: 'Un famoso preparador físico de atletas olímpicos te propone un programa de nutrición y biomecánica durante las vacaciones para subir un escalón competitivo.',
    icon: '⚡',
    choices: [
      {
        text: 'Invertir en el plan de preparación extrema',
        riskPercent: 70,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 15,
          message: '¡Salto físico descomunal! Volviste a la pretemporada volando y en pico de forma.'
        },
        failureOutcome: {
          ovrDelta: -1,
          marketValueDeltaPercent: -10,
          message: 'Agotamiento muscular prematuro al inicio de la competición.'
        }
      },
      {
        text: 'Desconectar y disfrutar de unas vacaciones tranquilas',
        riskPercent: 90,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 0,
          message: 'Mente despejada y baterías cargadas para afrontar un año largo.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -5,
          message: 'Llegaste con un ligero sobrepeso y tardaste varias jornadas en ponerte a tono.'
        }
      }
    ]
  },
  {
    id: 'saudi_mega_offer',
    title: 'Tentación Millonaria del Fútbol Exótico',
    description: 'Un multimillonario club del Golfo Pérsico intenta seducirte con una ficha astronómica que multiplicaría por 5 tu salario actual.',
    icon: '💰',
    choices: [
      {
        text: 'Priorizar el contrato millonario y el retiro dorado',
        riskPercent: 50,
        successOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: 35,
          message: 'Aseguraste un contrato de leyenda y te convertiste en la gran estrella franquicia del país.'
        },
        failureOutcome: {
          ovrDelta: -2,
          marketValueDeltaPercent: -20,
          message: 'La menor exigencia competitiva mermó tu nivel técnico y perdiste galones en la Selección.'
        }
      },
      {
        text: 'Rechazar los millones y priorizar la gloria europea',
        riskPercent: 85,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 15,
          message: 'Demostraste ambición pura. El respeto de la afición y los ojeadores subió como la espuma.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -5,
          message: 'Dejaste pasar una oportunidad económica irrepetible.'
        }
      }
    ]
  },
  {
    id: 'derby_provocation',
    title: 'Guerra Psicológica en el Gran Derbi',
    description: 'El central rival te busca continuamente con faltas a destiempo, provocaciones verbales y agarrones fuera del campo de visión del árbitro.',
    icon: '',
    choices: [
      {
        text: 'Morder el anzuelo y responder con agresividad',
        riskPercent: 35,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 15,
          message: 'Impusiste tu ley física, amedrentaste a la zaga rival y marcaste un gol decisivo.'
        },
        failureOutcome: {
          ovrDelta: -2,
          marketValueDeltaPercent: -15,
          message: 'Caíste en la trampa: tarjeta roja directa por agresión y 3 partidos de sanción.'
        }
      },
      {
        text: 'Mantener la sangre fría y responder marcando goles',
        riskPercent: 80,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 20,
          message: 'Cátedra de profesionalidad. Firmaste un doblete estelar dejando en evidencia al rival.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -5,
          message: 'El marcaje te desquició sutilmente y tuviste un partido gris.'
        }
      }
    ]
  },
  {
    id: 'boot_sponsor_offer',
    title: 'Oferta de Patrocinio de Botas de Marca Global',
    description: 'Una gran marca de ropa deportiva te ofrece un contrato de patrocinio exclusivo si cambias tu modelo de botas antes de la final.',
    icon: '',
    choices: [
      {
        text: 'Aceptar el nuevo calzado y estrenarlo en la final',
        riskPercent: 50,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 20,
          message: 'Estreno soñado con gol decisivo y portada en las marcas patrocinadoras.'
        },
        failureOutcome: {
          ovrDelta: -1,
          marketValueDeltaPercent: -10,
          missedGamesPercent: 15,
          message: 'Ampollas graves por falta de adaptación al nuevo calzado.'
        }
      },
      {
        text: 'Mantener tus botas habituales y rechazar el cambio rápido',
        riskPercent: 90,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 5,
          message: 'Comodidad garantizada y rendimiento sólido en el partido.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -5,
          message: 'Dejaste pasar una importante prima publicitaria.'
        }
      }
    ]
  },
  {
    id: 'transfer_rumor_distraction',
    title: 'Rumores de Fichaje por un Gigante Europeo',
    description: 'La prensa difunde portadas sobre el interés de grandes clubes europeos por ti a mitad de la competición.',
    icon: '',
    choices: [
      {
        text: 'Hacer guiños a la prensa en rueda de prensa',
        riskPercent: 40,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 30,
          message: 'Disparaste tu cotización internacional y el interés de los grandes.'
        },
        failureOutcome: {
          ovrDelta: -2,
          marketValueDeltaPercent: -20,
          message: 'La afición te pito por falta de respeto a los colores actuales.'
        }
      },
      {
        text: 'Reafirmar tu lealtad absoluta al club actual',
        riskPercent: 85,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 5,
          message: 'Respeto total de la hinchada y tranquilidad en el vestuario.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -5,
          message: 'Enfriaste el interés de traspasos de primer nivel.'
        }
      }
    ]
  },
  {
    id: 'veteran_mentor_clash',
    title: 'Consejo de un Veterano Leyenda',
    description: 'La estrella veterana del equipo te señala en el descanso por no presionar lo suficiente en labores defensivas.',
    icon: '',
    choices: [
      {
        text: 'Escuchar el consejo y ajustar tu esfuerzo defensivo',
        riskPercent: 80,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 10,
          message: 'Evolucionaste como jugador total ganando la admiración del vestuario.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -5,
          message: 'El esfuerzo extra te restó frescura de cara al gol.'
        }
      },
      {
        text: 'Ignorarle y mantener tu estilo de juego individual',
        riskPercent: 35,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 25,
          message: 'Marcaste dos goles descomunales demostrando tu talento único.'
        },
        failureOutcome: {
          ovrDelta: -2,
          marketValueDeltaPercent: -15,
          message: 'Tensión en el vestuario y reprimenda pública del cuerpo técnico.'
        }
      }
    ]
  },
  {
    id: 'fans_favorite_chant',
    title: 'Cántico de la Afición y Presión Mediática',
    description: 'La grada crea un cántico especial con tu nombre y exige que asumas la responsabilidad en las faltas directas.',
    icon: '',
    choices: [
      {
        text: 'Asumir todos los lanzamientos a puerta',
        riskPercent: 60,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 15,
          message: 'Anotaste dos faltas espectaculares consolidándote como ídolo.'
        },
        failureOutcome: {
          ovrDelta: -1,
          marketValueDeltaPercent: -10,
          message: 'Fallos consecutivos que generaron murmullos en la grada.'
        }
      },
      {
        text: 'Compartir la responsabilidad con tus compañeros',
        riskPercent: 85,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 5,
          message: 'Compañerismo ejemplar y equilibrio en el balón parado.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -5,
          message: 'La afición echó en falta mayor determinación por tu parte.'
        }
      }
    ]
  },
  {
    id: 'cold_weather_cup',
    title: 'Partido en Condiciones Meteorológicas Extremas',
    description: 'Eliminatoria decisiva disputada bajo una intensa nevada y terreno de juego congelado.',
    icon: '',
    choices: [
      {
        text: 'Arriesgar al máximo con entradas potentes y disparos lejanos',
        riskPercent: 50,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 15,
          message: 'Despliegue físico titánico sobre la nieve para meter al equipo en semifinales.'
        },
        failureOutcome: {
          ovrDelta: -2,
          marketValueDeltaPercent: -15,
          missedGamesPercent: 30,
          message: 'Resbalón infortunado y esguince de tobillo por el terreno helado.'
        }
      },
      {
        text: 'Jugar a un toque asegurando pases cortos',
        riskPercent: 85,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 5,
          message: 'Inteligencia táctica para minimizar errores sobre el césped congelado.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -10,
          message: 'El rival impuso su físico en la nieve y fuisteis eliminados.'
        }
      }
    ]
  },
  {
    id: 'press_conference_trap',
    title: 'Pregunta Trampa del Periodista Rival',
    description: 'Un periodista te pregunta si el entrenador se equivocó en el planteamiento táctico tras caer derrotados.',
    icon: '',
    choices: [
      {
        text: 'Criticar abiertamente el planteamiento del técnico',
        riskPercent: 25,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 10,
          message: 'La prensa alabó tu sinceridad y el técnico cambió el sistema.'
        },
        failureOutcome: {
          ovrDelta: -3,
          marketValueDeltaPercent: -30,
          isFired: true,
          message: 'Despedido por faltar al respeto a la entidad y al cuerpo técnico.'
        }
      },
      {
        text: 'Defender al grupo y asumir la responsabilidad colectiva',
        riskPercent: 90,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 5,
          message: 'Respuesta impecable que reforzó la unión del grupo.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -5,
          message: 'La prensa te tildó de conformista en la derrota.'
        }
      }
    ]
  },
  {
    id: 'red_card_appeal',
    title: 'Recurrir una Tarjeta Roja Injusta',
    description: 'Te expulsaron tras un pisotón fortuito. El club te ofrece recurrir la sanción ante el comité disciplinario.',
    icon: '',
    choices: [
      {
        text: 'Recurrir e ir a declarar en persona',
        riskPercent: 70,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 5,
          message: 'Sanción retirada por completo. Titular en el siguiente partido.'
        },
        failureOutcome: {
          ovrDelta: -1,
          marketValueDeltaPercent: -10,
          missedGamesPercent: 20,
          message: 'El comité consideró improcedente el recurso y aumentó la sanción.'
        }
      },
      {
        text: 'Aceptar la sanción y cumplir el partido de castigo',
        riskPercent: 95,
        successOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: 0,
          message: 'Aprovechaste la semana para entrenar aspectos físicos específicos.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -5,
          message: 'El sustituto rindió a gran nivel durante tu ausencia.'
        }
      }
    ]
  },
  {
    id: 'fitness_bootcamp_break',
    title: 'Entrenamiento Intensivo en el Parón de Selecciones',
    description: 'No fuiste convocado por tu selección y el preparador te propone un trabajo intensivo de potencia.',
    icon: '',
    choices: [
      {
        text: 'Trabajar dobles sesiones de fuerza y velocidad',
        riskPercent: 70,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 10,
          message: 'Pico de forma óptimo para afrontar la segunda mitad de la temporada.'
        },
        failureOutcome: {
          ovrDelta: -1,
          marketValueDeltaPercent: -10,
          missedGamesPercent: 15,
          message: 'Sobrecarga muscular severa en isquiotibiales.'
        }
      },
      {
        text: 'Descansar y mantener una carga ligera de trabajo',
        riskPercent: 90,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 0,
          message: 'Mente y cuerpo despejados para la alta competición.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -5,
          message: 'Perdiste ritmo competitivo respecto a tus compañeros.'
        }
      }
    ]
  },
  {
    id: 'position_change_experiment',
    title: 'Propuesta de Cambio de Posición',
    description: 'El entrenador quiere probarte en una posición diferente para cubrir una baja importante en la plantilla.',
    icon: '',
    choices: [
      {
        text: 'Aceptar el reto y adaptarte a la nueva demarcación',
        riskPercent: 65,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 20,
          message: 'Polivalencia estelar. Destacaste en la nueva posición acumulando recursos.'
        },
        failureOutcome: {
          ovrDelta: -2,
          marketValueDeltaPercent: -10,
          message: 'Desorientación en el campo y errores de posicionamiento.'
        }
      },
      {
        text: 'Pedir jugar exclusivamente en tu posición habitual',
        riskPercent: 85,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 5,
          message: 'Rendimiento solvente en tu zona natural de confort.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -5,
          message: 'El técnico contó con alternativas más versátiles.'
        }
      }
    ]
  },
  {
    id: 'social_media_challenge',
    title: 'Polémica en Redes Sociales',
    description: 'Un comentario antiguo en redes sociales sobre el club rival se hace viral generando controversia.',
    icon: '',
    choices: [
      {
        text: 'Emitir un comunicado oficial de disculpas',
        riskPercent: 85,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 0,
          message: 'Disculpas aceptadas y tensión rebajada con la afición.'
        },
        failureOutcome: {
          ovrDelta: -1,
          marketValueDeltaPercent: -10,
          message: 'Reacción fría de los aficionados rivales en cada salida.'
        }
      },
      {
        text: 'Mantener silencio y dejar pasar la tormenta',
        riskPercent: 40,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 10,
          message: 'El tema se olvidó rápidamente sin afectar a tu rendimiento.'
        },
        failureOutcome: {
          ovrDelta: -1,
          marketValueDeltaPercent: -20,
          message: 'Pérdida de contratos publicitarios por imagen pública.'
        }
      }
    ]
  },
  {
    id: 'ballon_dor_nomination',
    title: 'Nominación al Premio Internacional del Año',
    description: 'Inclusión histórica en la lista de candidatos al galardón de mejor jugador de la temporada.',
    icon: '',
    choices: [
      {
        text: 'Atender galas y entrevistas mediáticas internacionales',
        riskPercent: 60,
        successOutcome: {
          ovrDelta: 3,
          marketValueDeltaPercent: 40,
          message: 'Proyección mundial masiva y salto a la superelite del fútbol.'
        },
        failureOutcome: {
          ovrDelta: -1,
          marketValueDeltaPercent: -10,
          message: 'Las distracciones fuera del campo bajaron tu nivel en Liga.'
        }
      },
      {
        text: 'Mantener perfil bajo y focalizarte en el entrenamiento',
        riskPercent: 85,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 20,
          message: 'Concentración total reflejada en goles y partidos memorables.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -5,
          message: 'Menor visibilidad en las votaciones finales del premio.'
        }
      }
    ]
  },
  {
    id: 'academy_prodigy_competition',
    title: 'La Emergencia de una Joven Perla de la Cantera',
    description: 'Un joven de 17 años deslumbra en los entrenamientos y pide paso en tu misma posición.',
    icon: '',
    choices: [
      {
        text: 'Apoyar su progresión y aconsejarle como referente',
        riskPercent: 85,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 10,
          message: 'Liderazgo positivo alabado por la directiva y el cuerpo técnico.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -5,
          message: 'El joven te arrebató la titularidad en varios encuentros.'
        }
      },
      {
        text: 'Apretar al máximo en cada entrenamiento para marcar territorio',
        riskPercent: 55,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 20,
          message: 'Demostración incontestable de jerarquía y superioridad técnica.'
        },
        failureOutcome: {
          ovrDelta: -1,
          marketValueDeltaPercent: -10,
          message: 'Exceso de tensión en las sesiones de entrenamiento.'
        }
      }
    ]
  },
  {
    id: 'final_minutes_injury_risk',
    title: 'Sobrecarga en los Minutos Finales de la Prórroga',
    description: 'Empate en el minuto 115 de la prórroga de la final. Sientes un fuerte tirón en el gemelo.',
    icon: '',
    choices: [
      {
        text: 'Pedir el cambio inmediatamente por precaución',
        riskPercent: 90,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 5,
          message: 'Evitaste una rotura grave y pudiste levantar el título.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -10,
          message: 'El rival anotó el gol de la victoria aprovechando la sustitución.'
        }
      },
      {
        text: 'Aguantar cojeando en el campo hasta el pitido final',
        riskPercent: 35,
        successOutcome: {
          ovrDelta: 3,
          marketValueDeltaPercent: 30,
          message: 'Épica histórica: anotaste el gol del triunfo mermado físicamente.'
        },
        failureOutcome: {
          ovrDelta: -3,
          marketValueDeltaPercent: -35,
          missedGamesPercent: 50,
          message: 'Rotura fibrilar severa que te apartó 5 meses de las canchas.'
        }
      }
    ]
  },
  {
    id: 'club_financial_crisis',
    title: 'Crisis Financiera e Impagos Institucionales',
    description: 'El club atraviesa dificultades económicas y solicita a la plantilla aplazar parte de los salarios.',
    icon: '',
    choices: [
      {
        text: 'Aceptar el aplazamiento salarial para apoyar al club',
        riskPercent: 80,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 5,
          message: 'Gesto de lealtad absoluta considerado heroico por la hinchada.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -10,
          message: 'Incertidumbre institucional que afectó a la moral del vestuario.'
        }
      },
      {
        text: 'Exigir el cobro íntegro mediante tu representante',
        riskPercent: 45,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 25,
          message: 'Conseguiste la totalidad del salario o forzaste un traspaso ventajoso.'
        },
        failureOutcome: {
          ovrDelta: -2,
          marketValueDeltaPercent: -20,
          message: 'Relación fracturada con la directiva y ambiente tenso.'
        }
      }
    ]
  },
  {
    id: 'derby_hero_opportunity',
    title: 'El Gran Clásico de Máxima Rivalidad',
    description: 'Ambiente volcánico ante el eterno rival. El cuerpo técnico busca líderes para asumir la responsabilidad.',
    icon: '',
    choices: [
      {
        text: 'Pedir la responsabilidad del juego y liderar los ataques',
        riskPercent: 60,
        successOutcome: {
          ovrDelta: 3,
          marketValueDeltaPercent: 35,
          message: 'Actuación memorable con gol o asistencia decisiva para ganar el derbi.'
        },
        failureOutcome: {
          ovrDelta: -2,
          marketValueDeltaPercent: -15,
          message: 'La presión del rival cortó tus líneas de pase y caísteis derrotados.'
        }
      },
      {
        text: 'Jugar con máxima cautela táctica y asegurar el bloque',
        riskPercent: 85,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 10,
          message: 'Partido serio y solvente cumpliendo las órdenes del cuerpo técnico.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -5,
          message: 'Falta de ambición en los metros finales señalada por la prensa.'
        }
      }
    ]
  },
  {
    id: 'champions_night_penalty',
    title: 'Penalti en el Minuto 90 de Torneo Continental',
    description: 'Pena máxima decisiva para clasificar a tu club en el último minuto de la eliminatoria.',
    icon: '',
    choices: [
      {
        text: 'Asumir el penalti y tirar a romper a la escuadra',
        riskPercent: 50,
        successOutcome: {
          ovrDelta: 3,
          marketValueDeltaPercent: 40,
          message: 'Gol memorable que desató la locura en el estadio y la prensa mundial.'
        },
        failureOutcome: {
          ovrDelta: -2,
          marketValueDeltaPercent: -20,
          message: 'El balón se estrelló en el larguero y quedasteis eliminados.'
        }
      },
      {
        text: 'Ceder el lanzamiento al especialista habitual de la plantilla',
        riskPercent: 80,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 5,
          message: 'Tu compañero anotó y la plantilla celebró la clasificación unida.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -10,
          message: 'Críticas de los analistas por no asumir los galones en el momento clave.'
        }
      }
    ]
  },
  {
    id: 'fitness_trainer_program',
    title: 'Plan de Rendimiento de Alta Tecnología',
    description: 'Un famoso preparador físico de deportistas de élite te ofrece un plan privado de nutrición y biometría.',
    icon: '',
    choices: [
      {
        text: 'Invertir en el plan intensivo de biomecánica y fuerza',
        riskPercent: 75,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 25,
          message: 'Salto físico espectacular: mayor resistencia, velocidad y potencia.'
        },
        failureOutcome: {
          ovrDelta: -1,
          marketValueDeltaPercent: -10,
          message: 'Sobrecarga muscular por exceso de carga de trabajo privada.'
        }
      },
      {
        text: 'Continuar exclusivamente con el plan del club',
        riskPercent: 90,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 5,
          message: 'Rendimiento estable y sincronizado con el resto del grupo.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: 0,
          message: 'Sin mejoras físicas significativas respecto a la temporada anterior.'
        }
      }
    ]
  },
  {
    id: 'super_agent_offer',
    title: 'Propuesta de Representante de Superestrellas',
    description: 'Un agente internacional de primer nivel te ofrece unirte a su firma asegurándote patrocinios y traspasos top.',
    icon: '',
    choices: [
      {
        text: 'Firmar con el nuevo súper agente internacional',
        riskPercent: 65,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 30,
          message: 'Nuevos contratos comerciales e interés inmediato de clubes grandes.'
        },
        failureOutcome: {
          ovrDelta: -1,
          marketValueDeltaPercent: -15,
          message: 'Ruptura ruidosa con tu antiguo agente que derivó en litigio legal.'
        }
      },
      {
        text: 'Mantenerte fiel a tu agente de toda la vida',
        riskPercent: 85,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 10,
          message: 'Relación de confianza sólida y tranquilidad absoluta fuera del campo.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -5,
          message: 'Menor presencia en las reuniones de los grandes directores deportivos.'
        }
      }
    ]
  },
  {
    id: 'tactical_masterclass',
    title: 'Sesiones Tácticas Individuales con el Entrenador',
    description: 'El cuerpo técnico propone analizar horas de vídeo para afinar tu posicionamiento y lectura de juego.',
    icon: '',
    choices: [
      {
        text: 'Realizar las sesiones extra de vídeo semanalmente',
        riskPercent: 80,
        successOutcome: {
          ovrDelta: 2,
          marketValueDeltaPercent: 15,
          message: 'Inteligencia táctica sobresaliente y optimización de tus desmarques.'
        },
        failureOutcome: {
          ovrDelta: 0,
          marketValueDeltaPercent: -5,
          message: 'Fatiga mental por acumulación de conceptos teóricos.'
        }
      },
      {
        text: 'Focalizar el tiempo en descanso y recuperación física',
        riskPercent: 85,
        successOutcome: {
          ovrDelta: 1,
          marketValueDeltaPercent: 5,
          message: 'Excelente tono físico y frescura para los tramos finales de partido.'
        },
        failureOutcome: {
          ovrDelta: -1,
          marketValueDeltaPercent: -5,
          message: 'Faltó ajustar detalles tácticos en partidos de máxima exigencia.'
        }
      }
    ]
  }
];


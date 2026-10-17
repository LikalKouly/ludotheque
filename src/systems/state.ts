// État de la partie et sauvegarde (localStorage).

export type ChaseOutcome = 'rattrape' | 'presque' | 'plonge' | 'perdu' | 'raccourci' | 'aide';
export type Sabotage = 'leger' | 'normal' | 'fort' | 'piege';
export type BarrelsOutcome =
  | 'nette'
  | 'autrement'
  | 'partielle'
  | 'defaite'
  | 'fuite'
  | 'abandon';

export interface GameState {
  version: number;
  introDone: boolean;
  chaseOutcome: ChaseOutcome | null;
  knowsBox: boolean;
  sabotage: Sabotage;
  allies: string[];
  grignoteAngry: boolean;
  pages: number[];
  barrels: {
    plays: number;
    outcome: BarrelsOutcome | null;
    fading: number;
    magicianGone: boolean;
    gorilla: 'captif' | 'libre' | 'battu';
    secret: boolean;
  };
  ejected: boolean;
  prototypeEndSeen: boolean;
}

const KEY = 'ludotheque.save.v1';
const VERSION = 1;

export function newState(): GameState {
  return {
    version: VERSION,
    introDone: false,
    chaseOutcome: null,
    knowsBox: false,
    sabotage: 'normal',
    allies: [],
    grignoteAngry: false,
    pages: [],
    barrels: { plays: 0, outcome: null, fading: 0, magicianGone: false, gorilla: 'captif', secret: false },
    ejected: false,
    prototypeEndSeen: false,
  };
}

let current: GameState = newState();

export function state(): GameState {
  return current;
}

export function resetState(): void {
  current = newState();
  save();
}

export function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    // Pas de stockage disponible (navigation privée…) : la partie continue sans sauvegarde.
  }
}

export function hasSave(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    return (JSON.parse(raw) as GameState).version === VERSION;
  } catch {
    return false;
  }
}

export function load(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.version !== VERSION) return false;
    current = { ...newState(), ...parsed, barrels: { ...newState().barrels, ...parsed.barrels } };
    return true;
  } catch {
    return false;
  }
}

export function addPage(id: number): boolean {
  if (current.pages.includes(id)) return false;
  current.pages.push(id);
  current.pages.sort((a, b) => a - b);
  return true;
}

export function addAlly(name: string): void {
  if (!current.allies.includes(name)) current.allies.push(name);
}

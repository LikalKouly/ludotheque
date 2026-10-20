// Textes de l'histoire. Les noms restent provisoires.
// Nella ne sait pas encore qu'elle est le bug ; le codeur, Il Mago, ne se montre jamais.

import type { BarrelsOutcome, ChaseOutcome } from './state';

export const HERO = 'Nella';
export const CODER = 'Il Mago';
export const OWL = 'Madame Hulotte';
export const RAT = 'Grignote';

// Personnage qui parle → image affichée à côté de ses répliques.
export const PORTRAITS: Record<string, string> = {
  [HERO]: 'portrait-nella',
  [OWL]: 'owl',
  [RAT]: 'rat',
  'Le gorille': 'gorilla-free',
};

export const PAGES: Record<number, { title: string; text: string }> = {
  1: {
    title: 'Page 1',
    text:
      "…je rangeais les Réserves, tard. Tout au fond, une boîte sans nom. " +
      "Quand je l'ai touchée, son étiquette s'est mise à grésiller, comme un vieil écran…",
  },
  2: {
    title: 'Page 2',
    text:
      "…tout le monde dit que les gardiens chassent les nuisibles de la Ludoteca. " +
      'Alors pourquoi leur lumière me fait-elle si peur ?',
  },
  3: {
    title: 'Page 3 (secrète)',
    text:
      "…une note, d'une écriture qui n'est pas d'ici : « Erreur n° 0, trouvée dans la Ludoteca. " +
      'Nom de code : Coccinella. »',
  },
};

export const CHASE_SUMMARY: Record<ChaseOutcome, string> = {
  rattrape: 'Tu as rattrapé une page au vol. Les autres ont filé.',
  presque: "Une page t'a échappé de justesse, mais une fiche d'emprunt est tombée avec.",
  plonge: 'Tes pages se sont engouffrées dans « Barils en Folie », sous tes yeux.',
  perdu: 'Tes pages ont disparu. Il faudra enquêter pour savoir où elles sont allées.',
  raccourci: 'Par le raccourci, tu es arrivée dans « Barils en Folie » avant tes pages.',
  aide: 'Tu as sauvé Grignote. Pendant ce temps, tes pages ont disparu.',
};

export const BARRELS_SUMMARY: Record<BarrelsOutcome, string> = {
  nette: 'Victoire nette : tu as décroché ta page tout en haut.',
  autrement: 'Victoire « autrement » : tu as décousu la pièce du gorille au lieu de le combattre. Il devient ton allié.',
  partielle: 'Victoire partielle : tu es arrivée en haut, mais ta page avait déjà été recousue.',
  defaite: 'Défaite : ta page reste là-haut, et la boîte commence à s’effacer…',
  fuite: 'Défaite avec fuite : tu es tombée… dans une autre boîte !',
  abandon: 'Tu es sortie de la boîte. Le jeu reste tel quel.',
};

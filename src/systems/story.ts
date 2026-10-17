// Textes de l'histoire : noms provisoires, pages du livre, résumés des issues.

import type { BarrelsOutcome, ChaseOutcome } from './state';

export const HERO = 'Pico';
export const MAGICIAN = 'Maître Bidouille';
export const OWL = 'Madame Hulotte';
export const RAT = 'Grignote';
export const FIANCEE = 'Lila';

export const PAGES: Record<number, { title: string; text: string }> = {
  1: {
    title: 'Page 1',
    text:
      "…je rangeais les Réserves, tard. Tout au fond, une boîte sans nom. " +
      "Elle chuchotait. Elle chuchotait MON nom. J'ai tendu la main…",
  },
  2: {
    title: 'Page 2',
    text:
      "…Maître Bidouille m'a pris par l'épaule. Il avait les yeux mouillés. " +
      "« Pardonne-moi, petit. C'est pour toi que je fais ça. »",
  },
  3: {
    title: 'Page 3 (secrète)',
    text:
      "…sur la boîte sans nom, il y avait une étiquette à moitié effacée. " +
      "Je connais cette écriture. C'est la mienne.",
  },
};

export const CHASE_SUMMARY: Record<ChaseOutcome, string> = {
  rattrape: 'Tu as rattrapé le magicien : il a lâché une page, mais il est furieux.',
  presque: "Tu l'as presque eu : il a fait tomber une fiche d'emprunt.",
  plonge: "Il a plongé dans la boîte « Barils en Folie » sous tes yeux.",
  perdu: "Tu l'as perdu de vue. Il faudra enquêter pour savoir où il se cache.",
  raccourci: 'Ton raccourci a payé : tu es arrivé avant lui et tu lui as tendu un piège.',
  aide: 'Tu as sauvé Grignote. Le magicien en a profité pour disparaître.',
};

export const BARRELS_SUMMARY: Record<BarrelsOutcome, string> = {
  nette: 'Victoire nette : Lila est libre et tu as récupéré ta page.',
  autrement: "Victoire « autrement » : tu as libéré le gorille au lieu de le combattre. Il devient ton allié.",
  partielle: 'Victoire partielle : Lila est libre, mais le magicien a filé avec la page.',
  defaite: 'Défaite : le magicien garde la page, et la boîte commence à s’effacer…',
  fuite: 'Défaite avec fuite : tu es tombé… dans une autre boîte !',
  abandon: 'Tu es sorti de la boîte. Le jeu reste saboté.',
};

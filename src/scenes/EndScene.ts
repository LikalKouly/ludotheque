// Bilan de fin du prototype : le parcours du joueur, issue par issue.

import Phaser from 'phaser';
import { COLORS } from '../systems/art';
import { resetState, state } from '../systems/state';
import { BARRELS_SUMMARY, CHASE_SUMMARY } from '../systems/story';
import { W, button, goTo, textStyle } from '../systems/ui';

export class EndScene extends Phaser.Scene {
  constructor() {
    super('end');
  }

  create(): void {
    const s = state();
    this.cameras.main.fadeIn(500);
    this.add.rectangle(0, 0, W, 720, COLORS.night).setOrigin(0);
    this.add.text(W / 2, 70, 'Fin du prototype', textStyle(64, '#f6c945')).setOrigin(0.5);
    this.add.text(W / 2, 130, 'Voici ton parcours. Rejoue pour découvrir les autres issues !', textStyle(24)).setOrigin(0.5);

    const lines = [
      `Poursuite : ${s.chaseOutcome ? CHASE_SUMMARY[s.chaseOutcome] : '—'}`,
      `Barils en Folie : ${s.barrels.outcome ? BARRELS_SUMMARY[s.barrels.outcome] : '—'}`,
      `Alliés : ${[...s.allies, ...(s.barrels.gorilla === 'libre' ? ['le gorille'] : [])].join(', ') || 'aucun'}`,
      `Pages retrouvées : ${s.pages.length} / 3${s.barrels.secret ? ' (dont la page secrète)' : ''}`,
    ];
    if (s.grignoteAngry) lines.push('Grignote t’en veut de l’avoir abandonné.');
    this.add.text(110, 190, lines.join('\n\n'), { ...textStyle(24), wordWrap: { width: W - 220 }, lineSpacing: 4 });

    button(this, W / 2 - 220, 640, 'Continuer à explorer', () => goTo(this, 'hub'), 380);
    button(this, W / 2 + 220, 640, 'Nouvelle partie', () => {
      resetState();
      goTo(this, 'hub');
    }, 380);
  }
}

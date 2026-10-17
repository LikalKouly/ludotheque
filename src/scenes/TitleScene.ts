import Phaser from 'phaser';
import { COLORS, makeArt } from '../systems/art';
import { hasSave, load, resetState } from '../systems/state';
import { H, W, button, goTo, textStyle } from '../systems/ui';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create(): void {
    makeArt(this);
    this.cameras.main.fadeIn(400);
    this.add.rectangle(0, 0, W, H, COLORS.night).setOrigin(0);

    // Étagères en perspective, façon dessin animé.
    const g = this.add.graphics();
    for (let i = 0; i < 9; i++) {
      const x = i * 150 - 20;
      g.fillStyle(i % 2 ? COLORS.wallDark : COLORS.wall);
      g.fillPoints([
        new Phaser.Geom.Point(x, 0),
        new Phaser.Geom.Point(x + 150, 0),
        new Phaser.Geom.Point(x + 130 + (i - 4) * 6, H),
        new Phaser.Geom.Point(x + 10 + (i - 4) * 6, H),
      ]);
    }
    for (let i = 0; i < 40; i++) {
      const b = this.add.image(Phaser.Math.Between(40, W - 40), Phaser.Math.Between(40, H - 40), 'box-barrels');
      b.setScale(0.25).setAlpha(0.15).setAngle(Phaser.Math.Between(-20, 20));
      b.setTexture(['box-barrels', 'box-maze', 'box-worm'][i % 3]);
    }

    const title = this.add.text(W / 2, 170, 'La Ludothèque', textStyle(96, '#f6c945')).setOrigin(0.5);
    this.tweens.add({ targets: title, angle: { from: -2, to: 2 }, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.add.text(W / 2, 255, 'prototype jouable', textStyle(28)).setOrigin(0.5);

    const hero = this.add.image(W / 2 - 160, 400, 'hero').setScale(2);
    const mage = this.add.image(W / 2 + 170, 380, 'magician').setScale(1.6).setFlipX(true);
    this.tweens.add({ targets: hero, y: 390, duration: 400, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: mage, y: 370, duration: 700, yoyo: true, repeat: -1 });

    let y = 540;
    if (hasSave()) {
      button(this, W / 2, y, 'Continuer', () => {
        load();
        goTo(this, 'hub');
      });
      y += 70;
    }
    button(this, W / 2, y, 'Nouvelle partie', () => {
      resetState();
      goTo(this, 'hub');
    });

    this.add
      .text(W / 2, H - 24, 'Graphismes provisoires : ils seront remplacés par les vrais dessins.', textStyle(18, '#b9a9d9'))
      .setOrigin(0.5);
  }
}

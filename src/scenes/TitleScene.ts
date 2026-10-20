import Phaser from 'phaser';
import { BOX_COLORS, COLORS, makeArt, motes, preloadArt, stopMotion } from '../systems/art';
import { hasSave, load, resetState } from '../systems/state';
import { H, W, button, goTo, textStyle } from '../systems/ui';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  preload(): void {
    preloadArt(this);
  }

  create(): void {
    makeArt(this);
    this.cameras.main.fadeIn(600);
    const g = this.add.graphics();
    g.fillStyle(COLORS.night);
    g.fillRect(0, 0, W, H);

    // Lune et grande arche du fond.
    this.add.image(980, 150, 'glow').setScale(3).setTint(0xbfd4ff).setAlpha(0.35);
    g.fillStyle(COLORS.moon);
    g.fillCircle(980, 150, 48);
    g.fillStyle(0xc9d2de, 0.6);
    g.fillCircle(965, 140, 9);
    g.fillCircle(995, 165, 6);

    // Piles de boîtes de jeux, en silhouettes de plus en plus sombres.
    const rnd = new Phaser.Math.RandomDataGenerator(['titre']);
    for (let layer = 0; layer < 2; layer++) {
      for (let s = 0; s < 7; s++) {
        let y = H;
        const x = s * 190 + rnd.between(-20, 20) + layer * 90;
        const n = rnd.between(4, 9);
        for (let i = 0; i < n; i++) {
          const w = rnd.between(120, 170);
          const h = rnd.between(28, 44);
          y -= h;
          g.fillStyle(BOX_COLORS[rnd.between(0, BOX_COLORS.length - 1)], layer === 0 ? 0.55 : 1);
          g.fillRect(x + rnd.between(-8, 8), y, w, h - 2);
          if (layer === 1) {
            g.lineStyle(1.5, COLORS.gold, 0.6);
            g.strokeRect(x + 6, y + 5, w - 12, h - 12);
          }
        }
      }
    }
    g.fillStyle(0x000000, 0.45);
    g.fillRect(0, 0, W, H);

    motes(this, 26, 3);
    this.add.image(0, 0, 'vignette').setOrigin(0).setDepth(4);

    const title = this.add.text(W / 2, 150, 'La Ludothèque', { ...textStyle(96, '#f2b25c'), fontStyle: 'italic' }).setOrigin(0.5).setDepth(10);
    this.tweens.add({ targets: title, alpha: { from: 0.85, to: 1 }, duration: 1800, yoyo: true, repeat: -1 });
    this.add.text(W / 2, 232, 'prototype jouable', textStyle(26, '#d9b98a')).setOrigin(0.5).setDepth(10);

    const hero = this.add.image(330, 600, 'hero').setOrigin(0.5, 1).setScale(2.6).setDepth(10);
    stopMotion(this, hero, 1.5);

    // Des pages qui s'envolent… et, à peine visible, la main de celui qui écrit le monde.
    for (let i = 0; i < 6; i++) {
      const p = this.add.image(420 + i * 60, 420 - i * 30, 'page').setDepth(9).setAngle(i * 25);
      this.tweens.add({ targets: p, y: p.y - 20, angle: p.angle + 30, duration: 1400 + i * 200, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    }
    const mano = this.add.image(1080, 330, 'mano').setAlpha(0).setDepth(8).setAngle(-30);
    this.tweens.add({ targets: mano, alpha: 0.18, duration: 2200, yoyo: true, repeat: -1, repeatDelay: 2500, ease: 'Sine.InOut' });

    let y = 470;
    if (hasSave()) {
      button(this, W / 2 + 160, y, 'Continuer', () => {
        load();
        goTo(this, 'hub');
      }).setDepth(20);
      y += 70;
    }
    button(this, W / 2 + 160, y, 'Nouvelle partie', () => {
      resetState();
      goTo(this, 'hub');
    }).setDepth(20);

    this.add
      .text(W / 2, H - 24, 'Graphismes provisoires : ils seront remplacés par les vrais dessins.', textStyle(18, '#b39a78'))
      .setOrigin(0.5)
      .setDepth(20);
  }
}

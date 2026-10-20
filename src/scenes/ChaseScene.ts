// La poursuite des pages envolées entre les étagères. Plusieurs issues possibles.

import Phaser from 'phaser';
import { BOX_COLORS, COLORS, motes } from '../systems/art';
import { Controls } from '../systems/controls';
import { addAlly, addPage, save, state, type ChaseOutcome, type Sabotage } from '../systems/state';
import { HERO, RAT } from '../systems/story';
import { H, W, banner, choose, goTo, say, textStyle } from '../systems/ui';

const GROUND = 600;
const HERO_X = 260;
const GRAVITY = 2400;
const JUMP_V = -900;
const DURATION = 42;
const EVENT_RAT = 13;
const EVENT_FORK = 25;

interface Obstacle {
  img: Phaser.GameObjects.Image;
  speed: number;
  hit: boolean;
  passed: boolean;
}

const SABOTAGE: Record<ChaseOutcome, Sabotage> = {
  rattrape: 'fort',
  presque: 'normal',
  plonge: 'leger',
  perdu: 'fort',
  raccourci: 'piege',
  aide: 'fort',
};

export class ChaseScene extends Phaser.Scene {
  private controls!: Controls;
  private bg!: Phaser.GameObjects.TileSprite;
  private hero!: Phaser.GameObjects.Image;
  // L'essaim de pages qui s'enfuit ; le codeur reste invisible.
  private mage!: Phaser.GameObjects.Container;
  private gapBar!: Phaser.GameObjects.Graphics;
  private lostText!: Phaser.GameObjects.Text;
  private obstacles: Obstacle[] = [];
  private vy = 0;
  private heroY = GROUND;
  private gap = 380;
  private elapsed = 0;
  private nextSpawn = 2;
  private paused = false;
  private finished = false;
  private invulnerable = 0;
  private ratDone = false;
  private forkDone = false;
  private shortcut: 'none' | 'running' | 'ok' | 'failed' = 'none';
  private shortcutLeft = 0;
  private tapJump = false;
  private touchSprint = false;

  constructor() {
    super('chase');
  }

  create(): void {
    this.obstacles = [];
    this.vy = 0;
    this.heroY = GROUND;
    this.gap = 380;
    this.elapsed = 0;
    this.nextSpawn = 2;
    this.paused = false;
    this.finished = false;
    this.invulnerable = 0;
    this.ratDone = false;
    this.forkDone = false;
    this.shortcut = 'none';
    this.shortcutLeft = 0;

    this.cameras.main.fadeIn(400);
    this.controls = new Controls(this, false);
    this.makeBackground();
    this.bg = this.add.tileSprite(0, 0, W, GROUND + 30, 'chase-bg').setOrigin(0);
    const g = this.add.graphics();
    // Parquet sombre et long tapis rouge.
    g.fillStyle(0x24140c);
    g.fillRect(0, GROUND, W, H - GROUND);
    g.fillStyle(COLORS.carpet);
    g.fillRect(0, GROUND + 14, W, 70);
    g.lineStyle(4, COLORS.cream, 0.5);
    g.lineBetween(0, GROUND + 20, W, GROUND + 20);
    g.lineBetween(0, GROUND + 78, W, GROUND + 78);
    this.add.image(0, 0, 'vignette').setOrigin(0).setDepth(40);
    motes(this, 14, 41);

    this.hero = this.add.image(HERO_X, GROUND, 'hero').setOrigin(0.5, 1).setScale(0.95).setDepth(10);
    this.mage = this.add.container(HERO_X + this.gap, GROUND - 90).setDepth(9);
    const glow = this.add.image(0, 0, 'glow').setScale(1.6).setTint(0xbfe9ff).setAlpha(0.35).setBlendMode(Phaser.BlendModes.ADD);
    this.mage.add(glow);
    for (let i = 0; i < 6; i++) {
      const p = this.add.image(Phaser.Math.Between(-40, 40), Phaser.Math.Between(-40, 40), 'page').setScale(0.8);
      this.tweens.add({ targets: p, angle: { from: -40, to: 40 }, y: p.y - 14, duration: 300 + i * 70, yoyo: true, repeat: -1 });
      this.mage.add(p);
    }

    this.gapBar = this.add.graphics().setDepth(50);
    this.add.text(24, 16, 'Distance à tes pages', textStyle(22)).setDepth(50);
    this.lostText = this.add
      .text(W - 30, GROUND - 200, 'Elles s’éloignent !', textStyle(26, '#ff8a6a'))
      .setOrigin(1, 0.5)
      .setDepth(50)
      .setVisible(false);

    // Sur tablette : maintenir à gauche pour sprinter, toucher à droite pour sauter.
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.x < W / 2) this.touchSprint = true;
      else this.tapJump = true;
    });
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      if (p.x < W / 2) this.touchSprint = false;
    });

    this.paused = true;
    say(
      this,
      [
        { who: HERO, text: 'Mes pages ! Revenez !' },
        { text: 'Saute avec ESPACE (ou touche la droite de l’écran). Sprinte avec la flèche → (ou maintiens la gauche de l’écran) : tu les rattrapes plus vite, mais les obstacles arrivent plus vite aussi.' },
      ],
      () => (this.paused = false),
    );
  }

  private makeBackground(): void {
    if (this.textures.exists('chase-bg')) return;
    const rnd = new Phaser.Math.RandomDataGenerator(['poursuite']);
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(COLORS.night);
    g.fillRect(0, 0, W, GROUND + 30);
    // Une travée sur deux : bibliothèque de livres, puis pile de boîtes de jeux sous une applique.
    for (let s = 0; s < 6; s++) {
      const x = s * 214;
      if (s % 2 === 0) {
        g.fillStyle(COLORS.woodDark);
        g.fillRect(x + 8, 30, 196, GROUND - 30);
        for (let row = 0; row < 5; row++) {
          const y = 50 + row * 104;
          let bx = x + 16;
          while (bx < x + 190) {
            const bw = rnd.between(10, 20);
            const bh = rnd.between(50, 86);
            g.fillStyle(rnd.pick([0x7e2a20, 0x22284a, 0x3f6b4a, 0x6b4a1f, 0x3a2457, 0x8c5532]));
            g.fillRect(bx, y + 92 - bh, bw, bh);
            g.fillStyle(COLORS.gold, 0.45);
            g.fillRect(bx + 2, y + 92 - bh + 6, bw - 4, 2);
            bx += bw + 2;
          }
          g.fillStyle(COLORS.wood);
          g.fillRect(x + 8, y + 92, 196, 10);
        }
      } else {
        // Applique et halo chaud.
        for (let r = 90; r > 0; r -= 6) {
          g.fillStyle(COLORS.amber, 0.018);
          g.fillCircle(x + 107, 150, r);
        }
        g.fillStyle(COLORS.lamp);
        g.fillEllipse(x + 107, 150, 16, 20);
        g.fillStyle(COLORS.gold);
        g.fillRect(x + 104, 160, 6, 18);
        let y = GROUND + 10;
        for (let i = 0; i < 8; i++) {
          const w = rnd.between(130, 180);
          const h = rnd.between(34, 46);
          y -= h;
          const bx = x + 107 - w / 2 + rnd.between(-6, 6);
          g.fillStyle(BOX_COLORS[rnd.between(0, BOX_COLORS.length - 1)]);
          g.fillRect(bx, y, w, h - 3);
          g.lineStyle(1.5, COLORS.gold, 0.7);
          g.strokeRect(bx + 5, y + 5, w - 10, h - 13);
        }
      }
    }
    g.fillStyle(0x000000, 0.25);
    g.fillRect(0, 0, W, GROUND + 30);
    g.generateTexture('chase-bg', W + 4, GROUND + 30);
    g.destroy();
  }

  update(_t: number, deltaMs: number): void {
    const dt = Math.min(deltaMs / 1000, 0.05);
    const jump = this.controls.jumpPressed() || (this.tapJump && !this.paused);
    this.tapJump = false;
    if (this.paused || this.finished) return;

    this.elapsed += dt;
    const sprint = this.controls.pad.right || this.touchSprint;
    const pace = sprint ? 1.35 : 1;
    const speed = (this.shortcut === 'running' ? 560 : 430) * pace;
    this.bg.tilePositionX += speed * dt * 0.6;

    // Saut du héros.
    if (jump && this.heroY >= GROUND) this.vy = JUMP_V;
    this.vy += GRAVITY * dt;
    this.heroY = Math.min(GROUND, this.heroY + this.vy * dt);
    if (this.heroY >= GROUND) this.vy = 0;
    this.hero.y = this.heroY;
    this.hero.setAngle(this.heroY < GROUND ? -10 : Math.sin(this.elapsed * 22) * 4);
    // Course image par image, comme une poupée animée en stop-motion.
    this.hero.setTexture(this.heroY < GROUND || Math.floor(this.elapsed * 8) % 2 ? 'hero' : 'hero-walk');

    // Obstacles.
    this.nextSpawn -= dt;
    if (this.nextSpawn <= 0 && this.elapsed < DURATION - 2) this.spawn();
    this.invulnerable -= dt;
    for (const o of this.obstacles) {
      o.img.x -= o.speed * pace * dt;
      const dx = Math.abs(o.img.x - HERO_X);
      const top = GROUND - o.img.displayHeight + 10;
      if (!o.hit && dx < o.img.displayWidth / 2 && this.heroY > top && this.invulnerable <= 0) {
        o.hit = true;
        this.onHit();
      }
      if (!o.passed && o.img.x < HERO_X - 40) {
        o.passed = true;
        if (!o.hit) this.gap -= 12;
        if (this.shortcut === 'running') this.shortcutStep(o.hit);
      }
    }
    this.obstacles = this.obstacles.filter((o) => {
      if (o.img.x < -120) {
        o.img.destroy();
        return false;
      }
      return true;
    });

    // Les pages prennent de l'avance, sauf si on sprinte. Avant le carrefour, elles restent juste hors de portée.
    this.gap += (sprint ? -24 : 8) * dt;
    this.gap = Phaser.Math.Clamp(this.gap, this.forkDone ? 0 : 110, 1100);
    this.hero.setScale(1.4 * (sprint ? 1.05 : 1), 1.4);
    this.mage.x = Math.min(HERO_X + this.gap, W + 120);
    this.mage.y = GROUND - 90 + Math.sin(this.elapsed * 4) * 18;
    this.lostText.setVisible(this.gap > 760);
    this.drawGap();

    if (!this.ratDone && this.elapsed > EVENT_RAT) this.ratEvent();
    else if (!this.forkDone && this.elapsed > EVENT_FORK) this.forkEvent();
    else if (this.gap <= 60) this.finish('rattrape');
    else if (this.elapsed >= DURATION) this.finish(this.outcomeFromGap());
  }

  private spawn(): void {
    const cart = this.shortcut !== 'running' && Math.random() < 0.35;
    const img = this.add
      .image(W + 80, GROUND, cart ? 'cart' : 'pile')
      .setOrigin(0.5, 1)
      .setDepth(8)
      .setScale(cart ? 0.9 : 1);
    const base = this.shortcut === 'running' ? 560 : 430;
    this.obstacles.push({ img, speed: cart ? base + 140 : base, hit: false, passed: false });
    this.nextSpawn = this.shortcut === 'running' ? 0.85 : Phaser.Math.FloatBetween(1.0, 1.6);
  }

  private onHit(): void {
    this.gap += 90;
    this.invulnerable = 0.8;
    this.cameras.main.shake(150, 0.008);
    this.tweens.add({ targets: this.hero, alpha: 0.3, duration: 100, yoyo: true, repeat: 3 });
  }

  private shortcutStep(hit: boolean): void {
    if (hit) {
      this.shortcut = 'failed';
      this.gap += 220;
      banner(this, 'Patatras !', '#ff8a6a');
      this.bg.clearTint();
      return;
    }
    this.shortcutLeft--;
    if (this.shortcutLeft <= 0) {
      this.shortcut = 'ok';
      banner(this, 'Raccourci réussi !');
      this.bg.clearTint();
    }
  }

  private ratEvent(): void {
    this.ratDone = true;
    this.paused = true;
    const rat = this.add.image(820, GROUND, 'rat').setOrigin(0.5, 1).setScale(1.3).setDepth(9);
    const stack = this.add.image(820, GROUND - 46, 'pile').setOrigin(0.5, 1).setScale(1.4).setDepth(9);
    this.tweens.add({ targets: stack, angle: { from: -8, to: 8 }, duration: 160, yoyo: true, repeat: -1 });
    choose(this, { who: RAT, text: `Au secours ${HERO} ! La pile de boîtes va me tomber dessus !` }, [
      {
        label: `Aider ${RAT} (tes pages vont s'échapper)`,
        onPick: () => {
          addAlly(RAT);
          this.tweens.killTweensOf(stack);
          this.tweens.add({ targets: stack, x: 1000, alpha: 0, duration: 400 });
          this.finish('aide');
        },
      },
      {
        label: 'Continuer la poursuite',
        onPick: () => {
          state().grignoteAngry = true;
          this.tweens.killTweensOf(stack);
          this.tweens.add({ targets: stack, y: GROUND, angle: 80, duration: 300 });
          this.tweens.add({ targets: [rat, stack], x: '-=1400', duration: 3200 });
          say(this, [{ who: RAT, text: 'AÏE ! Tu me le paieras, Nella !' }], () => (this.paused = false));
        },
      },
    ]);
  }

  private forkEvent(): void {
    this.forkDone = true;
    this.paused = true;
    choose(this, { who: HERO, text: "Elles tournent au coin du rayon ! Je pourrais couper par le haut des étagères…" }, [
      {
        label: 'Prendre le raccourci par le haut (risqué)',
        onPick: () => {
          this.shortcut = 'running';
          this.shortcutLeft = 4;
          this.obstacles.forEach((o) => o.img.destroy());
          this.obstacles = [];
          this.nextSpawn = 0.6;
          this.bg.setTint(0x9fb8ff);
          banner(this, 'Ne tombe pas !');
          this.paused = false;
        },
      },
      { label: 'Rester en bas, plus prudent', onPick: () => (this.paused = false) },
    ]);
  }

  private outcomeFromGap(): ChaseOutcome {
    if (this.shortcut === 'ok') return 'raccourci';
    if (this.gap <= 150) return 'rattrape';
    if (this.gap <= 300) return 'presque';
    if (this.gap <= 560) return 'plonge';
    return 'perdu';
  }

  private finish(outcome: ChaseOutcome): void {
    if (this.finished) return;
    this.finished = true;
    const s = state();
    s.chaseOutcome = outcome;
    s.sabotage = SABOTAGE[outcome];
    s.knowsBox = !['perdu', 'aide'].includes(outcome);
    if (outcome === 'rattrape') addPage(1);
    save();

    const titles: Record<ChaseOutcome, string> = {
      rattrape: 'Une page attrapée !',
      presque: 'Presque !',
      plonge: 'Elles plongent dans une boîte !',
      perdu: 'Perdu de vue…',
      raccourci: 'Tu es arrivée la première !',
      aide: `${RAT} est sauvé !`,
    };
    banner(this, titles[outcome]);
    if (outcome === 'rattrape') {
      const p = this.add.image(this.mage.x, this.mage.y, 'page').setDepth(20);
      this.tweens.add({ targets: p, x: HERO_X, y: GROUND - 120, angle: 360, duration: 700 });
    }
    this.time.delayedCall(1900, () => goTo(this, 'hub', { from: 'chase' }));
  }

  private drawGap(): void {
    const g = this.gapBar;
    g.clear();
    g.fillStyle(0x140e22, 0.85);
    g.fillRoundedRect(20, 48, 360, 26, 10);
    const ratio = Phaser.Math.Clamp(1 - this.gap / 900, 0, 1);
    g.fillStyle(ratio > 0.6 ? 0x7fd6a0 : ratio > 0.3 ? 0xf2b25c : 0xc0392b);
    g.fillRoundedRect(24, 52, 352 * ratio, 18, 8);
    // Temps restant.
    const left = Math.max(0, DURATION - this.elapsed);
    g.fillStyle(0xf2b25c);
    g.fillRect(20, 80, 360 * (left / DURATION), 4);
  }
}

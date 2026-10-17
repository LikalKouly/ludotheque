// « Barils en Folie » : l'hommage à un classique de l'arcade, saboté par le magicien.

import Phaser from 'phaser';
import { COLORS, INK } from '../systems/art';
import { Controls } from '../systems/controls';
import { addPage, save, state, type BarrelsOutcome } from '../systems/state';
import { FIANCEE, HERO, MAGICIAN, RAT } from '../systems/story';
import { H, W, banner, button, goTo, say, textStyle } from '../systems/ui';

interface Girder {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dir: number; // sens dans lequel roulent les barils
  holes?: [number, number][];
}

interface Ladder {
  x: number;
  lower: number;
  upper: number;
}

interface Barrel {
  img: Phaser.GameObjects.Image;
  x: number;
  y: number;
  vy: number;
  on: number;
  dir: number;
}

const GIRDERS: Girder[] = [
  { x1: 0, y1: 680, x2: 1280, y2: 680, dir: -1, holes: [[560, 630]] },
  { x1: 120, y1: 560, x2: 1240, y2: 530, dir: -1 },
  { x1: 40, y1: 410, x2: 1160, y2: 440, dir: 1 },
  { x1: 120, y1: 320, x2: 1240, y2: 290, dir: -1 },
  { x1: 40, y1: 170, x2: 1160, y2: 200, dir: 1 },
  { x1: 480, y1: 95, x2: 760, y2: 95, dir: 1 },
];

const LADDERS: Ladder[] = [
  { x: 1000, lower: 0, upper: 1 },
  { x: 300, lower: 1, upper: 2 },
  { x: 950, lower: 2, upper: 3 },
  { x: 330, lower: 3, upper: 4 },
  { x: 720, lower: 4, upper: 5 },
];

const GRAVITY = 1500;
const JUMP_V = -520;
const WALK = 190;
const CLIMB = 130;
const TIME_LIMIT = 120;
const START = { x: 70, on: 0 };

const SETTINGS = {
  leger: { every: 3.0, speed: 190, intro: "Le magicien n'a pas eu le temps de tout saboter." },
  normal: { every: 2.2, speed: 225, intro: 'Le magicien a saboté le jeu.' },
  fort: { every: 1.5, speed: 265, intro: 'Le magicien est furieux : il a TOUT saboté !' },
  piege: { every: 3.3, speed: 175, intro: 'Tu es arrivé avant lui : il est tombé dans ton piège et il est tout étourdi !' },
};

const TAUNTS = ['Tiens, un baril de plus !', 'Code de triche : barils infinis !', 'Tu ne retrouveras jamais tes pages !', 'Ha ha ha !'];

function yAt(g: Girder, x: number): number {
  return g.y1 + ((x - g.x1) / (g.x2 - g.x1)) * (g.y2 - g.y1);
}

function supports(g: Girder, x: number): boolean {
  if (x < g.x1 || x > g.x2) return false;
  return !(g.holes ?? []).some(([a, b]) => x > a && x < b);
}

export class BarrelsScene extends Phaser.Scene {
  private controls!: Controls;
  private hero!: Phaser.GameObjects.Image;
  private hammerSprite!: Phaser.GameObjects.Image;
  private mage?: Phaser.GameObjects.Image;
  private bubble!: Phaser.GameObjects.Text;
  private gorilla?: Phaser.GameObjects.Image;
  private hud!: Phaser.GameObjects.Text;
  private items: { key: string; img: Phaser.GameObjects.Image; on: number; x: number }[] = [];
  private barrels: Barrel[] = [];
  private fadeOverlay?: Phaser.GameObjects.Rectangle;

  private px = START.x;
  private py = 0;
  private vx = 0;
  private vy = 0;
  private on = START.on;
  private climbing: Ladder | null = null;
  private facing = 1;

  private lives = 3;
  private timeLeft = TIME_LIMIT;
  private hammer = 0;
  private hasScroll = false;
  private gorillaState: 'captif' | 'libre' | 'battu' = 'captif';
  private gorillaX = 640;
  private gorillaDir = 1;
  private gorillaStun = 0;
  private gorillaHits = 0;
  private throwIn = 1.5;
  private tauntIn = 5;
  private magicianFled = false;
  private replay = false;
  private paused = true;
  private over = false;
  private invulnerable = 0;
  private settings = SETTINGS.normal;

  constructor() {
    super('barrels');
  }

  create(): void {
    const s = state();
    this.items = [];
    this.barrels = [];
    this.settings = SETTINGS[s.sabotage];
    this.replay = s.barrels.magicianGone;
    this.lives = 3 + (s.allies.includes(RAT) ? 1 : 0);
    this.timeLeft = TIME_LIMIT;
    this.hammer = 0;
    this.hasScroll = false;
    this.gorillaState = s.barrels.gorilla;
    this.gorillaHits = 0;
    this.gorillaStun = 0;
    this.throwIn = 1.5;
    this.tauntIn = 5;
    this.magicianFled = false;
    this.paused = true;
    this.over = false;
    this.invulnerable = 0;
    s.barrels.plays++;
    save();

    this.cameras.main.fadeIn(400);
    this.controls = new Controls(this);
    this.drawLevel();

    if (!this.replay) {
      this.mage = this.add.image(150, yAt(GIRDERS[4], 150), 'magician').setOrigin(0.5, 1).setScale(0.95);
      if (s.sabotage === 'piege') this.tweens.add({ targets: this.mage, angle: { from: -12, to: 12 }, duration: 500, yoyo: true, repeat: -1 });
      this.add.image(600, 95, 'lila').setOrigin(0.5, 1).setScale(1.2);
    } else {
      // Le magicien est parti, mais son chapeau enchanté continue de lancer des barils.
      this.mage = this.add.image(150, yAt(GIRDERS[4], 150), 'hat').setOrigin(0.5, 1).setScale(1.3);
    }
    this.bubble = this.add.text(150, 50, '', textStyle(20, '#f6c945')).setOrigin(0.5).setDepth(60);

    if (this.gorillaState === 'captif') {
      this.gorilla = this.add.image(this.gorillaX, yAt(GIRDERS[2], this.gorillaX), 'gorilla').setOrigin(0.5, 1).setScale(0.9);
    }

    this.addItem('hammer', 1, 700);
    this.addItem('scroll', 3, 1150);
    if (!state().barrels.secret) this.addItem('cartridge', 4, 1110);

    this.hero = this.add.image(0, 0, 'hero').setOrigin(0.5, 1).setDepth(40);
    this.hammerSprite = this.add.image(0, 0, 'hammer').setDepth(41).setVisible(false);
    this.respawn();

    this.hud = this.add.text(20, 12, '', textStyle(24)).setDepth(70);
    button(this, W - 100, 32, 'Sortir', () => this.end('abandon'), 160).setDepth(70);
    this.input.keyboard?.on('keydown-ESC', () => this.end('abandon'));

    if (s.barrels.fading > 0) {
      this.fadeOverlay = this.add.rectangle(0, 0, W, H, 0xffffff, 0).setOrigin(0).setDepth(55);
      this.tweens.add({ targets: this.fadeOverlay, fillAlpha: 0.12 * s.barrels.fading, duration: 900, yoyo: true, repeat: -1 });
    }

    const lines = this.replay
      ? [{ text: 'Le magicien est parti, mais son chapeau enchanté lance encore des barils. Atteins le sommet !' }]
      : [
          { who: MAGICIAN, text: `Tiens, tiens… ${HERO} ! J'ai jeté le gorille de ce jeu et j'ai pris sa place. Et j'ai emmené ${FIANCEE} !` },
          { text: this.settings.intro },
          { text: `Rejoins ${FIANCEE} tout en haut. Le gorille garde le passage : combats-le avec le marteau… ou trouve un moyen de le libérer de son collier.` },
          { text: 'Flèches (ou ZQSD) pour bouger, ↑ / ↓ sur les échelles, ESPACE pour sauter.' },
        ];
    say(this, lines, () => (this.paused = false));
  }

  // ---------- décor ----------

  private drawLevel(): void {
    const g = this.add.graphics();
    g.fillStyle(0x0d0a18);
    g.fillRect(0, 0, W, H);
    // Les échelles d'abord, pour qu'elles passent derrière les poutres.
    for (const l of LADDERS) {
      const top = yAt(GIRDERS[l.upper], l.x);
      const bottom = yAt(GIRDERS[l.lower], l.x);
      g.lineStyle(4, COLORS.ladder);
      g.lineBetween(l.x - 13, top, l.x - 13, bottom);
      g.lineBetween(l.x + 13, top, l.x + 13, bottom);
      for (let y = top + 12; y < bottom; y += 18) g.lineBetween(l.x - 13, y, l.x + 13, y);
    }
    for (const gd of GIRDERS) {
      const segs: [number, number][] = [];
      let start = gd.x1;
      for (const [a, b] of gd.holes ?? []) {
        segs.push([start, a]);
        start = b;
      }
      segs.push([start, gd.x2]);
      for (const [a, b] of segs) {
        const ya = yAt(gd, a);
        const yb = yAt(gd, b);
        g.fillStyle(COLORS.girder);
        g.fillPoints(
          [new Phaser.Geom.Point(a, ya), new Phaser.Geom.Point(b, yb), new Phaser.Geom.Point(b, yb + 16), new Phaser.Geom.Point(a, ya + 16)],
          true,
        );
        g.lineStyle(2, INK);
        for (let x = a + 8; x < b - 8; x += 24) {
          const y = yAt(gd, x);
          g.lineBetween(x, y + 2, x + 12, y + 14);
          g.lineBetween(x + 12, y + 2, x, y + 14);
        }
      }
    }
    // Le trou mystérieux en bas.
    this.add.text(595, 600, '?', textStyle(48, '#b06cff')).setOrigin(0.5);
    this.add.text(595, 712, 'vers une autre boîte…', textStyle(14, '#b06cff')).setOrigin(0.5, 1);
  }

  private addItem(key: string, on: number, x: number): void {
    const img = this.add.image(x, yAt(GIRDERS[on], x) - 30, key).setDepth(30).setScale(1.4);
    this.tweens.add({ targets: img, y: img.y - 8, duration: 600, yoyo: true, repeat: -1 });
    this.items.push({ key, img, on, x });
  }

  // ---------- boucle ----------

  update(_t: number, deltaMs: number): void {
    const dt = Math.min(deltaMs / 1000, 0.05);
    const jump = this.controls.jumpPressed();
    if (this.paused || this.over) return;

    this.timeLeft -= dt;
    this.invulnerable -= dt;
    this.hammer = Math.max(0, this.hammer - dt);
    this.updateHero(dt, jump);
    if (this.over) return;
    this.updateMagician(dt);
    this.updateBarrels(dt);
    this.updateGorilla(dt);
    this.checkItems();
    this.drawHud();

    if (this.on === 5) this.win();
  }

  private updateHero(dt: number, jump: boolean): void {
    const pad = this.controls.pad;
    if (this.climbing) {
      const l = this.climbing;
      const top = yAt(GIRDERS[l.upper], l.x);
      const bottom = yAt(GIRDERS[l.lower], l.x);
      if (pad.up) this.py -= CLIMB * dt;
      if (pad.down) this.py += CLIMB * dt;
      if (this.py <= top) {
        this.py = top;
        this.climbing = null;
        this.on = l.upper;
      } else if (this.py >= bottom) {
        this.py = bottom;
        this.climbing = null;
        this.on = l.lower;
      }
    } else if (this.on >= 0) {
      const g = GIRDERS[this.on];
      this.vx = (pad.right ? 1 : 0) - (pad.left ? 1 : 0);
      if (this.vx) this.facing = this.vx;
      this.px = Phaser.Math.Clamp(this.px + this.vx * WALK * dt, 14, W - 14);
      if (!supports(g, this.px)) {
        this.on = -1;
        this.vy = 0;
      } else {
        this.py = yAt(g, this.px);
        const ladderUp = LADDERS.find((l) => l.lower === this.on && Math.abs(l.x - this.px) < 16);
        const ladderDown = LADDERS.find((l) => l.upper === this.on && Math.abs(l.x - this.px) < 16);
        if (pad.up && ladderUp && this.hammer <= 0) {
          this.climbing = ladderUp;
          this.px = ladderUp.x;
          this.py -= 2;
        } else if (pad.down && ladderDown && this.hammer <= 0) {
          this.climbing = ladderDown;
          this.px = ladderDown.x;
          this.py += 2;
        } else if (jump) {
          this.vy = JUMP_V;
          this.on = -1;
        }
      }
    } else {
      // En l'air.
      this.px = Phaser.Math.Clamp(this.px + this.vx * WALK * dt, 14, W - 14);
      const ny = this.py + this.vy * dt;
      this.vy += GRAVITY * dt;
      let landed = false;
      if (this.vy > 0) {
        for (let i = 0; i < GIRDERS.length; i++) {
          const g = GIRDERS[i];
          if (!supports(g, this.px)) continue;
          const gy = yAt(g, this.px);
          if (this.py <= gy + 1 && ny >= gy) {
            this.py = gy;
            this.on = i;
            landed = true;
            break;
          }
        }
      }
      if (!landed) this.py = ny;
      if (this.py > H + 60) {
        this.end('fuite');
        return;
      }
    }

    this.hero.setPosition(this.px, this.py).setFlipX(this.facing < 0);
    const walking = this.on >= 0 && this.vx !== 0;
    this.hero.setAngle(walking ? Math.sin(this.time.now / 60) * 6 : 0);
    this.hero.setAlpha(this.invulnerable > 0 ? 0.5 : 1);
    this.hammerSprite.setVisible(this.hammer > 0);
    if (this.hammer > 0) {
      this.hammerSprite.setPosition(this.px + this.facing * 26, this.py - 52);
      this.hammerSprite.setAngle(Math.sin(this.time.now / 70) * 70 * this.facing);
    }
  }

  private updateMagician(dt: number): void {
    if (!this.mage || this.magicianFled) return;
    if (!this.replay && this.timeLeft <= 0) {
      this.magicianFled = true;
      this.cameras.main.flash(300, 176, 108, 255);
      this.bubble.setText('Trop lent ! Je file avec ta page !').setPosition(this.mage.x + 60, this.mage.y - 110);
      this.tweens.add({ targets: this.mage, alpha: 0, scale: 0.1, angle: 360, duration: 600 });
      this.time.delayedCall(2200, () => this.bubble.setText(''));
      return;
    }
    this.throwIn -= dt;
    if (this.throwIn <= 0) {
      this.throwIn = this.replay ? 2.6 : this.settings.every * Phaser.Math.FloatBetween(0.8, 1.2);
      this.spawnBarrel();
      this.tweens.add({ targets: this.mage, scaleX: this.mage.scaleX * 1.15, duration: 120, yoyo: true });
    }
    this.tauntIn -= dt;
    if (!this.replay && this.tauntIn <= 0) {
      this.tauntIn = 8;
      this.bubble.setText(Phaser.Utils.Array.GetRandom(TAUNTS)).setPosition(this.mage.x + 80, this.mage.y - 110);
      this.time.delayedCall(2000, () => this.bubble.setText(''));
    }
  }

  private spawnBarrel(): void {
    const x = 200;
    const y = yAt(GIRDERS[4], x);
    const img = this.add.image(x, y, 'barrel').setOrigin(0.5, 1).setDepth(35);
    this.barrels.push({ img, x, y, vy: 0, on: 4, dir: 1 });
  }

  private updateBarrels(dt: number): void {
    const speed = this.replay ? 200 : this.settings.speed;
    for (const b of this.barrels) {
      if (b.on >= 0) {
        const g = GIRDERS[b.on];
        b.x += b.dir * speed * dt;
        if (!supports(g, b.x)) {
          b.on = -1;
          b.vy = 40;
        } else b.y = yAt(g, b.x);
      } else {
        const ny = b.y + b.vy * dt;
        b.vy += GRAVITY * dt;
        b.x += b.dir * 40 * dt;
        let landed = false;
        for (let i = 0; i < 5; i++) {
          const g = GIRDERS[i];
          if (!supports(g, b.x)) continue;
          const gy = yAt(g, b.x);
          if (b.y <= gy + 1 && ny >= gy) {
            b.y = gy;
            b.on = i;
            b.dir = g.dir;
            landed = true;
            break;
          }
        }
        if (!landed) b.y = ny;
      }
      b.img.setPosition(b.x, b.y);
      b.img.angle += b.dir * speed * dt * 2;

      // Collision avec le héros.
      const dx = Math.abs(b.x - this.px);
      const dy = Math.abs(b.y - 17 - (this.py - 30));
      if (dx < 26 && dy < 34) {
        if (this.hammer > 0) {
          b.x = -999;
          this.cameras.main.shake(80, 0.004);
        } else if (this.invulnerable <= 0) {
          this.loseLife();
          return;
        }
      }
    }
    this.barrels = this.barrels.filter((b) => {
      if (b.x < -40 || b.x > W + 40 || b.y > H + 40) {
        b.img.destroy();
        return false;
      }
      return true;
    });
  }

  private updateGorilla(dt: number): void {
    if (!this.gorilla) return;
    const g = GIRDERS[2];
    if (this.gorillaState === 'libre') return;
    if (this.gorillaStun > 0) {
      this.gorillaStun -= dt;
      this.gorilla.setTint(0xffaaaa);
    } else {
      this.gorilla.clearTint();
      const speed = state().sabotage === 'fort' ? 110 : 75;
      this.gorillaX += this.gorillaDir * speed * dt;
      if (this.gorillaX > 820 || this.gorillaX < 470) this.gorillaDir *= -1;
    }
    this.gorilla.setPosition(this.gorillaX, yAt(g, this.gorillaX)).setFlipX(this.gorillaDir < 0);

    // Contact : la zone dangereuse est un peu plus basse que le dessin, pour qu'on puisse sauter par-dessus.
    const dx = Math.abs(this.gorillaX - this.px);
    const gy = yAt(g, this.gorillaX);
    const touching = dx < 44 && this.py > gy - 55 && this.py < gy + 10;
    if (!touching) return;
    if (this.hasScroll) {
      this.freeGorilla();
    } else if (this.hammer > 0 && this.gorillaStun <= 0) {
      this.gorillaHits++;
      this.gorillaStun = 1.2;
      this.gorillaX += (this.gorillaX > this.px ? 1 : -1) * 60;
      this.cameras.main.shake(120, 0.008);
      if (this.gorillaHits >= 3) this.beatGorilla();
    } else if (this.gorillaStun <= 0 && this.invulnerable <= 0) {
      this.loseLife();
    }
  }

  private freeGorilla(): void {
    this.gorillaState = 'libre';
    this.hasScroll = false;
    this.gorilla!.setTexture('gorilla-free').clearTint();
    banner(this, 'Gorille libéré !', '#59cd90');
    this.bubble.setText('Ouh ouh ! (merci)').setPosition(this.gorillaX, yAt(GIRDERS[2], this.gorillaX) - 110);
    this.time.delayedCall(1800, () => this.bubble.setText(''));
    this.tweens.add({ targets: this.gorilla, x: 60, duration: 2500, onComplete: () => this.gorilla?.setAlpha(0.6) });
  }

  private beatGorilla(): void {
    this.gorillaState = 'battu';
    banner(this, 'Gorille vaincu !');
    const gor = this.gorilla!;
    this.gorilla = undefined;
    this.tweens.add({ targets: gor, y: H + 200, angle: 200, duration: 900, onComplete: () => gor.destroy() });
  }

  private checkItems(): void {
    for (const it of this.items) {
      if (!it.img.active) continue;
      if (Math.abs(it.x - this.px) < 26 && Math.abs(it.img.y - (this.py - 30)) < 40) {
        it.img.destroy();
        if (it.key === 'hammer') {
          this.hammer = 10;
          banner(this, 'Marteau ! (10 s)');
        } else if (it.key === 'scroll') {
          this.hasScroll = true;
          banner(this, 'Parchemin du magicien !', '#b06cff');
          this.time.delayedCall(900, () =>
            this.flashText('« ↑↑↓↓ : ouvre n’importe quel collier magique »'),
          );
        } else if (it.key === 'cartridge') {
          const s = state();
          s.barrels.secret = true;
          addPage(3);
          save();
          banner(this, 'Cartouche dorée : page secrète !', '#f6c945');
        }
      }
    }
  }

  private flashText(text: string): void {
    const t = this.add.text(W / 2, 140, text, textStyle(24, '#b06cff')).setOrigin(0.5).setDepth(80);
    this.tweens.add({ targets: t, alpha: 0, delay: 2200, duration: 500, onComplete: () => t.destroy() });
  }

  private loseLife(): void {
    this.lives--;
    this.cameras.main.shake(250, 0.01);
    if (this.lives <= 0) {
      this.end('defaite');
      return;
    }
    banner(this, 'Aïe !', '#ff7a7a');
    this.respawn();
  }

  private respawn(): void {
    this.px = START.x;
    this.on = START.on;
    this.py = yAt(GIRDERS[0], this.px);
    this.vy = 0;
    this.vx = 0;
    this.climbing = null;
    this.hammer = 0;
    this.invulnerable = 1.5;
    this.barrels.forEach((b) => b.img.destroy());
    this.barrels = [];
    this.hero.setPosition(this.px, this.py);
  }

  private drawHud(): void {
    const t = Math.max(0, Math.ceil(this.timeLeft));
    const parts = [`Vies : ${'♥'.repeat(this.lives)}`];
    if (!this.replay) parts.push(this.magicianFled ? 'Le magicien a filé !' : `Temps : ${t}`);
    if (this.hammer > 0) parts.push(`Marteau : ${Math.ceil(this.hammer)}`);
    if (this.hasScroll) parts.push('Parchemin ✓');
    this.hud.setText(parts.join('    '));
  }

  // ---------- fins ----------

  private win(): void {
    if (this.over) return;
    if (this.replay) {
      this.over = true;
      banner(this, 'Boîte terminée !');
      this.time.delayedCall(1600, () => goTo(this, 'hub'));
      return;
    }
    if (this.magicianFled) {
      this.end('partielle');
      return;
    }
    addPage(2);
    this.end(this.gorillaState === 'libre' ? 'autrement' : 'nette');
  }

  private end(outcome: BarrelsOutcome): void {
    if (this.over) return;
    this.over = true;
    const s = state();
    const b = s.barrels;
    b.gorilla = this.gorillaState;
    if (!this.replay) b.outcome = outcome;
    if (outcome === 'nette' || outcome === 'autrement' || outcome === 'partielle') b.magicianGone = true;
    if (outcome === 'defaite') b.fading++;
    if (outcome === 'fuite') s.ejected = true;
    save();

    const titles: Record<BarrelsOutcome, string> = {
      nette: `${FIANCEE} est sauvée !`,
      autrement: `${FIANCEE} est sauvée !`,
      partielle: `${FIANCEE} est sauvée… mais pas la page`,
      defaite: 'Perdu…',
      fuite: 'Aaaaah !',
      abandon: 'Tu sors de la boîte',
    };
    banner(this, titles[outcome], outcome === 'defaite' ? '#ff7a7a' : '#f6c945');
    if (outcome === 'nette' || outcome === 'autrement') {
      this.mage?.setVisible(false);
      const p = this.add.image(150, 160, 'page').setDepth(60);
      this.tweens.add({ targets: p, x: this.px, y: this.py - 60, angle: 360, duration: 800 });
    }
    // Rejouer une boîte déjà terminée ne relance pas le bilan dans le hub.
    const data = this.replay ? {} : { from: 'barrels', outcome };
    this.time.delayedCall(1800, () => goTo(this, 'hub', data));
  }
}

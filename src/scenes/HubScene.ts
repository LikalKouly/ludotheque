// Le hub : une salle de la Ludoteca, en point & click.

import Phaser from 'phaser';
import { BOX_COLORS, COLORS, motes, stopMotion } from '../systems/art';
import { resetState, save, state, type BarrelsOutcome } from '../systems/state';
import { BARRELS_SUMMARY, CHASE_SUMMARY, CODER, HERO, OWL, PAGES, RAT } from '../systems/story';
import { H, W, button, choose, goTo, say, textStyle, type Line } from '../systems/ui';

interface Hotspot {
  name: string;
  zone: Phaser.Geom.Rectangle;
  stand: { x: number; y: number };
  act: () => void;
}

interface HubData {
  from?: 'chase' | 'barrels';
  outcome?: BarrelsOutcome;
}

const FLOOR_TOP = 560;
const FLOOR_BOTTOM = 690;
const HERO_SCALE = 1.1;

export class HubScene extends Phaser.Scene {
  private hero!: Phaser.GameObjects.Image;
  private hotspots: Hotspot[] = [];
  private verb!: Phaser.GameObjects.Text;
  private pagesText!: Phaser.GameObjects.Text;
  private busy = false;
  private walkTween?: Phaser.Tweens.Tween;
  private book?: Phaser.GameObjects.Image;

  constructor() {
    super('hub');
  }

  create(data: HubData): void {
    this.hotspots = [];
    this.busy = false;
    this.cameras.main.fadeIn(500);
    this.drawRoom();
    this.placeCharacters();
    this.drawHud();

    this.hero = this.add.image(660, 650, 'hero').setOrigin(0.5, 1).setScale(HERO_SCALE).setDepth(650);
    stopMotion(this, this.hero);

    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      const h = this.hotspotAt(p.x, p.y);
      this.verb.setText(h ? h.name : '');
    });
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.onClick(p.x, p.y));

    const s = state();
    if (!s.introDone) this.time.delayedCall(600, () => this.intro());
    else if (data.from === 'chase') this.time.delayedCall(500, () => this.afterChase());
    else if (data.from === 'barrels' && data.outcome) this.time.delayedCall(500, () => this.afterBarrels(data.outcome!));
  }

  // ---------- décor ----------

  private drawRoom(): void {
    const rnd = new Phaser.Math.RandomDataGenerator(['ludoteca']);
    const g = this.add.graphics();
    g.fillStyle(COLORS.night);
    g.fillRect(0, 0, W, H);

    // Le couloir en arche qui s'enfonce au fond, baigné d'une brume chaude.
    g.fillStyle(0x3a2216);
    g.fillRoundedRect(560, 90, 300, 470, { tl: 150, tr: 150, bl: 0, br: 0 });
    this.add.image(710, 330, 'glow').setScale(3.4, 3.2).setTint(COLORS.amber).setAlpha(0.35);
    for (let i = 0; i < 4; i++) {
      const inset = 30 + i * 28;
      g.lineStyle(10, COLORS.woodDark, 0.8 - i * 0.15);
      g.strokeRoundedRect(560 + inset, 90 + inset * 0.8, 300 - inset * 2, 470, { tl: 150 - inset, tr: 150 - inset, bl: 0, br: 0 });
    }
    // Étagères minuscules au fond du couloir.
    for (const x of [620, 760]) {
      g.fillStyle(COLORS.woodDark);
      g.fillRect(x, 260, 40, 200);
      for (let y = 270; y < 450; y += 30) {
        let bx = x + 3;
        while (bx < x + 36) {
          const bw = rnd.between(3, 6);
          g.fillStyle(Phaser.Utils.Array.GetRandom([0x7e2a20, 0x22284a, 0x3f6b4a, 0x6b4a1f]), 0.8);
          g.fillRect(bx, y + 26 - rnd.between(14, 22), bw, 22);
          bx += bw + 1;
        }
      }
    }

    // Grandes bibliothèques des côtés.
    const bookcase = (x: number, w: number, top: number) => {
      g.fillStyle(COLORS.woodDark);
      g.fillRect(x, top, w, FLOOR_TOP - top);
      for (let y = top + 16; y < FLOOR_TOP - 40; y += 86) {
        let bx = x + 8;
        while (bx < x + w - 14) {
          const bw = rnd.between(9, 18);
          const bh = rnd.between(46, 70);
          g.fillStyle(Phaser.Utils.Array.GetRandom([0x7e2a20, 0x22284a, 0x3f6b4a, 0x6b4a1f, 0x3a2457, 0x8c5532]));
          g.fillRect(bx, y + 72 - bh, bw, bh);
          g.fillStyle(COLORS.gold, 0.5);
          g.fillRect(bx + 2, y + 72 - bh + 6, bw - 4, 2);
          bx += bw + 2;
        }
        g.fillStyle(COLORS.wood);
        g.fillRect(x, y + 72, w, 9);
      }
    };
    bookcase(0, 110, 20);
    bookcase(1180, 100, 30);
    bookcase(880, 120, 120);

    // Fenêtre ronde et pleine lune.
    this.add.image(400, 150, 'glow').setScale(2.6).setTint(0xbfd4ff).setAlpha(0.3);
    g.fillStyle(0x1c2a44);
    g.fillCircle(400, 150, 74);
    g.fillStyle(COLORS.moon);
    g.fillCircle(420, 135, 34);
    g.fillStyle(0xc9d2de, 0.6);
    g.fillCircle(410, 128, 7);
    g.fillCircle(430, 146, 5);
    g.lineStyle(8, COLORS.woodDark);
    g.strokeCircle(400, 150, 74);
    g.lineBetween(326, 150, 474, 150);
    g.lineBetween(400, 76, 400, 224);

    // Appliques murales.
    for (const [x, y] of [
      [250, 270],
      [1080, 230],
    ]) {
      this.add.image(x, y, 'glow').setScale(1.6).setTint(COLORS.amber).setAlpha(0.5).setBlendMode(Phaser.BlendModes.ADD);
      g.fillStyle(COLORS.gold);
      g.fillRect(x - 3, y + 8, 6, 20);
      g.fillStyle(COLORS.lamp);
      g.fillEllipse(x, y, 18, 22);
    }

    // Sol : parquet sombre et grand tapis persan.
    g.fillStyle(0x24140c);
    g.fillRect(0, FLOOR_TOP - 20, W, H - FLOOR_TOP + 20);
    g.lineStyle(1, 0x3a2216);
    for (let i = -10; i < 22; i++) g.lineBetween(640 + i * 26, FLOOR_TOP - 20, 640 + i * 96, H);
    const rug = [
      new Phaser.Geom.Point(330, FLOOR_TOP),
      new Phaser.Geom.Point(990, FLOOR_TOP),
      new Phaser.Geom.Point(1230, H),
      new Phaser.Geom.Point(50, H),
    ];
    g.fillStyle(COLORS.carpet);
    g.fillPoints(rug, true);
    g.lineStyle(10, COLORS.cream, 0.55);
    g.strokePoints(rug, true);
    g.lineStyle(4, COLORS.navy, 0.8);
    g.strokePoints(
      [
        new Phaser.Geom.Point(370, FLOOR_TOP + 14),
        new Phaser.Geom.Point(950, FLOOR_TOP + 14),
        new Phaser.Geom.Point(1150, H - 10),
        new Phaser.Geom.Point(130, H - 10),
      ],
      true,
    );
    // Motifs du tapis : médaillons et losanges.
    g.fillStyle(COLORS.carpetDark);
    g.fillEllipse(640, 640, 380, 80);
    g.lineStyle(3, COLORS.cream, 0.5);
    g.strokeEllipse(640, 640, 380, 80);
    g.strokeEllipse(640, 640, 250, 50);
    g.fillStyle(COLORS.cream, 0.45);
    for (let i = 0; i < 9; i++) {
      const x = 330 + i * 78;
      g.fillTriangle(x, 600, x + 10, 590, x + 20, 600);
      g.fillTriangle(x, 600, x + 10, 610, x + 20, 600);
    }

    // Piles de boîtes de jeux contre le mur, aux titres dorés.
    const stack = (x: number, base: number, titles: string[]) => {
      let y = base;
      titles.forEach((t, i) => {
        const w = 170 - (i % 2) * 14;
        const h = 44;
        y -= h;
        const bx = x + (i % 2) * 7;
        g.fillStyle(BOX_COLORS[i % BOX_COLORS.length]);
        g.fillRect(bx, y, w, h - 3);
        g.lineStyle(1.5, COLORS.gold, 0.85);
        g.strokeRect(bx + 5, y + 5, w - 10, h - 13);
        this.add.text(bx + w / 2, y + h / 2 - 2, t, { ...textStyle(15, '#e2b45a'), fontStyle: 'italic', strokeThickness: 2 }).setOrigin(0.5);
      });
    };
    stack(150, 470, ['Dadi del Drago', 'Regni Mistici', 'Atlante Arcano', 'Regni Mistici', 'Il Gran Labirinto']);

    // Globe terrestre et tas de pièces d'or, au premier plan à gauche.
    g.fillStyle(0x5a4a2a);
    g.fillCircle(55, 480, 60);
    g.lineStyle(3, COLORS.gold);
    g.strokeCircle(55, 480, 60);
    g.lineStyle(1.5, 0x3a2f1a, 0.8);
    g.strokeEllipse(55, 480, 60, 120);
    g.lineBetween(-5, 480, 115, 480);
    g.fillStyle(COLORS.gold);
    for (let i = 0; i < 9; i++) g.fillEllipse(70 + (i % 3) * 14, 600 - Math.floor(i / 3) * 6, 18, 7);

    // Le bureau de Madame Hulotte.
    g.fillStyle(COLORS.wood);
    g.fillRoundedRect(300, 480, 210, 90, 6);
    g.fillStyle(COLORS.woodLight);
    g.fillRect(300, 480, 210, 10);
    g.fillStyle(COLORS.woodDark);
    g.fillRect(318, 500, 70, 60);
    g.fillRect(422, 500, 70, 60);
    this.add.image(470, 460, 'glow').setScale(0.9).setTint(COLORS.lamp).setAlpha(0.55).setBlendMode(Phaser.BlendModes.ADD);
    g.fillStyle(COLORS.gold);
    g.fillRect(468, 452, 4, 28);
    g.fillStyle(0x3f6b4a);
    g.fillTriangle(452, 456, 488, 456, 470, 436);
    this.book = this.add.image(370, 474, 'book').setOrigin(0.5, 1);

    // Le meuble à fiches d'emprunt, avec ses fioles qui luisent.
    g.fillStyle(COLORS.wood);
    g.fillRoundedRect(540, 420, 130, 150, 6);
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 3; c++) {
        g.fillStyle(COLORS.woodDark);
        g.fillRect(549 + c * 40, 432 + r * 33, 34, 25);
        g.fillStyle(COLORS.gold);
        g.fillCircle(566 + c * 40, 444 + r * 33, 2.5);
      }
    for (const [x, c] of [
      [560, COLORS.magic],
      [600, COLORS.teal],
      [640, 0xff5fa2],
    ] as const) {
      this.add.image(x, 404, 'glow').setScale(0.5).setTint(c).setAlpha(0.7).setBlendMode(Phaser.BlendModes.ADD);
      g.fillStyle(c, 0.85);
      g.fillCircle(x, 408, 10);
      g.fillRect(x - 3, 390, 6, 10);
    }

    // La vitrine des jeux, sous la lueur de la magie.
    this.add.image(890, 400, 'glow').setScale(3.2, 2.6).setTint(COLORS.magic).setAlpha(0.3).setBlendMode(Phaser.BlendModes.ADD);
    g.fillStyle(COLORS.woodDark);
    g.fillRect(740, 300, 330, 260);
    g.lineStyle(4, COLORS.gold, 0.8);
    g.strokeRect(740, 300, 330, 260);
    g.fillStyle(COLORS.wood);
    g.fillRect(740, 440, 330, 12);
    g.fillRect(740, 548, 330, 12);
    const boxes = [
      this.add.image(800, 440, 'box-barrels').setOrigin(0.5, 1).setScale(0.8),
      this.add.image(905, 440, 'box-maze').setOrigin(0.5, 1).setScale(0.8).setAngle(-5),
      this.add.image(1010, 440, 'box-worm').setOrigin(0.5, 1).setScale(0.8).setAngle(4),
    ];
    const fading = state().barrels.fading;
    if (fading > 0) boxes[0].setAlpha(Math.max(0.35, 1 - fading * 0.3));
    const label = (x: number, t: string) =>
      this.add.text(x, 470, t, { ...textStyle(15, '#e2b45a'), align: 'center', fontStyle: 'italic' }).setOrigin(0.5, 0);
    label(800, 'Barils\nen Folie');
    label(905, 'Labyrinthe\nGlouton');
    label(1010, 'Ver de\nBibliothèque');

    // La porte des Réserves, fermée à clé.
    g.fillStyle(0x1a0f0a);
    g.fillRoundedRect(1110, 360, 64, 200, { tl: 32, tr: 32, bl: 0, br: 0 });
    g.lineStyle(4, COLORS.gold, 0.7);
    g.strokeRoundedRect(1110, 360, 64, 200, { tl: 32, tr: 32, bl: 0, br: 0 });
    g.fillStyle(COLORS.gold);
    g.fillCircle(1162, 470, 5);

    motes(this, 22, 900);
    this.add.image(0, 0, 'vignette').setOrigin(0).setDepth(890);

    this.addHotspot('Parler à ' + OWL, 300, 380, 210, 190, { x: 470, y: 620 }, () => this.talkOwl());
    this.addHotspot("Fouiller les fiches d'emprunt", 540, 390, 130, 180, { x: 605, y: 620 }, () => this.searchCards());
    this.addHotspot('Regarder la vitrine des jeux', 740, 300, 330, 260, { x: 900, y: 620 }, () => this.openShelf());
    this.addHotspot('Porte des Réserves', 1110, 360, 64, 200, { x: 1110, y: 630 }, () =>
      this.say([
        { who: HERO, text: "Fermée. Ma clé n'entre même pas dans la serrure." },
        { who: HERO, text: "Les Réserves… Pourquoi j'ai l'impression d'y être déjà venue ?" },
      ]),
    );
  }

  private placeCharacters(): void {
    const s = state();
    const owl = this.add.image(400, 482, 'owl').setOrigin(0.5, 1).setScale(1.05).setDepth(470);
    stopMotion(this, owl, 0.6);

    if (s.allies.includes(RAT)) {
      const rat = this.add.image(1010, 660, 'rat').setOrigin(0.5, 1).setScale(1.3).setDepth(660);
      stopMotion(this, rat);
      this.addHotspot('Parler à ' + RAT, 970, 600, 90, 70, { x: 940, y: 660 }, () => this.talkRat());
    } else if (s.grignoteAngry) {
      this.add.image(1030, 660, 'rat').setOrigin(0.5, 1).setScale(1.3).setFlipX(true).setDepth(660).setTint(0x8f8478);
      this.addHotspot('Parler à ' + RAT, 990, 600, 90, 70, { x: 940, y: 660 }, () =>
        this.say([{ who: RAT, text: "Hmpf. Tu m'as laissé sous les boîtes. Je ne te parle plus." }]),
      );
    }
    if (s.barrels.gorilla === 'libre') {
      const gor = this.add.image(250, 640, 'gorilla-free').setOrigin(0.5, 1).setScale(1.1).setDepth(640);
      stopMotion(this, gor);
      this.addHotspot('Parler au gorille', 200, 550, 100, 95, { x: 330, y: 650 }, () =>
        this.say([{ who: 'Le gorille', text: 'Ouh ! Ouh ! (Il montre la cicatrice cousue sur sa poitrine, puis toi, puis encore sa poitrine.)' }]),
      );
    }
  }

  private drawHud(): void {
    const g = this.add.graphics().setDepth(950);
    g.fillStyle(0x140b07, 0.85);
    g.fillRoundedRect(16, 12, 230, 50, 12);
    g.lineStyle(2, COLORS.gold, 0.7);
    g.strokeRoundedRect(16, 12, 230, 50, 12);
    this.add.image(42, 37, 'page').setScale(0.8).setDepth(951);
    this.pagesText = this.add.text(66, 22, '', textStyle(26)).setDepth(951);
    this.refreshPages();
    button(this, W - 290, 38, 'Livre', () => this.readBook(), 140).setDepth(951);
    button(this, W - 120, 38, 'Menu', () => this.menu(), 140).setDepth(951);
    this.verb = this.add.text(W / 2, H - 16, '', textStyle(26, '#f2b25c')).setOrigin(0.5, 1).setDepth(951);
  }

  private refreshPages(): void {
    this.pagesText.setText(`Pages : ${state().pages.length} / 3`);
  }

  // ---------- point & click ----------

  private addHotspot(name: string, x: number, y: number, w: number, h: number, stand: { x: number; y: number }, act: () => void): void {
    this.hotspots.unshift({ name, zone: new Phaser.Geom.Rectangle(x, y, w, h), stand, act });
  }

  private hotspotAt(x: number, y: number): Hotspot | undefined {
    return this.hotspots.find((h) => h.zone.contains(x, y));
  }

  private onClick(x: number, y: number): void {
    if (this.busy) return;
    const h = this.hotspotAt(x, y);
    if (h) this.walkTo(h.stand.x, h.stand.y, () => h.act());
    else if (y > FLOOR_TOP - 40) this.walkTo(x, y);
  }

  private walkTo(x: number, y: number, then?: () => void): void {
    const tx = Phaser.Math.Clamp(x, 60, W - 60);
    const ty = Phaser.Math.Clamp(y, FLOOR_TOP + 40, FLOOR_BOTTOM);
    const dist = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, tx, ty);
    this.hero.setFlipX(tx < this.hero.x);
    this.walkTween?.stop();
    let frame = 0;
    let last = 0;
    this.walkTween = this.tweens.add({
      targets: this.hero,
      x: tx,
      y: ty,
      duration: Math.max(120, dist * 3.4),
      onUpdate: () => {
        this.hero.setDepth(this.hero.y);
        // Deux poses de marche, alternées comme en animation image par image.
        if (this.time.now - last > 140) {
          last = this.time.now;
          frame = 1 - frame;
          this.hero.setTexture(frame ? 'hero-walk' : 'hero');
        }
        // Plus petite au fond de la salle, plus grande au premier plan.
        this.hero.setScale(HERO_SCALE * (0.85 + ((this.hero.y - FLOOR_TOP) / (FLOOR_BOTTOM - FLOOR_TOP)) * 0.25));
      },
      onComplete: () => {
        this.hero.setTexture('hero');
        then?.();
      },
    });
  }

  private say(lines: Line[], then?: () => void): void {
    this.busy = true;
    say(this, lines, () => {
      this.busy = false;
      then?.();
    });
  }

  private ask(prompt: Line, choices: { label: string; onPick: () => void }[]): void {
    this.busy = true;
    choose(
      this,
      prompt,
      choices.map((c) => ({
        label: c.label,
        onPick: () => {
          this.busy = false;
          c.onPick();
        },
      })),
    );
  }

  // ---------- histoire ----------

  private intro(): void {
    this.say(
      [
        { who: OWL, text: `${HERO} ! Il est minuit passé. Range ces dernières boîtes et file te coucher.` },
        { who: HERO, text: 'Oui, Madame Hulotte… Encore des boîtes. Toujours des boîtes.' },
      ],
      () => this.pagesTear(),
    );
  }

  // Le codeur agit sans se montrer : les lampes vacillent et les pages s'arrachent toutes seules.
  // Le joueur aperçoit une main de lumière ; Nella, elle, ne voit rien.
  private pagesTear(): void {
    this.busy = true;
    const dark = this.add.rectangle(0, 0, W, H, 0x000000, 0).setOrigin(0).setDepth(880);
    this.tweens.add({ targets: dark, fillAlpha: 0.55, duration: 120, yoyo: true, repeat: 3 });
    const book = this.book!;
    const mano = this.add.image(book.x + 40, book.y - 70, 'mano').setAlpha(0).setDepth(885).setAngle(-20).setScale(0.8);
    this.tweens.add({ targets: mano, alpha: 0.28, duration: 400, yoyo: true, hold: 900, delay: 500 });
    this.time.delayedCall(900, () => {
      this.tweens.add({ targets: book, angle: { from: -6, to: 6 }, duration: 60, yoyo: true, repeat: 6 });
      for (let i = 0; i < 9; i++) {
        const p = this.add.image(book.x, book.y - 20, 'page').setDepth(710).setScale(0.7);
        this.tweens.add({
          targets: p,
          x: Phaser.Math.Between(820, 1260),
          y: Phaser.Math.Between(240, 460),
          angle: Phaser.Math.Between(-360, 360),
          alpha: 0,
          duration: 1300,
          delay: i * 90,
          onComplete: () => p.destroy(),
        });
      }
      this.cameras.main.shake(400, 0.005);
    });
    this.time.delayedCall(2300, () =>
      this.say(
        [
          { who: HERO, text: 'Mon livre ! Qui… qui est là ?!' },
          { who: OWL, text: 'Personne, ma petite. Ou alors…' },
          { who: OWL, text: `… ${CODER}. La légende dit qu'il écrit le monde, et que personne ne l'a jamais vu.` },
          { who: HERO, text: 'Ma tête… Je ne me souviens plus de rien. Mes pages ! Elles s’envolent !' },
          { who: OWL, text: 'Alors ne reste pas plantée là. COURS !' },
        ],
        () => {
          state().introDone = true;
          save();
          goTo(this, 'chase');
        },
      ),
    );
  }

  private afterChase(): void {
    const o = state().chaseOutcome!;
    const lines: Line[] = [{ text: CHASE_SUMMARY[o] }];
    if (o === 'rattrape') {
      lines.push({ who: HERO, text: 'Une page ! Ça me revient… un tout petit peu.' });
      lines.push({ who: OWL, text: 'Les autres se sont engouffrées dans « Barils en Folie ». Le jeu s’est mis à trembler juste après.' });
    } else if (o === 'presque') {
      lines.push({ who: OWL, text: 'Une fiche d’emprunt ? « Barils en Folie », emprunté cette nuit… La case du nom est vide.' });
    } else if (o === 'plonge') {
      lines.push({ who: OWL, text: 'Elles sont entrées dans « Barils en Folie ». Glisse-toi dans la boîte avant que quelque chose ne change !' });
    } else if (o === 'raccourci') {
      lines.push({ who: OWL, text: 'Tu es arrivée la première. Dépêche-toi, avant que le jeu ne soit… réparé.' });
    } else if (o === 'perdu') {
      lines.push({ who: OWL, text: 'Elles peuvent être dans n’importe quelle boîte. Regarde dans les fiches d’emprunt.' });
    } else if (o === 'aide') {
      lines.push({ who: RAT, text: `Merci ${HERO} ! Je te revaudrai ça. J'ai vu tes pages filer vers la vitrine des jeux !` });
      lines.push({ who: OWL, text: 'Les fiches d’emprunt te diront dans quelle boîte elles se sont cachées.' });
    }
    this.say(lines);
  }

  private afterBarrels(outcome: BarrelsOutcome): void {
    const s = state();
    const lines: Line[] = [{ text: BARRELS_SUMMARY[outcome] }];
    if (outcome === 'nette' || outcome === 'autrement') {
      lines.push({ who: HERO, text: 'Encore une page… Pourquoi j’ai peur de ce que je vais lire ?' });
    }
    if (outcome === 'autrement') {
      lines.push({ who: OWL, text: 'Cette pièce cousue sur le gorille… On en voit partout, ces temps-ci. On les appelle les Toppe. Elles réparent ce qui est cassé, paraît-il.' });
    }
    if (outcome === 'partielle') lines.push({ who: OWL, text: 'Recousue ? Alors quelqu’un, quelque part, ne veut pas que tu la lises.' });
    if (outcome === 'defaite') lines.push({ who: OWL, text: 'Regarde la boîte… elle pâlit. Comme si tu l’avais abîmée en y passant.' });
    if (outcome === 'fuite') {
      lines.push({ who: HERO, text: 'Ouille. Je suis tombée dans « Le Ver de Bibliothèque » ! (Ce jeu n’existe pas encore dans le prototype.)' });
    }
    if (s.barrels.secret) lines.push({ who: HERO, text: 'Et cette cartouche dorée cachait une page… avec une écriture qui n’est pas d’ici.' });
    const terminal = outcome !== 'abandon';
    this.say(lines, () => {
      if (terminal && !s.prototypeEndSeen) {
        s.prototypeEndSeen = true;
        save();
        goTo(this, 'end');
      }
    });
  }

  private talkOwl(): void {
    const s = state();
    this.ask({ who: OWL, text: 'Oui, ma petite ?' }, [
      {
        label: `Qui est ${CODER} ?`,
        onPick: () =>
          this.say([
            { who: OWL, text: "Une légende. Celui qui écrit le monde. Ceux qui disent l'avoir vu ne sont jamais d'accord : un sorcier, un fantôme, une main de lumière…" },
            { who: OWL, text: 'Ses gardiens, eux, on les voit. Ils chassent les nuisibles de la Ludoteca. Ne t’inquiète pas : ils ne s’en prennent jamais aux gentilles poupées.' },
          ]),
      },
      {
        label: 'Où sont passées mes pages ?',
        onPick: () =>
          this.say([
            {
              who: OWL,
              text: s.knowsBox
                ? 'Dans « Barils en Folie », dans la vitrine des jeux. Glisse-toi dans la boîte !'
                : 'Aucune idée. Mais chaque boîte qu’on ouvre laisse une fiche d’emprunt…',
            },
          ]),
      },
      { label: 'Rien, merci.', onPick: () => undefined },
    ]);
  }

  private talkRat(): void {
    this.say([
      { who: RAT, text: 'Un conseil de rat des rayons : dans « Barils en Folie », le gorille a une pièce de tissu cousue sur la poitrine.' },
      { who: RAT, text: "C'est elle qui le rend méchant. Trouve des ciseaux et découds-la, au lieu de lui taper dessus." },
    ]);
  }

  private searchCards(): void {
    const s = state();
    if (s.knowsBox) {
      this.say([{ who: HERO, text: 'J’ai déjà trouvé la bonne fiche : « Barils en Folie », emprunté cette nuit par… personne.' }]);
      return;
    }
    this.say(
      [
        { who: HERO, text: '« Le Labyrinthe Glouton » : rendu il y a trois jours.' },
        { who: HERO, text: '« Le Ver de Bibliothèque » : jamais emprunté. Pauvre jeu.' },
        { who: HERO, text: '« Barils en Folie » : emprunté CETTE NUIT. La case du nom est vide… mais l’encre est encore fraîche.' },
      ],
      () => {
        s.knowsBox = true;
        save();
      },
    );
  }

  private openShelf(): void {
    const s = state();
    const b = s.barrels;
    let status = 'quelque chose a changé dedans';
    if (b.magicianGone) status = 'le jeu a l’air calme';
    if (b.fading > 0) status += ', elle s’efface…';
    this.ask({ who: HERO, text: 'La vitrine des jeux. Dans laquelle entrer ?' }, [
      {
        label: s.knowsBox ? `Barils en Folie (${status})` : 'Barils en Folie',
        onPick: () => {
          if (!s.knowsBox) {
            this.say([{ who: HERO, text: 'Il y a tant de boîtes… Sans indice, je pourrais chercher des heures.' }]);
            return;
          }
          this.enterBox();
        },
      },
      {
        label: 'Le Labyrinthe Glouton',
        onPick: () => this.say([{ text: 'Ce mini-jeu arrive bientôt (pas encore dans le prototype).' }]),
      },
      {
        label: 'Le Ver de Bibliothèque',
        onPick: () =>
          this.say([
            {
              text: s.ejected
                ? 'Tu y es tombée tout à l’heure. Il faudra l’explorer… bientôt (pas encore dans le prototype).'
                : 'Ce mini-jeu arrive bientôt (pas encore dans le prototype).',
            },
          ]),
      },
      { label: 'Rien pour le moment', onPick: () => undefined },
    ]);
  }

  private enterBox(): void {
    this.busy = true;
    this.hero.setData('still', true);
    this.tweens.add({
      targets: this.hero,
      x: 800,
      y: 420,
      scale: 0.15,
      angle: 720,
      duration: 700,
      ease: 'Cubic.In',
      onComplete: () => goTo(this, 'barrels'),
    });
  }

  private readBook(): void {
    const pages = state().pages;
    if (pages.length === 0) {
      this.say([{ who: HERO, text: 'Mon livre est vide. Toutes mes pages ont été arrachées.' }]);
      return;
    }
    this.say(pages.map((id) => ({ who: PAGES[id].title, text: PAGES[id].text })));
  }

  private menu(): void {
    this.ask({ text: 'Menu' }, [
      {
        label: 'Sauvegarder',
        onPick: () => {
          save();
          this.say([{ text: 'Partie sauvegardée.' }]);
        },
      },
      { label: 'Retour au titre', onPick: () => goTo(this, 'title') },
      {
        label: 'Recommencer depuis le début',
        onPick: () => {
          resetState();
          goTo(this, 'hub');
        },
      },
      { label: 'Fermer', onPick: () => undefined },
    ]);
  }
}

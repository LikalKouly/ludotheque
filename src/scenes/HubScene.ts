// Le hub : un rayon de la Ludothèque, en point & click.

import Phaser from 'phaser';
import { COLORS, INK } from '../systems/art';
import { resetState, save, state, type BarrelsOutcome } from '../systems/state';
import { BARRELS_SUMMARY, CHASE_SUMMARY, FIANCEE, HERO, MAGICIAN, OWL, PAGES, RAT } from '../systems/story';
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

export class HubScene extends Phaser.Scene {
  private hero!: Phaser.GameObjects.Image;
  private hotspots: Hotspot[] = [];
  private verb!: Phaser.GameObjects.Text;
  private pagesText!: Phaser.GameObjects.Text;
  private busy = false;
  private walkTween?: Phaser.Tweens.Tween;

  constructor() {
    super('hub');
  }

  create(data: HubData): void {
    this.hotspots = [];
    this.busy = false;
    this.cameras.main.fadeIn(400);
    this.drawRoom();
    this.placeCharacters();
    this.drawHud();

    this.hero = this.add.image(640, 640, 'hero').setOrigin(0.5, 1).setScale(1.5).setDepth(640);

    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      const h = this.hotspotAt(p.x, p.y);
      this.verb.setText(h ? h.name : '');
    });
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.onClick(p.x, p.y));

    const s = state();
    if (!s.introDone) this.time.delayedCall(500, () => this.intro());
    else if (data.from === 'chase') this.time.delayedCall(450, () => this.afterChase());
    else if (data.from === 'barrels' && data.outcome) this.time.delayedCall(450, () => this.afterBarrels(data.outcome!));
  }

  // ---------- décor ----------

  private drawRoom(): void {
    const rnd = new Phaser.Math.RandomDataGenerator(['ludotheque']);
    const g = this.add.graphics();
    g.fillStyle(COLORS.night);
    g.fillRect(0, 0, W, H);

    // Étagères tordues en arrière-plan, comme dans les vieux jeux d'aventure.
    const shelf = (x: number, w: number, lean: number) => {
      const pts = [
        new Phaser.Geom.Point(x, 40),
        new Phaser.Geom.Point(x + w, 30),
        new Phaser.Geom.Point(x + w + lean, FLOOR_TOP),
        new Phaser.Geom.Point(x + lean, FLOOR_TOP),
      ];
      g.fillStyle(COLORS.woodDark);
      g.fillPoints(pts, true);
      g.lineStyle(4, INK);
      g.strokePoints(pts, true);
      for (let row = 0; row < 5; row++) {
        const y = 70 + row * 98;
        const t = (y - 40) / (FLOOR_TOP - 40);
        let bx = x + 10 + lean * t;
        const end = x + w - 10 + lean * t;
        while (bx < end - 14) {
          const bw = rnd.between(10, 22);
          const bh = rnd.between(48, 78);
          g.fillStyle(Phaser.Utils.Array.GetRandom([0xd8414f, 0x3fa7d6, 0xf6c945, 0x59cd90, 0xee8434, 0xb06cff]));
          g.fillRect(bx, y + 84 - bh, bw, bh);
          g.lineStyle(2, INK);
          g.strokeRect(bx, y + 84 - bh, bw, bh);
          bx += bw + 2;
        }
        g.fillStyle(COLORS.wood);
        g.fillRect(x + lean * t, y + 84, w, 10);
      }
    };
    shelf(10, 150, -16);
    shelf(1120, 150, 18);
    shelf(560, 160, 6);

    // Grande fenêtre ronde avec la lune.
    g.fillStyle(0x2e4a7a);
    g.fillCircle(330, 160, 90);
    g.lineStyle(8, COLORS.woodDark);
    g.strokeCircle(330, 160, 90);
    g.lineBetween(240, 160, 420, 160);
    g.lineBetween(330, 70, 330, 250);
    g.fillStyle(0xfff3b0);
    g.fillCircle(360, 130, 26);

    // Sol en planches, en perspective.
    g.fillStyle(COLORS.floor);
    g.fillRect(0, FLOOR_TOP, W, H - FLOOR_TOP);
    g.lineStyle(2, COLORS.floorLight);
    for (let i = -8; i < 20; i++) g.lineBetween(640 + i * 30, FLOOR_TOP, 640 + i * 110, H);
    g.lineStyle(4, INK);
    g.lineBetween(0, FLOOR_TOP, W, FLOOR_TOP);

    // Le bureau de la bibliothécaire.
    g.fillStyle(COLORS.wood);
    g.fillRoundedRect(120, 500, 200, 90, 8);
    g.lineStyle(4, INK);
    g.strokeRoundedRect(120, 500, 200, 90, 8);
    g.fillStyle(0xfffbea);
    g.fillRect(150, 488, 60, 14);
    g.fillStyle(COLORS.gold);
    g.fillCircle(290, 488, 10);

    // Le meuble à fiches d'emprunt.
    g.fillStyle(COLORS.wood);
    g.fillRoundedRect(395, 430, 150, 160, 6);
    g.strokeRoundedRect(395, 430, 150, 160, 6);
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 3; c++) {
        g.fillStyle(COLORS.woodDark);
        g.fillRect(405 + c * 46, 442 + r * 36, 40, 28);
        g.fillStyle(COLORS.gold);
        g.fillCircle(425 + c * 46, 456 + r * 36, 3);
      }

    // L'étagère des jeux, éclairée par la magie.
    g.fillStyle(COLORS.magic, 0.12);
    g.fillCircle(880, 400, 170);
    g.fillStyle(COLORS.woodDark);
    g.fillRect(720, 300, 340, 260);
    g.lineStyle(4, INK);
    g.strokeRect(720, 300, 340, 260);
    g.fillStyle(COLORS.wood);
    g.fillRect(720, 440, 340, 12);
    g.fillRect(720, 548, 340, 12);
    const boxes = this.add.container(0, 0);
    boxes.add(this.add.image(790, 440, 'box-barrels').setOrigin(0.5, 1).setScale(0.8));
    boxes.add(this.add.image(890, 440, 'box-maze').setOrigin(0.5, 1).setScale(0.8).setAngle(-6));
    boxes.add(this.add.image(990, 440, 'box-worm').setOrigin(0.5, 1).setScale(0.8).setAngle(4));
    const fading = state().barrels.fading;
    if (fading > 0) (boxes.list[0] as Phaser.GameObjects.Image).setAlpha(Math.max(0.35, 1 - fading * 0.3));
    this.add.text(790, 470, 'Barils\nen Folie', { ...textStyle(16), align: 'center' }).setOrigin(0.5, 0);
    this.add.text(890, 470, 'Labyrinthe\nGlouton', { ...textStyle(16), align: 'center' }).setOrigin(0.5, 0);
    this.add.text(990, 470, 'Ver de\nBibliothèque', { ...textStyle(16), align: 'center' }).setOrigin(0.5, 0);

    // La porte des Réserves, fermée.
    g.fillStyle(0x24182f);
    g.fillRoundedRect(1150, 380, 110, 180, { tl: 55, tr: 55, bl: 0, br: 0 });
    g.lineStyle(4, INK);
    g.strokeRoundedRect(1150, 380, 110, 180, { tl: 55, tr: 55, bl: 0, br: 0 });
    g.fillStyle(COLORS.gold);
    g.fillCircle(1240, 480, 6);

    this.addHotspot('Parler à ' + OWL, 120, 400, 200, 190, { x: 340, y: 620 }, () => this.talkOwl());
    this.addHotspot("Fouiller les fiches d'emprunt", 395, 430, 150, 160, { x: 470, y: 620 }, () => this.searchCards());
    this.addHotspot("Regarder l'étagère des jeux", 720, 300, 340, 260, { x: 880, y: 620 }, () => this.openShelf());
    this.addHotspot('Porte des Réserves', 1150, 380, 110, 180, { x: 1150, y: 620 }, () =>
      this.say([{ who: HERO, text: "Fermée à clé. Les Réserves… J'ai l'impression d'y être déjà venu." }]),
    );
  }

  private placeCharacters(): void {
    const s = state();
    const owl = this.add.image(220, 500, 'owl').setOrigin(0.5, 1);
    this.tweens.add({ targets: owl, scaleY: 1.03, duration: 900, yoyo: true, repeat: -1 });

    if (s.allies.includes(RAT)) {
      const rat = this.add.image(1060, 650, 'rat').setOrigin(0.5, 1).setScale(1.3).setDepth(650);
      this.tweens.add({ targets: rat, y: 645, duration: 300, yoyo: true, repeat: -1 });
      this.addHotspot('Parler à ' + RAT, 1020, 590, 90, 70, { x: 990, y: 650 }, () => this.talkRat());
    } else if (s.grignoteAngry) {
      this.add.image(1080, 650, 'rat').setOrigin(0.5, 1).setScale(1.3).setFlipX(true).setDepth(650).setTint(0x999999);
      this.addHotspot('Parler à ' + RAT, 1040, 590, 90, 70, { x: 990, y: 650 }, () =>
        this.say([{ who: RAT, text: "Hmpf. Tu m'as laissé sous les boîtes. Je ne te parle plus." }]),
      );
    }
    if (s.barrels.gorilla === 'libre') {
      this.add.image(620, 600, 'gorilla-free').setOrigin(0.5, 1).setScale(1.1).setDepth(600);
      this.addHotspot('Parler au gorille', 570, 510, 100, 95, { x: 700, y: 640 }, () =>
        this.say([{ who: 'Le gorille', text: 'Ouh ! Ouh ! (Il te fait un câlin qui manque de t’écraser.)' }]),
      );
    }
    if (s.barrels.outcome && ['nette', 'autrement', 'partielle'].includes(s.barrels.outcome)) {
      this.add.image(330, 640, 'lila').setOrigin(0.5, 1).setScale(1.4).setFlipX(true).setDepth(640);
      this.addHotspot('Parler à ' + FIANCEE, 300, 570, 60, 75, { x: 400, y: 640 }, () =>
        this.say([{ who: FIANCEE, text: "Tu es venu me chercher jusque dans ce jeu… Mais Pico, pourquoi le magicien t'en veut-il autant ?" }]),
      );
    }
  }

  private drawHud(): void {
    const g = this.add.graphics().setDepth(800);
    g.fillStyle(0x140e22, 0.85);
    g.fillRoundedRect(16, 12, 230, 50, 12);
    this.add.image(42, 37, 'page').setScale(0.8).setDepth(801);
    this.pagesText = this.add.text(66, 22, '', textStyle(26)).setDepth(801);
    this.refreshPages();
    button(this, W - 290, 38, 'Livre', () => this.readBook(), 140).setDepth(801);
    button(this, W - 120, 38, 'Menu', () => this.menu(), 140).setDepth(801);
    this.verb = this.add.text(W / 2, H - 16, '', textStyle(26, '#f6c945')).setOrigin(0.5, 1).setDepth(801);
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
    const ty = Phaser.Math.Clamp(y, FLOOR_TOP + 30, FLOOR_BOTTOM);
    const dist = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, tx, ty);
    this.hero.setFlipX(tx < this.hero.x);
    this.walkTween?.stop();
    this.walkTween = this.tweens.add({
      targets: this.hero,
      x: tx,
      y: ty,
      duration: Math.max(120, dist * 3.2),
      onUpdate: () => {
        this.hero.setDepth(this.hero.y);
        this.hero.setAngle(Math.sin(this.time.now / 60) * 5);
      },
      onComplete: () => {
        this.hero.setAngle(0);
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
        { who: HERO, text: 'Oui, Madame Hulotte… (Encore des boîtes. Toujours des boîtes.)' },
      ],
      () => this.magicianArrives(),
    );
  }

  private magicianArrives(): void {
    this.busy = true;
    this.cameras.main.flash(300, 176, 108, 255);
    const mage = this.add.image(1000, 640, 'magician').setOrigin(0.5, 1).setScale(1.4).setDepth(700).setFlipX(true);
    mage.setAlpha(0);
    this.tweens.add({ targets: mage, alpha: 1, duration: 300 });
    this.time.delayedCall(500, () =>
      this.say(
        [
          { who: MAGICIAN, text: 'Ha ha ! Le livre du petit rangeur ! Exactement ce que je cherchais.' },
          { who: HERO, text: 'Hé ! Rendez-moi ça ! C’est… c’est MON livre !' },
          { who: MAGICIAN, text: "Plus maintenant ! ↑ ↑ ↓ ↓ ← → ← → !" },
        ],
        () => this.tearPages(mage),
      ),
    );
  }

  private tearPages(mage: Phaser.GameObjects.Image): void {
    this.busy = true;
    for (let i = 0; i < 9; i++) {
      const p = this.add.image(mage.x, mage.y - 60, 'page').setDepth(710).setScale(0.8);
      this.tweens.add({
        targets: p,
        x: Phaser.Math.Between(700, 1100),
        y: Phaser.Math.Between(260, 460),
        angle: Phaser.Math.Between(-360, 360),
        alpha: 0,
        duration: 1200,
        delay: i * 80,
        onComplete: () => p.destroy(),
      });
    }
    this.cameras.main.shake(400, 0.006);
    this.time.delayedCall(1200, () =>
      this.say(
        [
          { who: MAGICIAN, text: 'Tes pages sont cachées dans les jeux. Bonne chance pour les retrouver !' },
          { who: HERO, text: 'Ma tête… Je… je ne me souviens plus de… de rien !' },
          { who: OWL, text: `Ne reste pas planté là, ${HERO} ! RATTRAPE-LE !` },
        ],
        () => {
          this.tweens.add({ targets: mage, x: W + 80, duration: 600 });
          state().introDone = true;
          save();
          this.time.delayedCall(500, () => goTo(this, 'chase'));
        },
      ),
    );
  }

  private afterChase(): void {
    const s = state();
    const o = s.chaseOutcome!;
    const lines: Line[] = [{ text: CHASE_SUMMARY[o] }];
    if (o === 'rattrape') {
      lines.push({ who: HERO, text: 'Une page ! Ça me revient… un tout petit peu.' });
      lines.push({ who: OWL, text: 'Il est furieux. Il s’est jeté dans « Barils en Folie ». Méfie-toi, il va tout saboter.' });
    } else if (o === 'presque') {
      lines.push({ who: OWL, text: 'Une fiche d’emprunt ? « Barils en Folie… emprunté cette nuit par M.B. » Le voilà !' });
    } else if (o === 'plonge') {
      lines.push({ who: OWL, text: "Il n'a pas eu le temps de préparer ses tours. Fonce dans « Barils en Folie » !" });
    } else if (o === 'raccourci') {
      lines.push({ who: OWL, text: "Tu l'attends de pied ferme dans « Barils en Folie ». Il ne s'y attend pas !" });
    } else if (o === 'perdu') {
      lines.push({ who: OWL, text: 'Il peut être dans n’importe quelle boîte… Regarde dans les fiches d’emprunt.' });
    } else if (o === 'aide') {
      lines.push({ who: RAT, text: `Merci ${HERO} ! Je te revaudrai ça. Je l'ai vu filer vers l'étagère des jeux !` });
      lines.push({ who: OWL, text: 'Les fiches d’emprunt te diront dans quelle boîte il s’est caché.' });
    }
    this.say(lines);
  }

  private afterBarrels(outcome: BarrelsOutcome): void {
    const s = state();
    const lines: Line[] = [{ text: BARRELS_SUMMARY[outcome] }];
    if (outcome === 'nette' || outcome === 'autrement') {
      lines.push({ who: HERO, text: 'Encore une page… Pourquoi j’ai l’impression que je ne vais pas aimer ce que je vais lire ?' });
    }
    if (outcome === 'autrement') lines.push({ who: 'Le gorille', text: 'Ouh ouh ! (Il a l’air de vouloir te suivre partout.)' });
    if (outcome === 'partielle') lines.push({ who: OWL, text: 'Il a filé vers les Réserves avec ta page. Les Réserves…' });
    if (outcome === 'defaite') lines.push({ who: OWL, text: 'Regarde la boîte… elle pâlit. Si personne n’y joue, l’Oubli va la manger.' });
    if (outcome === 'fuite') {
      lines.push({ who: HERO, text: 'Ouille. Je suis tombé dans « Le Ver de Bibliothèque » ! (Ce jeu n’existe pas encore dans le prototype.)' });
    }
    if (s.barrels.secret) lines.push({ who: HERO, text: 'Et cette cartouche dorée cachait une page secrète…' });
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
    this.ask({ who: OWL, text: 'Oui, mon petit ?' }, [
      {
        label: 'Qui est ce magicien ?',
        onPick: () =>
          this.say([
            { who: OWL, text: `${MAGICIAN}. Un tricheur. Il connaît tous les codes secrets de tous les jeux.` },
            { who: OWL, text: "Bizarre… on dirait qu'il te connaissait. Et que tu le connaissais." },
          ]),
      },
      {
        label: 'Où est-il maintenant ?',
        onPick: () =>
          this.say([
            {
              who: OWL,
              text: s.knowsBox
                ? 'Dans « Barils en Folie », sur l’étagère des jeux. Glisse-toi dans la boîte !'
                : 'Aucune idée. Mais quiconque emprunte une boîte laisse une fiche d’emprunt…',
            },
          ]),
      },
      { label: 'Rien, merci.', onPick: () => undefined },
    ]);
  }

  private talkRat(): void {
    this.say([
      { who: RAT, text: 'Un conseil de rat des rayons : dans « Barils en Folie », le gorille porte un collier magique.' },
      { who: RAT, text: "Il n'est pas méchant. C'est le collier. Trouve le parchemin du magicien et tu pourras l'en libérer." },
    ]);
  }

  private searchCards(): void {
    const s = state();
    if (s.knowsBox) {
      this.say([{ who: HERO, text: 'J’ai déjà trouvé la bonne fiche : « Barils en Folie », emprunté par M.B.' }]);
      return;
    }
    this.say(
      [
        { who: HERO, text: '« Le Labyrinthe Glouton » — rendu il y a trois jours.' },
        { who: HERO, text: '« Le Ver de Bibliothèque » — jamais emprunté. Pauvre jeu.' },
        { who: HERO, text: '« Barils en Folie » — emprunté CETTE NUIT par « M.B. ». L’encre est encore fraîche !' },
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
    let status = 'sabotée par le magicien';
    if (b.magicianGone) status = 'le magicien est parti';
    if (b.fading > 0) status += ', elle s’efface…';
    this.ask({ who: HERO, text: "L'étagère des jeux. Dans laquelle entrer ?" }, [
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
                ? 'Tu y es tombé tout à l’heure. Il faudra l’explorer… bientôt (pas encore dans le prototype).'
                : 'Ce mini-jeu arrive bientôt (pas encore dans le prototype).',
            },
          ]),
      },
      { label: 'Rien pour le moment', onPick: () => undefined },
    ]);
  }

  private enterBox(): void {
    this.busy = true;
    this.tweens.add({
      targets: this.hero,
      x: 790,
      y: 430,
      scale: 0.2,
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


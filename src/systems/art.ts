// Graphismes provisoires dessinés en code, dans l'identité de la Ludoteca :
// poupées et jouets façon stop-motion, bois sombre, lampes ambrées, lueurs violettes et turquoise.
// Toute image déposée dans src/assets/sprites/<clé>.png (ou .webp, .jpg) remplace le dessin de même clé.

import Phaser from 'phaser';

export const INK = 0x140a06;

export const COLORS = {
  shadow: 0x140b07,
  night: 0x1d120c,
  wall: 0x2e1b12,
  wood: 0x6b3d22,
  woodDark: 0x3f2416,
  woodLight: 0x8c5532,
  amber: 0xf2b25c,
  lamp: 0xffd38a,
  carpet: 0x7e2a20,
  carpetDark: 0x521a14,
  cream: 0xd9b98a,
  navy: 0x22284a,
  navyLight: 0x343c6b,
  gold: 0xd9a441,
  magic: 0x9a6cff,
  teal: 0x3fd0c0,
  moon: 0xe9eef5,
  red: 0xc0392b,
  girder: 0xb8432f,
  ladder: 0xd9a441,
};

// Couleurs des boîtes de jeux empilées (comme sur l'image de référence).
export const BOX_COLORS = [0x22284a, 0x3a2457, 0x4a1f24, 0x1f3a3a, 0x2b2f52, 0x5a3418];

type Draw = (g: Phaser.GameObjects.Graphics) => void;

function make(scene: Phaser.Scene, key: string, w: number, h: number, draw: Draw): void {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  draw(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

// Points de couture, pour l'aspect « jouet en tissu ».
function stitches(g: Phaser.GameObjects.Graphics, x1: number, y1: number, x2: number, y2: number, color = 0xf3e2c0): void {
  const n = Math.max(2, Math.floor(Math.hypot(x2 - x1, y2 - y1) / 6));
  g.lineStyle(1.5, color, 0.9);
  for (let i = 0; i < n; i += 2) {
    const a = i / n;
    const b = (i + 1) / n;
    g.lineBetween(x1 + (x2 - x1) * a, y1 + (y2 - y1) * a, x1 + (x2 - x1) * b, y1 + (y2 - y1) * b);
  }
}

// Nella : couettes noires et rubans rouges, frange, grands yeux sombres, gilet marine, jupe rouge à pois, clé au cou.
function nella(g: Phaser.GameObjects.Graphics, step: number): void {
  const skin = 0xeac7a2;
  // jambes et chaussures (deux poses pour la marche)
  const lx = step === 0 ? 0 : 3;
  g.fillStyle(0xe9dcc8);
  g.fillRect(26 - lx, 92, 5, 14);
  g.fillRect(34 + lx, 92, 5, 14);
  g.fillStyle(COLORS.red);
  g.fillEllipse(27 - lx, 107, 11, 6);
  g.fillEllipse(38 + lx, 107, 11, 6);
  // jupe à pois
  g.fillStyle(COLORS.red);
  g.fillPoints([new Phaser.Geom.Point(20, 70), new Phaser.Geom.Point(45, 70), new Phaser.Geom.Point(52, 95), new Phaser.Geom.Point(13, 95)], true);
  g.fillStyle(0x1a0d0a);
  for (const [x, y] of [[20, 78], [30, 75], [40, 79], [25, 87], [36, 88], [46, 90], [17, 92]]) g.fillCircle(x, y, 1.8);
  // gilet tricoté
  g.fillStyle(COLORS.navy);
  g.fillRoundedRect(18, 50, 29, 26, 6);
  g.fillRoundedRect(12, 52, 8, 24, 4);
  g.fillRoundedRect(45, 52, 8, 24, 4);
  g.lineStyle(1, COLORS.navyLight, 0.7);
  for (let y = 54; y < 74; y += 4) g.lineBetween(20, y, 45, y);
  g.fillStyle(skin);
  g.fillCircle(16, 77, 3.5);
  g.fillCircle(49, 77, 3.5);
  // clé en laiton
  g.lineStyle(1, COLORS.gold);
  g.lineBetween(28, 50, 32, 60);
  g.lineBetween(37, 50, 32, 60);
  g.fillStyle(COLORS.gold);
  g.fillCircle(32, 61, 2.4);
  g.fillRect(31.2, 62, 1.6, 6);
  // cou et tête de poupée (grosse tête)
  g.fillStyle(skin);
  g.fillRect(29, 44, 7, 7);
  g.fillCircle(32, 30, 18);
  // cheveux : calotte, mèches sur les côtés, frange
  g.fillStyle(0x0d0907);
  g.fillEllipse(32, 22, 40, 26);
  g.fillRect(14, 22, 6, 20);
  g.fillRect(44, 22, 6, 20);
  g.fillPoints(
    [
      new Phaser.Geom.Point(15, 20),
      new Phaser.Geom.Point(49, 20),
      new Phaser.Geom.Point(48, 28),
      new Phaser.Geom.Point(43, 25),
      new Phaser.Geom.Point(39, 29),
      new Phaser.Geom.Point(34, 25),
      new Phaser.Geom.Point(29, 29),
      new Phaser.Geom.Point(24, 25),
      new Phaser.Geom.Point(19, 29),
      new Phaser.Geom.Point(16, 26),
    ],
    true,
  );
  // couettes dressées comme des antennes
  g.fillEllipse(9, 9, 14, 18);
  g.fillEllipse(55, 9, 14, 18);
  g.fillTriangle(4, 2, 2, -2, 10, 4);
  g.fillTriangle(60, 2, 62, -2, 54, 4);
  // rubans rouges
  g.fillStyle(0xd8262f);
  g.fillTriangle(12, 14, 20, 18, 12, 22);
  g.fillTriangle(24, 14, 16, 18, 24, 22);
  g.fillTriangle(40, 14, 48, 18, 40, 22);
  g.fillTriangle(52, 14, 44, 18, 52, 22);
  // grands yeux sombres et brillants
  g.fillStyle(0x0b0706);
  g.fillEllipse(25, 33, 11, 12);
  g.fillEllipse(39, 33, 11, 12);
  g.fillStyle(0xffffff, 0.95);
  g.fillCircle(27, 30, 2.2);
  g.fillCircle(41, 30, 2.2);
  g.fillStyle(0xffffff, 0.5);
  g.fillCircle(23, 36, 1);
  g.fillCircle(37, 36, 1);
  // joues et sourire en coin
  g.fillStyle(0xe58f86, 0.45);
  g.fillCircle(20, 40, 3);
  g.fillCircle(44, 40, 3);
  g.lineStyle(1.4, 0x7a3a2a);
  g.beginPath();
  g.arc(33, 39, 4, 0.2, 2.4);
  g.strokePath();
}

function gameBox(g: Phaser.GameObjects.Graphics, color: number, motif: string): void {
  g.fillStyle(color);
  g.fillRoundedRect(4, 4, 112, 142, 6);
  g.lineStyle(3, COLORS.gold, 0.9);
  g.strokeRoundedRect(10, 10, 100, 130, 4);
  g.lineStyle(1, COLORS.gold, 0.5);
  g.strokeRoundedRect(14, 14, 92, 122, 3);
  g.fillStyle(0x000000, 0.3);
  g.fillRoundedRect(20, 30, 80, 66, 4);
  g.lineStyle(3, COLORS.lamp);
  if (motif === 'barrels') {
    for (let i = 0; i < 3; i++) g.lineBetween(26, 46 + i * 18, 94, 40 + i * 18 + (i % 2) * 8);
    g.fillStyle(0xb5652e);
    g.fillCircle(44, 54, 6);
    g.fillCircle(74, 74, 6);
  } else if (motif === 'maze') {
    g.strokeRect(28, 38, 64, 50);
    g.lineBetween(28, 63, 70, 63);
    g.lineBetween(52, 38, 52, 52);
    g.fillStyle(COLORS.lamp);
    g.fillCircle(40, 76, 6);
  } else {
    g.fillStyle(COLORS.teal);
    for (let i = 0; i < 6; i++) g.fillCircle(32 + i * 10, 64 + Math.sin(i) * 9, 4.5);
  }
  g.fillStyle(COLORS.magic, 0.6);
  g.fillCircle(60, 120, 5);
}

export function makeArt(scene: Phaser.Scene): void {
  make(scene, 'hero', 64, 112, (g) => nella(g, 0));
  make(scene, 'hero-walk', 64, 112, (g) => nella(g, 1));

  // La main lumineuse : la seule trace du codeur, que le joueur aperçoit et que Nella ne voit jamais.
  make(scene, 'mano', 80, 90, (g) => {
    for (let r = 40; r > 0; r -= 4) {
      g.fillStyle(0xbfe9ff, 0.025);
      g.fillCircle(40, 46, r);
    }
    g.fillStyle(0xf7f7ff);
    g.fillRoundedRect(22, 40, 34, 34, 10);
    g.fillRoundedRect(30, 8, 11, 40, 5);
    g.fillRoundedRect(41, 34, 9, 18, 4);
    g.fillRoundedRect(49, 38, 9, 16, 4);
    g.fillRoundedRect(14, 48, 12, 10, 5);
    g.fillStyle(0xd8dcef);
    g.fillRect(24, 72, 30, 8);
    g.lineStyle(1.5, 0xb8bdd6);
    g.lineBetween(30, 52, 50, 52);
    g.lineBetween(30, 58, 50, 58);
  });

  // Il Sigillo : sceau de cire violet qui remplace le gorille dans les jeux corrigés.
  make(scene, 'sigillo', 76, 76, (g) => {
    for (let r = 38; r > 26; r -= 3) {
      g.fillStyle(COLORS.magic, 0.06);
      g.fillCircle(38, 38, r);
    }
    g.fillStyle(0x6b2fb8);
    g.fillCircle(38, 38, 25);
    g.fillCircle(20, 30, 7);
    g.fillCircle(56, 46, 7);
    g.fillCircle(30, 58, 6);
    g.fillEllipse(48, 62, 6, 12);
    g.fillStyle(0x8a4fe0);
    g.fillCircle(38, 38, 18);
    g.lineStyle(3, 0xe8d8ff);
    g.beginPath();
    g.moveTo(31, 28);
    g.lineTo(26, 38);
    g.lineTo(31, 48);
    g.moveTo(45, 28);
    g.lineTo(50, 38);
    g.lineTo(45, 48);
    g.strokePath();
    g.fillStyle(0xe8d8ff);
    g.fillCircle(38, 38, 2.5);
  });

  // Una Toppa : pièce de tissu cousue, la forme visible des correctifs.
  make(scene, 'toppa', 40, 40, (g) => {
    g.fillStyle(0x6c7a3a);
    g.fillRect(4, 4, 32, 32);
    g.lineStyle(1, 0x4d5828);
    for (let i = 8; i < 36; i += 6) g.lineBetween(4, i, 36, i);
    stitches(g, 4, 4, 36, 4);
    stitches(g, 36, 4, 36, 36);
    stitches(g, 36, 36, 4, 36);
    stitches(g, 4, 36, 4, 4);
    g.lineStyle(2, 0xf3e2c0);
    g.lineBetween(11, 13, 17, 19);
    g.lineBetween(17, 13, 11, 19);
    g.lineBetween(23, 13, 29, 19);
    g.lineBetween(29, 13, 23, 19);
  });

  // Madame Hulotte : chouette en feutre, lunettes dorées.
  make(scene, 'owl', 90, 104, (g) => {
    g.fillStyle(0x7a5233);
    g.fillEllipse(45, 60, 70, 80);
    g.fillStyle(0xcfae80);
    g.fillEllipse(45, 70, 42, 48);
    stitches(g, 26, 52, 26, 92, 0x5a3a22);
    stitches(g, 64, 52, 64, 92, 0x5a3a22);
    g.fillStyle(0x7a5233);
    g.fillTriangle(15, 32, 22, 4, 32, 26);
    g.fillTriangle(75, 32, 68, 4, 58, 26);
    g.fillStyle(0xfff3dc);
    g.fillCircle(32, 40, 12);
    g.fillCircle(58, 40, 12);
    g.lineStyle(2.5, COLORS.gold);
    g.strokeCircle(32, 40, 12);
    g.strokeCircle(58, 40, 12);
    g.lineBetween(44, 40, 46, 40);
    g.fillStyle(0x1a0d0a);
    g.fillCircle(33, 41, 5);
    g.fillCircle(57, 41, 5);
    g.fillStyle(0xffffff);
    g.fillCircle(35, 39, 1.5);
    g.fillCircle(59, 39, 1.5);
    g.fillStyle(0xd98a2b);
    g.fillTriangle(41, 52, 49, 52, 45, 61);
  });

  // Grignote : petit rat en feutre gris, bonnet vert.
  make(scene, 'rat', 60, 48, (g) => {
    g.lineStyle(2.5, 0x8a7f73);
    g.beginPath();
    g.moveTo(8, 36);
    g.lineTo(1, 22);
    g.strokePath();
    g.fillStyle(0x8a7f73);
    g.fillEllipse(26, 33, 36, 24);
    stitches(g, 12, 33, 40, 33, 0x5d554c);
    g.fillCircle(42, 22, 12);
    g.fillCircle(36, 9, 6);
    g.fillStyle(0xe8a0a8);
    g.fillCircle(36, 9, 3);
    g.fillCircle(54, 23, 3);
    g.fillStyle(0x0b0706);
    g.fillCircle(45, 19, 3);
    g.fillStyle(0xffffff);
    g.fillCircle(46, 18, 1);
    g.fillStyle(0x3f8a5a);
    g.fillRoundedRect(37, 6, 16, 6, 2);
  });

  const gorilla = (patched: boolean): Draw => (g) => {
    g.fillStyle(0x4a3022);
    g.fillEllipse(48, 54, 76, 56);
    g.fillEllipse(14, 62, 20, 40);
    g.fillEllipse(82, 62, 20, 40);
    g.fillCircle(48, 26, 20);
    g.fillStyle(0xb88a62);
    g.fillEllipse(48, 32, 26, 18);
    g.fillStyle(0x0b0706);
    g.fillCircle(41, 22, 3);
    g.fillCircle(55, 22, 3);
    g.fillRect(42, 35, 12, 2);
    stitches(g, 28, 70, 68, 70, 0x2f1d14);
    if (patched) {
      g.fillStyle(0x6c7a3a);
      g.fillRect(36, 44, 24, 22);
      stitches(g, 36, 44, 60, 44);
      stitches(g, 60, 44, 60, 66);
      stitches(g, 60, 66, 36, 66);
      stitches(g, 36, 66, 36, 44);
      g.fillStyle(COLORS.magic);
      g.fillCircle(48, 55, 3);
    }
  };
  make(scene, 'gorilla', 96, 86, gorilla(true));
  make(scene, 'gorilla-free', 96, 86, gorilla(false));

  make(scene, 'barrel', 34, 34, (g) => {
    g.fillStyle(0x9c5527);
    g.fillCircle(17, 17, 15);
    g.lineStyle(3, 0x4a2410);
    g.strokeCircle(17, 17, 15);
    g.lineBetween(5, 11, 29, 11);
    g.lineBetween(5, 23, 29, 23);
    g.fillStyle(COLORS.magic);
    g.fillCircle(17, 17, 3);
  });

  make(scene, 'hammer', 34, 34, (g) => {
    g.fillStyle(COLORS.woodLight);
    g.fillRect(14, 12, 6, 20);
    g.fillStyle(0xb9b2a6);
    g.fillRoundedRect(4, 3, 26, 12, 3);
    g.lineStyle(1.5, 0x6d675e);
    g.strokeRoundedRect(4, 3, 26, 12, 3);
  });

  // Les ciseaux de couturière : de quoi découdre une Toppa.
  make(scene, 'scissors', 40, 34, (g) => {
    g.lineStyle(3.5, COLORS.gold);
    g.strokeCircle(9, 25, 6);
    g.strokeCircle(21, 27, 6);
    g.lineStyle(3, 0xd7dbe2);
    g.lineBetween(13, 20, 36, 4);
    g.lineBetween(17, 22, 37, 10);
    g.fillStyle(COLORS.gold);
    g.fillCircle(17, 19, 2);
  });

  make(scene, 'cartridge', 32, 36, (g) => {
    g.fillStyle(COLORS.gold);
    g.fillRoundedRect(3, 3, 26, 30, 4);
    g.lineStyle(2, 0x8a6420);
    g.strokeRoundedRect(3, 3, 26, 30, 4);
    g.fillStyle(0xfff3b0);
    g.fillRect(8, 8, 16, 10);
    g.fillStyle(0x5a4010);
    for (let i = 0; i < 4; i++) g.fillRect(7 + i * 5, 27, 3, 5);
  });

  make(scene, 'page', 32, 40, (g) => {
    g.fillStyle(0xf3e6c8);
    g.fillRect(3, 3, 26, 34);
    g.fillStyle(0xd9c7a0);
    g.fillTriangle(29, 3, 29, 12, 20, 3);
    g.lineStyle(1.5, 0x8c7c62);
    for (let i = 0; i < 5; i++) g.lineBetween(8, 12 + i * 5, 24, 12 + i * 5);
  });

  // Le livre de Nella, posé sur le bureau.
  make(scene, 'book', 52, 36, (g) => {
    g.fillStyle(0xf3e6c8);
    g.fillRect(6, 4, 42, 26);
    g.fillStyle(0x7e2a20);
    g.fillRoundedRect(2, 8, 48, 26, 3);
    g.lineStyle(2, COLORS.gold);
    g.strokeRoundedRect(7, 12, 38, 18, 2);
    g.fillStyle(COLORS.gold);
    g.fillCircle(26, 21, 3);
  });

  make(scene, 'pin', 24, 40, (g) => {
    g.fillStyle(0xb9b2a6);
    g.fillRect(11, 18, 2, 20);
    g.fillStyle(0xd8262f);
    g.fillCircle(12, 11, 9);
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(9, 8, 2.5);
  });

  // Obstacles de la poursuite : piles de boîtes de jeux et chariot de livres.
  make(scene, 'pile', 64, 72, (g) => {
    for (let i = 0; i < 4; i++) {
      const w = 58 - (i % 2) * 8;
      const x = 3 + (i % 2) * 5;
      const y = 56 - i * 17;
      g.fillStyle(BOX_COLORS[i % BOX_COLORS.length]);
      g.fillRect(x, y, w, 15);
      g.lineStyle(1.5, COLORS.gold, 0.8);
      g.strokeRect(x + 2, y + 2, w - 4, 11);
    }
  });

  make(scene, 'cart', 96, 68, (g) => {
    g.fillStyle(COLORS.wood);
    g.fillRect(6, 24, 84, 26);
    g.lineStyle(2, COLORS.woodDark);
    g.strokeRect(6, 24, 84, 26);
    const books = [0x7e2a20, 0x22284a, 0x3f6b4a, 0x6b4a1f, 0x3a2457, 0x8c5532];
    for (let i = 0; i < 7; i++) {
      g.fillStyle(books[i % books.length]);
      g.fillRect(10 + i * 11, 6 + (i % 3) * 4, 10, 18 - (i % 3) * 4);
    }
    g.fillStyle(0x1a0d0a);
    g.fillCircle(22, 58, 8);
    g.fillCircle(74, 58, 8);
    g.fillStyle(COLORS.gold);
    g.fillCircle(22, 58, 2.5);
    g.fillCircle(74, 58, 2.5);
  });

  make(scene, 'box-barrels', 120, 150, (g) => gameBox(g, 0x4a1f24, 'barrels'));
  make(scene, 'box-maze', 120, 150, (g) => gameBox(g, 0x22284a, 'maze'));
  make(scene, 'box-worm', 120, 150, (g) => gameBox(g, 0x1f3a3a, 'worm'));

  // Vignette : assombrit les bords, comme la lumière d'un plateau de tournage.
  make(scene, 'vignette', 1280, 720, (g) => {
    for (let i = 0; i < 24; i++) {
      g.lineStyle(14, 0x000000, 0.05 + i * 0.012);
      g.strokeRoundedRect(-i * 12 + 280, -i * 12 + 160, 720 + i * 24, 400 + i * 24, 200);
    }
  });

  // Lueur douce, réutilisée pour les lampes et la magie.
  make(scene, 'glow', 128, 128, (g) => {
    for (let r = 64; r > 0; r -= 4) {
      g.fillStyle(0xffffff, 0.035);
      g.fillCircle(64, 64, r);
    }
  });
}

// Le léger « tremblement » des films en stop-motion : la poupée bouge par à-coups, 12 fois par seconde.
export function stopMotion(scene: Phaser.Scene, target: Phaser.GameObjects.Image, amount = 1): void {
  const baseAngle = target.angle;
  scene.time.addEvent({
    delay: 1000 / 12,
    loop: true,
    callback: () => {
      if (!target.active || target.getData('still')) return;
      target.setAngle(baseAngle + Phaser.Math.FloatBetween(-0.7, 0.7) * amount);
    },
  });
}

// Poussières lumineuses qui flottent dans l'air de la bibliothèque.
export function motes(scene: Phaser.Scene, count: number, depth = 5): void {
  for (let i = 0; i < count; i++) {
    const tint = Phaser.Utils.Array.GetRandom([COLORS.magic, COLORS.teal, COLORS.lamp]);
    const m = scene.add
      .image(Phaser.Math.Between(0, 1280), Phaser.Math.Between(40, 600), 'glow')
      .setScale(Phaser.Math.FloatBetween(0.08, 0.2))
      .setTint(tint)
      .setAlpha(Phaser.Math.FloatBetween(0.3, 0.8))
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(depth);
    scene.tweens.add({
      targets: m,
      y: m.y - Phaser.Math.Between(30, 90),
      x: m.x + Phaser.Math.Between(-40, 40),
      alpha: 0.1,
      duration: Phaser.Math.Between(3000, 7000),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
  }
}

// Images fournies par l'équipe : elles remplacent les dessins provisoires de même clé.
const SPRITES = import.meta.glob('../assets/sprites/*.{png,webp,jpg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const PORTRAITS = import.meta.glob('../assets/portraits/*.{png,webp,jpg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.(png|webp|jpg)$/, '');

export function preloadArt(scene: Phaser.Scene): void {
  for (const [path, url] of Object.entries(SPRITES)) scene.load.image(keyOf(path), url);
  for (const [path, url] of Object.entries(PORTRAITS)) scene.load.image(`portrait-${keyOf(path)}`, url);
}

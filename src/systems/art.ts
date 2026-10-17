// Graphismes provisoires, dessinés en code. Ils seront remplacés par les vrais dessins de l'équipe.

import Phaser from 'phaser';

export const INK = 0x1b1026;

export const COLORS = {
  night: 0x1d1530,
  wall: 0x3a2a55,
  wallDark: 0x2a1f40,
  wood: 0x8a4f2b,
  woodDark: 0x5c3119,
  floor: 0x4b3a2e,
  floorLight: 0x5e4a3b,
  gold: 0xf6c945,
  girder: 0xd8414f,
  ladder: 0x5fd3e6,
  magic: 0xb06cff,
};

const BOOK_COLORS = [0xd8414f, 0x3fa7d6, 0xf6c945, 0x59cd90, 0xee8434, 0xb06cff, 0xfafafa];

type Draw = (g: Phaser.GameObjects.Graphics) => void;

function make(scene: Phaser.Scene, key: string, w: number, h: number, draw: Draw): void {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  draw(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

function mouse(g: Phaser.GameObjects.Graphics, body: number, outfit: number, bow: boolean): void {
  g.lineStyle(3, INK);
  // queue
  g.beginPath();
  g.moveTo(10, 50);
  g.lineTo(2, 44);
  g.lineTo(4, 34);
  g.strokePath();
  // corps (salopette)
  g.fillStyle(outfit);
  g.fillRoundedRect(10, 34, 28, 26, 8);
  g.strokeRoundedRect(10, 34, 28, 26, 8);
  // pieds
  g.fillStyle(INK);
  g.fillEllipse(17, 61, 12, 5);
  g.fillEllipse(32, 61, 12, 5);
  // tête
  g.fillStyle(body);
  g.fillCircle(26, 22, 14);
  g.strokeCircle(26, 22, 14);
  // oreilles
  g.fillStyle(body);
  g.fillCircle(14, 9, 9);
  g.strokeCircle(14, 9, 9);
  g.fillCircle(36, 8, 9);
  g.strokeCircle(36, 8, 9);
  g.fillStyle(0xf4a6b8);
  g.fillCircle(14, 9, 5);
  g.fillCircle(36, 8, 5);
  // museau
  g.fillStyle(body);
  g.fillEllipse(38, 26, 14, 10);
  g.strokeEllipse(38, 26, 14, 10);
  g.fillStyle(0xf47a9a);
  g.fillCircle(45, 25, 3);
  // œil
  g.fillStyle(0xffffff);
  g.fillCircle(31, 18, 5);
  g.fillStyle(INK);
  g.fillCircle(33, 18, 2.5);
  if (bow) {
    g.fillStyle(0xff5fa2);
    g.fillTriangle(20, 4, 28, 10, 20, 16);
    g.fillTriangle(36, 4, 28, 10, 36, 16);
    g.lineStyle(2, INK);
    g.strokeTriangle(20, 4, 28, 10, 20, 16);
    g.strokeTriangle(36, 4, 28, 10, 36, 16);
  }
}

export function makeArt(scene: Phaser.Scene): void {
  make(scene, 'hero', 50, 66, (g) => mouse(g, 0xb8b4c4, 0x3f7fd9, false));
  make(scene, 'lila', 50, 66, (g) => mouse(g, 0xe8dcc8, 0xff8fb8, true));

  make(scene, 'magician', 64, 96, (g) => {
    g.lineStyle(3, INK);
    // robe
    g.fillStyle(0x6a3fb8);
    g.fillTriangle(32, 34, 6, 94, 58, 94);
    g.strokeTriangle(32, 34, 6, 94, 58, 94);
    g.fillStyle(COLORS.gold);
    g.fillCircle(24, 70, 3);
    g.fillCircle(40, 82, 3);
    g.fillCircle(34, 58, 2.5);
    // tête
    g.fillStyle(0xf2c9a0);
    g.fillCircle(32, 36, 12);
    g.strokeCircle(32, 36, 12);
    // barbe
    g.fillStyle(0xf5f5f5);
    g.fillTriangle(20, 40, 44, 40, 32, 64);
    g.strokeTriangle(20, 40, 44, 40, 32, 64);
    // yeux malicieux
    g.fillStyle(INK);
    g.fillRect(25, 32, 5, 2);
    g.fillRect(35, 32, 5, 2);
    // chapeau
    g.fillStyle(0x6a3fb8);
    g.fillTriangle(32, 0, 14, 28, 50, 28);
    g.strokeTriangle(32, 0, 14, 28, 50, 28);
    g.fillStyle(0x4a2a88);
    g.fillRoundedRect(8, 24, 48, 7, 3);
    g.strokeRoundedRect(8, 24, 48, 7, 3);
    g.fillStyle(COLORS.gold);
    g.fillCircle(32, 15, 4);
  });

  make(scene, 'hat', 50, 40, (g) => {
    g.lineStyle(3, INK);
    g.fillStyle(0x6a3fb8);
    g.fillTriangle(25, 2, 9, 30, 41, 30);
    g.strokeTriangle(25, 2, 9, 30, 41, 30);
    g.fillStyle(0x4a2a88);
    g.fillRoundedRect(3, 28, 44, 8, 3);
    g.strokeRoundedRect(3, 28, 44, 8, 3);
    g.fillStyle(COLORS.gold);
    g.fillCircle(25, 17, 4);
  });

  make(scene, 'owl', 84, 96, (g) => {
    g.lineStyle(3, INK);
    g.fillStyle(0x9a6a3c);
    g.fillEllipse(42, 56, 66, 74);
    g.strokeEllipse(42, 56, 66, 74);
    g.fillStyle(0xe8cfa0);
    g.fillEllipse(42, 66, 40, 44);
    // aigrettes
    g.fillStyle(0x9a6a3c);
    g.fillTriangle(14, 30, 22, 4, 30, 26);
    g.fillTriangle(70, 30, 62, 4, 54, 26);
    g.strokeTriangle(14, 30, 22, 4, 30, 26);
    g.strokeTriangle(70, 30, 62, 4, 54, 26);
    // lunettes
    g.fillStyle(0xffffff);
    g.fillCircle(30, 36, 11);
    g.fillCircle(54, 36, 11);
    g.strokeCircle(30, 36, 11);
    g.strokeCircle(54, 36, 11);
    g.lineBetween(41, 36, 43, 36);
    g.fillStyle(INK);
    g.fillCircle(31, 37, 4);
    g.fillCircle(53, 37, 4);
    g.fillStyle(COLORS.gold);
    g.fillTriangle(38, 46, 46, 46, 42, 56);
  });

  make(scene, 'rat', 56, 44, (g) => {
    g.lineStyle(3, INK);
    g.beginPath();
    g.moveTo(8, 34);
    g.lineTo(1, 22);
    g.strokePath();
    g.fillStyle(0x7d7468);
    g.fillEllipse(24, 30, 34, 22);
    g.strokeEllipse(24, 30, 34, 22);
    g.fillCircle(40, 20, 11);
    g.strokeCircle(40, 20, 11);
    g.fillCircle(34, 8, 6);
    g.strokeCircle(34, 8, 6);
    g.fillStyle(0xf47a9a);
    g.fillCircle(51, 21, 3);
    g.fillStyle(INK);
    g.fillCircle(43, 17, 2.5);
    // petit bonnet de rangeur
    g.fillStyle(0x59cd90);
    g.fillRect(36, 6, 14, 5);
  });

  const gorilla = (collar: boolean): Draw => (g) => {
    g.lineStyle(3, INK);
    g.fillStyle(0x5a3a26);
    g.fillEllipse(48, 54, 76, 56);
    g.strokeEllipse(48, 54, 76, 56);
    // bras
    g.fillEllipse(14, 62, 20, 40);
    g.strokeEllipse(14, 62, 20, 40);
    g.fillEllipse(82, 62, 20, 40);
    g.strokeEllipse(82, 62, 20, 40);
    // tête
    g.fillCircle(48, 26, 20);
    g.strokeCircle(48, 26, 20);
    g.fillStyle(0xc89a72);
    g.fillEllipse(48, 32, 26, 18);
    g.fillStyle(INK);
    g.fillCircle(41, 22, 3);
    g.fillCircle(55, 22, 3);
    g.fillRect(42, 35, 12, 2);
    if (collar) {
      g.fillStyle(COLORS.magic);
      g.fillRoundedRect(30, 42, 36, 8, 3);
      g.strokeRoundedRect(30, 42, 36, 8, 3);
      g.fillStyle(COLORS.gold);
      g.fillCircle(48, 46, 3);
    }
  };
  make(scene, 'gorilla', 96, 86, gorilla(true));
  make(scene, 'gorilla-free', 96, 86, gorilla(false));

  make(scene, 'barrel', 34, 34, (g) => {
    g.lineStyle(3, INK);
    g.fillStyle(0xb5652e);
    g.fillCircle(17, 17, 15);
    g.strokeCircle(17, 17, 15);
    g.lineStyle(3, 0x5c3119);
    g.lineBetween(6, 11, 28, 11);
    g.lineBetween(6, 23, 28, 23);
    g.fillStyle(COLORS.magic);
    g.fillCircle(17, 17, 3);
  });

  make(scene, 'hammer', 34, 34, (g) => {
    g.lineStyle(3, INK);
    g.fillStyle(COLORS.wood);
    g.fillRect(14, 12, 6, 20);
    g.strokeRect(14, 12, 6, 20);
    g.fillStyle(0xaaaacc);
    g.fillRoundedRect(4, 3, 26, 12, 3);
    g.strokeRoundedRect(4, 3, 26, 12, 3);
  });

  make(scene, 'scroll', 36, 28, (g) => {
    g.lineStyle(3, INK);
    g.fillStyle(0xf4e4bc);
    g.fillRoundedRect(4, 4, 28, 20, 4);
    g.strokeRoundedRect(4, 4, 28, 20, 4);
    g.lineStyle(2, COLORS.magic);
    g.lineBetween(9, 11, 27, 11);
    g.lineBetween(9, 17, 22, 17);
  });

  make(scene, 'cartridge', 32, 36, (g) => {
    g.lineStyle(3, INK);
    g.fillStyle(COLORS.gold);
    g.fillRoundedRect(3, 3, 26, 30, 4);
    g.strokeRoundedRect(3, 3, 26, 30, 4);
    g.fillStyle(0xfff3b0);
    g.fillRect(8, 8, 16, 10);
    g.fillStyle(INK);
    for (let i = 0; i < 4; i++) g.fillRect(7 + i * 5, 27, 3, 5);
  });

  make(scene, 'page', 32, 40, (g) => {
    g.lineStyle(3, INK);
    g.fillStyle(0xfffbea);
    g.fillRect(3, 3, 26, 34);
    g.strokeRect(3, 3, 26, 34);
    g.lineStyle(2, 0x8c7c62);
    for (let i = 0; i < 5; i++) g.lineBetween(8, 10 + i * 5, 24, 10 + i * 5);
  });

  make(scene, 'pile', 56, 64, (g) => {
    g.lineStyle(3, INK);
    for (let i = 0; i < 4; i++) {
      const c = BOOK_COLORS[(i * 3) % BOOK_COLORS.length];
      g.fillStyle(c);
      const w = 46 - (i % 2) * 8;
      const x = 5 + (i % 2) * 6;
      g.fillRect(x, 50 - i * 15, w, 13);
      g.strokeRect(x, 50 - i * 15, w, 13);
    }
  });

  make(scene, 'cart', 92, 64, (g) => {
    g.lineStyle(3, INK);
    g.fillStyle(COLORS.wood);
    g.fillRect(6, 22, 80, 26);
    g.strokeRect(6, 22, 80, 26);
    for (let i = 0; i < 6; i++) {
      g.fillStyle(BOOK_COLORS[i % BOOK_COLORS.length]);
      g.fillRect(10 + i * 12, 6 + (i % 3) * 3, 10, 18 - (i % 3) * 3);
      g.strokeRect(10 + i * 12, 6 + (i % 3) * 3, 10, 18 - (i % 3) * 3);
    }
    g.fillStyle(INK);
    g.fillCircle(20, 54, 8);
    g.fillCircle(72, 54, 8);
  });

  make(scene, 'box-barrels', 120, 150, (g) => gameBox(g, 0xd8414f, 'barrels'));
  make(scene, 'box-maze', 120, 150, (g) => gameBox(g, 0x3fa7d6, 'maze'));
  make(scene, 'box-worm', 120, 150, (g) => gameBox(g, 0x59cd90, 'worm'));
}

function gameBox(g: Phaser.GameObjects.Graphics, color: number, motif: string): void {
  g.lineStyle(4, INK);
  g.fillStyle(color);
  g.fillRoundedRect(4, 4, 112, 142, 8);
  g.strokeRoundedRect(4, 4, 112, 142, 8);
  g.fillStyle(0x000000, 0.25);
  g.fillRect(12, 34, 96, 80);
  g.lineStyle(3, 0xffffff);
  if (motif === 'barrels') {
    for (let i = 0; i < 3; i++) g.lineBetween(18, 50 + i * 22, 102, 44 + i * 22 + (i % 2) * 10);
    g.fillStyle(0xb5652e);
    g.fillCircle(40, 60, 7);
    g.fillCircle(78, 84, 7);
  } else if (motif === 'maze') {
    g.strokeRect(22, 44, 76, 60);
    g.lineBetween(22, 74, 70, 74);
    g.lineBetween(50, 44, 50, 60);
    g.fillStyle(COLORS.gold);
    g.fillCircle(36, 90, 8);
  } else {
    g.fillStyle(0xffffff);
    for (let i = 0; i < 6; i++) g.fillCircle(30 + i * 11, 74 + Math.sin(i) * 10, 5);
  }
  g.fillStyle(0xffffff, 0.9);
  g.fillRoundedRect(14, 118, 92, 20, 4);
}

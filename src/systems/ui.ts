// Boîtes de dialogue, choix et boutons, communs à toutes les scènes.

import Phaser from 'phaser';
import { INK } from './art';

export const W = 1280;
export const H = 720;
export const FONT = '"Trebuchet MS", "Segoe UI", Verdana, sans-serif';

export function textStyle(size: number, color = '#fff6e0'): Phaser.Types.GameObjects.Text.TextStyle {
  return { fontFamily: FONT, fontSize: `${size}px`, color, stroke: '#1b1026', strokeThickness: Math.max(3, size / 6) };
}

export interface Line {
  who?: string;
  text: string;
}

export interface Choice {
  label: string;
  onPick: () => void;
}

const DEPTH = 1000;

// Une boîte de dialogue en bas de l'écran. Un clic (ou Espace/Entrée) fait avancer.
export function say(scene: Phaser.Scene, lines: Line[], onDone?: () => void): void {
  let i = 0;
  const layer = scene.add.container(0, 0).setDepth(DEPTH);
  const blocker = scene.add.zone(0, 0, W, H).setOrigin(0).setInteractive();
  const panel = scene.add.graphics();
  panel.fillStyle(0x140e22, 0.92);
  panel.fillRoundedRect(40, 490, W - 80, 200, 18);
  panel.lineStyle(4, 0xf6c945);
  panel.strokeRoundedRect(40, 490, W - 80, 200, 18);
  const who = scene.add.text(72, 506, '', textStyle(26, '#f6c945'));
  const body = scene.add.text(72, 546, '', { ...textStyle(26), wordWrap: { width: W - 150 }, lineSpacing: 6 });
  const hint = scene.add.text(W - 70, 668, '▶', textStyle(22, '#f6c945')).setOrigin(1, 1);
  scene.tweens.add({ targets: hint, alpha: 0.2, duration: 500, yoyo: true, repeat: -1 });
  layer.add([blocker, panel, who, body, hint]);

  const show = () => {
    const line = lines[i];
    who.setText(line.who ?? '');
    body.setText(line.text);
  };
  const next = () => {
    i++;
    if (i >= lines.length) {
      cleanup();
      onDone?.();
    } else {
      show();
    }
  };
  const key = (e: KeyboardEvent) => {
    if (e.code === 'Space' || e.code === 'Enter') next();
  };
  const cleanup = () => {
    scene.input.keyboard?.off('keydown', key);
    layer.destroy();
  };
  blocker.on('pointerdown', next);
  scene.input.keyboard?.on('keydown', key);
  show();
}

// Une question avec plusieurs réponses possibles.
export function choose(scene: Phaser.Scene, prompt: Line, choices: Choice[]): void {
  const layer = scene.add.container(0, 0).setDepth(DEPTH);
  const blocker = scene.add.zone(0, 0, W, H).setOrigin(0).setInteractive();
  const boxH = 120 + choices.length * 62;
  const y0 = H - boxH - 30;
  const panel = scene.add.graphics();
  panel.fillStyle(0x140e22, 0.94);
  panel.fillRoundedRect(40, y0, W - 80, boxH, 18);
  panel.lineStyle(4, 0xf6c945);
  panel.strokeRoundedRect(40, y0, W - 80, boxH, 18);
  layer.add([blocker, panel]);
  if (prompt.who) layer.add(scene.add.text(72, y0 + 16, prompt.who, textStyle(26, '#f6c945')));
  layer.add(
    scene.add.text(72, y0 + (prompt.who ? 54 : 24), prompt.text, { ...textStyle(26), wordWrap: { width: W - 150 } }),
  );
  choices.forEach((c, idx) => {
    const b = button(scene, W / 2, y0 + 130 + idx * 62, `${idx + 1}. ${c.label}`, () => pick(idx), W - 200);
    layer.add(b);
  });
  const pick = (idx: number) => {
    scene.input.keyboard?.off('keydown', key);
    layer.destroy();
    choices[idx].onPick();
  };
  const key = (e: KeyboardEvent) => {
    const n = Number(e.key);
    if (n >= 1 && n <= choices.length) pick(n - 1);
  };
  scene.input.keyboard?.on('keydown', key);
}

export function button(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  width = 320,
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const bg = scene.add.graphics();
  const draw = (hover: boolean) => {
    bg.clear();
    bg.fillStyle(hover ? 0xf6c945 : 0x2c2046, 1);
    bg.fillRoundedRect(-width / 2, -24, width, 48, 12);
    bg.lineStyle(3, hover ? INK : 0xf6c945);
    bg.strokeRoundedRect(-width / 2, -24, width, 48, 12);
  };
  draw(false);
  const t = scene.add.text(0, 0, label, textStyle(24)).setOrigin(0.5);
  const hit = scene.add.zone(0, 0, width, 48).setInteractive({ useHandCursor: true });
  hit.on('pointerover', () => {
    draw(true);
    t.setColor('#1b1026').setStroke('#f6c945', 0);
  });
  hit.on('pointerout', () => {
    draw(false);
    t.setColor('#fff6e0').setStroke('#1b1026', 4);
  });
  hit.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, ev: Phaser.Types.Input.EventData) => {
    ev.stopPropagation();
    onClick();
  });
  c.add([bg, t, hit]);
  return c;
}

export function goTo(scene: Phaser.Scene, key: string, data?: object): void {
  scene.cameras.main.fadeOut(350, 0, 0, 0);
  scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => scene.scene.start(key, data));
}

export function banner(scene: Phaser.Scene, text: string, color = '#f6c945'): void {
  const t = scene.add
    .text(W / 2, H / 2 - 40, text, { ...textStyle(54, color), align: 'center' })
    .setOrigin(0.5)
    .setDepth(DEPTH - 1)
    .setScale(0.2);
  scene.tweens.add({ targets: t, scale: 1, duration: 350, ease: 'Back.Out' });
  scene.tweens.add({ targets: t, alpha: 0, delay: 1400, duration: 400, onComplete: () => t.destroy() });
}

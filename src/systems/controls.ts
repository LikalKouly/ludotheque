// Commandes des mini-jeux : clavier sur PC, boutons à l'écran sur tablette.

import Phaser from 'phaser';
import { H, W, textStyle } from './ui';

export interface Pad {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
}

export class Controls {
  private keys: Record<string, Phaser.Input.Keyboard.Key>;
  private touch: Pad = { left: false, right: false, up: false, down: false, jump: false };
  private jumpWasDown = false;

  constructor(private scene: Phaser.Scene, touchPad = true) {
    const kb = scene.input.keyboard!;
    this.keys = kb.addKeys('LEFT,RIGHT,UP,DOWN,SPACE,A,D,W,S,Q,Z') as Record<string, Phaser.Input.Keyboard.Key>;
    if (touchPad && scene.sys.game.device.input.touch) this.buildTouchPad();
  }

  get pad(): Pad {
    const k = this.keys;
    return {
      // Q/Z pour les claviers AZERTY, A/W pour les QWERTY.
      left: k.LEFT.isDown || k.A.isDown || k.Q.isDown || this.touch.left,
      right: k.RIGHT.isDown || k.D.isDown || this.touch.right,
      up: k.UP.isDown || k.W.isDown || k.Z.isDown || this.touch.up,
      down: k.DOWN.isDown || k.S.isDown || this.touch.down,
      jump: k.SPACE.isDown || this.touch.jump,
    };
  }

  // Vrai seulement à l'instant où le saut est pressé.
  jumpPressed(): boolean {
    const down = this.pad.jump;
    const pressed = down && !this.jumpWasDown;
    this.jumpWasDown = down;
    return pressed;
  }

  private buildTouchPad(): void {
    const s = this.scene;
    s.input.addPointer(3);
    const mk = (x: number, y: number, label: string, key: keyof Pad, r = 52) => {
      const g = s.add.circle(x, y, r, 0xffffff, 0.16).setStrokeStyle(3, 0xffffff, 0.5).setDepth(900);
      s.add.text(x, y, label, textStyle(30)).setOrigin(0.5).setDepth(901).setAlpha(0.8);
      g.setInteractive();
      const on = () => (this.touch[key] = true);
      const off = () => (this.touch[key] = false);
      g.on('pointerdown', on);
      g.on('pointerup', off);
      g.on('pointerout', off);
    };
    mk(90, H - 90, '◀', 'left');
    mk(210, H - 90, '▶', 'right');
    mk(W - 230, H - 150, '▲', 'up', 44);
    mk(W - 230, H - 55, '▼', 'down', 44);
    mk(W - 90, H - 100, 'SAUT', 'jump', 60);
  }
}

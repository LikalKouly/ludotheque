import Phaser from 'phaser';
import { TitleScene } from './scenes/TitleScene';
import { HubScene } from './scenes/HubScene';
import { ChaseScene } from './scenes/ChaseScene';
import { BarrelsScene } from './scenes/BarrelsScene';
import { EndScene } from './scenes/EndScene';
import { H, W, setPortraits } from './systems/ui';
import { PORTRAITS } from './systems/story';

setPortraits(PORTRAITS);

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: W,
  height: H,
  backgroundColor: '#140b07',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [TitleScene, HubScene, ChaseScene, BarrelsScene, EndScene],
});

// Accès pour les tests automatiques.
(window as unknown as { __game: Phaser.Game }).__game = game;

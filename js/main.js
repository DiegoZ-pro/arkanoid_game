// js/main.js
const config = {
  type: Phaser.AUTO,
  width: W,
  height: H,
  backgroundColor: '#0a0a1a',
  parent: 'game-container',
  scene: [MenuScene, GameScene, GameOverScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: W,
    height: H,
  }
};

new Phaser.Game(config);
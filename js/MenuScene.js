// js/MenuScene.js
class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }
 
  create() {
    sound.stopMusic();
    this.cameras.main.setBackgroundColor('#0a0a1a');
    const cx = W / 2;

    const title = this.add.text(cx, 220, 'ARKANOID', {
        fontFamily: 'monospace', fontSize: '96px', fontStyle: 'bold',
        color: '#378ADD', stroke: '#185FA5', strokeThickness: 6
    });
    title.setOrigin(0.5);
    this.tweens.add({ targets: title, y: 200, yoyo: true, repeat: -1, duration: 1200, ease: 'Sine.easeInOut' });

    ['NIVEL 1', 'NIVEL 2', 'NIVEL 3'].forEach((t, i) => {
        const btn = this.add.rectangle(cx, 480 + i * 130, 380, 80, 0x185FA5, 1)
        .setInteractive({ useHandCursor: true });
        this.add.text(cx, 480 + i * 130, t, {
        fontFamily: 'monospace', fontSize: '36px', color: '#E6F1FB'
        }).setOrigin(0.5);
        btn.on('pointerover', () => btn.setFillStyle(0x378ADD));
        btn.on('pointerout',  () => btn.setFillStyle(0x185FA5));
        btn.on('pointerdown', () => this.scene.start('Game', { level: i }));
    });

    this.add.text(cx, H - 50, 'usa el ratón para mover la paleta', {
        fontFamily: 'monospace', fontSize: '22px', color: '#888780'
    }).setOrigin(0.5);
    }
}

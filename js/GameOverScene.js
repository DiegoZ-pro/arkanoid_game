// js/GameOverScene.js
class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }
 
  init(data) {
    this.score = data.score || 0;
    this.win   = data.win   || false;
    this.level = data.level || 0;
  }
 
  create() {
    this.cameras.main.setBackgroundColor('#0a0a1a');
    const cx = W / 2;
    this.add.text(cx, 340, this.win ? '¡GANASTE!' : 'GAME OVER', {
        fontFamily: 'monospace', fontSize: '80px', fontStyle: 'bold',
        color: this.win ? '#C0DD97' : '#F0997B',
        stroke: '#0a0a1a', strokeThickness: 4
    }).setOrigin(0.5);
    this.add.text(cx, 480, 'PUNTUACIÓN', {
        fontFamily: 'monospace', fontSize: '30px', color: '#888780'
    }).setOrigin(0.5);
    this.add.text(cx, 550, String(this.score), {
        fontFamily: 'monospace', fontSize: '70px', color: '#B5D4F4', fontStyle: 'bold'
    }).setOrigin(0.5);

    const btn = this.add.rectangle(cx, 700, 340, 80, 0x185FA5, 1).setInteractive({ useHandCursor: true });
    this.add.text(cx, 700, 'MENÚ PRINCIPAL', {
        fontFamily: 'monospace', fontSize: '28px', color: '#E6F1FB'
    }).setOrigin(0.5);
    btn.on('pointerover', () => btn.setFillStyle(0x378ADD));
    btn.on('pointerout',  () => btn.setFillStyle(0x185FA5));
    btn.on('pointerdown', () => this.scene.start('Menu'));

    if (!this.win) {
        const btn2 = this.add.rectangle(cx, 820, 340, 80, 0x3B6D11, 1).setInteractive({ useHandCursor: true });
        this.add.text(cx, 820, 'REINTENTAR', {
        fontFamily: 'monospace', fontSize: '28px', color: '#EAF3DE'
        }).setOrigin(0.5);
        btn2.on('pointerover', () => btn2.setFillStyle(0x639922));
        btn2.on('pointerout',  () => btn2.setFillStyle(0x3B6D11));
        btn2.on('pointerdown', () => this.scene.start('Game', { level: this.level }));
    }
    }
}

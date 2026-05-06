// js/GameOverScene.js
class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }

  init(data) {
    this.score = data.score || 0;
    this.win   = data.win   || false;
    this.level = data.level || 0;
  }

  create() {
    this.cameras.main.setBackgroundColor('#000008');
    const cx = W / 2;
    const cy = H / 2;

    // ── Estrellas ──
    this.stars = [];
    for (let i = 0; i < 300; i++) {
      const size  = Phaser.Math.FloatBetween(0.5, 3);
      const speed = size * 0.4;
      const s = this.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        size, 0xffffff,
        Phaser.Math.FloatBetween(0.3, 1)
      );
      this.stars.push({ obj: s, speed });
    }

    // ── Partículas de color ──
    this.particles = [];
    const pColors = this.win
      ? [0x00ff88, 0xffff00, 0x00ffff, 0xffffff]
      : [0xff0044, 0xff4400, 0xff00ff, 0x440000];
    for (let i = 0; i < 50; i++) {
      const p = this.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        Phaser.Math.Between(2, 6),
        pColors[Phaser.Math.Between(0, 3)],
        Phaser.Math.FloatBetween(0.2, 0.8)
      );
      this.particles.push({
        obj: p,
        vx: Phaser.Math.FloatBetween(-0.6, 0.6),
        vy: Phaser.Math.FloatBetween(-1.0, -0.2),
      });
    }

    // ── Scanlines ──
    const scanGfx = this.add.graphics();
    for (let y = 0; y < H; y += 4) {
      scanGfx.fillStyle(0x000000, 0.08);
      scanGfx.fillRect(0, y, W, 2);
    }
    scanGfx.setDepth(100);

    // ── Marco neón exterior ──
    const neonColor = this.win ? 0x00ff88 : 0xff0044;
    const neonHex   = this.win ? '#00ff88' : '#ff0044';
    const frameGfx  = this.add.graphics();
    frameGfx.lineStyle(3, neonColor, 0.4);
    frameGfx.strokeRect(40, 40, W - 80, H - 80);
    frameGfx.lineStyle(1, neonColor, 0.15);
    frameGfx.strokeRect(60, 60, W - 120, H - 120);

    // ── Panel central ──
    const panelGfx = this.add.graphics();
    panelGfx.fillStyle(0x000010, 0.85);
    panelGfx.fillRect(cx - 480, cy - 300, 960, 600);
    panelGfx.lineStyle(2, neonColor, 0.7);
    panelGfx.strokeRect(cx - 480, cy - 300, 960, 600);
    // Línea decorativa interior
    panelGfx.lineStyle(1, neonColor, 0.2);
    panelGfx.strokeRect(cx - 465, cy - 285, 930, 570);

    // ── Título principal ──
    const titleText = this.win ? '¡VICTORIA!' : 'GAME  OVER';
    const titleColor = this.win ? '#00ff88' : '#ff0044';
    const titleStroke = this.win ? '#005522' : '#550000';

    // Sombra
    this.add.text(cx + 6, cy - 220 + 6, titleText, {
      fontFamily: 'monospace',
      fontSize: '110px',
      fontStyle: 'bold',
      color: titleStroke,
    }).setOrigin(0.5).setAlpha(0.4);

    // Título
    this.titleObj = this.add.text(cx, cy - 220, titleText, {
      fontFamily: 'monospace',
      fontSize: '110px',
      fontStyle: 'bold',
      color: titleColor,
      stroke: titleStroke,
      strokeThickness: 8,
    }).setOrigin(0.5);

    // Pulso del título
    this.tweens.add({
      targets: this.titleObj,
      scaleX: 1.03, scaleY: 1.03,
      yoyo: true, repeat: -1,
      duration: 800, ease: 'Sine.easeInOut'
    });

    // Parpadeo
    this.time.addEvent({
      delay: 2500, loop: true,
      callback: () => {
        this.tweens.add({
          targets: this.titleObj,
          alpha: 0.1, yoyo: true, repeat: 2,
          duration: 70,
          onComplete: () => this.titleObj.setAlpha(1)
        });
      }
    });

    // ── Separador ──
    const sepGfx = this.add.graphics();
    sepGfx.lineStyle(2, neonColor, 0.5);
    sepGfx.lineBetween(cx - 400, cy - 100, cx + 400, cy - 100);
    sepGfx.lineStyle(1, neonColor, 0.2);
    sepGfx.lineBetween(cx - 380, cy - 94, cx + 380, cy - 94);

    // ── Puntuación ──
    this.add.text(cx, cy - 60, 'PUNTUACIÓN FINAL', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#445566',
    }).setOrigin(0.5);

    // Score animado
    this.scoreDisplay = 0;
    this.scoreFinal   = this.score;
    this.scoreTxt = this.add.text(cx, cy + 10, '0', {
      fontFamily: 'monospace',
      fontSize: '90px',
      fontStyle: 'bold',
      color: '#B5D4F4',
      stroke: '#0a1a2a',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Animación conteo del score
    this.time.addEvent({
      delay: 20,
      repeat: 60,
      callback: () => {
        this.scoreDisplay = Math.min(
          this.scoreDisplay + Math.ceil(this.scoreFinal / 60),
          this.scoreFinal
        );
        this.scoreTxt.setText(String(this.scoreDisplay));
      }
    });

    // Mensaje según resultado
    const msg = this.win
      ? '¡Completaste todos los niveles!'
      : `Llegaste hasta el nivel ${this.level + 1}`;
    this.add.text(cx, cy + 90, msg, {
      fontFamily: 'monospace',
      fontSize: '26px',
      color: '#667788',
    }).setOrigin(0.5);

    // ── Separador inferior ──
    const sep2 = this.add.graphics();
    sep2.lineStyle(2, neonColor, 0.5);
    sep2.lineBetween(cx - 400, cy + 130, cx + 400, cy + 130);

    // ── Botones ──
    const buttons = this.win
      ? [
          { label: '⌂  MENÚ PRINCIPAL', color: 0x001133, neon: '#4488ff', glow: 0x0055ff, action: () => this.scene.start('Menu') },
        ]
      : [
          { label: '↺  REINTENTAR',      color: 0x332200, neon: '#ffaa00', glow: 0xffaa00, action: () => this.scene.start('Game', { level: this.level }) },
          { label: '⌂  MENÚ PRINCIPAL',  color: 0x001133, neon: '#4488ff', glow: 0x0055ff, action: () => this.scene.start('Menu') },
        ];

    const totalBtns  = buttons.length;
    const btnSpacing = 110;
    const startY     = this.win
      ? cy + 210
      : cy + 160;

    buttons.forEach((bd, i) => {
      const by = startY + i * btnSpacing;

      // Sombra
      this.add.rectangle(cx + 5, by + 5, 520, 76, 0x000000, 0.5);

      // Fondo
      const bg = this.add.rectangle(cx, by, 520, 76, bd.color, 1)
        .setInteractive({ useHandCursor: true });

      // Borde neón
      const border = this.add.graphics();
      border.lineStyle(3, bd.glow, 0.9);
      border.strokeRect(cx - 260, by - 38, 520, 76);

      // Texto
      const lbl = this.add.text(cx, by, bd.label, {
        fontFamily: 'monospace',
        fontSize: '38px',
        fontStyle: 'bold',
        color: bd.neon,
      }).setOrigin(0.5);

      // Flechas laterales
      const arrowL = this.add.text(cx - 230, by, '▶', {
        fontFamily: 'monospace', fontSize: '26px', color: bd.neon
      }).setOrigin(0.5).setAlpha(0);
      const arrowR = this.add.text(cx + 230, by, '◀', {
        fontFamily: 'monospace', fontSize: '26px', color: bd.neon
      }).setOrigin(0.5).setAlpha(0);

      // Hover
      bg.on('pointerover', () => {
        bg.setFillStyle(bd.glow, 0.2);
        border.clear();
        border.lineStyle(4, bd.glow, 1);
        border.strokeRect(cx - 260, by - 38, 520, 76);
        lbl.setScale(1.06);
        arrowL.setAlpha(1); arrowR.setAlpha(1);
        sound.paddle();
      });
      bg.on('pointerout', () => {
        bg.setFillStyle(bd.color, 1);
        border.clear();
        border.lineStyle(3, bd.glow, 0.9);
        border.strokeRect(cx - 260, by - 38, 520, 76);
        lbl.setScale(1);
        arrowL.setAlpha(0); arrowR.setAlpha(0);
      });
      bg.on('pointerdown', () => {
        this.cameras.main.flash(300, 0, 255, 255);
        this.time.delayedCall(300, () => bd.action());
      });
    });

    // ── Pie ──
    this.add.text(cx, H - 40, '© 2025  ARKANOID  PHASER 3', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#223344',
    }).setOrigin(0.5);
  }

  update() {
    this.stars.forEach(s => {
      s.obj.y += s.speed;
      if (s.obj.y > H + 5) {
        s.obj.y = -5;
        s.obj.x = Phaser.Math.Between(0, W);
      }
    });

    this.particles.forEach(p => {
      p.obj.x += p.vx;
      p.obj.y += p.vy;
      if (p.obj.y < -10) {
        p.obj.y = H + 10;
        p.obj.x = Phaser.Math.Between(0, W);
      }
      if (p.obj.x < 0 || p.obj.x > W) p.vx *= -1;
    });
  }
}
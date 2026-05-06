// js/MenuScene.js
class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    this.cameras.main.setBackgroundColor('#000008');
    const cx = W / 2;
    const cy = H / 2;

    // ── Fondo: estrellas en 3 capas de velocidad ──
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

    // ── Partículas de color flotantes ──
    this.particles = [];
    const pColors = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff88];
    for (let i = 0; i < 40; i++) {
      const p = this.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        Phaser.Math.Between(2, 5),
        pColors[Phaser.Math.Between(0, 3)],
        Phaser.Math.FloatBetween(0.2, 0.7)
      );
      this.particles.push({
        obj: p,
        vx: Phaser.Math.FloatBetween(-0.5, 0.5),
        vy: Phaser.Math.FloatBetween(-0.8, -0.2),
      });
    }

    // ── Scanlines ──
    const scanGfx = this.add.graphics();
    for (let y = 0; y < H; y += 4) {
      scanGfx.fillStyle(0x000000, 0.08);
      scanGfx.fillRect(0, y, W, 2);
    }
    scanGfx.setDepth(100);

    // ── Líneas de neón decorativas ──
    const lineGfx = this.add.graphics();
    lineGfx.lineStyle(2, 0x00ffff, 0.15);
    lineGfx.strokeRect(40, 40, W - 80, H - 80);
    lineGfx.lineStyle(1, 0xff00ff, 0.1);
    lineGfx.strokeRect(55, 55, W - 110, H - 110);

    // ── Logo ARKANOID ──
    // Sombra del logo
    this.add.text(cx + 6, cy - 320 + 6, 'ARKANOID', {
      fontFamily: 'monospace',
      fontSize: '130px',
      fontStyle: 'bold',
      color: '#ff00ff',
      alpha: 0.3
    }).setOrigin(0.5).setAlpha(0.25);

    // Logo principal
    this.logo = this.add.text(cx, cy - 320, 'ARKANOID', {
      fontFamily: 'monospace',
      fontSize: '130px',
      fontStyle: 'bold',
      color: '#00ffff',
      stroke: '#0088ff',
      strokeThickness: 8,
    }).setOrigin(0.5);

    // Pulso del logo
    this.tweens.add({
      targets: this.logo,
      scaleX: 1.04, scaleY: 1.04,
      yoyo: true, repeat: -1,
      duration: 900, ease: 'Sine.easeInOut'
    });

    // Brillo intermitente
    this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => {
        this.tweens.add({
          targets: this.logo,
          alpha: 0.2,
          yoyo: true, repeat: 2,
          duration: 80,
          onComplete: () => this.logo.setAlpha(1)
        });
      }
    });

    // Subtítulo
    this.add.text(cx, cy - 210, '— INSERT COIN —', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ffff00',
    }).setOrigin(0.5);

    // ── Botones de nivel ──
    const btnData = [
      { label: 'NIVEL  1', level: 0, color: 0x003333, neon: '#00ffff', glow: 0x00ffff },
      { label: 'NIVEL  2', level: 1, color: 0x330033, neon: '#ff00ff', glow: 0xff00ff },
      { label: 'NIVEL  3', level: 2, color: 0x332200, neon: '#ffaa00', glow: 0xffaa00 },
    ];

    btnData.forEach((bd, i) => {
      const by = cy - 60 + i * 140;

      // Sombra del botón
      this.add.rectangle(cx + 6, by + 6, 500, 80, 0x000000, 0.6);

      // Fondo del botón
      const bg = this.add.rectangle(cx, by, 500, 80, bd.color, 1)
        .setInteractive({ useHandCursor: true });

      // Borde neón
      const border = this.add.graphics();
      border.lineStyle(3, bd.glow, 0.9);
      border.strokeRect(cx - 250, by - 40, 500, 80);

      // Texto
      const lbl = this.add.text(cx, by, bd.label, {
        fontFamily: 'monospace',
        fontSize: '42px',
        fontStyle: 'bold',
        color: bd.neon,
      }).setOrigin(0.5);

      // Indicadores laterales
      const arrowL = this.add.text(cx - 220, by, '▶', {
        fontFamily: 'monospace', fontSize: '28px', color: bd.neon
      }).setOrigin(0.5).setAlpha(0);
      const arrowR = this.add.text(cx + 220, by, '◀', {
        fontFamily: 'monospace', fontSize: '28px', color: bd.neon
      }).setOrigin(0.5).setAlpha(0);

      // Hover
      bg.on('pointerover', () => {
        bg.setFillStyle(bd.glow, 0.25);
        border.clear();
        border.lineStyle(4, bd.glow, 1);
        border.strokeRect(cx - 250, by - 40, 500, 80);
        lbl.setScale(1.06);
        arrowL.setAlpha(1); arrowR.setAlpha(1);
        this.tweens.add({ targets: [arrowL, arrowR], x: { from: arrowL.x, to: arrowL.x }, alpha: 1, duration: 150 });
        sound.paddle();
      });
      bg.on('pointerout', () => {
        bg.setFillStyle(bd.color, 1);
        border.clear();
        border.lineStyle(3, bd.glow, 0.9);
        border.strokeRect(cx - 250, by - 40, 500, 80);
        lbl.setScale(1);
        arrowL.setAlpha(0); arrowR.setAlpha(0);
      });
      bg.on('pointerdown', () => {
        this.cameras.main.flash(300, 0, 255, 255);
        this.time.delayedCall(300, () => {
          sound.startMusic();
          this.scene.start('Game', { level: bd.level });
        });
      });
    });

    // ── Pie de página ──
    this.add.text(cx, H - 60, 'USA EL RATÓN PARA MOVER LA PALETA  |  ESC = PAUSA', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#445566',
    }).setOrigin(0.5);

    this.add.text(cx, H - 30, '© 2025  ARKANOID  PHASER 3', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#223344',
    }).setOrigin(0.5);

    // Detener música si venimos del juego
    sound.stopMusic();
  }

  update() {
    // Estrellas con parallax
    this.stars.forEach(s => {
      s.obj.y += s.speed;
      if (s.obj.y > H + 5) {
        s.obj.y = -5;
        s.obj.x = Phaser.Math.Between(0, W);
      }
    });

    // Partículas flotantes
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
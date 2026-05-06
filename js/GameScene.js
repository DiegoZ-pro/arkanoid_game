// js/GameScene.js
class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  init(data) {
    this.levelIndex = data.level || 0;
    this.lives    = 3;
    this.score    = 0;
    this.balls    = [];
    this.bricks   = [];
    this.powerups = [];
    this.paddleW  = 200;
    this.waiting  = true;
    this.isPaused = false;
    this.volumeOn = true;
  }

  create() {
    this.cameras.main.setBackgroundColor('#0a0a1a');
    const cx = W / 2;

    // Estrellas decorativas de fondo
    for (let i = 0; i < 60; i++) {
      this.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        Phaser.Math.Between(1, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.2, 0.7)
      );
    }

    // HUD
    this.scoreTxt = this.add.text(20, 14, 'SCORE: 0', {
      fontFamily: 'monospace', fontSize: '26px', color: '#B5D4F4'
    });
    this.livesTxt = this.add.text(W - 20, 14, '♥♥♥', {
      fontFamily: 'monospace', fontSize: '28px', color: '#F0997B'
    }).setOrigin(1, 0);
    this.add.text(cx, 14, 'NIVEL ' + (this.levelIndex + 1), {
      fontFamily: 'monospace', fontSize: '26px', color: '#C0DD97'
    }).setOrigin(0.5, 0);

    // Paleta
    this.paddle = this.add.rectangle(cx, H - 60, this.paddleW, 20, 0xB5D4F4, 1);

    // Bloques
    this.createBricks();

    // Primera bola
    this.launchBall(cx, H - 90);

    // Control ratón
    this.input.on('pointermove', ptr => {
      if (this.isPaused) return;
      this.paddle.x = Phaser.Math.Clamp(ptr.x, this.paddleW / 2, W - this.paddleW / 2);
    });

    // Click para lanzar
    this.input.on('pointerdown', () => {
      if (this.isPaused) return;
      if (this.waiting) {
        this.waiting = false;
        const b = this.balls[0];
        b.vx = (Math.random() * 2 - 1) * 400;
        b.vy = -550;
      }
    });

    this.add.text(cx, H / 2 + 60, 'click para lanzar', {
      fontFamily: 'monospace', fontSize: '24px', color: '#888780'
    }).setOrigin(0.5).setName('hint');

    // Música
    sound.startMusic();

    // ── Tecla ESC ──
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // ── Overlay pausa ──
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x000008, 0.85);
    this.pauseOverlay.fillRect(0, 0, W, H);
    this.pauseOverlay.setDepth(50).setVisible(false);

    // Scanlines pausa
    this.pauseScan = this.add.graphics();
    for (let y = 0; y < H; y += 4) {
      this.pauseScan.fillStyle(0x000000, 0.08);
      this.pauseScan.fillRect(0, y, W, 2);
    }
    this.pauseScan.setDepth(51).setVisible(false);

    // Título PAUSA
    this.pauseTitle = this.add.text(W / 2, H / 2 - 280, 'PAUSA', {
      fontFamily: 'monospace', fontSize: '100px', fontStyle: 'bold',
      color: '#00ffff', stroke: '#0044aa', strokeThickness: 8
    }).setOrigin(0.5).setDepth(52).setVisible(false);

    // Borde decorativo pausa
    this.pauseLine = this.add.graphics().setDepth(52);
    this.pauseLine.lineStyle(2, 0x00ffff, 0.5);
    this.pauseLine.strokeRect(W / 2 - 320, H / 2 - 200, 640, 500);
    this.pauseLine.setVisible(false);

    // Botones de pausa
    this.pauseButtons = [];
    const pauseOpts = [
      { label: '▶  REANUDAR',       color: 0x003333, neon: '#00ffff', glow: 0x00ffff, action: () => this.resumeGame() },
      { label: '↺  REINICIAR',      color: 0x332200, neon: '#ffaa00', glow: 0xffaa00, action: () => { sound.stopMusic(); this.scene.restart({ level: this.levelIndex }); } },
      { label: '♪  VOLUMEN',        color: 0x220033, neon: '#ff88ff', glow: 0xff00ff, action: () => this.toggleVolume() },
      { label: '⌂  MENÚ PRINCIPAL', color: 0x001133, neon: '#4488ff', glow: 0x0055ff, action: () => { sound.stopMusic(); this.scene.start('Menu'); } },
    ];

    pauseOpts.forEach((opt, i) => {
      const by = H / 2 - 80 + i * 105;
      const bg = this.add.rectangle(W / 2, by, 560, 78, opt.color, 1)
        .setDepth(52).setVisible(false).setInteractive({ useHandCursor: true });
      const border = this.add.graphics().setDepth(52);
      border.lineStyle(2, opt.glow, 0.8);
      border.strokeRect(W / 2 - 280, by - 39, 560, 78);
      border.setVisible(false);
      const lbl = this.add.text(W / 2, by, opt.label, {
        fontFamily: 'monospace', fontSize: '36px', fontStyle: 'bold', color: opt.neon
      }).setOrigin(0.5).setDepth(52).setVisible(false);

      bg.on('pointerover', () => { bg.setFillStyle(opt.glow, 0.2); lbl.setScale(1.05); sound.paddle(); });
      bg.on('pointerout',  () => { bg.setFillStyle(opt.color, 1);  lbl.setScale(1); });
      bg.on('pointerdown', () => opt.action());

      this.pauseButtons.push({ bg, border, lbl });
    });

    // Texto volumen
    this.volumeTxt = this.add.text(W / 2, H / 2 + 355, 'VOLUMEN: ON', {
      fontFamily: 'monospace', fontSize: '24px', color: '#445566'
    }).setOrigin(0.5).setDepth(52).setVisible(false);
  }

  // ── Crear bloques ─────────────────────────────────────────
  createBricks() {
    const layout = LEVELS[this.levelIndex];
    const bw = 200, bh = 45, padX = 60, padY = 120, gap = 10;
    this.bricks = [];
    layout.forEach((row, ri) => {
      row.forEach((val, ci) => {
        if (!val) return;
        const x = padX + ci * (bw + gap) + bw / 2;
        const y = padY + ri * (bh + gap) + bh / 2;
        const rect = this.add.rectangle(x, y, bw, bh, COLORS[val], 1);
        rect.setStrokeStyle(1, 0xffffff, 0.15);
        const isPowerup = Math.random() < 0.18;
        const ptype = POWERUP_TYPES[Phaser.Math.Between(0, 2)];
        this.bricks.push({ rect, x, y, w: bw, h: bh, isPowerup, ptype });
      });
    });
  }

  // ── Crear bola ────────────────────────────────────────────
  launchBall(x, y) {
    const g = this.add.circle(x, y, 14, 0xE6F1FB, 1);
    g.setStrokeStyle(1, 0x85B7EB, 0.8);
    const ball = { g, x, y, vx: 0, vy: 0, r: 14 };
    this.balls.push(ball);
    return ball;
  }

  // ── Movimiento y colisión precisa ─────────────────────────
  moveBall(b, dt) {
    const STEPS = 4;
    const sx = b.vx * dt / STEPS;
    const sy = b.vy * dt / STEPS;

    for (let s = 0; s < STEPS; s++) {
      b.x += sx;
      b.y += sy;

      // Paredes
      if (b.x - b.r < 0) { b.x = b.r;      b.vx =  Math.abs(b.vx); }
      if (b.x + b.r > W) { b.x = W - b.r;  b.vx = -Math.abs(b.vx); }
      if (b.y - b.r < 0) { b.y = b.r;      b.vy =  Math.abs(b.vy); }
      if (b.y > H + 20)  { return 'lost'; }

      // Paleta
      const hw = this.paddleW / 2;
      const py = this.paddle.y;
      const px = this.paddle.x;
      if (b.vy > 0 &&
          b.y + b.r >= py - 10 &&
          b.y - b.r <= py + 10 &&
          b.x + b.r >= px - hw &&
          b.x - b.r <= px + hw) {
        b.y = py - 10 - b.r;
        b.vy = -Math.abs(b.vy);
        const rel = (b.x - px) / hw;
        b.vx = rel * 520;
        const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (spd > 700) { const f = 700 / spd; b.vx *= f; b.vy *= f; }
        if (Math.abs(b.vy) < 250) b.vy = -250;
        sound.paddle();
      }

      // Bloques — AABB precisa
      for (let bri = this.bricks.length - 1; bri >= 0; bri--) {
        const br = this.bricks[bri];
        const left   = br.x - br.w / 2;
        const right  = br.x + br.w / 2;
        const top    = br.y - br.h / 2;
        const bottom = br.y + br.h / 2;

        if (b.x + b.r > left  && b.x - b.r < right &&
            b.y + b.r > top   && b.y - b.r < bottom) {

          const overlapLeft   = (b.x + b.r) - left;
          const overlapRight  = right  - (b.x - b.r);
          const overlapTop    = (b.y + b.r) - top;
          const overlapBottom = bottom - (b.y - b.r);
          const minH = Math.min(overlapLeft, overlapRight);
          const minV = Math.min(overlapTop, overlapBottom);

          if (minV < minH) {
            b.vy = -b.vy;
            if (overlapTop < overlapBottom) b.y = top - b.r;
            else                            b.y = bottom + b.r;
          } else {
            b.vx = -b.vx;
            if (overlapLeft < overlapRight) b.x = left - b.r;
            else                            b.x = right + b.r;
          }

          this.score += 10 * (this.levelIndex + 1);
          this.scoreTxt.setText('SCORE: ' + this.score);
          if (br.isPowerup) this.spawnPowerup(br.x, br.y, br.ptype);
          br.rect.destroy();
          this.bricks.splice(bri, 1);
          this.cameras.main.shake(40, 0.004);
          sound.brick();
          break;
        }
      }
    }
    return 'ok';
  }

  // ── Loop principal ────────────────────────────────────────
  update(time, delta) {
    const dt = delta / 1000;

    // ESC pausa
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      if (this.isPaused) this.resumeGame();
      else this.pauseGame();
    }
    if (this.isPaused) return;

    // Espera click
    if (this.waiting) {
      if (this.balls[0]) {
        this.balls[0].x = this.paddle.x;
        this.balls[0].y = this.paddle.y - 30;
        this.balls[0].g.x = this.balls[0].x;
        this.balls[0].g.y = this.balls[0].y;
      }
      return;
    }

    // ── Bolas ──
    for (let bi = this.balls.length - 1; bi >= 0; bi--) {
      const b = this.balls[bi];
      const result = this.moveBall(b, dt);
      b.g.x = b.x; b.g.y = b.y;

      if (result === 'lost') {
        b.g.destroy();
        this.balls.splice(bi, 1);
        if (this.balls.length === 0) {
          this.lives--;
          this.updateLives();
          if (this.lives <= 0) {
            sound.gameOver();
            sound.stopMusic();
            this.scene.start('GameOver', { score: this.score, level: this.levelIndex });
            return;
          }
          this.time.delayedCall(500, () => {
            this.launchBall(this.paddle.x, this.paddle.y - 30);
            this.waiting = true;
          });
        }
      }
    }

    // ── Power-ups ──
    for (let pi = this.powerups.length - 1; pi >= 0; pi--) {
      const p = this.powerups[pi];
      p.y += 120 * dt;
      p.g.y = p.y;
      const ph = this.paddle.y, px = this.paddle.x, pw = this.paddleW;
      if (p.y + 10 >= ph - 10 && p.y - 10 <= ph + 10 &&
          p.x >= px - pw / 2  && p.x <= px + pw / 2) {
        this.applyPowerup(p.type);
        p.g.destroy();
        this.powerups.splice(pi, 1);
      } else if (p.y > H + 20) {
        p.g.destroy();
        this.powerups.splice(pi, 1);
      }
    }

    // ── Victoria ──
    if (this.bricks.length === 0) {
      if (this.levelIndex < 2) {
        sound.stopMusic();
        this.scene.start('Game', { level: this.levelIndex + 1 });
      } else {
        sound.win();
        sound.stopMusic();
        this.scene.start('GameOver', { score: this.score, win: true });
      }
    }
  }

  // ── Power-ups ─────────────────────────────────────────────
  spawnPowerup(x, y, type) {
    const g = this.add.rectangle(x, y, 36, 18, POWERUP_COLORS[type], 1);
    g.setStrokeStyle(1, 0xffffff, 0.4);
    this.powerups.push({ g, x, y, type });
  }

  applyPowerup(type) {
    sound.powerup();
    if (type === 'wide') {
      this.paddleW = Math.min(this.paddleW + 100, 420);
      this.paddle.width = this.paddleW;
      this.time.delayedCall(8000, () => {
        this.paddleW = Math.max(this.paddleW - 100, 160);
        this.paddle.width = this.paddleW;
      });
    } else if (type === 'multiball') {
      const nb = this.launchBall(this.paddle.x, this.paddle.y - 30);
      nb.vx = (Math.random() * 400 - 200);
      nb.vy = -520;
    } else if (type === 'slow') {
      this.balls.forEach(b => {
        const s = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        b.vx = b.vx / s * 250; b.vy = b.vy / s * 250;
      });
      this.time.delayedCall(5000, () => {
        this.balls.forEach(b => {
          const s = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
          b.vx = b.vx / s * 480; b.vy = b.vy / s * 480;
        });
      });
    }
    this.score += 50;
    this.scoreTxt.setText('SCORE: ' + this.score);
  }

  updateLives() {
    const hearts = ['', '♥', '♥♥', '♥♥♥'];
    this.livesTxt.setText(hearts[this.lives] || '');
    if (this.lives > 0) sound.loseLife();
  }

  // ── Pausa ─────────────────────────────────────────────────
  pauseGame() {
    if (this.waiting || this.isPaused) return;
    this.isPaused = true;
    this.pauseOverlay.setVisible(true);
    this.pauseScan.setVisible(true);
    this.pauseTitle.setVisible(true);
    this.pauseLine.setVisible(true);
    this.pauseButtons.forEach(b => {
      b.bg.setVisible(true);
      if (b.border) b.border.setVisible(true);
      if (b.lbl !== b.bg) b.lbl.setVisible(true);
    });
    this.volumeTxt.setVisible(true);
    sound.stopMusic();
  }

  resumeGame() {
    this.isPaused = false;
    this.pauseOverlay.setVisible(false);
    this.pauseScan.setVisible(false);
    this.pauseTitle.setVisible(false);
    this.pauseLine.setVisible(false);
    this.pauseButtons.forEach(b => {
      b.bg.setVisible(false);
      if (b.border) b.border.setVisible(false);
      if (b.lbl !== b.bg) b.lbl.setVisible(false);
    });
    this.volumeTxt.setVisible(false);
    sound.startMusic();
  }

  toggleVolume() {
    this.volumeOn = !this.volumeOn;
    if (this.volumeOn) {
      sound.ctx.resume();
      this.volumeTxt.setText('VOLUMEN: ON');
      this.volumeTxt.setColor('#00ffff');
    } else {
      sound.ctx.suspend();
      this.volumeTxt.setText('VOLUMEN: OFF');
      this.volumeTxt.setColor('#ff4444');
    }
  }
}
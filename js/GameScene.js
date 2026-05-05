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
  }

  create() {
    sound.startMusic();
    this.cameras.main.setBackgroundColor('#0a0a1a');
    const cx = W / 2;

    for (let i = 0; i < 60; i++) {
      this.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        Phaser.Math.Between(1, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.2, 0.7)
      );
    }

    this.scoreTxt = this.add.text(20, 14, 'SCORE: 0', {
    fontFamily: 'monospace', fontSize: '26px', color: '#B5D4F4'
    });
    this.livesTxt = this.add.text(W - 20, 14, '♥♥♥', {
    fontFamily: 'monospace', fontSize: '28px', color: '#F0997B'
    }).setOrigin(1, 0);
    this.add.text(cx, 14, 'NIVEL ' + (this.levelIndex + 1), {
    fontFamily: 'monospace', fontSize: '26px', color: '#C0DD97'
    }).setOrigin(0.5, 0);

    this.paddle = this.add.rectangle(cx, H - 60, this.paddleW, 20, 0xB5D4F4, 1);

    this.createBricks();
    this.launchBall(cx, H - 50);

    this.input.on('pointermove', ptr => {
      this.paddle.x = Phaser.Math.Clamp(ptr.x, this.paddleW / 2, W - this.paddleW / 2);
    });

    this.input.on('pointerdown', () => {
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
  }

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

  launchBall(x, y) {
    const g = this.add.circle(x, y, 14, 0xE6F1FB, 1);
    g.setStrokeStyle(1, 0x85B7EB, 0.8);
    const ball = { g, x, y, vx: 0, vy: 0, r: 14 };
    this.balls.push(ball);
    return ball;
  }

  // ── Movimiento y colisión precisa por sub-pasos ───────────
  moveBall(b, dt) {
    const STEPS = 4;
    const sx = b.vx * dt / STEPS;
    const sy = b.vy * dt / STEPS;

    for (let s = 0; s < STEPS; s++) {
      b.x += sx;
      b.y += sy;

      // Paredes laterales
      if (b.x - b.r < 0) { b.x = b.r;      b.vx =  Math.abs(b.vx); }
      if (b.x + b.r > W) { b.x = W - b.r;  b.vx = -Math.abs(b.vx); }
      // Techo
      if (b.y - b.r < 0) { b.y = b.r;      b.vy =  Math.abs(b.vy); }
      // Suelo
      if (b.y > H + 20)  { return 'lost'; }

      // Paleta
      const hw = this.paddleW / 2;
      const py = this.paddle.y;
      const px = this.paddle.x;
      if (b.vy > 0 &&
          b.y + b.r >= py - 6 &&
          b.y - b.r <= py + 6 &&
          b.x + b.r >= px - hw &&
          b.x - b.r <= px + hw) {
        b.y = py - 6 - b.r;
        b.vy = -Math.abs(b.vy);
        sound.paddle();
        const rel = (b.x - px) / hw;
        b.vx = rel * 320;
        const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (spd > 420) { const f = 420 / spd; b.vx *= f; b.vy *= f; }
        if (Math.abs(b.vy) < 150) b.vy = -150;
      }

      // Bloques — AABB con resolución por lado de menor penetración
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

  update(time, delta) {
    const dt = delta / 1000;

    if (this.waiting) {
      if (this.balls[0]) {
        this.balls[0].x = this.paddle.x;
        this.balls[0].y = this.paddle.y - 20;
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
            sound.loseLife();
            sound.stopMusic();
            this.scene.start('GameOver', { score: this.score, level: this.levelIndex });
            return;
          }
          this.time.delayedCall(500, () => {
            this.launchBall(this.paddle.x, this.paddle.y - 20);
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
      if (p.y + 10 >= ph - 6 && p.y - 10 <= ph + 6 &&
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

  spawnPowerup(x, y, type) {
    const g = this.add.rectangle(x, y, 24, 12, POWERUP_COLORS[type], 1);
    g.setStrokeStyle(1, 0xffffff, 0.4);
    this.powerups.push({ g, x, y, type });
  }

  applyPowerup(type) {
    if (type === 'wide') {
      this.paddleW = Math.min(this.paddleW + 100, 420);
      this.paddle.width = this.paddleW;
      this.time.delayedCall(8000, () => {
        this.paddleW = Math.max(this.paddleW - 100, 160);
        this.paddle.width = this.paddleW;
      });
    } else if (type === 'multiball') {
      const nb = this.launchBall(this.paddle.x, this.paddle.y - 20);
      nb.vx = (Math.random() * 400 - 200);
      nb.vy = -520;
    } else if (type === 'slow') {
      this.balls.forEach(b => {
        const s = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        b.vx = b.vx / s * 180; b.vy = b.vy / s * 180;
      });
      this.time.delayedCall(5000, () => {
        this.balls.forEach(b => {
          const s = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
          b.vx = b.vx / s * 280; b.vy = b.vy / s * 280;
        });
      });
    }
    sound.powerup();
    this.score += 50;
    this.scoreTxt.setText('SCORE: ' + this.score);
  }

  updateLives() {
    const hearts = ['', '♥', '♥♥', '♥♥♥'];
    this.livesTxt.setText(hearts[this.lives] || '');
    if (this.lives > 0) sound.loseLife();
  }
}
// js/SoundManager.js
class SoundManager {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.musicNodes = [];
    this.musicPlaying = false;
  }

  // ── Motor base: tono simple ──────────────────────────────
  _play(freq, type, duration, volume = 0.3, delay = 0) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  }

  // ── Golpe en bloque ──────────────────────────────────────
  brick() {
    this._play(520, 'square', 0.08, 0.25);
    this._play(380, 'square', 0.06, 0.10, 0.04);
  }

  // ── Golpe en paleta ──────────────────────────────────────
  paddle() {
    this._play(300, 'sine', 0.12, 0.3);
    this._play(420, 'sine', 0.08, 0.2, 0.06);
  }

  // ── Perder vida ──────────────────────────────────────────
  loseLife() {
    this._play(440, 'sawtooth', 0.15, 0.4);
    this._play(330, 'sawtooth', 0.15, 0.4, 0.15);
    this._play(220, 'sawtooth', 0.20, 0.4, 0.30);
  }

  // ── Power-up recogido ────────────────────────────────────
  powerup() {
    [440, 550, 660, 880].forEach((f, i) => {
      this._play(f, 'sine', 0.12, 0.25, i * 0.07);
    });
  }

  // ── Victoria ─────────────────────────────────────────────
  win() {
    [523, 659, 784, 1047].forEach((f, i) => {
      this._play(f, 'sine', 0.3, 0.35, i * 0.15);
    });
    this._play(1047, 'sine', 0.6, 0.5, 0.65);
  }

  // ── Game Over ────────────────────────────────────────────
  gameOver() {
    [440, 370, 311, 220].forEach((f, i) => {
      this._play(f, 'sawtooth', 0.25, 0.35, i * 0.18);
    });
  }

  // ── Música de fondo (loop) ───────────────────────────────
  startMusic() {
    if (this.musicPlaying) return;
    this.musicPlaying = true;
    const ctx = this.ctx;

    // Melodía: notas y duraciones en segundos
    const melody = [
      [330, 0.2], [370, 0.2], [440, 0.2], [370, 0.2],
      [330, 0.2], [294, 0.2], [330, 0.4],
      [392, 0.2], [440, 0.2], [494, 0.2], [440, 0.2],
      [392, 0.2], [370, 0.2], [392, 0.4],
      [440, 0.2], [494, 0.2], [523, 0.2], [494, 0.2],
      [440, 0.2], [392, 0.2], [440, 0.4],
      [370, 0.2], [330, 0.2], [294, 0.2], [330, 0.2],
      [370, 0.2], [440, 0.2], [330, 0.6],
    ];

    // Bajo: acompaña la melodía
    const bass = [
      [110, 0.4], [110, 0.4], [147, 0.4], [147, 0.4],
      [131, 0.4], [131, 0.4], [110, 0.4], [110, 0.4],
    ];

    const totalDuration = melody.reduce((a, b) => a + b[1], 0);

    const playLoop = () => {
      if (!this.musicPlaying) return;

      let t = ctx.currentTime + 0.05;

      // Melodía
      melody.forEach(([freq, dur]) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur - 0.02);
        osc.start(t);
        osc.stop(t + dur);
        this.musicNodes.push(osc);
        t += dur;
      });

      // Bajo
      let tb = ctx.currentTime + 0.05;
      bass.forEach(([freq, dur]) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, tb);
        gain.gain.setValueAtTime(0.08, tb);
        gain.gain.exponentialRampToValueAtTime(0.001, tb + dur - 0.05);
        osc.start(tb);
        osc.stop(tb + dur);
        this.musicNodes.push(osc);
        tb += dur;
      });

      // Repetir cuando termine la melodía
      this._musicTimer = setTimeout(playLoop, totalDuration * 1000);
    };

    playLoop();
  }

  stopMusic() {
    this.musicPlaying = false;
    clearTimeout(this._musicTimer);
    this.musicNodes.forEach(n => { try { n.stop(); } catch(e) {} });
    this.musicNodes = [];
  }
}

// Instancia global
const sound = new SoundManager();
// Platanus Hack 25: Game Selector
// Global helper function
const playTone = (scene, freq, dur) => {
  const ctx = scene.sound.context;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = 'square';
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + dur);
};

// Text style presets
const txtStyle = {
  title: { fontSize: '48px', fontFamily: 'monospace', color: '#00ffff', stroke: '#000000', strokeThickness: 4 },
  btn: { fontSize: '32px', fontFamily: 'monospace', color: '#000000' },
  info: { fontSize: '13px', fontFamily: 'monospace', color: '#888888' },
  small: { fontSize: '12px', fontFamily: 'monospace', color: '#888888' },
  back: { fontSize: '20px', fontFamily: 'monospace', color: '#ff0000' }
};

// Menu Scene
class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const cx = 400;
    this.add.text(cx, 100, 'SELECT GAME', txtStyle.title).setOrigin(0.5);

    const games = [
      { name: 'LS20', y: 200, key: 'ONE' },
      { name: 'VC33', y: 300, key: 'TWO' },
      { name: 'FT09', y: 400, key: 'THREE' }
    ];

    games.forEach((g) => {
      const bg = this.add.graphics();
      const txt = this.add.text(cx, g.y, g.name, txtStyle.btn).setOrigin(0.5);

      const drawBtn = (fill, border, txtColor) => {
        bg.clear();
        bg.fillStyle(fill, fill === 0x00ff00 ? 1 : 0.8);
        bg.fillRect(cx - 100, g.y - 30, 200, 60);
        bg.lineStyle(3, border, 1);
        bg.strokeRect(cx - 100, g.y - 30, 200, 60);
        txt.setColor(txtColor);
      };

      drawBtn(0x00ff00, 0x00aa00, '#000000');
      const zone = this.add.zone(cx, g.y, 200, 60).setInteractive({ useHandCursor: true });

      zone.on('pointerover', () => drawBtn(0x00ff00, 0xffff00, '#ffff00'));
      zone.on('pointerout', () => drawBtn(0x00ff00, 0x00aa00, '#000000'));
      zone.on('pointerdown', () => {
        playTone(this, 440, 0.1);
        this.scene.start('GameScene', { gameName: g.name });
      });

      this.input.keyboard.on('keydown-' + g.key, () => {
        playTone(this, 440, 0.1);
        this.scene.start('GameScene', { gameName: g.name });
      });
    });

    const texts = [
      'Este juego esta basado en un benchmark de inteligencia artificial',
      'conocido como ARC AGI 3. Selecciona un juego para ver si eres',
      'mas inteligente que la IA (por ahora)'
    ];

    texts.forEach((t, i) => {
      const color = i === 2 ? '#666666' : '#888888';
      this.add.text(cx, 500 + i * 20, t, { fontSize: '13px', fontFamily: 'monospace', color: color }).setOrigin(0.5);
    });
  }
}

// Game Scene
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.gameName = data.gameName || 'GAME';
  }

  create() {
    const cx = 400;
    const cy = 300;
    const sz = 64;
    const sx = cx - sz / 2;
    const sy = cy - sz / 2;

    const gfx = this.add.graphics();
    gfx.fillStyle(0x222222, 1);
    gfx.fillRect(sx, sy, sz, sz);
    gfx.lineStyle(2, 0x00ff00, 1);
    gfx.strokeRect(sx, sy, sz, sz);

    this.add.text(cx, cy, this.gameName, { fontSize: '10px', fontFamily: 'monospace', color: '#00ff00' }).setOrigin(0.5);
    this.add.text(cx, sy - 40, 'NOW PLAYING', { fontSize: '24px', fontFamily: 'monospace', color: '#00ffff' }).setOrigin(0.5);
    this.add.text(cx, sy + sz + 40, this.gameName, { fontSize: '48px', fontFamily: 'monospace', color: '#ffff00', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5);

    const instructions = [
      'There are no instructions, intentionally.',
      'Play the game to discover controls, rules, and goal.',
      'Press \'Start\' to play. Play to learn. Win the game.'
    ];

    instructions.forEach((t, i) => {
      const color = i === 2 ? '#666666' : '#888888';
      this.add.text(cx, 420 + i * 20, t, { fontSize: '12px', fontFamily: 'monospace', color: color }).setOrigin(0.5);
    });

    const btn = this.add.text(cx, 520, 'BACK TO MENU', txtStyle.back).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setColor('#ff6666'));
    btn.on('pointerout', () => btn.setColor('#ff0000'));
    btn.on('pointerdown', () => {
      playTone(this, 440, 0.1);
      this.scene.start('MenuScene');
    });

    this.input.keyboard.on('keydown-ESC', () => {
      playTone(this, 440, 0.1);
      this.scene.start('MenuScene');
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      playTone(this, 440, 0.1);
      this.scene.start('MenuScene');
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [MenuScene, GameScene]
};

const game = new Phaser.Game(config);

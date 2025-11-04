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
        const sceneName = g.name === 'LS20' ? 'LS20Scene' : 'GameScene';
        this.scene.start(sceneName, { gameName: g.name });
      });

      this.input.keyboard.on('keydown-' + g.key, () => {
        playTone(this, 440, 0.1);
        const sceneName = g.name === 'LS20' ? 'LS20Scene' : 'GameScene';
        this.scene.start(sceneName, { gameName: g.name });
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

// LS20 Game Scene
class LS20Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'LS20Scene' });
    this.grid = 64;
    this.size = 9;
    this.offsetX = 112;
    this.offsetY = 12;
  }

  create() {
    this.currentLevel = 0;
    this.lives = 3;
    this.maxMoves = 22;
    this.movesLeft = 22;
    this.canMove = true;

    // Play area: 48x48 cells, with 8 cells border on all sides
    this.playAreaStart = 8;
    this.playAreaSize = 48;

    // Levels definition (positions in grid cells, within 8-56 range)
    // Valid positions: 8, 16, 24, 32, 40, 48 (blocked corners: 48,8 and 8,48)
    this.levels = [
      {
        player: { x: 40, y: 48 },
        walls: [
          [16, 16, 8, 16]
        ]
      }
    ];

    this.input.keyboard.on('keydown-ESC', () => {
      playTone(this, 440, 0.1);
      this.scene.start('MenuScene');
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');

    this.loadLevel();
  }

  loadLevel() {
    if (this.gfx) this.gfx.destroy();
    this.gfx = this.add.graphics();

    // Reset moves for new level
    this.movesLeft = this.maxMoves;
    this.lives = 3;

    const lvl = this.levels[this.currentLevel];

    // Draw grid background
    this.gfx.fillStyle(0x888888, 1);
    this.gfx.fillRect(this.offsetX, this.offsetY, this.grid * this.size, this.grid * this.size);

    // Draw border (8 cells on all sides) in darker color
    this.gfx.fillStyle(0x333333, 1);
    // Top border
    this.gfx.fillRect(this.offsetX, this.offsetY, this.grid * this.size, this.playAreaStart * this.size);
    // Bottom border
    this.gfx.fillRect(this.offsetX, this.offsetY + (this.playAreaStart + this.playAreaSize) * this.size, this.grid * this.size, this.playAreaStart * this.size);
    // Left border
    this.gfx.fillRect(this.offsetX, this.offsetY + this.playAreaStart * this.size, this.playAreaStart * this.size, this.playAreaSize * this.size);
    // Right border
    this.gfx.fillRect(this.offsetX + (this.playAreaStart + this.playAreaSize) * this.size, this.offsetY + this.playAreaStart * this.size, this.playAreaStart * this.size, this.playAreaSize * this.size);

    // Draw walls (positions in grid cells) - same color as non-playable area
    this.gfx.fillStyle(0x333333, 1);
    lvl.walls.forEach(w => {
      this.gfx.fillRect(
        this.offsetX + (w[0] * this.size),
        this.offsetY + (w[1] * this.size),
        w[2] * this.size,
        w[3] * this.size
      );
    });

    // Draw blocked corners (8x8 cells each)
    this.gfx.fillStyle(0x333333, 1);
    // Top-right corner (48, 8)
    this.gfx.fillRect(
      this.offsetX + (48 * this.size),
      this.offsetY + (8 * this.size),
      8 * this.size,
      8 * this.size
    );
    // Bottom-left corner area
    // (8, 48)
    this.gfx.fillRect(
      this.offsetX + (8 * this.size),
      this.offsetY + (48 * this.size),
      8 * this.size,
      8 * this.size
    );
    // (16, 48) - 1 more to the right
    this.gfx.fillRect(
      this.offsetX + (16 * this.size),
      this.offsetY + (48 * this.size),
      8 * this.size,
      8 * this.size
    );
    // (24, 48) - 2 more to the right
    this.gfx.fillRect(
      this.offsetX + (24 * this.size),
      this.offsetY + (48 * this.size),
      8 * this.size,
      8 * this.size
    );
    // (8, 40) - 1 up
    this.gfx.fillRect(
      this.offsetX + (8 * this.size),
      this.offsetY + (40 * this.size),
      8 * this.size,
      8 * this.size
    );

    // Create player
    this.player = { x: lvl.player.x, y: lvl.player.y };
    this.drawPlayer();
    this.drawLives();
    this.drawMoves();
    this.drawGrid();
  }

  drawGrid() {
    if (this.gridGfx) this.gridGfx.destroy();
    this.gridGfx = this.add.graphics();

    // Draw grid lines on entire 64x64 grid (on top of everything)
    this.gridGfx.lineStyle(1, 0x666666, 0.3);
    for (let i = 0; i <= this.grid; i++) {
      this.gridGfx.lineBetween(
        this.offsetX + i * this.size, this.offsetY,
        this.offsetX + i * this.size, this.offsetY + this.grid * this.size
      );
      this.gridGfx.lineBetween(
        this.offsetX, this.offsetY + i * this.size,
        this.offsetX + this.grid * this.size, this.offsetY + i * this.size
      );
    }
  }

  drawPlayer() {
    if (this.playerGfx) this.playerGfx.destroy();
    this.playerGfx = this.add.graphics();

    // Player is 8x8 cells: 8 cells wide × (2 cells orange top + 6 cells blue bottom)
    const px = this.offsetX + (this.player.x * this.size);
    const py = this.offsetY + (this.player.y * this.size);

    // Orange part (top 2 cells)
    this.playerGfx.fillStyle(0xff9933, 1);
    this.playerGfx.fillRect(px, py, 8 * this.size, 2 * this.size);

    // Blue part (bottom 6 cells)
    this.playerGfx.fillStyle(0x3399ff, 1);
    this.playerGfx.fillRect(px, py + (2 * this.size), 8 * this.size, 6 * this.size);
  }

  drawLives() {
    if (this.livesGfx) this.livesGfx.destroy();
    this.livesGfx = this.add.graphics();

    // Lives: 3 red squares 2x2 cells within the 64x64 grid
    // 1 cell from top, 2 cells from right, 2 cells separation
    const gridRight = this.offsetX + (this.grid * this.size);
    for (let i = 0; i < this.lives; i++) {
      const x = gridRight - (2 * this.size) - (i * 4 * this.size) - (2 * this.size);
      const y = this.offsetY + (1 * this.size);
      this.livesGfx.fillStyle(0xff0000, 1);
      this.livesGfx.fillRect(x, y, 2 * this.size, 2 * this.size);
    }
  }

  drawMoves() {
    if (this.movesGfx) this.movesGfx.destroy();
    this.movesGfx = this.add.graphics();

    // Moves: 22 squares 1x1 cell within the 64x64 grid
    // 2 cells from top, 2 cells from left, 1 cell separation
    // Consumed from right to left, turn gray when used
    for (let i = 0; i < this.maxMoves; i++) {
      const x = this.offsetX + (2 * this.size) + (i * 2 * this.size);
      const y = this.offsetY + (2 * this.size);

      // Used moves (from left) are gray, remaining moves (to right) are purple
      const movesUsed = this.maxMoves - this.movesLeft;
      const color = i < movesUsed ? 0x444444 : 0x9933ff;

      this.movesGfx.fillStyle(color, 1);
      this.movesGfx.fillRect(x, y, this.size, this.size);
    }
  }

  update() {
    if (!this.canMove) return;

    let dx = 0, dy = 0;

    // Move 8 cells per keypress
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.keys.A)) dx = -8;
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.keys.D)) dx = 8;
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keys.W)) dy = -8;
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.keys.S)) dy = 8;

    if (dx !== 0 || dy !== 0) {
      this.movePlayer(dx, dy);
    }
  }

  movePlayer(dx, dy) {
    const newX = this.player.x + dx;
    const newY = this.player.y + dy;

    if (this.canMoveTo(newX, newY)) {
      this.player.x = newX;
      this.player.y = newY;
      this.movesLeft--;
      playTone(this, 300, 0.05);
      this.drawPlayer();
      this.drawMoves();
      this.drawGrid();

      // Check if out of moves
      if (this.movesLeft <= 0) {
        this.loseLife();
      } else {
        this.checkWin();
      }
    } else {
      playTone(this, 150, 0.1);
    }
  }

  loseLife() {
    this.lives--;
    playTone(this, 200, 0.3);

    if (this.lives <= 0) {
      this.gameOver();
    } else {
      // Reset player position and moves
      const lvl = this.levels[this.currentLevel];
      this.player.x = lvl.player.x;
      this.player.y = lvl.player.y;
      this.movesLeft = this.maxMoves;

      this.time.delayedCall(500, () => {
        this.drawPlayer();
        this.drawLives();
        this.drawMoves();
        this.drawGrid();
      });
    }
  }

  gameOver() {
    this.canMove = false;
    playTone(this, 200, 0.5);

    this.time.delayedCall(1000, () => {
      this.scene.restart();
    });
  }

  canMoveTo(x, y) {
    // Check play area bounds (48x48 cells, starting at cell 8)
    // Player is 8x8 cells
    const maxPos = this.playAreaStart + this.playAreaSize;
    if (x < this.playAreaStart || x + 8 > maxPos || y < this.playAreaStart || y + 8 > maxPos) return false;

    // Block top-right corner (48, 8)
    if (x === 48 && y === 8) return false;

    // Block bottom-left corner area
    if (x === 8 && y === 48) return false;
    if (x === 16 && y === 48) return false;
    if (x === 24 && y === 48) return false;
    if (x === 8 && y === 40) return false;

    const lvl = this.levels[this.currentLevel];

    // Check wall collisions (all in cells)
    for (let w of lvl.walls) {
      // AABB collision detection (player is 8x8 cells)
      if (x < w[0] + w[2] && x + 8 > w[0] && y < w[1] + w[3] && y + 8 > w[1]) {
        return false;
      }
    }
    return true;
  }

  checkWin() {
    const lvl = this.levels[this.currentLevel];
    // Check if player position matches any goal position (both in grid cells)
    if (lvl.goals) {
      for (let g of lvl.goals) {
        if (this.player.x === g[0] && this.player.y === g[1]) {
          this.canMove = false;
          playTone(this, 600, 0.3);

          this.time.delayedCall(800, () => {
            this.currentLevel++;
            if (this.currentLevel < this.levels.length) {
              this.canMove = true;
              this.loadLevel();
            } else {
              this.scene.start('MenuScene');
            }
          });
          return;
        }
      }
    }
  }
}

// Game Scene (placeholder for other games)
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
  scene: [MenuScene, LS20Scene, GameScene]
};

const game = new Phaser.Game(config);

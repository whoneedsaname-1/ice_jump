class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        this.input = new InputHandler();
        this.level = new LevelManager(this.width, this.height);
        this.player = new Player(this.width / 2, this.height - 150);
        this.particles = new ParticleSystem();

        this.state = 'START'; // START, PLAYING, GAMEOVER
        this.combo = 0;
        this.highScore = localStorage.getItem('neonTowerHighScore') || 0;

        // UI Elements
        this.uiScore = document.getElementById('score');
        this.uiCombo = document.getElementById('combo');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.finalScoreEl = document.getElementById('final-score');
        this.highScoreEl = document.getElementById('high-score');

        // Bind buttons
        document.getElementById('start-btn').addEventListener('click', (e) => {
            e.target.blur();
            this.startGame();
        });
        document.getElementById('restart-btn').addEventListener('click', (e) => {
            e.target.blur();
            this.startGame();
        });

        this.lastTime = 0;
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    startGame() {
        this.state = 'PLAYING';
        this.level.reset();
        this.player = new Player(this.width / 2, this.height - 150);
        this.particles.reset();
        this.combo = 0;

        this.startScreen.classList.remove('active');
        this.gameOverScreen.classList.remove('active');

        this.updateUI();
    }

    gameOver() {
        this.state = 'GAMEOVER';
        if (this.level.score > this.highScore) {
            this.highScore = this.level.score;
            localStorage.setItem('neonTowerHighScore', this.highScore);
        }

        this.finalScoreEl.innerText = this.level.score;
        this.highScoreEl.innerText = this.highScore;
        this.gameOverScreen.classList.add('active');
    }

    update(dt) {
        if (this.state !== 'PLAYING') return;

        // Player Update
        this.player.update(this.input, this.width);

        // Level Update
        this.level.update(this.player.y, this.height);

        // Particles Update
        this.particles.update();

        // Collision Detection
        this.checkCollisions();

        // Game Over Check
        if (this.player.y > this.level.cameraY + this.height + 100) {
            this.gameOver();
        }

        this.updateUI();
    }

    checkCollisions() {
        // Only check collision if falling
        if (this.player.vy < 0) return;

        const platforms = this.level.getPlatforms();

        for (let p of platforms) {
            if (p.broken) continue;

            // Simple AABB for feet
            if (this.player.x < p.x + p.width &&
                this.player.x + this.player.width > p.x &&
                this.player.y + this.player.height > p.y &&
                this.player.y + this.player.height < p.y + p.height + 10) { // +10 tolerance

                // Landed
                this.player.y = p.y - this.player.height;
                this.player.vy = 0;
                this.player.onGround = true;

                // Platform logic
                if (p.type === PlatformType.ICE) {
                    this.player.friction = 0.98; // Slippery
                } else {
                    this.player.friction = 0.8; // Normal
                }

                if (p.type === PlatformType.BREAKABLE) {
                    this.gameOver();
                } else {
                    // Spawn landing particles
                    if (Math.abs(this.player.vy) > 2) {
                        this.particles.spawn(this.player.x + this.player.width / 2, this.player.y + this.player.height, '#fff', 5);
                    }
                }

                // Combo logic
                return; // Collided with one, stop checking
            }
        }
    }

    updateUI() {
        this.uiScore.innerText = this.level.score;
        this.uiCombo.innerText = this.combo;
    }

    draw() {
        // Clear
        this.ctx.fillStyle = '#050510';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Background Parallax (Simple stars/grid)
        this.drawBackground();

        this.ctx.save();
        // We don't translate the whole context because we handle cameraY manually in draw methods
        // This allows for easier UI drawing if we wanted it on canvas, but we have DOM UI.
        // Actually, let's keep it manual for parallax control.

        this.level.draw(this.ctx);
        this.player.draw(this.ctx, this.level.cameraY);
        this.particles.draw(this.ctx, this.level.cameraY);

        this.ctx.restore();
    }

    drawBackground() {
        // Dynamic background based on height
        const hue = (this.level.floorCount * 2) % 360;
        this.ctx.fillStyle = `hsla(${hue}, 50%, 10%, 0.2)`;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Grid effect
        this.ctx.strokeStyle = `hsla(${hue}, 50%, 20%, 0.1)`;
        this.ctx.lineWidth = 1;
        const offset = (this.level.cameraY * 0.5) % 50;

        for (let i = 0; i < this.width; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.height);
            this.ctx.stroke();
        }

        for (let i = -offset; i < this.height; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.width, i);
            this.ctx.stroke();
        }
    }

    loop(timestamp) {
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();

        requestAnimationFrame(this.loop);
    }
}

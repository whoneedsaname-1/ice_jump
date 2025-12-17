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

        this.highScore = localStorage.getItem('neonTowerHighScore') || 0;

        // UI Elements
        this.uiScore = document.getElementById('score');

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

        document.getElementById('tutorial-btn').addEventListener('click', (e) => {
            e.target.blur();
            this.startTutorial();
        });

        // Mobile Controls
        const btnLeft = document.getElementById('btn-left');
        const btnRight = document.getElementById('btn-right');
        const btnJump = document.getElementById('btn-jump');

        const bindTouch = (elem, code) => {
            elem.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent scrolling/selecting
                this.input.setKey(code, true);
            });
            elem.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.input.setKey(code, false);
            });
            // Mouse events for testing on non-touch
            elem.addEventListener('mousedown', (e) => {
                this.input.setKey(code, true);
            });
            elem.addEventListener('mouseup', (e) => {
                this.input.setKey(code, false);
            });
        };

        bindTouch(btnLeft, 'ArrowLeft');
        bindTouch(btnRight, 'ArrowRight');
        bindTouch(btnJump, 'Space');

        this.tutorial = new TutorialManager(this);

        this.lastTime = 0;
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    startTutorial() {
        this.state = 'TUTORIAL';
        this.level.resetTutorial();
        this.player = new Player(this.width / 2, this.height - 150);
        this.particles.reset();

        this.startScreen.classList.remove('active');
        this.gameOverScreen.classList.remove('active');

        this.tutorial.start();
        this.updateUI();
    }

    endTutorial() {
        this.state = 'START';
        this.tutorial.stop();

        // Save score if needed (using same high score logic, or separate tutorial score?)
        // User asked to "save score acquired in tutorial". 
        // I'll assume they want it to count towards high score if it's high enough, 
        // OR just save it as "last score".
        // Let's reuse the high score logic from gameOver just to be safe it saves.
        if (this.level.score > this.highScore) {
            this.highScore = this.level.score;
            localStorage.setItem('neonTowerHighScore', this.highScore);
        }

        // Return to start screen
        this.startScreen.classList.add('active');
        this.gameOverScreen.classList.remove('active');
        this.updateUI();
    }

    startGame() {
        this.state = 'PLAYING';
        if (this.tutorial) this.tutorial.stop(); // Clear tutorial UI
        this.level.reset();
        this.player = new Player(this.width / 2, this.height - 150);
        this.particles.reset();


        this.startScreen.classList.remove('active');
        this.gameOverScreen.classList.remove('active');

        this.updateUI();
    }

    gameOver() {
        if (this.state === 'TUTORIAL') {
            this.startTutorial(); // Instant restart
            return;
        }

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
        if (this.state !== 'PLAYING' && this.state !== 'TUTORIAL') return;

        let updateInput = this.input;
        if (this.state === 'TUTORIAL') {
            this.tutorial.update(dt);
            // Apply tutorial input restrictions
            updateInput = this.tutorial.filterInput(this.input);
        }

        // Player Update
        this.player.update(updateInput, this.width);

        // Level Update
        this.level.update(this.player.y, this.height);

        // Particles Update
        this.particles.update();

        // Collision Detection
        this.checkCollisions();

        // Game Over Check
        if (this.player.y > this.level.cameraY + this.height) {
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
                this.player.resetJumps();

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


                return; // Collided with one, stop checking
            }
        }
    }

    updateUI() {
        this.uiScore.innerText = this.level.score;

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

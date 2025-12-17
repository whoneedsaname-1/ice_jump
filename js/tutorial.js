class TutorialManager {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.step = 0;
        this.timer = 0;

        // Steps enum-like
        this.STEPS = {
            WELCOME: 0,
            MOVE: 1,
            JUMP: 2,
            DOUBLE_JUMP: 3,
            COMPLETED: 4
        };

        this.overlay = document.getElementById('tutorial-overlay');
        this.textEl = document.getElementById('tutorial-text');
    }

    start() {
        this.active = true;
        this.step = this.STEPS.WELCOME;
        this.timer = 0;
        this.updateOverlay("Welcome to Neon Tower! Let's learn to climb.");

        // Setup initial clean state logic is handled by Game.startTutorial()
    }

    stop() {
        this.active = false;
        this.overlay.classList.remove('active');
    }

    update(dt) {
        if (!this.active) return;
        this.timer += dt;

        switch (this.step) {
            case this.STEPS.WELCOME:
                if (this.timer > 2000) {
                    this.step = this.STEPS.MOVE;
                    this.updateOverlay("Use Arrow Keys (← →) to move left and right.");
                }
                break;

            case this.STEPS.MOVE:
                // Check if player moved
                if (Math.abs(this.game.player.vx) > 1) {
                    this.timer = 0; // Reset timer for next step delay
                    this.step = this.STEPS.JUMP;
                    this.updateOverlay("Great! Now press SPACE to Jump.");
                }
                break;

            case this.STEPS.JUMP:
                // Check if player jumped (moved up significantly)
                if (this.game.player.vy < -5) {
                    this.step = this.STEPS.DOUBLE_JUMP;
                    this.updateOverlay("Awesome! Jump again in mid-air to DOUBLE JUMP!");
                }
                break;

            case this.STEPS.DOUBLE_JUMP:
                // Check if double jumped (we can check player.jumpCount or just wait for height)
                if (this.game.player.jumpCount > 1) {
                    this.step = this.STEPS.COMPLETED;
                    this.updateOverlay("You're ready! Reach the top!");
                    setTimeout(() => {
                        this.game.endTutorial();
                    }, 3000);
                }
                break;
        }
    }

    filterInput(input) {
        // Create a proxy to intercept isDown calls
        return {
            isDown: (code) => {
                // Block controls based on step

                // WELCOME: Block Everything (Listen to me!)
                if (this.step === this.STEPS.WELCOME) {
                    return false;
                }

                // MOVE: Block Jump
                if (this.step === this.STEPS.MOVE) {
                    if (code === 'Space') return false;
                }

                // JUMP: Block Double Jump (Block Space if already in air/jumped)
                if (this.step === this.STEPS.JUMP) {
                    if (code === 'Space' && this.game.player.jumpCount > 0) return false;
                }

                // DOUBLE_JUMP: Allow Everything

                return input.isDown(code);
            }
        };
    }

    updateOverlay(text) {
        if (this.textEl) this.textEl.innerText = text;
        this.overlay.classList.add('active');
    }
}



window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');

    // Set canvas size to match CSS
    canvas.width = 600;
    canvas.height = 800;

    const game = new Game(canvas);

    // Auto-resize logic
    const resizeGame = () => {
        const container = document.getElementById('game-container');
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Target ratio
        const targetRatio = 600 / 800;
        const windowRatio = windowWidth / windowHeight;

        let scale;
        if (windowRatio < targetRatio) {
            // Window is narrower than game, fit to width
            scale = windowWidth / 600;
        } else {
            // Window is wider than game, fit to height
            scale = windowHeight / 800;
        }

        // Cap scale at 1.0 if we don't want to upscale pixelated art too much, 
        // but for this game filling the screen is better.
        // Let's keep a small margin (0.95) so it doesn't touch edges exactly
        scale *= 0.95;

        container.style.transform = `scale(${scale})`;
    };

    window.addEventListener('resize', resizeGame);
    resizeGame(); // Initial call
});

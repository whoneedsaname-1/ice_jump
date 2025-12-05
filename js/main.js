

window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');

    // Set canvas size to match CSS
    canvas.width = 600;
    canvas.height = 800;

    const game = new Game(canvas);

    // Handle window resize if we want responsive canvas (optional for now)
    // For this game, we keep internal resolution fixed and scale via CSS if needed
});

class InputHandler {
    constructor() {
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false,
            Enter: false // For restarting
        };

        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    onKeyDown(e) {
        if (['ArrowLeft', 'ArrowRight', 'Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
            e.preventDefault();
        }

        if (e.code === 'ArrowLeft') this.keys.ArrowLeft = true;
        if (e.code === 'ArrowRight') this.keys.ArrowRight = true;
        if (e.code === 'Space') this.keys.Space = true;
        if (e.code === 'Enter') this.keys.Enter = true;
    }

    onKeyUp(e) {
        if (e.code === 'ArrowLeft') this.keys.ArrowLeft = false;
        if (e.code === 'ArrowRight') this.keys.ArrowRight = false;
        if (e.code === 'Space') this.keys.Space = false;
        if (e.code === 'Enter') this.keys.Enter = false;
    }

    isDown(key) {
        return this.keys[key];
    }
}

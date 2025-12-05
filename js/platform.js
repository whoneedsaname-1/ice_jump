const PlatformType = {
    STANDARD: 'standard',
    ICE: 'ice',
    MOVING: 'moving',
    BREAKABLE: 'breakable'
};

class Platform {
    constructor(x, y, width, type = PlatformType.STANDARD) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = 20;
        this.type = type;
        this.vx = (type === PlatformType.MOVING) ? (Math.random() > 0.5 ? 2 : -2) : 0;
        this.broken = false;
        this.color = this.getColorByType();
    }

    getColorByType() {
        switch (this.type) {
            case PlatformType.ICE: return '#00ffff'; // Cyan
            case PlatformType.MOVING: return '#ff00ff'; // Magenta
            case PlatformType.BREAKABLE: return '#ff4444'; // Red
            default: return '#00ff00'; // Green (Standard)
        }
    }

    update(canvasWidth) {
        if (this.type === PlatformType.MOVING) {
            this.x += this.vx;
            if (this.x <= 0 || this.x + this.width >= canvasWidth) {
                this.vx *= -1;
            }
        }
    }

    draw(ctx, cameraY) {
        if (this.broken) return;

        const drawY = this.y - cameraY;

        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;

        // Rounded rectangle
        ctx.beginPath();
        ctx.roundRect(this.x, drawY, this.width, this.height, 5);
        ctx.fill();

        // Reset shadow
        ctx.shadowBlur = 0;

        // Detail for ice
        if (this.type === PlatformType.ICE) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(this.x + 5, drawY, this.width - 10, 5);
        }

        // Detail for breakable
        if (this.type === PlatformType.BREAKABLE) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x + 10, drawY + 5);
            ctx.lineTo(this.x + this.width - 10, drawY + 15);
            ctx.stroke();
        }
    }
}

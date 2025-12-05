class Particle {
    constructor(x, y, color, vx, vy, life) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.size = Utils.randomInt(2, 5);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.size *= 0.95;
    }

    draw(ctx, cameraY) {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.beginPath();
        ctx.arc(this.x, this.y - cameraY, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    spawn(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            const vx = Utils.randomFloat(-2, 2);
            const vy = Utils.randomFloat(-2, 2);
            const life = Utils.randomInt(20, 40);
            this.particles.push(new Particle(x, y, color, vx, vy, life));
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx, cameraY) {
        this.particles.forEach(p => p.draw(ctx, cameraY));
    }

    reset() {
        this.particles = [];
    }
}

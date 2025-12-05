class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.vx = 0;
        this.vy = 0;

        // Physics constants
        this.friction = 0.8;
        this.acceleration = 1.8;
        this.gravity = 0.7;
        this.jumpForce = -17;
        this.maxSpeed = 10;

        this.onGround = false;
        this.color = '#ffffff';
        this.trail = []; // For visual effect
    }

    update(input, canvasWidth) {
        // Horizontal Movement
        if (input.isDown('ArrowLeft')) {
            this.vx -= this.acceleration;
        }
        if (input.isDown('ArrowRight')) {
            this.vx += this.acceleration;
        }

        // Friction
        this.vx *= this.friction;

        // Cap speed
        if (this.vx > this.maxSpeed) this.vx = this.maxSpeed;
        if (this.vx < -this.maxSpeed) this.vx = -this.maxSpeed;

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Gravity
        this.vy += this.gravity;

        // Screen Wrapping
        if (this.x + this.width < 0) {
            this.x = canvasWidth;
        } else if (this.x > canvasWidth) {
            this.x = -this.width;
        }

        // Jumping
        if (this.onGround && input.isDown('Space')) {
            this.jump();
        }

        // Trail effect
        if (Math.abs(this.vx) > 5 || Math.abs(this.vy) > 5) {
            this.trail.push({ x: this.x, y: this.y, alpha: 0.5 });
        }
        if (this.trail.length > 5) this.trail.shift();
        this.trail.forEach(t => t.alpha -= 0.05);

        this.onGround = false; // Reset ground state, will be set by collision
    }

    jump(bonus = 0) {
        this.vy = this.jumpForce - Math.abs(this.vx * 0.2) - bonus; // Speed adds jump height
        this.onGround = false;
    }

    draw(ctx, cameraY) {
        const drawY = this.y - cameraY;

        // Draw trail
        this.trail.forEach(t => {
            ctx.fillStyle = `rgba(255, 255, 255, ${t.alpha})`;
            ctx.fillRect(t.x, t.y - cameraY, this.width, this.height);
        });

        // Draw Player
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#fff';
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(this.x, drawY, this.width, this.height, 8);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Eyes (Cute factor)
        ctx.fillStyle = '#000';
        if (this.vx > 0) {
            ctx.fillRect(this.x + 18, drawY + 8, 4, 4);
            ctx.fillRect(this.x + 24, drawY + 8, 4, 4);
        } else if (this.vx < 0) {
            ctx.fillRect(this.x + 2, drawY + 8, 4, 4);
            ctx.fillRect(this.x + 8, drawY + 8, 4, 4);
        } else {
            ctx.fillRect(this.x + 8, drawY + 8, 4, 4);
            ctx.fillRect(this.x + 18, drawY + 8, 4, 4);
        }
    }
}

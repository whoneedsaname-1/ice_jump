class LevelManager {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.platforms = [];
        this.cameraY = 0;
        this.score = 0;
        this.floorCount = 0;
        this.biome = 0;

        // Initial platform (ground)
        this.platforms.push(new Platform(0, height - 50, width, PlatformType.STANDARD));

        // Generate initial set
        this.generatePlatforms(height);
    }

    reset() {
        this.platforms = [];
        this.cameraY = 0;
        this.score = 0;
        this.floorCount = 0;
        this.biome = 0;
        this.platforms.push(new Platform(0, this.height - 50, this.width, PlatformType.STANDARD));
        this.generatePlatforms(this.height);
    }

    generatePlatforms(targetY) {
        let lastY = this.platforms[this.platforms.length - 1].y;

        // Generate up to targetY (relative to camera, so negative values)
        // We want to generate slightly above the screen
        while (lastY > this.cameraY - 100) {
            this.floorCount++;

            // Difficulty scaling
            const difficulty = Math.min(this.floorCount / 500, 1); // 0 to 1

            // Platform gap
            const gap = Utils.randomInt(80, 120 + (difficulty * 50));
            const newY = lastY - gap;

            // Platform width
            const pWidth = Utils.randomInt(80, 200 - (difficulty * 50));
            const pX = Utils.randomInt(0, this.width - pWidth);

            // Determine type
            let type = PlatformType.STANDARD;
            const rand = Math.random();

            if (this.floorCount > 10) {
                if (rand < 0.1 + (difficulty * 0.2)) type = PlatformType.MOVING;
                else if (rand < 0.2 + (difficulty * 0.2)) type = PlatformType.ICE;
                else if (rand < 0.25 + (difficulty * 0.2)) type = PlatformType.BREAKABLE;
            }

            this.platforms.push(new Platform(pX, newY, pWidth, type));
            lastY = newY;
        }
    }

    update(playerY, canvasHeight) {
        // Camera logic: follow player if they go above 1/3 of screen
        const targetCameraY = playerY - canvasHeight * 0.6;
        if (targetCameraY < this.cameraY) {
            this.cameraY = targetCameraY;
            this.score = Math.floor(Math.abs(this.cameraY));
        }

        // Generate more platforms
        this.generatePlatforms(this.cameraY);

        // Cleanup old platforms (only those below the screen)
        this.platforms = this.platforms.filter(p => p.y < this.cameraY + canvasHeight + 200);

        // Update platforms
        this.platforms.forEach(p => p.update(this.width));
    }

    draw(ctx) {
        this.platforms.forEach(p => p.draw(ctx, this.cameraY));
    }

    getPlatforms() {
        return this.platforms;
    }
}

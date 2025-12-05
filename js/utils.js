const Utils = {
    // Random integer between min and max (inclusive)
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

    // Random float between min and max
    randomFloat: (min, max) => Math.random() * (max - min) + min,

    // Random color from an array
    randomChoice: (arr) => arr[Math.floor(Math.random() * arr.length)],

    // AABB Collision detection
    rectIntersect: (r1, r2) => {
        return !(r2.x > r1.x + r1.width ||
            r2.x + r2.width < r1.x ||
            r2.y > r1.y + r1.height ||
            r2.y + r2.height < r1.y);
    },

    // Linear interpolation
    lerp: (start, end, t) => start * (1 - t) + end * t
};

"use strict";
try {
    const canvas = document.querySelector('canvas');
    if (!canvas)
        throw new Error('Canvas element not found!');
    const ctx = canvas.getContext('2d');
    if (!ctx)
        throw new Error('Failed to get 2D context from canvas!');
    console.log('Canvas and context are ready!');
    // Variables
    let mouse = { x: null, y: null };
    const maxRadius = 30;
    let circlesArr = []; // Array of moving circles
    // Functions
    function rotate(velocity, angle) {
        return {
            x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
            y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
        };
    }
    function resolveCollision(particle, otherParticle) {
        const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
        const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;
        const xDist = otherParticle.x - particle.x;
        const yDist = otherParticle.y - particle.y;
        if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
            const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);
            const m1 = particle.mass;
            const m2 = otherParticle.mass;
            const u1 = rotate(particle.velocity, angle);
            const u2 = rotate(otherParticle.velocity, angle);
            const v1 = {
                x: (u1.x * (m1 - m2) + u2.x * 2 * m2) / (m1 + m2),
                y: u1.y
            };
            const v2 = {
                x: (u2.x * (m1 - m2) + u1.x * 2 * m2) / (m1 + m2),
                y: u2.y
            };
            const vFinal1 = rotate(v1, -angle);
            const vFinal2 = rotate(v2, -angle);
            particle.velocity.x = vFinal1.x;
            particle.velocity.y = vFinal1.y;
            otherParticle.velocity.x = vFinal2.x;
            otherParticle.velocity.y = vFinal2.y;
        }
    }
    function distance(x1, y1, x2, y2) {
        return Math.hypot(x2 - x1, y2 - y1);
    }
    function randomElement(arr) {
        const index = Math.floor(Math.random() * arr.length);
        return arr[index];
    }
    // Circle Class
    class Circle {
        constructor(x, y, dx, dy, radius, color, mouseZone, mass, imageUrl) {
            this.x = x;
            this.y = y;
            this.velocity = { x: dx, y: dy };
            this.radius = radius;
            this.minRadius = radius;
            this.color = color;
            this.mouseZone = mouseZone;
            this.mass = mass;
            // If an image URL is provided, load the image
            if (imageUrl) {
                this.image = new Image();
                this.image.src = imageUrl;
            }
        }
        draw(ctx) {
            // If there's an image, draw it
            if (this.image) {
                const imageSize = this.radius * 2;
                ctx.drawImage(this.image, this.x - this.radius, this.y - this.radius, imageSize, imageSize);
            }
            else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }
        update(ctx, circlesArr) {
            this.draw(ctx);
            for (let i = 0; i < circlesArr.length; i++) {
                if (this === circlesArr[i])
                    continue;
                if (distance(this.x, this.y, circlesArr[i].x, circlesArr[i].y) - this.radius * 2 < 0) {
                    resolveCollision(this, circlesArr[i]);
                }
            }
            if (this.x + this.radius > window.innerWidth || this.x - this.radius < 0) {
                this.velocity.x = -this.velocity.x;
            }
            if (this.y + this.radius > window.innerHeight || this.y - this.radius < 0) {
                this.velocity.y = -this.velocity.y;
            }
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            if (mouse.x !== null && mouse.y !== null) {
                if (Math.abs(mouse.x - this.x) < this.mouseZone && Math.abs(mouse.y - this.y) < this.mouseZone) {
                    if (this.radius < maxRadius) {
                        this.radius += 3;
                    }
                }
                else if (this.radius > this.minRadius) {
                    this.radius -= 3;
                }
            }
        }
    }
    // Main logic
    const colors = [
        "e76f51",
        "f4a261",
        "e9c46a",
        "2a9d8f",
        "264653",
        "dc2f02",
        "7ae582",
        "598392",
        "01161e"
    ];
    // Creating main center circle (fixed position) with image
    let x_deadcenter = window.innerWidth / 2;
    let y_deadcenter = window.innerHeight / 2;
    let main_circle = new Circle(x_deadcenter, y_deadcenter, 0, 0, 30, "#333", 0, 8); // Add your image path
    // Add main circle to the array of circles
    circlesArr.push(main_circle);
    // Function to initialize the moving circles
    function init() {
        circlesArr = [];
        circlesArr.push(main_circle);
        for (let i = 0; i < 300; i++) {
            const radius = 8;
            let x = Math.random() * (window.innerWidth - radius * 2) + radius;
            let y = Math.random() * (window.innerHeight - radius * 2) + radius;
            const dx = (Math.random() + 0.5) * 2;
            const dy = (Math.random() + 0.5) * 2;
            const color = `#${randomElement(colors)}`;
            const mouseZone = 50;
            let mass = 5;
            if (i !== 0) {
                for (let j = 0; j < circlesArr.length; j++) {
                    if (distance(x, y, circlesArr[j].x, circlesArr[j].y) - radius * 2 < 0) {
                        x = Math.random() * (window.innerWidth - radius * 2) + radius;
                        y = Math.random() * (window.innerHeight - radius * 2) + radius;
                        j = -1; // Restart checking
                    }
                }
            }
            circlesArr.push(new Circle(x, y, dx, dy, radius, color, mouseZone, mass));
        }
    }
    // Main animation loop
    function animate() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        // Update all circles
        for (const circle of circlesArr) {
            circle.update(ctx, circlesArr);
        }
        requestAnimationFrame(animate);
    }
    // Event listeners
    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    });
    window.addEventListener('load', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
        animate();
    });
}
catch (error) {
    if (error instanceof Error) {
        console.error('Caught an error:', error.message);
    }
    else {
        console.error('Caught an unknown error:', error);
    }
}

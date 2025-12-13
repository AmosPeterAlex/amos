/**
 * Interactive Particle Portfolio - Iteration 2
 * - Fixed: Full page scrolling support
 * - Fixed: Mouse interaction works through layers
 */

class ThemeManager {
    constructor() {
        this.themeToggleBtn = document.getElementById('theme-toggle');
        this.body = document.body;
        this.overlay = document.querySelector('.theme-transition-overlay');

        // Colors for particles need to track themes
        this.themes = {
            light: {
                bg: '#ffffff',
                particle: '#000000',
                particleAlpha: 0.15
            },
            dark: {
                bg: '#111111',
                particle: '#ffffff',
                particleAlpha: 0.15
            }
        };

        this.currentTheme = localStorage.getItem('theme') ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme, false);
        this.themeToggleBtn.addEventListener('click', (e) => this.toggleTheme(e));
    }

    applyTheme(themeName, animate = true) {
        this.body.setAttribute('data-theme', themeName);
        localStorage.setItem('theme', themeName);

        if (window.particleSystem) {
            window.particleSystem.updateTheme(this.themes[themeName].particle);
        }
    }

    toggleTheme(e) {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.currentTheme = newTheme;
        this.animateTransition(e, newTheme);
        this.applyTheme(newTheme); // Apply logical theme immediately for text
    }

    animateTransition(e, newTheme) {
        const rect = e.currentTarget.getBoundingClientRect();
        // Calculate center of button
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2; // y is relative to viewport, which is what fixed overlay needs

        // Set overlay properties
        this.overlay.style.backgroundColor = this.themes[newTheme].bg;
        this.overlay.classList.add('animating');

        const maxRadius = Math.hypot(window.innerWidth, window.innerHeight);

        const animation = this.overlay.animate([
            { clipPath: `circle(0px at ${x}px ${y}px)` },
            { clipPath: `circle(${maxRadius}px at ${x}px ${y}px)` }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
            fill: 'forwards'
        });

        animation.onfinish = () => {
            this.overlay.classList.remove('animating');
            this.overlay.style.clipPath = 'none';
        };
    }
}

class Particle {
    constructor(canvasWidth, canvasHeight, colorStr) {
        // Position particles randomly in the VIEWPORT
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;

        this.colorStr = colorStr;
        this.currentColorRGB = this.hexToRgb(colorStr);
        this.targetColorRGB = this.hexToRgb(colorStr);
        this.colorMix = 0;

        // Base positions relative to screen (floating animation)
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
    }

    hexToRgb(hex) {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    update(width, height, mouse) {
        // Interaction Logic
        // Mouse coordinates are clientX/Y (viewport relative)
        // Particle coordinates are canvas relative (which is fixed to viewport)
        // So simple distance check works.

        // However, if mouse is not on screen (initial state), don't interact
        if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let maxDistance = 150;
            let force = (maxDistance - distance) / maxDistance;

            if (distance < maxDistance) {
                this.x -= forceDirectionX * force * this.density;
                this.y -= forceDirectionY * force * this.density;
            } else {
                if (this.x !== this.baseX) {
                    let dx = this.x - this.baseX;
                    this.x -= dx / 20;
                }
                if (this.y !== this.baseY) {
                    let dy = this.y - this.baseY;
                    this.y -= dy / 20;
                }
            }
        }

        // Move
        this.x += this.vx;
        this.y += this.vy;
        this.baseX += this.vx;
        this.baseY += this.vy;

        // Wrap
        if (this.x < 0) { this.x = width; this.baseX = width; }
        else if (this.x > width) { this.x = 0; this.baseX = 0; }

        if (this.y < 0) { this.y = height; this.baseY = height; }
        else if (this.y > height) { this.y = 0; this.baseY = 0; }

        // Color Interpolation
        if (this.colorMix < 1) {
            this.colorMix += 0.05;
            if (this.colorMix > 1) this.colorMix = 1;
        }
    }

    draw(ctx) {
        const r = Math.round(this.currentColorRGB.r + (this.targetColorRGB.r - this.currentColorRGB.r) * this.colorMix);
        const g = Math.round(this.currentColorRGB.g + (this.targetColorRGB.g - this.currentColorRGB.g) * this.colorMix);
        const b = Math.round(this.currentColorRGB.b + (this.targetColorRGB.b - this.currentColorRGB.b) * this.colorMix);

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.2)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    setTargetColor(hex) {
        // Freeze current color as start point
        this.currentColorRGB = {
            r: Math.round(this.currentColorRGB.r + (this.targetColorRGB.r - this.currentColorRGB.r) * this.colorMix),
            g: Math.round(this.currentColorRGB.g + (this.targetColorRGB.g - this.currentColorRGB.g) * this.colorMix),
            b: Math.round(this.currentColorRGB.b + (this.targetColorRGB.b - this.currentColorRGB.b) * this.colorMix)
        };
        this.targetColorRGB = this.hexToRgb(hex);
        this.colorMix = 0;
    }
}

class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particle-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null };

        window.addEventListener('resize', () => this.resize());

        // Track mouse relative to VIEWPORT (clientX/Y)
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Also track scroll if we wanted parallax, but for now fixed bg is fine.

        this.resize();
        this.initParticles();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initParticles() {
        const theme = localStorage.getItem('theme') || 'light';
        const color = theme === 'light' ? '#000000' : '#ffffff';

        this.particles = [];
        const density = (this.canvas.width * this.canvas.height) / 15000;
        const count = Math.min(density, 150);

        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(this.canvas.width, this.canvas.height, color));
        }
    }

    updateTheme(newColor) {
        this.particles.forEach(p => p.setTargetColor(newColor));
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            p.update(this.canvas.width, this.canvas.height, this.mouse);
            p.draw(this.ctx);
        });

        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
    window.particleSystem = new ParticleSystem();
});

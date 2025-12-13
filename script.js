/**
 * Interactive Particle Portfolio
 * features:
 * - Canvas-based particle system
 * - Mouse repulsion/attraction
 * - Smooth theme transitions
 */

class ThemeManager {
    constructor() {
        this.themeToggleBtn = document.getElementById('theme-toggle');
        this.body = document.body;
        this.overlay = document.querySelector('.theme-transition-overlay');
        
        // Colors for particle interpolation
        this.themes = {
            light: {
                bg: '#ffffff',
                particle: '#000000', // Black particles on white
                particleAlpha: 0.15
            },
            dark: {
                bg: '#111111',
                particle: '#ffffff', // White particles on dark
                particleAlpha: 0.15
            }
        };

        this.currentTheme = localStorage.getItem('theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        
        this.init();
    }

    init() {
        // Set initial theme without animation
        this.applyTheme(this.currentTheme, false);

        this.themeToggleBtn.addEventListener('click', (e) => this.toggleTheme(e));
    }

    applyTheme(themeName, animate = true) {
        this.body.setAttribute('data-theme', themeName);
        localStorage.setItem('theme', themeName);
        
        // Notify particle system if it exists
        if (window.particleSystem) {
            const targetColor = this.themes[themeName].particle;
            window.particleSystem.updateTheme(targetColor);
        }
    }

    toggleTheme(e) {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        const oldTheme = this.currentTheme;
        this.currentTheme = newTheme;

        // Visual Wave Transition
        this.animateTransition(e, newTheme, oldTheme);
        
        // Apply logic
        this.applyTheme(newTheme);
    }

    animateTransition(e, newTheme, oldTheme) {
        // Calculate click position relative to viewport
        const rect = e.target.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        // Create a temporary element for the ripple if we want it ABOVE canvas but BELOW text? 
        // Actually, CSS mixing-blend-mode or just a high z-index div with clip-path is easiest.
        // But we want particles to transition smoothly. 
        // Strategy: 
        // 1. Overlay is fixed, z-index 0 (behind UI, maybe above particles or below?).
        // If particles are transparent, background color matters.
        // Let's make the ripple happen on the BODY background or a layer just above it.
        
        // Set overlay color to new theme bg
        this.overlay.style.backgroundColor = this.themes[newTheme].bg;
        this.overlay.style.clipPath = `circle(0% at ${x}px ${y}px)`;
        this.overlay.classList.add('animating');
        
        // We need to ensure the overlay is visible
        // Animate clip-path
        const maxRadius = Math.hypot(window.innerWidth, window.innerHeight);
        
        const animation = this.overlay.animate([
            { clipPath: `circle(0px at ${x}px ${y}px)` },
            { clipPath: `circle(${maxRadius}px at ${x}px ${y}px)` }
        ], {
            duration: 600,
            easing: 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
            fill: 'forwards'
        });

        animation.onfinish = () => {
            // Animation done. 
            // 1. Set actual body background to new theme
            // 2. Hide overlay (reset)
            this.overlay.classList.remove('animating');
            this.overlay.style.clipPath = 'none';
        };
    }
}

class Particle {
    constructor(canvasWidth, canvasHeight, colorStr) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1; // 1 to 3px
        
        // Color handling
        this.colorStr = colorStr; // e.g., "#ffffff"
        this.targetColorStr = colorStr;
        this.currentColorRGB = this.hexToRgb(colorStr);
        this.targetColorRGB = this.hexToRgb(colorStr);
        this.colorMix = 0; // 0 to 1 (0 = current, 1 = target)
        
        // Interaction
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
    }

    hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });
        
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    update(width, height, mouse, themeTransitionFactor) {
        // Mouse Interaction
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx*dx + dy*dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = 150;
        let force = (maxDistance - distance) / maxDistance;

        // Repulsion
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < maxDistance) {
            this.x -= directionX;
            this.y -= directionY;
        } else {
            // Return to velocity movement
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx/20; // easing back
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy/20;
            }
        }

        // Standard movement
        this.x += this.vx;
        this.y += this.vy;
        this.baseX += this.vx; // Keep base moving too
        this.baseY += this.vy;

        // Wrap around
        if (this.x < 0) { this.x = width; this.baseX = width; }
        if (this.x > width) { this.x = 0; this.baseX = 0; }
        if (this.y < 0) { this.y = height; this.baseY = height; }
        if (this.y > height) { this.y = 0; this.baseY = 0; }

        // Color Interpolation
        if (this.colorMix < 1) {
            this.colorMix += 0.05; // Transition speed
            if(this.colorMix > 1) this.colorMix = 1;
        }
    }

    draw(ctx) {
        // Interpolate color
        const r = Math.round(this.currentColorRGB.r + (this.targetColorRGB.r - this.currentColorRGB.r) * this.colorMix);
        const g = Math.round(this.currentColorRGB.g + (this.targetColorRGB.g - this.currentColorRGB.g) * this.colorMix);
        const b = Math.round(this.currentColorRGB.b + (this.targetColorRGB.b - this.currentColorRGB.b) * this.colorMix);
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.2)`; // Hardcoded opacity for now
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    setTargetColor(hex) {
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
        this.numberOfParticles = 100;
        this.mouse = { x: null, y: null, radius: 150 };
        
        // Listeners
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
        
        // Init
        this.resize();
        this.initParticles();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // Re-init particles could be option, or just let them wrap
    }

    initParticles() {
        const theme = localStorage.getItem('theme') || 'light';
        const color = theme === 'light' ? '#000000' : '#ffffff';
        
        this.particles = [];
        // Calculate convenient density
        const density = (this.canvas.width * this.canvas.height) / 15000;
        this.numberOfParticles = Math.min(density, 150); // Cap at 150 for performance

        for (let i = 0; i < this.numberOfParticles; i++) {
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

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
    window.particleSystem = new ParticleSystem();
});

/**
 * Interactive Particle Portfolio - Iteration 2
 * - Fixed: Full page scrolling support
 * - Fixed: Mouse interaction works through layers
 * - Fixed: Theme animation sequencing (Wave Effect)
 */

class ThemeManager {
    constructor() {
        this.themeToggleBtn = document.getElementById('theme-toggle');
        this.body = document.body;
        this.overlay = document.querySelector('.theme-transition-overlay');
        this.logoBtn = document.getElementById('brand-logo');
        this.isAnimating = false;

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

        this.currentColorTheme = localStorage.getItem('color-theme') || 'default';

        this.init();
    }

    init() {
        // Set initial state without animation
        this.applyTheme(this.currentTheme);
        this.applyColorTheme(this.currentColorTheme);

        this.themeToggleBtn.addEventListener('click', (e) => this.toggleTheme(e));
        if (this.logoBtn) {
            this.logoBtn.addEventListener('click', () => this.toggleColorTheme());
        }
    }

    applyColorTheme(colorTheme) {
        if (colorTheme === 'default') {
            this.body.removeAttribute('data-color-theme');
        } else {
            this.body.setAttribute('data-color-theme', colorTheme);
        }
        localStorage.setItem('color-theme', colorTheme);
    }

    toggleColorTheme() {
        this.currentColorTheme = this.currentColorTheme === 'default' ? 'alt' : 'default';
        this.applyColorTheme(this.currentColorTheme);
    }

    applyTheme(themeName) {
        // This actually switches the CSS variables and sets state
        this.body.setAttribute('data-theme', themeName);
        localStorage.setItem('theme', themeName);
    }

    toggleTheme(e) {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const oldTheme = this.currentTheme;
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.currentTheme = newTheme;

        // 1. Start Particle Transition Immediately (Visual "Mix")
        if (window.particleSystem) {
            window.particleSystem.updateTheme(this.themes[newTheme].particle);
        }

        // 2. Start Wave Animation
        this.animateTransition(e, newTheme, () => {
            // 3. On Finish: detailed switch
            this.applyTheme(newTheme);
            this.isAnimating = false;
        });
    }

    animateTransition(e, newTheme, onComplete) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // Prepare overlay
        this.overlay.style.backgroundColor = this.themes[newTheme].bg;
        this.overlay.classList.add('animating');

        // Calculate radius to cover the furthest corner
        const maxRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        const animation = this.overlay.animate([
            { clipPath: `circle(0px at ${x}px ${y}px)` },
            { clipPath: `circle(${maxRadius}px at ${x}px ${y}px)` }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
            fill: 'forwards'
        });

        animation.onfinish = () => {
            onComplete();
            this.overlay.classList.remove('animating');
            this.overlay.style.clipPath = 'none';
            animation.cancel();
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
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

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

class TextMagnifier {
    constructor() {
        this.magnifyElements = document.querySelectorAll('[data-magnify], h1, h2, .hero-subtitle');
        this.chars = [];
        this.mouse = { x: -1000, y: -1000 };
        this.radius = 120; // Increased radius for smooth pull
        this.maxScale = 1.3;
        this.maxPull = 14; // Pixels to pull towards mouse

        this.init();
    }

    init() {
        this.magnifyElements.forEach(el => {
            this.splitText(el);
        });

        // Track global mouse
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Start Loop
        this.animate();
    }

    splitText(el) {
        const text = el.textContent;
        el.innerHTML = '';
        el.style.whiteSpace = 'pre-wrap';

        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            span.className = 'magnify-char';
            el.appendChild(span);
        });
    }

    animate() {
        this.magnifyElements.forEach(parent => {
            const rect = parent.getBoundingClientRect();
            const dist = Math.hypot(
                Math.max(rect.left, Math.min(this.mouse.x, rect.right)) - this.mouse.x,
                Math.max(rect.top, Math.min(this.mouse.y, rect.bottom)) - this.mouse.y
            );

            if (dist < this.radius + 50) {
                const chars = parent.querySelectorAll('.magnify-char');
                chars.forEach(char => {
                    const charRect = char.getBoundingClientRect();
                    const charX = charRect.left + charRect.width / 2;
                    const charY = charRect.top + charRect.height / 2;

                    const dx = this.mouse.x - charX;
                    const dy = this.mouse.y - charY;
                    const charDist = Math.sqrt(dx * dx + dy * dy);

                    if (charDist < this.radius) {
                        // Calculate intensity (0 to 1)
                        const effect = 1 - (charDist / this.radius);
                        const intensity = effect * effect; // Quadratic ease

                        // Scale
                        const scale = 1 + (intensity * (this.maxScale - 1));

                        // Magnetic Pull (Move towards mouse)
                        const pullFactor = intensity * this.maxPull;
                        // const transX = (dx / charDist) * pullFactor;
                        // const transY = (dy / charDist) * pullFactor;

                        // Limit pull to avoid extreme overlap, maybe dampen it
                        const transX = dx * intensity * 0.2;
                        const transY = dy * intensity * 0.2;

                        char.style.transform = `translate(${transX}px, ${transY}px) scale(${scale})`;
                    } else {
                        if (char.style.transform) {
                            char.style.transform = '';
                        }
                    }
                });
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

class CustomCursor {
    constructor() {
        this.ring = document.createElement('div');
        this.ring.className = 'cursor-ring';

        document.body.appendChild(this.ring);

        this.mouse = { x: -100, y: -100 };
        this.ringPos = { x: -100, y: -100 };

        this.init();
    }

    init() {
        // Track mouse
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;

            // Initial position to avoid flying in from corner on load
            if (this.ringPos.x === -100) {
                this.ringPos = { x: this.mouse.x, y: this.mouse.y };
            }
        });

        // Hover listeners for scale effect
        this.addHoverListeners();

        // Start loop
        this.animate();
    }

    addHoverListeners() {
        const hoverables = document.querySelectorAll('a, button, .logo, .theme-btn, .project-card, .social-icon, input, textarea');

        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });
    }

    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    animate() {
        // Smooth follow with slower inertia (0.05)
        this.ringPos.x = this.lerp(this.ringPos.x, this.mouse.x, 0.05);
        this.ringPos.y = this.lerp(this.ringPos.y, this.mouse.y, 0.05);

        // Apply transforms
        this.ring.style.transform = `translate(${this.ringPos.x}px, ${this.ringPos.y}px) translate(-50%, -50%)`;

        requestAnimationFrame(() => this.animate());
    }
}

// Enhance TextMagnifier with Magnetic Pull
class MagneticText {
    constructor() {
        // Re-using data-magnify attribute or targeting specific text
        this.textElements = document.querySelectorAll('[data-magnify], p, h1, h2, h3, h4, h5, h6, span, label');
        // Filter out large blocks, keep it to reasonable text containers if possible, 
        // but for "premium feel" on everything, we need to be careful about performance.
        // Let's restrict to headings and specific marked text for magnetism + slight shift on paragraphs.

        this.mouse = { x: -1000, y: -1000 };
        this.radius = 100;

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Start animation loop
        this.animate();
    }

    animate() {
        // Optimization: Only animate elements currently in viewport or close to mouse?
        // Simple bounding box check for active elements.

        // Note: Splitting every paragraph is bad for performance. 
        // We will Apply magnetism to WHOLE WORDS or Lines for general text, 
        // and CHARACTERS for headings/hero.

        // For this task request: "When hovering text, apply a mild magnetic pull where characters slightly distort or shift"
        // Existing TextMagnifier does character splitting. Let's assume we want to KEEP that for [data-magnify] 
        // and maybe apply a simple translation to other block elements? 
        // Actually, the user asked for "cursor ... magnetic pull ... characters".
        // I will stick to the existing TextMagnifier logic but ADD the magnetic pull shift.

        // We need to modify the existing TextMagnifier loop or replace it.
        // I will REPLACE the window.textMagnifier instantiation with this new logical block 
        // that handles both magnification and magnetic pull.
    }
}

// Updating existing TextMagnifier to include Magnetic Pull
// (Re-definition to overwrite previous class logic if we could, but here we are appending/editing)
// Best approach: I will edit the existing TextMagnifier class in-place in the next tool call, 
// so here I will just append the CustomCursor and init code.
// Wait, I am replacing the end of the file. I should rewrite the DOMContentLoaded block.

document.addEventListener('DOMContentLoaded', () => {
    // Check if device is touch capable to avoid custom cursor frustration
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (!isTouch && window.matchMedia('(pointer: fine)').matches) {
        window.customCursor = new CustomCursor();
    }

    // Initialize existing systems
    window.themeManager = new ThemeManager();
    window.particleSystem = new ParticleSystem();

    // Updated TextMagnifier (we will patch the class above in a separate edit, 
    // or we can instantiate a new MagneticText class if I renamed it).
    // Let's use the existing class but I need to modify it. 
    // For now, I'll instantiate the OLD one, but I plan to modify it.
    window.textMagnifier = new TextMagnifier();

    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li');
    const body = document.body;

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            body.classList.toggle('nav-active');

            // Animate Links
            links.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });
        });
    }

    // Close nav when clicking a link
    links.forEach(link => {
        link.addEventListener('click', () => {
            body.classList.remove('nav-active');
        });
    });
});


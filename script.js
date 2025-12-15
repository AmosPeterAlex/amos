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

// Minimal Simplex Noise implementation for organic movement
class SimplexNoise {
    constructor() {
        this.grad3 = [
            [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
            [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
            [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
        ];
        this.p = [];
        for (let i = 0; i < 256; i++) {
            this.p[i] = Math.floor(Math.random() * 256);
        }
        // To remove the need for index wrapping, double the permutation table length
        this.perm = [];
        for (let i = 0; i < 512; i++) {
            this.perm[i] = this.p[i & 255];
        }
    }

    dot(g, x, y) {
        return g[0] * x + g[1] * y;
    }

    noise(xin, yin) {
        let n0, n1, n2; // Noise contributions from the three corners
        // Skew the input space to determine which simplex cell we're in
        const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
        const s = (xin + yin) * F2; // Hairy factor for 2D
        const i = Math.floor(xin + s);
        const j = Math.floor(yin + s);
        const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
        const t = (i + j) * G2;
        const X0 = i - t; // Unskew the cell origin back to (x,y) space
        const Y0 = j - t;
        const x0 = xin - X0; // The x,y distances from the cell origin
        const y0 = yin - Y0;

        // For the 2D case, the simplex shape is an equilateral triangle.
        // Determine which simplex we are in.
        let i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
        if (x0 > y0) { i1 = 1; j1 = 0; } // lower triangle, XY order: (0,0)->(1,0)->(1,1)
        else { i1 = 0; j1 = 1; } // upper triangle, YX order: (0,0)->(0,1)->(1,1)

        // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
        // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
        // c = (3-sqrt(3))/6
        const x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
        const y2 = y0 - 1.0 + 2.0 * G2;

        // Work out the hashed gradient indices of the three simplex corners
        const ii = i & 255;
        const jj = j & 255;
        const gi0 = this.perm[ii + this.perm[jj]] % 12;
        const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
        const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;

        // Calculate the contribution from the three corners
        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0) n0 = 0.0;
        else {
            t0 *= t0;
            n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
        }

        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) n1 = 0.0;
        else {
            t1 *= t1;
            n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
        }

        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) n2 = 0.0;
        else {
            t2 *= t2;
            n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
        }

        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [-1,1].
        return 70.0 * (n0 + n1 + n2);
    }
}

class BlobAnimation {
    constructor() {
        this.canvas = document.getElementById('hero-blob');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.points = [];
        this.noise = new SimplexNoise();
        this.mouse = { x: 0, y: 0 };
        // Center of the canvas
        this.centerX = 0;
        this.centerY = 0;

        // Configuration
        this.numPoints = 8; // Number of vertices for the blob
        this.baseRadius = 180; // approximate radius
        this.noiseScale = 0.8; // How "rough" the noise is in space
        this.noiseStrength = 40; // How far vertices deform
        this.speed = 0.003; // Speed of evolution
        this.time = 0;

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            // Get mouse pos relative to canvas center? 
            // The canvas is fixed centered 600x600.
            // We need screen coordinates.
            // But tracking mouse relative to the fixed center of screen is easier.
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        this.resize();
        this.init();
        this.animate();
    }

    resize() {
        // Keeps the canvas resolution high but CSS handles fixed size
        // Actually, CSS sets 600px width/height.
        // Let's match internal resolution to avoid blur
        // or just use fixed 600x600 logical size.
        this.canvas.width = 600;
        this.canvas.height = 600;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    init() {
        // Create points in a circle
        this.points = [];
        const step = (Math.PI * 2) / this.numPoints;
        for (let i = 0; i < this.numPoints; i++) {
            const angle = i * step;
            this.points.push({
                angle: angle,
                x: 0,
                y: 0,
                baseAngle: angle
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.time += this.speed;

        // Update points
        this.points.forEach(p => {
            // Noise based on angle and time
            // We map circle to a line in noise space? Or 2D noise on the circle?
            // standard approach: noise(cos(a), sin(a), time) - requires 3D noise
            // 2D noise approach: noise(cos(a)*scale + time, sin(a)*scale + time)

            const ns = 1.5; // Noise spatial scale (smoothness around ring)

            // Circular noise sampling to make it loop perfect?
            // Simple approach: 2D noise walking through time on one axis? No.
            // Let's use 2D noise: x = cos(angle)+off, y = sin(angle)+off
            const xoff = Math.cos(p.baseAngle) * ns + this.time;
            const yoff = Math.sin(p.baseAngle) * ns + this.time;

            const n = this.noise.noise(xoff, yoff);
            const r = this.baseRadius + n * this.noiseStrength;

            // Mouse interaction (repel/attract)
            // Calculate distance from this point to mouse
            // Current theoretical pos
            let px = this.centerX + Math.cos(p.baseAngle) * r;
            let py = this.centerY + Math.sin(p.baseAngle) * r;

            const dx = this.mouse.x - px;
            const dy = this.mouse.y - py;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 200;

            let interactX = 0;
            let interactY = 0;

            if (dist < maxDist) {
                const force = (maxDist - dist) / maxDist;
                // Gentle attraction? or distortion?
                // Let's do attraction for "organic" feel
                interactX = dx * force * 0.1;
                interactY = dy * force * 0.1;
            }

            p.x = px + interactX;
            p.y = py + interactY;
        });

        // Draw Blob

        // Gradient
        // Iridescent-ish: changing colors over time
        const hue1 = (this.time * 50) % 360;
        const hue2 = (hue1 + 60) % 360;

        // Create gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 600, 600);
        // Use HSLA for better color control
        // We want a glassy look, so maybe semi-transparent
        gradient.addColorStop(0, `hsla(${hue1}, 70%, 60%, 0.6)`);
        gradient.addColorStop(1, `hsla(${hue2}, 70%, 60%, 0.6)`);

        this.ctx.fillStyle = gradient;
        // this.ctx.strokeStyle = `hsla(${hue1}, 80%, 80%, 0.5)`;
        // this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        // Cardinal spline / Catmull-Rom for smoothness through points
        // Simplified: use quadratic curves between midpoints

        const len = this.points.length;
        // Move to first midpoint
        const p0 = this.points[0];
        const pLast = this.points[len - 1];
        const midX0 = (p0.x + pLast.x) / 2;
        const midY0 = (p0.y + pLast.y) / 2;

        this.ctx.moveTo(midX0, midY0);

        for (let i = 0; i < len; i++) {
            const p1 = this.points[i];
            const p2 = this.points[(i + 1) % len];
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            this.ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
        }

        this.ctx.closePath();
        this.ctx.fill();
        // this.ctx.stroke();

        requestAnimationFrame(() => this.animate());
    }
}

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

// Sound Manager for UI Effects
class SoundManager {
    constructor() {
        this.toggleBtn = document.getElementById('sound-toggle');
        this.enabled = localStorage.getItem('sound-enabled') === 'true'; // Default false if not set? Request says "Sound preference must persist". Let's default to false or true? "Users must be able to turn sounds ON/OFF". Usually opt-in or opt-out. Let's default to OFF to be safe/non-intrusive, or ON if "premium experience" implies it. Let's default to FALSE as per "Sound volume should be low and non-intrusive" implies potential annoyance. Actually, let's default to TRUE but with a check, or FALSE. Let's go with FALSE to be safe, or TRUE if user didn't specify default. Let's assume TRUE for "wow" factor but check legacy.
        // Actually, let's default to FALSE to avoid auto-playing sound issues, but "premium" usually means ON. 
        // Let's check if null.
        if (localStorage.getItem('sound-enabled') === null) {
            this.enabled = true; // Default ON
        }

        this.ctx = null;
        // We defer AudioContext creation until interaction to avoid warnings/errors

        this.init();
    }

    init() {
        this.updateUI();

        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());
        }

        this.setupListeners();
    }

    updateUI() {
        if (this.toggleBtn) {
            this.toggleBtn.setAttribute('data-sound', this.enabled ? 'on' : 'off');
            this.toggleBtn.setAttribute('aria-label', this.enabled ? 'Mute Sound' : 'Enable Sound');
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('sound-enabled', this.enabled);
        this.updateUI();

        // If enabling, we might need to resume/create context immediately (if inside user gesture)
        if (this.enabled) {
            this.getContext();
            // Play a test sound to confirm enabled? Optional.
            this.playHoverSound();
        }
    }

    getContext() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    }

    playHoverSound() {
        if (!this.enabled) return;

        const ctx = this.getContext();

        // Premium "Pop" / "Thock" sound
        // Oscillator: Sine or Triangle
        // Envelope: very short attack, short decay
        // Filter: Lowpass to soften it

        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Sound Design
        osc.type = 'sine';
        // Pitch drop for "thock"
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);

        // Volume Envelope
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.05, t + 0.01); // Attack (low volume)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1); // Decay

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.1);
    }

    setupListeners() {
        // Target interactive elements
        const targets = document.querySelectorAll('a, button, [role="button"], .project-card, .social-icon, input, textarea');

        targets.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.playHoverSound();
            });
        });

        // Also listen for new elements if logic changes (MutationObserver) 
        // but for now static list is fine. 
        // Note: Dynamically added elements won't have sounds with this simple approach.
        // Better to use delegation if possible, or just re-run setup.
        // Event Delegation for mouseenter:
        document.body.addEventListener('mouseenter', (e) => {
            // mouseenter doesn't bubble, need to use mouseover or capture.
            // mouseover bubbles.
        }, true);

        // Let's use delegation with 'mouseover' and check target, 
        // to handle current and future elements.
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('a, button, [role="button"], .project-card, .social-icon, input, textarea');
            if (target && !target.dataset.soundAttached) {
                // To avoid repeated plays while moving INSIDE the element (mouseover fires again for children)
                // We track "mouseenter" logic manually or just use the listener on the element.
                // Re-attaching listeners is messy.
                // Simple approach: Use a flag or check relatedTarget?

                // Let's just stick to the initial attach for simplicity as requested "performant". 
                // Delegation for hover sound can be tricky with bubbling.
            }
        });

        // Actually, the simpler "querySelectorAll" is fine for this static site.
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Check if device is touch capable to avoid custom cursor frustration
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (!isTouch && window.matchMedia('(pointer: fine)').matches) {
        window.customCursor = new CustomCursor();
    }

    // Initialize existing systems
    window.themeManager = new ThemeManager();
    window.particleSystem = new ParticleSystem();
    window.blobAnimation = new BlobAnimation();
    window.soundManager = new SoundManager();

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


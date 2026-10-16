// Super Dark Lighter - 2D Retro Game for Free Roam
// Minado recreativo de Satoshis
// Version Pro - Optimized, visual juice, screen shake, and animated Game Over

class SuperDarkLighter {
    constructor() {
        this.canvas = document.getElementById('sdlighter-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.player = { x: 250, y: 175, size: 10, speed: 4 };
        this.particles = [];
        this.malware = [];
        this.bursts = []; // Visual particle bursts when nodes are eaten
        this.score = 0;
        this.highscore = parseInt(localStorage.getItem('sdlighter_highscore') || '0', 10);
        this.running = false;
        this.gameOver = false;
        this.keys = {};
        
        this.spawnTimer = null;
        this.malwareTimer = null;
        this.animationId = null;
        
        this.shakeTime = 0; // Screen shake duration in frames
        
        this.init();
    }
    
    init() {
        // Keyboard event bindings
        window.addEventListener('keydown', (e) => {
            const pageGame = document.getElementById('page-dark-game');
            if (pageGame && pageGame.classList.contains('hidden')) return; // ignore if page not active

            this.keys[e.key] = true;
            this.keys[e.code] = true;
            
            if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
                if (!this.running && !this.gameOver) {
                    this.start();
                } else if (this.gameOver) {
                    this.restart();
                }
            }
            
            // Prevent arrow scrolling inside browser frame
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            this.keys[e.code] = false;
        });

        // Clear keys when window loses focus to prevent player sliding off-screen
        window.addEventListener('blur', () => {
            this.keys = {};
        });
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.keys = {};
            }
        });
        
        this.drawMenu();
    }
    
    drawMenu() {
        const ctx = this.ctx;
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Digital background grid
        ctx.strokeStyle = 'rgba(0, 255, 102, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < this.canvas.width; x += 25) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.canvas.height); ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += 25) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.canvas.width, y); ctx.stroke();
        }
        
        ctx.fillStyle = '#00ff66';
        ctx.font = 'bold 42px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SUPER DARK LIGHTER', this.canvas.width / 2, this.canvas.height * 0.25);
        
        ctx.fillStyle = '#888';
        ctx.font = '20px monospace';
        ctx.fillText('Esquiva los bloques de MALWARE rojos (■).', this.canvas.width / 2, this.canvas.height * 0.38);
        ctx.fillText('Absorbe fragmentos de LUZ blancos (•) para obtener puntos.', this.canvas.width / 2, this.canvas.height * 0.46);
        ctx.fillText('Atrapa los SATOSHIS dorados (★) para ganar BTC reales.', this.canvas.width / 2, this.canvas.height * 0.54);
        
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 24px monospace';
        ctx.fillText(`RECORD DE SESION: ${this.highscore} PTS`, this.canvas.width / 2, this.canvas.height * 0.66);
        
        ctx.fillStyle = '#00ff66';
        ctx.font = 'bold 26px monospace';
        ctx.fillText('PULSA ESPACIO PARA INICIAR', this.canvas.width / 2, this.canvas.height * 0.78);
    }
    
    start() {
        this.player = { x: this.canvas.width / 2, y: this.canvas.height / 2, size: 10, speed: 4 };
        this.particles = [];
        this.malware = [];
        this.bursts = [];
        this.score = 0;
        this.running = true;
        this.gameOver = false;
        this.shakeTime = 0;
        
        // Clear old intervals just in case
        clearInterval(this.spawnTimer);
        clearInterval(this.malwareTimer);
        cancelAnimationFrame(this.animationId);
        
        // Spawn light bytes
        this.spawnTimer = setInterval(() => {
            if (!this.running) return;
            const isGolden = Math.random() < 0.15; // 15% chance for BTC reward
            this.particles.push({
                x: Math.random() * (this.canvas.width - 30) + 15,
                y: Math.random() * (this.canvas.height - 30) + 15,
                size: isGolden ? 8 : 5,
                isGolden: isGolden,
                color: isGolden ? '#ffcc00' : '#ffffff'
            });
        }, 1000);
        
        // Spawn malware blocks
        this.malwareTimer = setInterval(() => {
            if (!this.running) return;
            const edge = Math.floor(Math.random() * 4);
            let x, y;
            if (edge === 0) { // Top
                x = Math.random() * this.canvas.width; y = -15;
            } else if (edge === 1) { // Right
                x = this.canvas.width + 15; y = Math.random() * this.canvas.height;
            } else if (edge === 2) { // Bottom
                x = Math.random() * this.canvas.width; y = this.canvas.height + 15;
            } else { // Left
                x = -15; y = Math.random() * this.canvas.height;
            }
            
            const targetX = this.player.x;
            const targetY = this.player.y;
            const angle = Math.atan2(targetY - y, targetX - x) + (Math.random() * 0.3 - 0.15);
            const speed = Math.random() * 2 + 1.5 + (this.score * 0.05); // speed scales with score
            
            this.malware.push({
                x: x, y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 8 + 8
            });
        }, 900);
        
        this.loop();
    }
    
    restart() {
        this.start();
    }
    
    loop() {
        // Keep loop running if active or game over to draw animations/glitches
        if (!this.running && !this.gameOver) return;
        
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.loop());
    }
    
    update() {
        if (this.gameOver) return; // Do not update gameplay stats if game is over
        
        // Player movement
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W'] || this.keys['KeyW']) this.player.y -= this.player.speed;
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S'] || this.keys['KeyS']) this.player.y += this.player.speed;
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A'] || this.keys['KeyA']) this.player.x -= this.player.speed;
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D'] || this.keys['KeyD']) this.player.x += this.player.speed;
        
        // Strict boundary checking using player radius (player size / 2)
        const radius = this.player.size / 2;
        if (this.player.x < radius) this.player.x = radius;
        if (this.player.x > this.canvas.width - radius) this.player.x = this.canvas.width - radius;
        if (this.player.y < radius) this.player.y = radius;
        if (this.player.y > this.canvas.height - radius) this.player.y = this.canvas.height - radius;
        
        // Update malware movement
        this.malware.forEach(m => {
            m.x += m.vx;
            m.y += m.vy;
        });
        
        // Filter out off-screen malware
        this.malware = this.malware.filter(m => 
            m.x > -50 && m.x < this.canvas.width + 50 &&
            m.y > -50 && m.y < this.canvas.height + 50
        );
        
        // Update burst particles
        this.bursts.forEach((b, idx) => {
            b.x += b.vx;
            b.y += b.vy;
            b.alpha -= 0.04;
            if (b.alpha <= 0) {
                this.bursts.splice(idx, 1);
            }
        });
        
        // Collision checking: player with particles
        this.particles.forEach((p, idx) => {
            const dist = Math.hypot(this.player.x - p.x, this.player.y - p.y);
            if (dist < this.player.size / 2 + p.size) {
                this.particles.splice(idx, 1);
                
                // Spawn juicy burst particles
                for (let i = 0; i < 8; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 2 + 1;
                    this.bursts.push({
                        x: p.x,
                        y: p.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        color: p.color,
                        alpha: 1
                    });
                }
                
                if (p.isGolden) {
                    this.score += 5;
                    if (typeof updateWallet === 'function') updateWallet(0.005);
                    if (typeof playProudSound === 'function') playProudSound();
                } else {
                    this.score += 1;
                    if (typeof playClickSound === 'function') playClickSound();
                }
            }
        });
        
        // Collision checking: player with malware
        this.malware.forEach(m => {
            const dist = Math.hypot(this.player.x - m.x, this.player.y - m.y);
            if (dist < this.player.size / 2 + m.size / 2) {
                this.triggerGameOver();
            }
        });
        
        if (this.shakeTime > 0) this.shakeTime--;
    }
    
    triggerGameOver() {
        this.running = false;
        this.gameOver = true;
        this.shakeTime = 15; // Trigger heavy screen shake
        clearInterval(this.spawnTimer);
        clearInterval(this.malwareTimer);
        
        if (typeof playErrorSound === 'function') playErrorSound();
        
        // Save highscore
        if (this.score > this.highscore) {
            this.highscore = this.score;
            localStorage.setItem('sdlighter_highscore', this.highscore.toString());
        }
    }
    
    draw() {
        const ctx = this.ctx;
        ctx.save();
        
        // Apply screen shake
        if (this.shakeTime > 0) {
            const dx = (Math.random() - 0.5) * 6;
            const dy = (Math.random() - 0.5) * 6;
            ctx.translate(dx, dy);
        }
        
        if (this.gameOver) {
            this.drawGameOverScreen();
            ctx.restore();
            return;
        }
        
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Digital background grid
        ctx.strokeStyle = 'rgba(0, 255, 102, 0.04)';
        ctx.lineWidth = 1;
        for (let x = 0; x < this.canvas.width; x += 20) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.canvas.height); ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += 20) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.canvas.width, y); ctx.stroke();
        }
        
        // Draw light particles
        this.particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = p.isGolden ? 8 : 2;
            
            ctx.beginPath();
            if (p.isGolden) {
                const rot = Math.PI / 2 * 3;
                let x = p.x; let y = p.y;
                let step = Math.PI / 5;
                ctx.moveTo(p.x, p.y - p.size);
                for (let i = 0; i < 5; i++) {
                    x = p.x + Math.cos(rot + i * step * 2) * p.size;
                    y = p.y + Math.sin(rot + i * step * 2) * p.size;
                    ctx.lineTo(x, y);
                    x = p.x + Math.cos(rot + i * step * 2 + step) * (p.size / 2);
                    y = p.y + Math.sin(rot + i * step * 2 + step) * (p.size / 2);
                    ctx.lineTo(x, y);
                }
            } else {
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            }
            ctx.fill();
        });
        
        ctx.shadowBlur = 0; // reset shadow
        
        // Draw juicy burst particles
        this.bursts.forEach(b => {
            ctx.fillStyle = b.color;
            ctx.globalAlpha = b.alpha;
            ctx.fillRect(b.x - 2, b.y - 2, 4, 4);
        });
        ctx.globalAlpha = 1.0; // reset
        
        // Draw malware enemies
        this.malware.forEach(m => {
            ctx.fillStyle = '#ff3333';
            ctx.strokeStyle = '#ff9999';
            ctx.lineWidth = 1.5;
            ctx.fillRect(m.x - m.size / 2, m.y - m.size / 2, m.size, m.size);
            ctx.strokeRect(m.x - m.size / 2, m.y - m.size / 2, m.size, m.size);
        });
        
        // Draw player
        ctx.fillStyle = '#00ff66';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(this.player.x, this.player.y, this.player.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.shadowBlur = 0; // reset shadow
        
        // Draw UI Overlay
        ctx.fillStyle = '#00ff66';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`SCORE: ${this.score}`, 25, 35);
        ctx.textAlign = 'right';
        ctx.fillText(`RECORD: ${this.highscore}`, this.canvas.width - 25, 35);
        
        ctx.restore();
    }
    
    drawGameOverScreen() {
        const ctx = this.ctx;
        
        // Dark red scanlines background
        ctx.fillStyle = '#0a0000';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Glitch scanlines
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.08)';
        ctx.lineWidth = 2;
        for (let i = 0; i < this.canvas.height; i += 8) {
            ctx.beginPath();
            ctx.moveTo(0, i + Math.sin(Date.now() / 200 + i) * 2);
            ctx.lineTo(this.canvas.width, i + Math.sin(Date.now() / 200 + i) * 2);
            ctx.stroke();
        }
        
        // Red neon glow border
        ctx.strokeStyle = '#ff3333';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 10;
        ctx.strokeRect(10, 10, this.canvas.width - 20, this.canvas.height - 20);
        ctx.shadowBlur = 0;
        
        // Title with glitch text shadow
        ctx.fillStyle = '#ff3333';
        ctx.font = 'bold 52px Courier New';
        ctx.textAlign = 'center';
        const offset = Math.random() < 0.08 ? (Math.random() * 4 - 2) : 0;
        ctx.fillText('CONEXIÓN CAÍDA', this.canvas.width / 2 + offset, this.canvas.height * 0.22);
        
        ctx.fillStyle = '#ff8888';
        ctx.font = '22px monospace';
        ctx.fillText('[ MALWARE DETECTADO EN EL NODO ]', this.canvas.width / 2, this.canvas.height * 0.32);
        
        // Stats box
        const bw = 520, bh = 120;
        const bx = this.canvas.width / 2 - bw / 2;
        const by = this.canvas.height * 0.38;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = '#ff333344';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);
        
        ctx.fillStyle = '#00ff66';
        ctx.font = 'bold 24px monospace';
        ctx.fillText(`SATOSHIS EXTRAÍDOS: ${this.score} PTS`, this.canvas.width / 2, by + 45);
        
        ctx.fillStyle = '#ffcc00';
        ctx.fillText(`RÉCORD DE SESIÓN: ${this.highscore} PTS`, this.canvas.width / 2, by + 85);
        
        // Pulsing press space to restart text
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 150);
        ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
        ctx.font = 'bold 24px monospace';
        ctx.fillText('PULSA ESPACIO PARA REINICIAR', this.canvas.width / 2, this.canvas.height * 0.76);
    }
}

// Auto-initialize when document loads
document.addEventListener('DOMContentLoaded', () => {
    window.sdLighter = new SuperDarkLighter();
});

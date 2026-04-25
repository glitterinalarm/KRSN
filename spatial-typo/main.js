// Typography Lab - Spore "Ecosystem" Engine v50.0
// THE "SPORE" REVOLUTION: Organic, Diverse, Mathematical, and Biological.
// Focus: Deep morphological evolution, explosive diversity, and biological coherence.

console.log("TypoLab v50.0 — SPORE ECOSYSTEM REVOLUTION | QUANTUM EVOLUTION");

let _uid = 0;

const APP_STATE = {
    atoms: [],
    view: { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0 },
    isRecording: false
};

const FONT_SOURCES = [
    { name: 'Roboto', url: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-black-webfont.ttf' }
];
const FONTS = [];

function rand(a, b)   { return Math.random() * (b - a) + a; }
function clamp(v,a,b) { return Math.max(a, Math.min(b, v)); }
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════
// BIOCONTROL / GENOME
// ═══════════════════════════════════════════════════════════
class BioGenome {
    static TYPES = ['CRYSTAL', 'FLUID', 'NEURAL', 'MECHANIC', 'GASEOUS', 'FRAGMENTED', 'LIGHT'];
    static MATERIALS = ['MATTE', 'NEON', 'GLASS', 'MEAT', 'METAL'];

    static createRandom() {
        return {
            // Discrete Genes (Spore Style)
            type: pick(BioGenome.TYPES),
            material: pick(BioGenome.MATERIALS),
            
            // Physics Genes
            g_speed: rand(0.05, 0.2),
            g_amplitude: rand(0.1, 0.5),
            g_viscosity: rand(0.5, 0.95), // How much it drags
            g_vortex: rand(0, 0.1),
            g_drift: rand(0.01, 0.05),
            
            // Morphology Genes
            v_complexity: 0.1,
            v_fragmentation: 0,
            v_scale: 1.0,
            v_strokeW: rand(1, 3),
            v_resolution: 0.15,
            
            // Biological Traits
            cohesion: 1.0, 
            breathing: rand(0.01, 0.05),
            pulsation: rand(0.01, 0.1),
            
            // Aesthetic
            colorR: Math.random() * 255,
            colorG: Math.random() * 255,
            colorB: Math.random() * 255,
            alpha: 220,
            
            mutationRate: 0.1
        };
    }

    static merge(A, B) {
        const child = {};
        const dominant = Math.random() > 0.5 ? A : B;
        const recessive = dominant === A ? B : A;

        for (const k in A) {
            // Inheritance Logic
            if (typeof A[k] === 'string') {
                // Dominant/Recessive inheritance (Spore behavior)
                child[k] = Math.random() > 0.8 ? recessive[k] : dominant[k];
            } else if (k === 'v_complexity') {
                child[k] = clamp((A[k] + B[k]) / 2 + 0.15, 0.1, 1.0);
            } else if (k.startsWith('color')) {
                child[k] = clamp((A[k] + B[k]) / 2 + rand(-40, 40), 0, 255);
            } else {
                // Crossover with mutation
                child[k] = (A[k] + B[k]) / 2;
                if (Math.random() < A.mutationRate) child[k] += rand(-0.2, 0.2);
            }
        }

        // Radical Mutations (Mutations "Sauteuses")
        if (Math.random() < 0.1) child.type = pick(BioGenome.TYPES);
        if (child.v_complexity > 0.4) child.v_fragmentation += rand(0.1, 0.3);
        
        child.cohesion = clamp(dominant.cohesion * 0.9, 0.1, 0.98);
        child.g_speed += rand(0, 0.1);
        child.g_amplitude += rand(0, 0.3);

        return child;
    }
}

// ═══════════════════════════════════════════════════════════
// ECOSYSTEM SKETCH
// ═══════════════════════════════════════════════════════════
const sketch = (p) => {
    p.preload = () => {
        FONT_SOURCES.forEach(f => {
            p.loadFont(f.url, (font) => { FONTS.push({ name: f.name, obj: font }); });
        });
    };

    p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight).parent('stage');
        const hide = () => { const l = document.getElementById('loader'); if (l) l.classList.add('hidden'); };
        hide();
        setTimeout(hide, 2000);
        window.TU = new TypoUniverse(p);
        injectExportUI(p);
        for (let i = 0; i < 6; i++) window.TU.addAtom();
    };

    p.draw = () => {
        p.background(5, 6, 8); // Deep deep space
        
        // Dynamic Viewport move
        APP_STATE.view.x += (APP_STATE.view.targetX - APP_STATE.view.x) * 0.05;
        APP_STATE.view.y += (APP_STATE.view.targetY - APP_STATE.view.y) * 0.05;
        
        p.push();
        p.translate(p.width/2 + APP_STATE.view.x, p.height/2 + APP_STATE.view.y);
        p.scale(APP_STATE.view.zoom);
        
        // Draw Ecosystem
        APP_STATE.atoms.forEach(a => {
            a.update();
            a.draw();
        });
        p.pop();

        // Overlay info
        p.fill(255, 30);
        p.noStroke();
        p.textSize(10);
        p.text(`SPORE ENGINE v50.0 | MOLECULES: ${APP_STATE.atoms.length}`, 20, p.height - 20);
    };

    p.windowResized = () => p.resizeCanvas(window.innerWidth, window.innerHeight);
};

// ═══════════════════════════════════════════════════════════
// LIVING ORGANIC TYPO
// ═══════════════════════════════════════════════════════════
class LivingTypo {
    constructor(p, char, fontData, parentData = null) {
        this.p = p;
        this.atomId = _uid++;
        this.vertices = [];
        this.particles = []; // For fragmented/gaseous types
        this.breathingStage = Math.random() * p.TWO_PI;
        this.gen = 1;

        if (parentData) {
            this.x = parentData.x;
            this.y = parentData.y;
            this.char = parentData.char;
            this.fontName = parentData.fontName;
            this.dna = parentData.dna;
            this.gen = parentData.gen;
            
            // Re-sample or inherit vertices
            parentData.vertices.forEach(v => {
                this.vertices.push({
                    pos: v.pos.copy(),
                    basePos: v.pos.copy(),
                    vel: p.createVector(0,0),
                    seed: v.seed || Math.random()
                });
            });
            
            // If fragmented, inherit particles
            if (this.dna.type === 'FRAGMENTED' || this.dna.type === 'GASEOUS') {
                for (let i = 0; i < 100 * this.dna.v_complexity; i++) {
                    const v = pick(this.vertices);
                    this.particles.push({
                        pos: v.pos.copy(),
                        vel: p.createVector(rand(-1,1), rand(-1,1)),
                        sz: rand(2, 10),
                        life: rand(0.5, 1.0)
                    });
                }
            }
        } else {
            this.x = (Math.random() - 0.5) * 1200;
            this.y = (Math.random() - 0.5) * 800;
            this.char = char || pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
            this.dna = BioGenome.createRandom();
            const font = fontData || (FONTS.length ? FONTS[0] : null);
            this.fontName = font ? font.name : 'System';
            if (font && font.obj) {
                const b = font.obj.textBounds(this.char, 0, 0, 400);
                const pts = font.obj.textToPoints(this.char, -b.x - b.w/2, -b.y - b.h/2, 400, { sampleFactor: this.dna.v_resolution });
                pts.forEach(pt => {
                    this.vertices.push({
                        pos: p.createVector(pt.x, pt.y),
                        basePos: p.createVector(pt.x, pt.y),
                        vel: p.createVector(0, 0),
                        seed: Math.random()
                    });
                });
            }
        }
    }

    update() {
        const d = this.dna;
        const p = this.p;
        const t = p.frameCount * 0.01 * d.g_speed;
        this.breathingStage += d.breathing;

        const noiseScale = 0.005;
        const drift = d.g_drift * 10;

        // Biological Physics Loop
        this.vertices.forEach((v, i) => {
            const force = p.createVector(0, 0);
            
            // Vortex force (Quantum/Spore drift)
            const ang = p.noise(v.pos.x * noiseScale, v.pos.y * noiseScale, t) * p.TWO_PI * 4;
            force.add(p5.Vector.fromAngle(ang).mult(d.g_amplitude));
            
            // Swarm behavior
            if (d.type === 'FRAGMENTED') {
                force.add(p.createVector(rand(-drift, drift), rand(-drift, drift)));
            }

            // Cohesion (The elastic glue of the typo)
            const home = p5.Vector.sub(v.basePos, v.pos);
            force.add(home.mult(d.cohesion * 0.15));

            // Applied velocity
            v.vel.add(force);
            v.vel.mult(d.g_viscosity);
            v.pos.add(v.vel);

            // Breathing effect
            const breath = 1 + Math.sin(this.breathingStage + v.seed * p.TWO_PI) * 0.05;
            v.pos.mult(breath);
        });

        // Particle System Update (for Gaseous/Fragmented)
        this.particles.forEach(pt => {
            pt.pos.add(pt.vel);
            pt.vel.add(p.createVector(rand(-0.1, 0.1), rand(-0.1, 0.1)));
            pt.life -= 0.01;
            if (pt.life <= 0) {
                const target = pick(this.vertices);
                if (target) {
                    pt.pos = target.pos.copy();
                    pt.life = 1.0;
                }
            }
        });
    }

    draw() {
        const p = this.p;
        const d = this.dna;
        const col = [d.colorR, d.colorG, d.colorB];
        
        p.push();
        p.translate(this.x, this.y);
        
        // Depth / Volume logic
        const volume = 1 + d.v_complexity * 0.5;
        p.scale(volume);

        // Material Setting
        if (d.material === 'NEON') p.blendMode(p.ADD);
        if (d.material === 'GLASS') p.drawingContext.shadowBlur = 15;
        p.drawingContext.shadowColor = `rgba(${col[0]},${col[1]},${col[2]}, 0.5)`;

        // RENDER TYPES
        switch (d.type) {
            case 'CRYSTAL':
                this.drawCrystal(p, col, d);
                break;
            case 'FLUID':
                this.drawFluid(p, col, d);
                break;
            case 'NEURAL':
                this.drawNeural(p, col, d);
                break;
            case 'MECHANIC':
                this.drawMechanic(p, col, d);
                break;
            case 'GASEOUS':
                this.drawGaseous(p, col, d);
                break;
            case 'FRAGMENTED':
                this.drawFragmented(p, col, d);
                break;
            case 'LIGHT':
                this.drawLight(p, col, d);
                break;
            default:
                this.drawDefault(p, col, d);
        }

        p.blendMode(p.BLEND);
        p.pop();
    }

    // --- RENDERING MODULES ---

    drawDefault(p, col, d) {
        p.noFill();
        p.stroke(col[0], col[1], col[2], d.alpha);
        p.strokeWeight(d.v_strokeW);
        p.beginShape();
        this.vertices.forEach(v => p.vertex(v.pos.x, v.pos.y));
        p.endShape();
    }

    drawCrystal(p, col, d) {
        // Faceted polygons for volume
        p.noStroke();
        for (let i = 0; i < this.vertices.length - 3; i += 4) {
            p.fill(col[0], col[1], col[2], d.alpha * 0.3);
            p.beginShape();
            p.vertex(this.vertices[i].pos.x, this.vertices[i].pos.y);
            p.vertex(this.vertices[i+1].pos.x, this.vertices[i+1].pos.y);
            p.vertex(this.vertices[i+2].pos.x, this.vertices[i+2].pos.y);
            p.endShape(p.CLOSE);
            p.stroke(255, 40);
            p.line(this.vertices[i].pos.x, this.vertices[i].pos.y, this.vertices[i+2].pos.x, this.vertices[i+2].pos.y);
        }
    }

    drawFluid(p, col, d) {
        // Thick organic membrane
        p.fill(col[0], col[1], col[2], d.alpha * 0.4);
        p.stroke(col[0], col[1], col[2], d.alpha);
        p.strokeWeight(d.v_strokeW * 2);
        p.beginShape();
        if (this.vertices.length > 3) {
            this.vertices.forEach(v => p.curveVertex(v.pos.x, v.pos.y));
        } else {
            this.vertices.forEach(v => p.vertex(v.pos.x, v.pos.y));
        }
        p.endShape(p.CLOSE);
    }

    drawNeural(p, col, d) {
        // Connections and tendrils
        p.stroke(col[0], col[1], col[2], d.alpha * 0.8);
        p.strokeWeight(d.v_strokeW * 0.5);
        for (let i = 0; i < this.vertices.length; i += 8) {
            for (let j = i + 1; j < this.vertices.length; j += 20) {
                const dist = this.vertices[i].pos.dist(this.vertices[j].pos);
                if (dist < 100 * (1 + d.v_complexity)) {
                    p.line(this.vertices[i].pos.x, this.vertices[i].pos.y, this.vertices[j].pos.x, this.vertices[j].pos.y);
                }
            }
        }
    }

    drawMechanic(p, col, d) {
        // Joints and segments (tripods)
        p.stroke(col[0], col[1], col[2], d.alpha);
        p.strokeWeight(d.v_strokeW);
        for (let i = 0; i < this.vertices.length; i += 10) {
            const v = this.vertices[i];
            p.rect(v.pos.x - 2, v.pos.y - 2, 4, 4);
            if (i > 0) {
                p.line(v.pos.x, v.pos.y, this.vertices[i-1].pos.x, this.vertices[i-1].pos.y);
            }
            // Tripod legs
            if (v.seed > 0.8) {
                p.line(v.pos.x, v.pos.y, v.pos.x + 20, v.pos.y + 40);
            }
        }
    }

    drawGaseous(p, col, d) {
        // Particle trails and clouds
        p.noStroke();
        this.particles.forEach(pt => {
            p.fill(col[0], col[1], col[2], d.alpha * pt.life * 0.5);
            p.circle(pt.pos.x, pt.pos.y, pt.sz * pt.life);
        });
    }

    drawFragmented(p, col, d) {
        // Exploding blocks
        p.fill(col[0], col[1], col[2], d.alpha);
        p.noStroke();
        this.vertices.forEach((v, i) => {
            if (i % 5 === 0) {
                const sz = 10 * v.seed * (1 + d.v_complexity);
                p.push();
                p.translate(v.pos.x, v.pos.y);
                p.rotate(v.seed * p.TWO_PI + p.frameCount * 0.05);
                p.rect(-sz/2, -sz/2, sz, sz);
                p.pop();
            }
        });
    }

    drawLight(p, col, d) {
        // Glowing paths and neon light
        p.blendMode(p.ADD);
        p.noFill();
        p.strokeWeight(d.v_strokeW * 3);
        p.stroke(col[0], col[1], col[2], 50);
        p.beginShape();
        this.vertices.forEach(v => p.vertex(v.pos.x, v.pos.y));
        p.endShape();
        
        p.strokeWeight(d.v_strokeW);
        p.stroke(255, d.alpha);
        p.beginShape();
        this.vertices.forEach(v => p.vertex(v.pos.x, v.pos.y));
        p.endShape();
    }
}

// ═══════════════════════════════════════════════════════════
// ECOSYSTEM MANAGER
// ═══════════════════════════════════════════════════════════
class TypoUniverse {
    constructor(p) {
        this.p = p;
        this.history = [];
        this.initUI();
        this.initInteraction();
    }

    addAtom() {
        this.history.push([...APP_STATE.atoms]);
        APP_STATE.atoms.push(new LivingTypo(this.p, '', null));
        this.updateMoleculeList();
    }

    undo() {
        if (this.history.length > 0) {
            APP_STATE.atoms = this.history.pop();
            this.updateMoleculeList();
        }
    }

    focusOn(atomId) {
        const a = APP_STATE.atoms.find(o => o.atomId === atomId);
        if (a) {
            APP_STATE.view.targetX = -a.x * APP_STATE.view.zoom;
            APP_STATE.view.targetY = -a.y * APP_STATE.view.zoom;
        }
    }

    checkFusion(moved) {
        const other = APP_STATE.atoms.find(o => o !== moved && Math.hypot(o.x - moved.x, o.y - moved.y) < 150);
        if (!other) return;

        console.log("🧬 CELLULAR FUSION DETECTED");
        const childDna = BioGenome.merge(moved.dna, other.dna);
        
        const child = new LivingTypo(this.p, moved.char, null, {
            x: (moved.x + other.x) / 2,
            y: (moved.y + other.y) / 2,
            char: pick([moved.char, other.char]),
            fontName: moved.fontName,
            gen: Math.max(moved.gen, other.gen) + 1,
            dna: childDna,
            vertices: [...moved.vertices, ...other.vertices]
        });

        APP_STATE.atoms = APP_STATE.atoms.filter(a => a !== moved && a !== other);
        APP_STATE.atoms.push(child);
        this.updateMoleculeList();
    }

    initUI() {
        document.getElementById('add-atom').onclick = () => this.addAtom();
        document.getElementById('undo-btn').onclick = () => this.undo();
        document.getElementById('molecule-list').onclick = (e) => {
            const li = e.target.closest('[data-atom-id]');
            if (li) this.focusOn(parseInt(li.dataset.atomId, 10));
        };
    }

    initInteraction() {
        let dragged = null, panning = false, lx = 0, ly = 0;
        const toWorld = (cx, cy) => ({
            wx: (cx - this.p.width/2 - APP_STATE.view.x) / APP_STATE.view.zoom,
            wy: (cy - this.p.height/2 - APP_STATE.view.y) / APP_STATE.view.zoom
        });

        window.addEventListener('mousedown', e => {
            if (e.target.closest('.ui-overlay')) return;
            const { wx, wy } = toWorld(e.clientX, e.clientY);
            dragged = APP_STATE.atoms.find(a => Math.hypot(a.x - wx, a.y - wy) < 200 / APP_STATE.view.zoom) || null;
            if (!dragged) { panning = true; lx = e.clientX; ly = e.clientY; }
        });

        window.addEventListener('mousemove', e => {
            if (dragged) {
                dragged.x += (e.movementX) / APP_STATE.view.zoom;
                dragged.y += (e.movementY) / APP_STATE.view.zoom;
            } else if (panning) {
                APP_STATE.view.targetX += (e.clientX - lx);
                APP_STATE.view.targetY += (e.clientY - ly);
                APP_STATE.view.x = APP_STATE.view.targetX;
                APP_STATE.view.y = APP_STATE.view.targetY;
                lx = e.clientX; ly = e.clientY;
            }
        });

        window.addEventListener('mouseup', () => {
            if (dragged) this.checkFusion(dragged);
            dragged = null; panning = false;
        });

        window.addEventListener('wheel', e => {
            e.preventDefault();
            const factor = e.deltaY > 0 ? 0.9 : 1.1;
            APP_STATE.view.zoom = clamp(APP_STATE.view.zoom * factor, 0.05, 5);
        }, { passive: false });
    }

    updateMoleculeList() {
        const ml = document.getElementById('molecule-list');
        if (!ml) return;
        ml.innerHTML = APP_STATE.atoms.map(a => `
            <li class="molecule-item" data-atom-id="${a.atomId}">
                <span class="status-dot" style="background:rgb(${a.dna.colorR},${a.dna.colorG},${a.dna.colorB})"></span>
                <div class="molecule-info">
                   <div class="name">${a.char} [${a.dna.type}]</div>
                   <div class="meta">GEN ${a.gen} | ${a.dna.material}</div>
                </div>
            </li>
        `).join('');
    }
}

function injectExportUI(p) {
    const parent = document.querySelector('.side-panel');
    if (!parent) return;
    const div = document.createElement('div');
    div.className = 'export-group';
    div.innerHTML = `<button id="btn-snap" class="luxury-btn">SNAPSHOT</button>`;
    parent.appendChild(div);
    document.getElementById('btn-snap').onclick = () => p.saveCanvas('spore_typo', 'png');
}

new p5(sketch);

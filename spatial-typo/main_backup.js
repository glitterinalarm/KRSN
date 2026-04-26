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
    { name: 'Roboto', url: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-black-webfont.ttf' },
    { name: 'Playfair', url: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf' },
    { name: 'SpaceMono', url: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/spacemono/SpaceMono-Bold.ttf' }
];
const FONTS = [];

function rand(a, b)   { return Math.random() * (b - a) + a; }
function clamp(v,a,b) { return Math.max(a, Math.min(b, v)); }
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════
// BIOCONTROL / GENOME
// ═══════════════════════════════════════════════════════════
class BioGenome {
    static TYPES = [
        'CRYSTAL', 'FLUID', 'NEURAL', 'MECHANIC', 'GASEOUS', 'FRAGMENTED', 'LIGHT',
        'QUANTUM', 'FRACTAL', 'GRID', 'ARTISTIC', 'LIQUID_METAL', 'GHOST',
        'VOXEL', 'FUNGAL', 'GLITCH', 'VECTOR', 'STRING',
        'OP_ART', 'KINETIC', 'STIPPLE', 'AURA', 'FLUX',
        'MITOSIS', 'DNA', 'PHOTOSYNTHESIS', 'LYMPHOCYTE', 'GLOBULE',
        'TRIGONOMETRY', 'GOLDEN_RATIO', 'DERIVATIVE', 'INTEGRAL', 'COMPLEX_PLANE',
        'STATISTICS', 'GEOMETRY', 'LOGIC', 'EXPONENTIAL',
        'RELATIVITY', 'QUANTUM_WAVE', 'THERMODYNAMICS', 'ELECTROMAGNETISM',
        'GRAVITY_WELL', 'KINETICS', 'FLUID_DYNAMICS', 'OPTICS', 'ASTROPHYSICS',
        'CELLULAR_AUTOMATA', 'VORONOI', 'ASCII_ART', 'PIXEL_SORT', 'TURING',
        'DELAUNAY', 'FLOW_FIELD', 'ATTRACTOR', 'PARAMETRIC'
    ];
    static MATERIALS = ['MATTE', 'NEON', 'GLASS', 'MEAT', 'METAL', 'CHROME', 'PLASMA', 'GOLIGHT', 'DARKMATTER'];

    static cross(d1, d2) {
        const roll = Math.random();
        let newType = d1.type;
        let secondaryType = null;
        
        if (roll < 0.4) { // HYBRID: Combination of both
            newType = d1.type;
            secondaryType = d2.type;
        } else if (roll < 0.7) { // DOMINANT: One takes over
            newType = Math.random() > 0.5 ? d1.type : d2.type;
        } else if (roll < 0.95) { // MUTANT: New family
            newType = pick(this.TYPES);
        } else { // LETHAL: Handled in checkFusion
            return null;
        }

        return {
            type: newType,
            secondaryType: secondaryType,
            material: Math.random() > 0.5 ? d1.material : d2.material,
            colorR: (d1.colorR + d2.colorR) / 2,
            colorG: (d1.colorG + d2.colorG) / 2,
            colorB: (d1.colorB + d2.colorB) / 2,
            v_resolution: (d1.v_resolution + d2.v_resolution) / 2,
            v_speed: (d1.v_speed + d2.v_speed) / 2,
            v_complexity: (d1.v_complexity + d2.v_complexity) / 1.5,
            v_strokeW: (d1.v_strokeW + d2.v_strokeW) / 2,
            g_amplitude: (d1.g_amplitude + d2.g_amplitude) / 2,
            g_speed: (d1.g_speed + d2.g_speed) / 2,
            g_drift: (d1.g_drift + d2.g_drift) / 2,
            g_viscosity: (d1.g_viscosity + d2.g_viscosity) / 2,
            cohesion: (d1.cohesion + d2.cohesion) * 1.1,
            breathing: (d1.breathing + d2.breathing) / 2,
            anim_offset: d1.anim_offset.copy().lerp(d2.anim_offset, 0.5)
        };
    }

    static createRandom() {
        return {
            // Discrete Genes (Spore Style)
            type: pick(BioGenome.TYPES),
            material: pick(BioGenome.MATERIALS),
            
            // Physics Genes
            g_speed: rand(0.05, 0.25),
            g_amplitude: rand(0.2, 0.8),
            g_viscosity: rand(0.7, 0.98), 
            g_vortex: rand(0, 0.2),
            g_drift: rand(0.01, 0.1),
            g_quantum: rand(0, 1), // Probability of flickering
            
            // Morphology Genes
            v_complexity: 0.1,
            v_fragmentation: 0,
            v_scale: 1.0,
            v_strokeW: rand(1, 4),
            v_resolution: 0.2,
            v_fractalDepth: Math.floor(rand(1, 3)),
            
            // Biological & Physical Traits
            cohesion: 1.0, 
            breathing: rand(0.01, 0.08),
            pulsation: rand(0.02, 0.15),
            gravity: rand(-0.1, 0.1),
            
            // Deep Genetic Fusion
            anim_offset: p5.Vector.random2D(),
            
            // Aesthetic
            colorR: Math.random() * 255,
            colorG: Math.random() * 255,
            colorB: Math.random() * 255,
            alpha: 220,
            
            mutationRate: 0.15
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
        
        // Initial Showroom - Spawn 8 random families in a grid
        const allTypes = [...BioGenome.TYPES];
        const selectedTypes = [];
        for (let i = 0; i < 8; i++) {
            const idx = Math.floor(Math.random() * allTypes.length);
            selectedTypes.push(allTypes.splice(idx, 1)[0]);
        }
        
        const cols = 4;
        const spacing = 600;
        selectedTypes.forEach((type, i) => {
            const ix = i % cols;
            const iy = Math.floor(i / cols);
            const x = (ix - (cols-1)/2) * spacing;
            const y = (iy - (Math.ceil(selectedTypes.length/cols)-1)/2) * spacing;
            window.TU.addAtom(type, x, y);
        });
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
        p.text(`SPORE ENGINE v52.1 | FAMILIES: ${BioGenome.TYPES.length} | MOLECULES: ${APP_STATE.atoms.length}`, 20, p.height - 20);
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
            
            // Re-sample or inherit vertices with strict capping
            const MAX_VERTICES = 350;
            const step = Math.ceil(parentData.vertices.length / MAX_VERTICES);
            parentData.vertices.forEach((v, i) => {
                if (i % step === 0 && this.vertices.length < MAX_VERTICES) {
                    this.vertices.push({
                        pos: v.pos.copy(),
                        basePos: v.pos.copy(),
                        vel: p.createVector(0,0),
                        seed: v.seed || Math.random()
                    });
                }
            });
            
            // If fragmented, inherit particles (reduced)
            if (this.dna.type === 'FRAGMENTED' || this.dna.type === 'GASEOUS') {
                const particleCount = Math.min(40, 60 * this.dna.v_complexity);
                for (let i = 0; i < particleCount; i++) {
                    const v = pick(this.vertices) || { pos: p.createVector(0,0) };
                    this.particles.push({
                        pos: v.pos.copy(),
                        vel: p.createVector(rand(-1,1), rand(-1,1)),
                        sz: rand(2, 6),
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
                const sampleFactor = this.dna.v_resolution * 0.8; // Reduced sampling
                const pts = font.obj.textToPoints(this.char, -b.x - b.w/2, -b.y - b.h/2, 400, { sampleFactor });
                const MAX_VERTICES = 300;
                pts.forEach((pt, i) => {
                    if (this.vertices.length < MAX_VERTICES) {
                        this.vertices.push({
                            pos: p.createVector(pt.x, pt.y),
                            basePos: p.createVector(pt.x, pt.y),
                            vel: p.createVector(0, 0),
                            seed: Math.random()
                        });
                    }
                });
            }
        }
    }

    checkFusion(a1, a2) {
        const p = this.p;
        const childDNA = BioGenome.cross(a1.dna, a2.dna);
        
        if (!childDNA) {
            // LETHAL MUTATION: Both die in an explosion
            this.explode(a1.x, a1.y, [255, 0, 0]);
            this.removeAtom(a1.atomId);
            this.removeAtom(a2.atomId);
            return;
        }

        let childChar = Math.random() > 0.5 ? a1.char : a2.char;
        if (Math.random() < 0.2) {
            // MORPH: Character shift to mathematical/Greek symbols
            childChar = pick("ABCDEFGHIJKLMNOPQRSTUVWXYZΣΔΩΨΠΦΞΛΘ");
        }

        const nx = (a1.x + a2.x) / 2;
        const ny = (a1.y + a2.y) / 2;
        
        // Birth explosion
        this.explode(nx, ny, [childDNA.colorR, childDNA.colorG, childDNA.colorB]);

        this.addAtom(childDNA.type, nx, ny, childChar, childDNA);
        this.removeAtom(a1.atomId);
        this.removeAtom(a2.atomId);
    }

    explode(x, y, col) {
        const p = this.p;
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * p.TWO_PI;
            const spd = Math.random() * 8;
            this.particles.push({
                pos: p.createVector(x, y),
                vel: p.createVector(Math.cos(angle) * spd, Math.sin(angle) * spd),
                sz: rand(2, 10),
                life: 1.0,
                color: col
            });
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

            // Breathing effect (Smooth, non-cumulative)
            const breath = Math.sin(this.breathingStage + v.seed * p.TWO_PI) * 5 * d.v_complexity;
            v.pos.add(p5.Vector.mult(v.pos, breath * 0.001));
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
        p.push();
        p.translate(this.x, this.y);
        p.rotate(this.angle);

        const col = [d.colorR, d.colorG, d.colorB];
        p.strokeWeight(d.v_strokeW);

        // Material Setting
        if (d.material === 'NEON') p.blendMode(p.ADD);
        if (d.material === 'GLASS') p.drawingContext.shadowBlur = 15;
        p.drawingContext.shadowColor = `rgba(${col[0]},${col[1]},${col[2]}, 0.5)`;

        // Render Primary Engine
        this.renderDNA(p, col, d, d.type);
        
        // Render Secondary Engine (if Hybrid)
        if (d.secondaryType) {
            p.push();
            this.renderDNA(p, [255, 255, 255, 100], d, d.secondaryType);
            p.pop();
        }

        p.blendMode(p.BLEND);
        p.pop();
    }

    renderDNA(p, col, d, type) {
        switch (type) {
            case 'CRYSTAL':     this.drawCrystal(p, col, d); break;
            case 'FLUID':       this.drawFluid(p, col, d); break;
            case 'NEURAL':      this.drawNeural(p, col, d); break;
            case 'MECHANIC':    this.drawMechanic(p, col, d); break;
            case 'GASEOUS':      this.drawGaseous(p, col, d); break;
            case 'FRAGMENTED':  this.drawFragmented(p, col, d); break;
            case 'LIGHT':       this.drawLight(p, col, d); break;
            case 'QUANTUM':     this.drawQuantum(p, col, d); break;
            case 'FRACTAL':     this.drawFractal(p, col, d); break;
            case 'GRID':        this.drawGrid(p, col, d); break;
            case 'ARTISTIC':    this.drawArtistic(p, col, d); break;
            case 'LIQUID_METAL': this.drawLiquidMetal(p, col, d); break;
            case 'GHOST':       this.drawGhost(p, col, d); break;
            case 'VOXEL':       this.drawVoxel(p, col, d); break;
            case 'FUNGAL':      this.drawFungal(p, col, d); break;
            case 'GLITCH':      this.drawGlitch(p, col, d); break;
            case 'VECTOR':      this.drawVector(p, col, d); break;
            case 'STRING':      this.drawString(p, col, d); break;
            case 'OP_ART':      this.drawOpArt(p, col, d); break;
            case 'KINETIC':     this.drawKinetic(p, col, d); break;
            case 'STIPPLE':     this.drawStipple(p, col, d); break;
            case 'AURA':        this.drawAura(p, col, d); break;
            case 'FLUX':        this.drawFlux(p, col, d); break;
            case 'MITOSIS':     this.drawMitosis(p, col, d); break;
            case 'DNA':         this.drawDna(p, col, d); break;
            case 'PHOTOSYNTHESIS': this.drawPhotosynthesis(p, col, d); break;
            case 'LYMPHOCYTE':  this.drawLymphocyte(p, col, d); break;
            case 'GLOBULE':     this.drawGlobule(p, col, d); break;
            case 'TRIGONOMETRY': this.drawTrig(p, col, d); break;
            case 'GOLDEN_RATIO': this.drawGolden(p, col, d); break;
            case 'DERIVATIVE':   this.drawDeriv(p, col, d); break;
            case 'INTEGRAL':     this.drawIntegral(p, col, d); break;
            case 'COMPLEX_PLANE': this.drawComplex(p, col, d); break;
            case 'STATISTICS':   this.drawStats(p, col, d); break;
            case 'GEOMETRY':     this.drawGeometry(p, col, d); break;
            case 'LOGIC':        this.drawLogic(p, col, d); break;
            case 'EXPONENTIAL':  this.drawExpr(p, col, d); break;
            case 'RELATIVITY':   this.drawRelativity(p, col, d); break;
            case 'QUANTUM_WAVE': this.drawQuantumWave(p, col, d); break;
            case 'THERMODYNAMICS': this.drawEntropy(p, col, d); break;
            case 'ELECTROMAGNETISM': this.drawElectromagnetic(p, col, d); break;
            case 'GRAVITY_WELL': this.drawGravity(p, col, d); break;
            case 'KINETICS':     this.drawKinetics(p, col, d); break;
            case 'FLUID_DYNAMICS': this.drawFluidDyn(p, col, d); break;
            case 'OPTICS':       this.drawOptics(p, col, d); break;
            case 'ASTROPHYSICS': this.drawAstrophys(p, col, d); break;
            case 'CELLULAR_AUTOMATA': this.drawCellular(p, col, d); break;
            case 'VORONOI':      this.drawVoronoi(p, col, d); break;
            case 'ASCII_ART':    this.drawASCII(p, col, d); break;
            case 'PIXEL_SORT':   this.drawPixelSort(p, col, d); break;
            case 'TURING':       this.drawTuring(p, col, d); break;
            case 'DELAUNAY':     this.drawDelaunay(p, col, d); break;
            case 'FLOW_FIELD':   this.drawFlowField(p, col, d); break;
            case 'ATTRACTOR':    this.drawAttractor(p, col, d); break;
            case 'PARAMETRIC':   this.drawParametric(p, col, d); break;
            default:            this.drawDefault(p, col, d);
        }
    }

    // --- RENDERING MODULES ---

    drawQuantum(p, col, d) {
        // Superposition: fewer ghosts for performance
        for (let j = 0; j < 2; j++) {
            p.push();
            const ox = p.noise(p.frameCount * 0.05, j) * 15 - 7.5;
            const oy = p.noise(p.frameCount * 0.05, j + 50) * 15 - 7.5;
            p.translate(ox, oy);
            p.stroke(col[0], col[1], col[2], d.alpha * 0.15);
            p.noFill();
            p.beginShape();
            for (let i = 0; i < this.vertices.length; i += 2) {
                p.vertex(this.vertices[i].pos.x, this.vertices[i].pos.y);
            }
            p.endShape();
            p.pop();
        }
        // Quantum "Flicker"
        if (p.random() > 0.15) this.drawDefault(p, col, d);
    }

    drawFractal(p, col, d) {
        // Recursive replication on vertices (Heavily limited for performance)
        this.drawDefault(p, col, d);
        if (this.gen < 2) return;
        p.push();
        const sc = 0.25;
        p.scale(sc);
        let count = 0;
        const maxChildren = 6; 
        for (let i = 0; i < this.vertices.length; i += 50) {
            if (count >= maxChildren) break;
            const v = this.vertices[i];
            p.push();
            p.translate(v.pos.x / sc, v.pos.y / sc);
            this.drawDefault(p, col, d);
            p.pop();
            count++;
        }
        p.pop();
    }

    drawGrid(p, col, d) {
        // Snapped mathematical structure
        const gridSize = 20 * (1.1 - d.v_complexity);
        p.stroke(col[0], col[1], col[2], d.alpha);
        p.noFill();
        p.beginShape(p.LINES);
        this.vertices.forEach(v => {
            const gx = Math.round(v.pos.x / gridSize) * gridSize;
            const gy = Math.round(v.pos.y / gridSize) * gridSize;
            p.vertex(gx, gy);
            p.vertex(v.pos.x, v.pos.y);
        });
        p.endShape();
    }

    drawArtistic(p, col, d) {
        // Bauhaus / De Stijl inspired
        p.noStroke();
        this.vertices.forEach((v, i) => {
            if (i % 15 === 0) {
                const colors = [[255, 0, 0], [255, 255, 0], [0, 0, 255], [255, 255, 255]];
                const c = pick(colors);
                p.fill(c[0], c[1], c[2], d.alpha * 0.5);
                const w = 40 * v.seed;
                const h = 5 * v.seed;
                p.push();
                p.translate(v.pos.x, v.pos.y);
                p.rotate(v.vel.heading());
                p.rect(-w/2, -h/2, w, h);
                p.pop();
            }
        });
    }

    drawLiquidMetal(p, col, d) {
        p.blendMode(p.SCREEN);
        p.strokeWeight(d.v_strokeW * 4);
        p.stroke(200, 200, 255, 100);
        this.drawFluid(p, [255, 255, 255], d);
        p.strokeWeight(d.v_strokeW);
        p.stroke(col[0], col[1], col[2], d.alpha);
        this.drawFluid(p, col, d);
    }

    drawGhost(p, col, d) {
        p.noFill();
        p.strokeWeight(1);
        for (let i = 0; i < 5; i++) {
            p.stroke(col[0], col[1], col[2], (d.alpha / 5) * (1 - i / 5));
            p.beginShape();
            this.vertices.forEach(v => {
                const off = v.vel.copy().mult(-i * 2);
                p.vertex(v.pos.x + off.x, v.pos.y + off.y);
            });
            p.endShape();
        }
    }

    drawVoxel(p, col, d) {
        // Pseudo-3D Cubes
        p.noStroke();
        this.vertices.forEach((v, i) => {
            if (i % 12 === 0) {
                const sz = 15 * v.seed * (1 + d.v_complexity) * 0.8;
                p.fill(col[0], col[1], col[2], d.alpha);
                p.rect(v.pos.x, v.pos.y, sz, sz);
                p.fill(col[0]*0.7, col[1]*0.7, col[2]*0.7, d.alpha);
                p.beginShape();
                p.vertex(v.pos.x, v.pos.y);
                p.vertex(v.pos.x + sz/2, v.pos.y - sz/2);
                p.vertex(v.pos.x + sz + sz/2, v.pos.y - sz/2);
                p.vertex(v.pos.x + sz, v.pos.y);
                p.endShape(p.CLOSE);
            }
        });
    }

    drawFungal(p, col, d) {
        // Mycelium branching
        p.stroke(col[0], col[1], col[2], d.alpha * 0.6);
        p.strokeWeight(1);
        this.vertices.forEach((v, i) => {
            if (i % 15 === 0) {
                const ang = v.seed * p.TWO_PI;
                const len = 40 * v.seed * (1 + d.v_complexity);
                p.line(v.pos.x, v.pos.y, v.pos.x + Math.cos(ang) * len, v.pos.y + Math.sin(ang) * len);
                if (v.seed > 0.8) {
                    p.circle(v.pos.x + Math.cos(ang) * len, v.pos.y + Math.sin(ang) * len, 3);
                }
            }
        });
        this.drawDefault(p, col, d);
    }

    drawGlitch(p, col, d) {
        // Chromatic aberration and digital noise
        p.push();
        if (p.random() > 0.8) p.translate(p.random(-10, 10), 0);
        p.stroke(255, 0, 0, d.alpha * 0.5);
        this.drawDefault(p, [255, 0, 0], d);
        p.pop();
        
        p.push();
        if (p.random() > 0.8) p.translate(p.random(-10, 10), 0);
        p.stroke(0, 255, 255, d.alpha * 0.5);
        this.drawDefault(p, [0, 255, 255], d);
        p.pop();
        
        this.drawDefault(p, col, d);
    }

    drawVector(p, col, d) {
        // Streamlines
        p.noFill();
        p.stroke(col[0], col[1], col[2], d.alpha * 0.4);
        this.vertices.forEach((v, i) => {
            if (i % 10 === 0) {
                p.beginShape();
                let x = v.pos.x, y = v.pos.y;
                for (let step = 0; step < 5; step++) {
                    p.vertex(x, y);
                    const ang = p.noise(x * 0.01, y * 0.01, p.frameCount * 0.01) * p.TWO_PI * 2;
                    x += Math.cos(ang) * 10;
                    y += Math.sin(ang) * 10;
                }
                p.endShape();
            }
        });
    }

    drawString(p, col, d) {
        // High frequency vibrating strings
        p.noFill();
        p.strokeWeight(0.5);
        for (let i = 0; i < 3; i++) {
            p.stroke(col[0], col[1], col[2], (d.alpha / 3) * (1 + Math.sin(p.frameCount * 0.2 + i)));
            p.beginShape();
            this.vertices.forEach(v => {
                const off = Math.sin(p.frameCount * 0.5 + v.seed * 10) * 5;
                p.vertex(v.pos.x + off, v.pos.y + off);
            });
            p.endShape();
        }
    }

    drawOpArt(p, col, d) {
        // High contrast Moire & Concentric lines
        p.noFill();
        p.strokeWeight(2);
        for (let i = 0; i < 10; i += 2) {
            const shift = i * 2;
            p.stroke(i % 4 === 0 ? 255 : 0, d.alpha);
            p.beginShape();
            this.vertices.forEach(v => p.vertex(v.pos.x + shift, v.pos.y + shift));
            p.endShape();
        }
    }

    drawKinetic(p, col, d) {
        // Rotating mechanical parts
        p.stroke(col[0], col[1], col[2], d.alpha);
        this.vertices.forEach((v, i) => {
            if (i % 20 === 0) {
                p.push();
                p.translate(v.pos.x, v.pos.y);
                p.rotate(p.frameCount * 0.05 + v.seed * p.TWO_PI);
                p.line(-20, 0, 20, 0);
                p.circle(20, 0, 5);
                p.pop();
            }
        });
        this.drawDefault(p, col, d);
    }

    drawStipple(p, col, d) {
        // Pointillism / Dithering
        p.noStroke();
        p.fill(col[0], col[1], col[2], d.alpha);
        this.vertices.forEach((v, i) => {
            const density = Math.floor(v.seed * 10);
            for (let k = 0; k < density; k++) {
                p.circle(v.pos.x + rand(-10, 10), v.pos.y + rand(-10, 10), 2);
            }
        });
    }

    drawAura(p, col, d) {
        // Energetic glow field
        p.noFill();
        for (let i = 1; i < 5; i++) {
            p.stroke(col[0], col[1], col[2], d.alpha / (i * 2));
            p.strokeWeight(i * 5);
            p.beginShape();
            this.vertices.forEach(v => p.vertex(v.pos.x, v.pos.y));
            p.endShape();
        }
        this.drawDefault(p, [255, 255, 255], d);
    }

    drawFlux(p, col, d) {
        // Flowing particles
        p.noStroke();
        this.vertices.forEach((v, i) => {
            if (i % 5 === 0) {
                const flow = (p.frameCount * 0.1 + v.seed * 100) % 100;
                p.fill(col[0], col[1], col[2], d.alpha * (1 - flow/100));
                p.circle(v.pos.x, v.pos.y + flow, 3);
            }
        });
        this.drawDefault(p, col, d);
    }

    drawMitosis(p, col, d) {
        // Cells splitting
        const split = Math.sin(p.frameCount * 0.05) * 20;
        p.noFill();
        p.strokeWeight(d.v_strokeW);
        p.stroke(col[0], col[1], col[2], d.alpha);
        p.beginShape();
        this.vertices.forEach(v => p.vertex(v.pos.x - split, v.pos.y));
        p.endShape();
        p.beginShape();
        this.vertices.forEach(v => p.vertex(v.pos.x + split, v.pos.y));
        p.endShape();
    }

    drawDna(p, col, d) {
        // Double helix
        p.noFill();
        p.strokeWeight(1.5);
        for (let side = -1; side <= 1; side += 2) {
            p.stroke(col[0], col[1], col[2], d.alpha);
            p.beginShape();
            this.vertices.forEach((v, i) => {
                const off = Math.sin(p.frameCount * 0.1 + i * 0.5) * 15 * side;
                p.vertex(v.pos.x + off, v.pos.y);
                if (i % 8 === 0 && side === 1) {
                    p.push();
                    p.stroke(255, 50);
                    p.line(v.pos.x + off, v.pos.y, v.pos.x - off, v.pos.y);
                    p.pop();
                }
            });
            p.endShape();
        }
    }

    drawPhotosynthesis(p, col, d) {
        // Green energy & oxygen bubbles
        p.fill(50, 200, 100, d.alpha * 0.3);
        p.stroke(50, 255, 120, d.alpha);
        this.drawFluid(p, [50, 255, 120], d);
        p.noStroke();
        this.vertices.forEach((v, i) => {
            if (i % 10 === 0) {
                const oxy = (p.frameCount * 0.1 + v.seed * 100) % 50;
                p.fill(200, 255, 220, d.alpha * (1 - oxy/50));
                p.circle(v.pos.x, v.pos.y - oxy, 4);
            }
        });
    }

    drawLymphocyte(p, col, d) {
        // Defensive pulsing spikes
        p.stroke(255, d.alpha);
        p.fill(col[0], col[1], col[2], d.alpha * 0.7);
        this.vertices.forEach((v, i) => {
            if (i % 25 === 0) {
                p.push();
                p.translate(v.pos.x, v.pos.y);
                const pulse = Math.sin(p.frameCount * 0.1 + v.seed * 5);
                for (let a = 0; a < p.TWO_PI; a += p.PI/3) {
                    p.line(0, 0, Math.cos(a) * (15 + pulse * 10), Math.sin(a) * (15 + pulse * 10));
                }
                p.circle(0, 0, 8);
                p.pop();
            }
        });
        this.drawDefault(p, col, d);
    }

    drawGlobule(p, col, d) {
        // Soft red spheres
        p.noStroke();
        this.vertices.forEach((v, i) => {
            if (i % 8 === 0) {
                const pulse = 1 + Math.sin(p.frameCount * 0.1 + v.seed * 10) * 0.2;
                p.fill(200, 20, 40, d.alpha);
                p.circle(v.pos.x, v.pos.y, 12 * pulse);
                p.fill(255, 100);
                p.circle(v.pos.x - 3, v.pos.y - 3, 3);
            }
        });
    }

    drawTrig(p, col, d) {
        // Sine & Cosine waves
        p.noFill();
        p.stroke(col[0], col[1], col[2], d.alpha);
        p.beginShape();
        this.vertices.forEach((v, i) => {
            const wave = Math.sin(p.frameCount * 0.1 + i * 0.2) * 20;
            p.vertex(v.pos.x, v.pos.y + wave);
        });
        p.endShape();
    }

    drawGolden(p, col, d) {
        // Fibonacci Spirals
        p.noFill();
        p.stroke(col[0], col[1], col[2], d.alpha * 0.5);
        this.vertices.forEach((v, i) => {
            if (i % 40 === 0) {
                p.push();
                p.translate(v.pos.x, v.pos.y);
                let a = 0, r = 0;
                p.beginShape();
                for (let k = 0; k < 20; k++) {
                    p.vertex(Math.cos(a)*r, Math.sin(a)*r);
                    a += 1.618; r += 2;
                }
                p.endShape();
                p.pop();
            }
        });
        this.drawDefault(p, col, d);
    }

    drawDeriv(p, col, d) {
        // Tangent lines (Derivatives)
        p.stroke(col[0], col[1], col[2], d.alpha);
        this.vertices.forEach((v, i) => {
            if (i % 15 === 0 && i < this.vertices.length - 1) {
                const next = this.vertices[i+1];
                const dx = next.pos.x - v.pos.x;
                const dy = next.pos.y - v.pos.y;
                p.line(v.pos.x - dx*2, v.pos.y - dy*2, v.pos.x + dx*2, v.pos.y + dy*2);
                p.circle(v.pos.x, v.pos.y, 3);
            }
        });
    }

    drawIntegral(p, col, d) {
        // Sums and areas
        p.stroke(col[0], col[1], col[2], d.alpha * 0.4);
        p.strokeWeight(1);
        this.vertices.forEach((v, i) => {
            if (i % 8 === 0) {
                p.line(v.pos.x, v.pos.y, v.pos.x, v.pos.y + 30 * v.seed);
            }
        });
        this.drawDefault(p, col, d);
    }

    drawComplex(p, col, d) {
        // Fractal noise maps
        p.noStroke();
        this.vertices.forEach((v, i) => {
            if (i % 5 === 0) {
                const noise = p.noise(v.pos.x * 0.05, v.pos.y * 0.05, p.frameCount * 0.01);
                p.fill(col[0], col[1], col[2], d.alpha * noise);
                p.rect(v.pos.x - 5, v.pos.y - 5, 10, 10);
            }
        });
    }

    drawStats(p, col, d) {
        // Bar charts & Distributions
        p.fill(col[0], col[1], col[2], d.alpha);
        this.vertices.forEach((v, i) => {
            if (i % 20 === 0) {
                const h = 30 * v.seed;
                p.rect(v.pos.x - 2, v.pos.y - h, 4, h);
            }
        });
    }

    drawGeometry(p, col, d) {
        // Euclidean shapes
        p.noFill();
        p.stroke(col[0], col[1], col[2], d.alpha);
        this.vertices.forEach((v, i) => {
            if (i % 30 === 0) {
                if (v.seed > 0.5) p.circle(v.pos.x, v.pos.y, 20);
                else p.triangle(v.pos.x, v.pos.y - 10, v.pos.x - 10, v.pos.y + 10, v.pos.x + 10, v.pos.y + 10);
            }
        });
        this.drawDefault(p, col, d);
    }

    drawLogic(p, col, d) {
        // Binary logic
        p.fill(col[0], col[1], col[2], d.alpha);
        p.textSize(8);
        this.vertices.forEach((v, i) => {
            if (i % 12 === 0) {
                p.text(v.seed > 0.5 ? "1" : "0", v.pos.x, v.pos.y);
            }
        });
    }

    drawExpr(p, col, d) {
        // Exponential growth curves
        p.noFill();
        p.stroke(col[0], col[1], col[2], d.alpha);
        this.vertices.forEach((v, i) => {
            if (i % 40 === 0) {
                p.beginShape();
                for (let x = 0; x < 30; x++) {
                    p.vertex(v.pos.x + x, v.pos.y - Math.exp(x * 0.1) * 2);
                }
                p.endShape();
            }
        });
        this.drawDefault(p, col, d);
    }

    drawRelativity(p, col, d) {
        // Space-time Curvature
        p.noFill();
        p.stroke(col[0], col[1], col[2], d.alpha * 0.5);
        for (let r = 20; r < 200; r += 40) {
            p.ellipse(0, 0, r * 2, r * 1.5);
        }
        this.vertices.forEach(v => {
            p.push();
            p.translate(v.pos.x, v.pos.y);
            p.rotate(v.pos.heading());
            p.line(0, 0, 20, 0);
            p.pop();
        });
    }

    drawQuantumWave(p, col, d) {
        // Wave-Particle Duality
        p.noFill();
        p.strokeWeight(1);
        for (let i = 0; i < 3; i++) {
            p.stroke(col[0], col[1], col[2], d.alpha / (i+1));
            p.beginShape();
            this.vertices.forEach((v, j) => {
                const wave = p.sin(p.frameCount * 0.2 + j * 0.1 + i) * 15;
                p.vertex(v.pos.x + wave, v.pos.y + wave);
            });
            p.endShape();
        }
    }

    drawEntropy(p, col, d) {
        // Thermal Agitation
        p.noStroke();
        this.vertices.forEach(v => {
            const heatX = rand(-5, 5);
            const heatY = rand(-5, 5);
            p.fill(col[0], col[1], col[2], d.alpha * 0.6);
            p.circle(v.pos.x + heatX, v.pos.y + heatY, 3);
        });
    }

    drawElectromagnetic(p, col, d) {
        // Field Lines
        p.noFill();
        p.stroke(col[0], col[1], col[2], d.alpha);
        this.vertices.forEach((v, i) => {
            if (i % 15 === 0) {
                p.push();
                p.translate(v.pos.x, v.pos.y);
                p.arc(0, 0, 40, 40, 0, p.PI);
                p.pop();
            }
        });
        this.drawDefault(p, [255, 255, 255], d);
    }

    drawGravity(p, col, d) {
        // Point Mass & Vacuum
        p.fill(0, d.alpha);
        p.stroke(col[0], col[1], col[2], d.alpha);
        p.circle(0, 0, 50);
        this.vertices.forEach(v => {
            const dist = p.dist(0, 0, v.pos.x, v.pos.y);
            const force = p.createVector(-v.pos.x, -v.pos.y).limit(2);
            v.pos.add(force);
            p.line(v.pos.x, v.pos.y, 0, 0);
        });
    }

    drawKinetics(p, col, d) {
        // Momentum Vectors
        p.stroke(col[0], col[1], col[2], d.alpha);
        this.vertices.forEach(v => {
            p.line(v.pos.x, v.pos.y, v.pos.x + v.vel.x * 10, v.pos.y + v.vel.y * 10);
            p.circle(v.pos.x, v.pos.y, 2);
        });
    }

    drawFluidDyn(p, col, d) {
        // Turbulent streams
        p.noFill();
        p.stroke(col[0], col[1], col[2], d.alpha * 0.3);
        this.vertices.forEach((v, i) => {
            if (i % 8 === 0) {
                p.beginShape();
                for (let k = 0; k < 10; k++) {
                    const nx = p.noise(v.pos.x * 0.01, v.pos.y * 0.01, k * 0.1) * 20;
                    p.vertex(v.pos.x + k * 5, v.pos.y + nx);
                }
                p.endShape();
            }
        });
    }

    drawOptics(p, col, d) {
        // Refraction & Caustics
        p.push();
        p.blendMode(p.ADD);
        p.stroke(255, d.alpha);
        this.vertices.forEach((v, i) => {
            if (i % 20 === 0) {
                const ray = p.createVector(100, 100);
                p.line(v.pos.x, v.pos.y, v.pos.x + ray.x, v.pos.y + ray.y);
            }
        });
        p.pop();
        this.drawDefault(p, col, d);
    }

    drawAstrophys(p, col, d) {
        // Planetary Orbits
        p.noFill();
        p.stroke(col[0], col[1], col[2], d.alpha * 0.5);
        this.vertices.forEach((v, i) => {
            if (i % 50 === 0) {
                p.circle(v.pos.x, v.pos.y, 40);
                p.push();
                p.translate(v.pos.x, v.pos.y);
                p.rotate(p.frameCount * 0.1);
                p.fill(255, d.alpha);
                p.circle(20, 0, 5);
                p.pop();
            }
        });
    }

    drawCellular(p, col, d) {
        // Grid-based growth
        p.noStroke();
        p.fill(col[0], col[1], col[2], d.alpha * 0.6);
        this.vertices.forEach((v, i) => {
            if (i % 10 === 0) {
                const sz = 6;
                p.rect(Math.round(v.pos.x / sz) * sz, Math.round(v.pos.y / sz) * sz, sz-1, sz-1);
            }
        });
    }

    drawVoronoi(p, col, d) {
        // Cellular partition
        p.stroke(col[0], col[1], col[2], d.alpha * 0.4);
        p.noFill();
        this.vertices.forEach((v, i) => {
            if (i % 30 === 0) {
                p.beginShape();
                for (let a = 0; a < p.TWO_PI; a += p.PI/3) {
                    p.vertex(v.pos.x + p.cos(a) * 20, v.pos.y + p.sin(a) * 20);
                }
                p.endShape(p.CLOSE);
            }
        });
        this.drawDefault(p, col, d);
    }

    drawASCII(p, col, d) {
        // Textual representation
        p.fill(col[0], col[1], col[2], d.alpha);
        p.textSize(9);
        const chars = "@#S%?*+;:,.";
        this.vertices.forEach((v, i) => {
            if (i % 12 === 0) {
                const c = chars[Math.floor(v.seed * chars.length)];
                p.text(c, v.pos.x, v.pos.y);
            }
        });
    }

    drawPixelSort(p, col, d) {
        // Vertical melting
        p.stroke(col[0], col[1], col[2], d.alpha * 0.5);
        this.vertices.forEach((v, i) => {
            if (i % 10 === 0) {
                const len = p.noise(v.pos.x * 0.1, p.frameCount * 0.05) * 60;
                p.line(v.pos.x, v.pos.y, v.pos.x, v.pos.y + len);
            }
        });
        this.drawDefault(p, col, d);
    }

    drawTuring(p, col, d) {
        // Reaction-Diffusion spots
        p.noStroke();
        this.vertices.forEach((v, i) => {
            if (i % 5 === 0) {
                const n = p.noise(v.pos.x * 0.04, v.pos.y * 0.04, p.frameCount * 0.02);
                if (n > 0.6) {
                    p.fill(255, d.alpha * n);
                    p.circle(v.pos.x, v.pos.y, 8);
                }
            }
        });
    }

    drawDelaunay(p, col, d) {
        // Triangulation mesh
        p.stroke(col[0], col[1], col[2], d.alpha * 0.3);
        p.noFill();
        for (let i = 0; i < this.vertices.length; i += 20) {
            const v1 = this.vertices[i];
            const v2 = this.vertices[(i + 40) % this.vertices.length];
            const v3 = this.vertices[(i + 80) % this.vertices.length];
            p.triangle(v1.pos.x, v1.pos.y, v2.pos.x, v2.pos.y, v3.pos.x, v3.pos.y);
        }
    }

    drawFlowField(p, col, d) {
        // Streamlines
        p.noFill();
        p.stroke(col[0], col[1], col[2], d.alpha * 0.6);
        this.vertices.forEach((v, i) => {
            if (i % 15 === 0) {
                p.beginShape();
                let x = v.pos.x, y = v.pos.y;
                for (let k = 0; k < 5; k++) {
                    const ang = p.noise(x * 0.01, y * 0.01, p.frameCount * 0.01) * p.TWO_PI * 2;
                    x += p.cos(ang) * 10;
                    y += p.sin(ang) * 10;
                    p.vertex(x, y);
                }
                p.endShape();
            }
        });
    }

    drawAttractor(p, col, d) {
        // Strange attractors (simulated)
        p.noFill();
        p.stroke(col[0], col[1], col[2], d.alpha * 0.4);
        this.vertices.forEach((v, i) => {
            if (i % 50 === 0) {
                p.push();
                p.translate(v.pos.x, v.pos.y);
                p.beginShape();
                let lx = 0, ly = 0;
                for (let k = 0; k < 30; k++) {
                    const nx = p.sin(ly * 0.1) * 10;
                    const ny = p.cos(lx * 0.1) * 10;
                    lx += nx; ly += ny;
                    p.vertex(lx, ly);
                }
                p.endShape();
                p.pop();
            }
        });
    }

    drawParametric(p, col, d) {
        // Geometric orbits
        p.noFill();
        p.stroke(col[0], col[1], col[2], d.alpha);
        this.vertices.forEach((v, i) => {
            if (i % 40 === 0) {
                p.push();
                p.translate(v.pos.x, v.pos.y);
                p.beginShape();
                for (let a = 0; a < p.TWO_PI; a += 0.2) {
                    const r = 20 * p.sin(a * 4 + p.frameCount * 0.1);
                    p.vertex(p.cos(a) * r, p.sin(a) * r);
                }
                p.endShape(p.CLOSE);
                p.pop();
            }
        });
        this.drawDefault(p, col, d);
    }

    drawDefault(p, col, d) {
        p.noFill();
        p.stroke(col[0], col[1], col[2], d.alpha);
        p.strokeWeight(d.v_strokeW);
        p.beginShape();
        if (this.vertices.length > 3) {
            // Use curveVertex for smoother organic paths
            p.curveVertex(this.vertices[0].pos.x, this.vertices[0].pos.y);
            this.vertices.forEach(v => p.curveVertex(v.pos.x, v.pos.y));
            p.curveVertex(this.vertices[this.vertices.length-1].pos.x, this.vertices[this.vertices.length-1].pos.y);
        } else {
            this.vertices.forEach(v => p.vertex(v.pos.x, v.pos.y));
        }
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
        // High-performance Neural connections
        p.stroke(col[0], col[1], col[2], d.alpha * 0.8);
        p.strokeWeight(d.v_strokeW * 0.5);
        const limit = 100 * (1 + d.v_complexity);
        const step = Math.max(12, Math.floor(20 / (1 + d.v_complexity)));
        for (let i = 0; i < this.vertices.length; i += step) {
            const v1 = this.vertices[i];
            for (let j = i + step; j < this.vertices.length; j += step * 2) {
                const v2 = this.vertices[j];
                const dsq = (v1.pos.x - v2.pos.x)**2 + (v1.pos.y - v2.pos.y)**2;
                if (dsq < limit * limit) {
                    p.line(v1.pos.x, v1.pos.y, v2.pos.x, v2.pos.y);
                }
            }
        }
    }

    drawMechanic(p, col, d) {
        // High-tech skeletal structure
        p.stroke(col[0], col[1], col[2], d.alpha * 0.8);
        p.strokeWeight(d.v_strokeW * 0.5);
        this.vertices.forEach((v, i) => {
            if (i % 15 === 0) {
                const len = 25 * Math.sin(p.frameCount * 0.06 + v.seed * 5);
                p.line(v.pos.x, v.pos.y, v.pos.x + len, v.pos.y + len);
                p.noStroke();
                p.fill(col[0], col[1], col[2], d.alpha);
                p.rect(v.pos.x + len - 2, v.pos.y + len - 2, 4, 4);
                p.stroke(col[0], col[1], col[2], d.alpha * 0.8);
            }
        });
        this.drawDefault(p, col, d);
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

    addAtom(forcedType = null, x = null, y = null) {
        this.history.push([...APP_STATE.atoms]);
        const atom = new LivingTypo(this.p, '', null);
        if (forcedType) atom.dna.type = forcedType;
        if (x !== null) atom.x = x;
        if (y !== null) atom.y = y;
        APP_STATE.atoms.push(atom);
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
            if (e.target.closest('.ui-overlay')) return; // Let the menu scroll!
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

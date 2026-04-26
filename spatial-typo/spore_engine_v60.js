// Typography Lab - Spore "Ecosystem" Engine v52.2
// THE "SPORE" REVOLUTION: Organic, Diverse, Mathematical, and Biological.
// Focus: Deep morphological evolution, explosive diversity, and biological coherence.

console.log("TypoLab v52.2 — SPORE ECOSYSTEM REVOLUTION | QUANTUM EVOLUTION");

let _uid = 0;

const APP_STATE = {
    atoms: [],
    view: { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0 },
    isRecording: false
};

const FONT_SOURCES = [
    { name: 'Outfit', url: 'https://cdn.jsdelivr.net/fontsource/fonts/outfit@latest/latin-700-normal.ttf' }
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

    static createRandom(p) {
        return {
            type: pick(this.TYPES),
            material: pick(this.MATERIALS),
            alpha: 255,
            v_resolution: 0.15,
            v_speed: rand(0.5, 2.0),
            v_complexity: rand(0.3, 1.2),
            v_strokeW: rand(1, 3),
            g_amplitude: rand(1, 4), // Reduced from 2-10
            g_speed: rand(0.5, 2),
            g_drift: rand(-0.2, 0.2),
            g_viscosity: rand(0.92, 0.98),
            cohesion: rand(0.4, 0.8), // Increased from 0.1-0.5
            breathing: rand(0.01, 0.03),
            anim_offset: p ? p.createVector(0,0) : { x: 0, y: 0, copy: () => ({ x: 0, y: 0 }) },
            colorR: Math.random() * 255,
            colorG: Math.random() * 255,
            colorB: Math.random() * 255
        };
    }

    static cross(d1, d2, p) {
        const roll = Math.random();
        let newType = d1.type;
        let secondaryType = null;
        let isSuper = false;

        if (d1.type === d2.type) {
            isSuper = true;
            newType = d1.type;
            secondaryType = d1.secondaryType || d1.type;
        } else if (roll < 0.6) {
            newType = d1.type;
            secondaryType = d2.type;
        } else {
            newType = Math.random() > 0.5 ? d1.type : d2.type;
            secondaryType = newType;
        }

        return {
            type: newType,
            secondaryType: secondaryType,
            isSuper: isSuper,
            material: Math.random() > 0.5 ? d1.material : d2.material,
            colorR: (d1.colorR + d2.colorR) / 2,
            colorG: (d1.colorG + d2.colorG) / 2,
            colorB: (d1.colorB + d2.colorB) / 2,
            v_resolution: (d1.v_resolution + d2.v_resolution) / 2,
            v_speed: (d1.v_speed + d2.v_speed) * (isSuper ? 1.5 : 1),
            v_complexity: (d1.v_complexity + d2.v_complexity) * (isSuper ? 1.4 : 1),
            v_strokeW: (d1.v_strokeW + d2.v_strokeW) / 2,
            g_amplitude: (d1.g_amplitude + d2.g_amplitude) / 2,
            g_speed: (d1.g_speed + d2.g_speed) / 2,
            g_drift: (d1.g_drift + d2.g_drift) / 2,
            g_viscosity: (d1.g_viscosity + d2.g_viscosity) / 2,
            cohesion: (d1.cohesion + d2.cohesion) * 1.1,
            breathing: (d1.breathing + d2.breathing) / 2,
            anim_offset: (d1.anim_offset && d2.anim_offset) ? d1.anim_offset.copy().lerp(d2.anim_offset, 0.5) : (p ? p.createVector(0,0) : { x:0, y:0 })
        };
    }
}

// ═══════════════════════════════════════════════════════════
// LIVING ORGANISM
// ═══════════════════════════════════════════════════════════
class LivingTypo {
    constructor(p, char, fontData, config = {}) {
        this.p = p;
        this.atomId = _uid++;
        this.vertices = [];
        this.particles = [];
        this.angle = config.angle || 0;
        this.gen = config.gen || 0;
        this.breathingStage = Math.random() * p.TWO_PI;
        
        const d = config.dna || BioGenome.createRandom(p);
        // Manual deep clone to preserve p5.Vector and custom properties
        this.dna = Object.assign({}, d);
        if (d.anim_offset) this.dna.anim_offset = d.anim_offset.copy();
        
        this.char = config.char || char || pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
        this.x = (config.x !== undefined && config.x !== null) ? config.x : (Math.random() - 0.5) * 800;
        this.y = (config.y !== undefined && config.y !== null) ? config.y : (Math.random() - 0.5) * 600;

        this.leftV = [];
        this.rightV = [];

        // Failsafe: if no vertices were cloned, generate them now
        if (this.vertices.length === 0) {
            const font = fontData || (FONTS.length ? FONTS[0] : null);
            this.fontName = font ? font.name : 'System';
            if (font && font.obj) {
                const b = font.obj.textBounds(this.char, 0, 0, 400);
                const sampleFactor = this.dna.v_resolution * 0.8;
                const pts = font.obj.textToPoints(this.char, -b.x - b.w/2, -b.y - b.h/2, 400, { sampleFactor });
                pts.forEach(pt => {
                    if (this.vertices.length < 300) {
                        const vt = {
                            pos: p.createVector(pt.x, pt.y),
                            basePos: p.createVector(pt.x, pt.y),
                            vel: p.createVector(0, 0),
                            seed: Math.random()
                        };
                        this.vertices.push(vt);
                        if (pt.x <= 0) this.leftV.push(vt);
                        else this.rightV.push(vt);
                    }
                });
            }
        } else {
            // Pre-split cloned vertices as well
            this.vertices.forEach(vt => {
                if (vt.basePos.x <= 0) this.leftV.push(vt);
                else this.rightV.push(vt);
            });
        }

        // Particle initialization for specific types
        if (this.dna.type === 'FRAGMENTED' || this.dna.type === 'GASEOUS') {
            for (let i = 0; i < 40; i++) {
                const v = pick(this.vertices) || { pos: p.createVector(0,0) };
                this.particles.push({
                    pos: v.pos.copy(),
                    vel: p.createVector(rand(-1,1), rand(-1,1)),
                    sz: rand(2, 6),
                    life: rand(0.5, 1.0)
                });
            }
        }
    }

    update() {
        const d = this.dna;
        const p = this.p;
        const t = p.frameCount * 0.01 * d.g_speed;
        this.breathingStage += d.breathing;

        this.vertices.forEach((v, i) => {
            const force = p.createVector(0, 0);
            const ang = p.noise(v.pos.x * 0.005, v.pos.y * 0.005, t) * p.TWO_PI * 4;
            force.add(p5.Vector.fromAngle(ang).mult(d.g_amplitude));
            
            const home = p5.Vector.sub(v.basePos, v.pos);
            force.add(home.mult(d.cohesion * 0.15));

            v.vel.add(force);
            v.vel.mult(d.g_viscosity);
            v.pos.add(v.vel);

            const breath = Math.sin(this.breathingStage + v.seed * p.TWO_PI) * 5 * d.v_complexity;
            v.pos.add(p5.Vector.mult(v.pos, breath * 0.001));
        });

        this.particles.forEach(pt => {
            pt.pos.add(pt.vel);
            pt.life -= 0.01;
            if (pt.life <= 0) {
                const target = pick(this.vertices);
                if (target) { pt.pos = target.pos.copy(); pt.life = 1.0; }
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
        if (d.material === 'NEON') p.blendMode(p.ADD);
        if (d.material === 'GLASS') p.drawingContext.shadowBlur = d.isSuper ? 30 : 15;
        p.drawingContext.shadowColor = `rgba(${col[0]},${col[1]},${col[2]}, 0.5)`;

        if (d.isSuper) p.strokeWeight(d.v_strokeW * 1.5);

        // Splitted rendering ONLY if secondaryType exists and is different
        // And ONLY if we have calculated halves
        if (d.secondaryType && d.secondaryType !== d.type && this.leftV.length > 0) {
            // Render Left Half
            this.renderDNA(p, col, d, d.type, this.leftV);
            
            // Render Right Half
            const rightCol = d.isSuper ? col : [255, 255, 255, 180];
            this.renderDNA(p, rightCol, d, d.secondaryType, this.rightV);
        } else {
            // Render Whole Letter normally
            this.renderDNA(p, col, d, d.type, this.vertices);
        }

        p.blendMode(p.BLEND);
        p.pop();
    }

    renderDNA(p, col, d, type, customV = null) {
        const v = customV || this.vertices;
        if (v.length === 0) return;

        switch (type) {
            case 'CRYSTAL': this.drawCrystal(p, col, d, v); break;
            case 'FLUID': this.drawFluid(p, col, d, v); break;
            case 'NEURAL': this.drawNeural(p, col, d, v); break;
            case 'MECHANIC': this.drawMechanic(p, col, d, v); break;
            case 'GASEOUS': this.drawGaseous(p, col, d, v); break;
            case 'FRAGMENTED': this.drawFragmented(p, col, d, v); break;
            case 'LIGHT': this.drawLight(p, col, d, v); break;
            case 'QUANTUM': this.drawQuantum(p, col, d, v); break;
            case 'FRACTAL': this.drawFractal(p, col, d, v); break;
            case 'GRID': this.drawGrid(p, col, d, v); break;
            case 'ARTISTIC': this.drawArtistic(p, col, d, v); break;
            case 'LIQUID_METAL': this.drawLiquidMetal(p, col, d, v); break;
            case 'GHOST': this.drawGhost(p, col, d, v); break;
            case 'VOXEL': this.drawVoxel(p, col, d, v); break;
            case 'FUNGAL': this.drawFungal(p, col, d, v); break;
            case 'GLITCH': this.drawGlitch(p, col, d, v); break;
            case 'VECTOR': this.drawVector(p, col, d, v); break;
            case 'STRING': this.drawString(p, col, d, v); break;
            case 'OP_ART': this.drawOpArt(p, col, d, v); break;
            case 'KINETIC': this.drawKinetic(p, col, d, v); break;
            case 'STIPPLE': this.drawStipple(p, col, d, v); break;
            case 'AURA': this.drawAura(p, col, d, v); break;
            case 'FLUX': this.drawFlux(p, col, d, v); break;
            case 'MITOSIS': this.drawMitosis(p, col, d, v); break;
            case 'DNA': this.drawDna(p, col, d, v); break;
            case 'PHOTOSYNTHESIS': this.drawPhotosynthesis(p, col, d, v); break;
            case 'LYMPHOCYTE': this.drawLymphocyte(p, col, d, v); break;
            case 'GLOBULE': this.drawGlobule(p, col, d, v); break;
            case 'TRIGONOMETRY': this.drawTrig(p, col, d, v); break;
            case 'GOLDEN_RATIO': this.drawGolden(p, col, d, v); break;
            case 'DERIVATIVE': this.drawDeriv(p, col, d, v); break;
            case 'INTEGRAL': this.drawIntegral(p, col, d, v); break;
            case 'COMPLEX_PLANE': this.drawComplex(p, col, d, v); break;
            case 'STATISTICS': this.drawStats(p, col, d, v); break;
            case 'GEOMETRY': this.drawGeometry(p, col, d, v); break;
            case 'LOGIC': this.drawLogic(p, col, d, v); break;
            case 'EXPONENTIAL': this.drawExpr(p, col, d, v); break;
            case 'RELATIVITY': this.drawRelativity(p, col, d, v); break;
            case 'QUANTUM_WAVE': this.drawQuantumWave(p, col, d, v); break;
            case 'THERMODYNAMICS': this.drawEntropy(p, col, d, v); break;
            case 'ELECTROMAGNETISM': this.drawElectromagnetic(p, col, d, v); break;
            case 'GRAVITY_WELL': this.drawGravity(p, col, d, v); break;
            case 'KINETICS': this.drawKinetics(p, col, d, v); break;
            case 'FLUID_DYNAMICS': this.drawFluidDyn(p, col, d, v); break;
            case 'OPTICS': this.drawOptics(p, col, d, v); break;
            case 'ASTROPHYSICS': this.drawAstrophys(p, col, d, v); break;
            case 'CELLULAR_AUTOMATA': this.drawCellular(p, col, d, v); break;
            case 'VORONOI': this.drawVoronoi(p, col, d, v); break;
            case 'ASCII_ART': this.drawASCII(p, col, d, v); break;
            case 'PIXEL_SORT': this.drawPixelSort(p, col, d, v); break;
            case 'TURING': this.drawTuring(p, col, d, v); break;
            case 'DELAUNAY': this.drawDelaunay(p, col, d, v); break;
            case 'FLOW_FIELD': this.drawFlowField(p, col, d, v); break;
            case 'ATTRACTOR': this.drawAttractor(p, col, d, v); break;
            case 'PARAMETRIC': this.drawParametric(p, col, d, v); break;
            default: this.drawDefault(p, col, d, v);
        }
    }

    // --- ENGINES ---
    drawDefault(p, col, d, v) {
        p.noFill(); p.stroke(col[0], col[1], col[2], d.alpha); p.strokeWeight(d.v_strokeW);
        p.beginShape();
        if (v.length > 3) {
            p.curveVertex(v[0].pos.x, v[0].pos.y);
            v.forEach(vt => p.curveVertex(vt.pos.x, vt.pos.y));
            p.curveVertex(v[v.length-1].pos.x, v[v.length-1].pos.y);
        } else { v.forEach(vt => p.vertex(vt.pos.x, vt.pos.y)); }
        p.endShape();
    }

    drawCrystal(p, col, d, v) {
        p.stroke(col[0], col[1], col[2], d.alpha * 0.6); p.noFill();
        const limit = 40 * (1 + d.v_complexity);
        for (let i = 0; i < v.length; i += 8) {
            const v1 = v[i];
            for (let j = i + 1; j < Math.min(i + 15, v.length); j++) {
                const v2 = v[j];
                if (p5.Vector.dist(v1.pos, v2.pos) < limit) {
                    p.strokeWeight(0.5);
                    p.line(v1.pos.x, v1.pos.y, v2.pos.x, v2.pos.y);
                }
            }
        }
        this.drawDefault(p, col, d, v);
    }

    drawFluid(p, col, d, v) {
        p.fill(col[0], col[1], col[2], d.alpha * 0.4); p.stroke(col[0], col[1], col[2], d.alpha);
        p.strokeWeight(d.v_strokeW * 2);
        p.beginShape();
        v.forEach(vt => p.curveVertex(vt.pos.x, vt.pos.y));
        p.endShape(p.CLOSE);
    }

    drawNeural(p, col, d, v) {
        p.stroke(col[0], col[1], col[2], d.alpha * 0.8); p.strokeWeight(d.v_strokeW * 0.5);
        const limit = 100 * (1 + d.v_complexity);
        const step = Math.max(12, Math.floor(20 / (1 + d.v_complexity)));
        for (let i = 0; i < v.length; i += step) {
            const v1 = v[i];
            for (let j = i + step; j < v.length; j += step * 2) {
                const v2 = v[j];
                if (p5.Vector.dist(v1.pos, v2.pos) < limit) p.line(v1.pos.x, v1.pos.y, v2.pos.x, v2.pos.y);
            }
        }
    }

    drawMechanic(p, col, d, v) {
        p.stroke(col[0], col[1], col[2], d.alpha * 0.8); p.strokeWeight(d.v_strokeW * 0.5);
        v.forEach((v, i) => {
            if (i % 15 === 0) {
                const len = 25 * Math.sin(p.frameCount * 0.06 + v.seed * 5);
                p.line(v.pos.x, v.pos.y, v.pos.x + len, v.pos.y + len);
                p.noStroke(); p.fill(col[0], col[1], col[2], d.alpha); p.rect(v.pos.x + len - 2, v.pos.y + len - 2, 4, 4);
                p.stroke(col[0], col[1], col[2], d.alpha * 0.8);
            }
        });
        this.drawDefault(p, col, d, v);
    }

    drawGaseous(p, col, d, v) {
        p.noStroke();
        this.particles.forEach(pt => {
            p.fill(col[0], col[1], col[2], d.alpha * pt.life * 0.5);
            p.circle(pt.pos.x, pt.pos.y, pt.sz * pt.life);
        });
    }

    drawFragmented(p, col, d, v) {
        p.fill(col[0], col[1], col[2], d.alpha); p.noStroke();
        v.forEach((v, i) => {
            if (i % 5 === 0) {
                const sz = 10 * v.seed * (1 + d.v_complexity);
                p.push(); p.translate(v.pos.x, v.pos.y); p.rotate(v.seed * p.TWO_PI + p.frameCount * 0.05);
                p.rect(-sz/2, -sz/2, sz, sz); p.pop();
            }
        });
    }

    drawLight(p, col, d, v) {
        p.blendMode(p.ADD); p.noFill(); p.strokeWeight(d.v_strokeW * 3); p.stroke(col[0], col[1], col[2], 50);
        p.beginShape(); v.forEach(v => p.vertex(v.pos.x, v.pos.y)); p.endShape();
        p.strokeWeight(d.v_strokeW); p.stroke(255, d.alpha);
        p.beginShape(); v.forEach(v => p.vertex(v.pos.x, v.pos.y)); p.endShape();
    }

    drawQuantum(p, col, d, v) {
        for (let j = 0; j < 2; j++) {
            p.push();
            p.translate(p.noise(p.frameCount * 0.05, j) * 15 - 7.5, p.noise(p.frameCount * 0.05, j + 50) * 15 - 7.5);
            p.stroke(col[0], col[1], col[2], d.alpha * 0.15); p.noFill();
            p.beginShape(); v.forEach((v, i) => { if (i % 2 === 0) p.vertex(v.pos.x, v.pos.y); }); p.endShape();
            p.pop();
        }
        if (p.random() > 0.15) this.drawDefault(p, col, d, v);
    }

    drawFractal(p, col, d, v) {
        this.drawDefault(p, col, d, v);
        if (this.gen < 1) return;
        p.push(); p.scale(0.25);
        for (let i = 0; i < v.length; i += 100) {
            p.push(); p.translate(v[i].pos.x * 4, v[i].pos.y * 4);
            this.drawDefault(p, col, d, v); p.pop();
        }
        p.pop();
    }

    drawGrid(p, col, d, v) {
        const gridSize = 20 * (1.1 - d.v_complexity);
        p.stroke(col[0], col[1], col[2], d.alpha); p.noFill();
        p.beginShape(p.LINES);
        v.forEach(v => {
            p.vertex(Math.round(v.pos.x / gridSize) * gridSize, Math.round(v.pos.y / gridSize) * gridSize);
            p.vertex(v.pos.x, v.pos.y);
        });
        p.endShape();
    }

    drawArtistic(p, col, d, v) {
        p.noStroke();
        v.forEach((v, i) => {
            if (i % 15 === 0) {
                const colors = [[255, 0, 0], [255, 255, 0], [0, 0, 255]];
                const c = pick(colors); p.fill(c[0], c[1], c[2], d.alpha * 0.5);
                p.push(); p.translate(v.pos.x, v.pos.y); p.rotate(v.vel.heading());
                p.rect(-20 * v.seed, -2.5 * v.seed, 40 * v.seed, 5 * v.seed); p.pop();
            }
        });
    }

    drawLiquidMetal(p, col, d, v) {
        p.noStroke(); p.fill(col[0], col[1], col[2], d.alpha * 0.8);
        v.forEach(v => { p.circle(v.pos.x, v.pos.y, 8 + Math.sin(p.frameCount * 0.1 + v.seed * 10) * 4); });
    }

    drawGhost(p, col, d, v) {
        p.noFill();
        for (let i = 0; i < 3; i++) {
            p.stroke(col[0], col[1], col[2], d.alpha * (0.3 - i * 0.1));
            p.beginShape();
            v.forEach((v, idx) => {
                const off = p.noise(idx * 0.1, p.frameCount * 0.02 + i) * 20;
                p.curveVertex(v.pos.x + off, v.pos.y + off);
            });
            p.endShape();
        }
    }

    drawVoxel(p, col, d, v) {
        p.fill(col[0], col[1], col[2], d.alpha); p.noStroke();
        v.forEach((v, i) => {
            if (i % 8 === 0) {
                const sz = 12 * (1 + d.v_complexity) * v.seed;
                p.rect(v.pos.x - sz/2, v.pos.y - sz/2, sz, sz);
                p.fill(255, 50); p.rect(v.pos.x - sz/2, v.pos.y - sz/2, sz/2, sz/2);
                p.fill(col[0], col[1], col[2], d.alpha);
            }
        });
    }

    drawFungal(p, col, d, v) {
        p.stroke(col[0], col[1], col[2], d.alpha * 0.6);
        v.forEach((v, i) => {
            if (i % 20 === 0) {
                p.line(v.pos.x, v.pos.y, v.pos.x + Math.cos(v.seed * 6.28) * 30, v.pos.y + Math.sin(v.seed * 6.28) * 30);
                p.circle(v.pos.x + Math.cos(v.seed * 6.28) * 30, v.pos.y + Math.sin(v.seed * 6.28) * 30, 4);
            }
        });
        this.drawDefault(p, col, d, v);
    }

    drawGlitch(p, col, d, v) {
        if (p.random() > 0.9) return;
        p.stroke(col[0], col[1], col[2], d.alpha);
        v.forEach((v, i) => {
            if (p.random() > 0.95) {
                p.strokeWeight(p.random(1, 10));
                p.line(v.pos.x - 50, v.pos.y, v.pos.x + 50, v.pos.y);
            }
        });
        this.drawDefault(p, col, d, v);
    }

    drawVector(p, col, d, v) {
        p.stroke(col[0], col[1], col[2], d.alpha);
        v.forEach((v, i) => {
            if (i % 10 === 0) {
                p.line(v.pos.x, v.pos.y, v.pos.x + v.vel.x * 10, v.pos.y + v.vel.y * 10);
                p.circle(v.pos.x + v.vel.x * 10, v.pos.y + v.vel.y * 10, 2);
            }
        });
    }

    drawString(p, col, d, v) {
        p.noFill(); p.stroke(col[0], col[1], col[2], d.alpha);
        const step = Math.floor(10 / (1 + d.v_complexity));
        for (let i = 0; i < v.length; i += step) {
            const v = v[i];
            p.line(v.pos.x, v.pos.y, 0, 0);
        }
        this.drawDefault(p, col, d, v);
    }

    drawOpArt(p, col, d, v) {
        p.noFill(); p.stroke(255, d.alpha * 0.5);
        for (let i = 0; i < 5; i++) {
            p.beginShape();
            v.forEach(v => p.vertex(v.pos.x * (1 + i * 0.1), v.pos.y * (1 + i * 0.1)));
            p.endShape(p.CLOSE);
        }
    }

    drawKinetic(p, col, d, v) {
        v.forEach((v, i) => {
            if (i % 20 === 0) {
                p.push(); p.translate(v.pos.x, v.pos.y); p.rotate(p.frameCount * 0.1 + v.seed);
                p.stroke(col[0], col[1], col[2], d.alpha); p.line(-15, 0, 15, 0); p.pop();
            }
        });
        this.drawDefault(p, col, d, v);
    }

    drawStipple(p, col, d, v) {
        p.fill(col[0], col[1], col[2], d.alpha); p.noStroke();
        v.forEach(v => {
            for (let k = 0; k < 3; k++) p.circle(v.pos.x + rand(-5, 5), v.pos.y + rand(-5, 5), rand(1, 3));
        });
    }

    drawAura(p, col, d, v) {
        p.noStroke();
        for (let r = 40; r > 0; r -= 10) {
            p.fill(col[0], col[1], col[2], d.alpha * 0.1);
            v.forEach(v => p.circle(v.pos.x, v.pos.y, r));
        }
    }

    drawFlux(p, col, d, v) {
        p.stroke(col[0], col[1], col[2], d.alpha * 0.5); p.noFill();
        p.beginShape();
        v.forEach((v, i) => {
            const off = p.sin(p.frameCount * 0.1 + i * 0.5) * 20;
            p.vertex(v.pos.x + off, v.pos.y + off);
        });
        p.endShape();
    }

    drawMitosis(p, col, d, v) {
        p.stroke(col[0], col[1], col[2], d.alpha);
        [ -20, 20 ].forEach(off => {
            p.push(); p.translate(off, 0); this.drawDefault(p, col, d, v); p.pop();
        });
        v.forEach((v, i) => {
            if (i % 30 === 0) p.line(-20 + v.pos.x, v.pos.y, 20 + v.pos.x, v.pos.y);
        });
    }

    drawDna(p, col, d, v) {
        p.strokeWeight(2);
        for (let i = 0; i < v.length - 1; i += 10) {
            const v1 = v[i]; const v2 = v[i+1] || v1;
            p.stroke(col[0], col[1], col[2], d.alpha); p.line(v1.pos.x - 10, v1.pos.y, v1.pos.x + 10, v1.pos.y);
            p.stroke(255, d.alpha * 0.5); p.circle(v1.pos.x - 10, v1.pos.y, 4); p.circle(v1.pos.x + 10, v1.pos.y, 4);
        }
        this.drawDefault(p, col, d, v);
    }

    drawPhotosynthesis(p, col, d, v) {
        p.stroke(0, 255, 100, d.alpha * 0.6);
        v.forEach((v, i) => {
            if (i % 15 === 0) {
                p.push(); p.translate(v.pos.x, v.pos.y); p.rotate(v.seed * 6.28);
                p.ellipse(0, 0, 10, 20); p.line(0, 0, 0, 15); p.pop();
            }
        });
        this.drawDefault(p, [0, 200, 50], d);
    }

    drawLymphocyte(p, col, d, v) {
        p.stroke(255, d.alpha); p.fill(col[0], col[1], col[2], d.alpha * 0.7);
        v.forEach((v, i) => {
            if (i % 25 === 0) {
                p.push(); p.translate(v.pos.x, v.pos.y); const pulse = Math.sin(p.frameCount * 0.1 + v.seed * 5);
                for (let a = 0; a < p.TWO_PI; a += p.PI/3) p.line(0, 0, Math.cos(a) * (15 + pulse * 10), Math.sin(a) * (15 + pulse * 10));
                p.circle(0, 0, 8); p.pop();
            }
        });
        this.drawDefault(p, col, d, v);
    }

    drawGlobule(p, col, d, v) {
        p.noStroke();
        v.forEach((v, i) => {
            if (i % 8 === 0) {
                const pulse = 1 + Math.sin(p.frameCount * 0.1 + v.seed * 10) * 0.2;
                p.fill(200, 20, 40, d.alpha); p.circle(v.pos.x, v.pos.y, 12 * pulse);
                p.fill(255, 100); p.circle(v.pos.x - 3, v.pos.y - 3, 3);
            }
        });
    }

    drawTrig(p, col, d, v) {
        p.noFill(); p.stroke(col[0], col[1], col[2], d.alpha);
        p.beginShape(); v.forEach((v, i) => p.vertex(v.pos.x, v.pos.y + Math.sin(p.frameCount * 0.1 + i * 0.2) * 20)); p.endShape();
    }

    drawGolden(p, col, d, v) {
        p.noFill(); p.stroke(col[0], col[1], col[2], d.alpha * 0.5);
        v.forEach((v, i) => {
            if (i % 40 === 0) {
                p.push(); p.translate(v.pos.x, v.pos.y); let a = 0, r = 0;
                p.beginShape(); for (let k = 0; k < 20; k++) { p.vertex(Math.cos(a)*r, Math.sin(a)*r); a += 1.618; r += 2; } p.endShape();
                p.pop();
            }
        });
        this.drawDefault(p, col, d, v);
    }

    drawDeriv(p, col, d, v) {
        p.stroke(col[0], col[1], col[2], d.alpha);
        v.forEach((v, i) => {
            if (i % 15 === 0 && i < v.length-1) {
                const next = v[i+1]; const dx=next.pos.x-v.pos.x, dy=next.pos.y-v.pos.y;
                p.line(v.pos.x - dx*2, v.pos.y - dy*2, v.pos.x + dx*2, v.pos.y + dy*2);
            }
        });
    }

    drawIntegral(p, col, d, v) {
        p.stroke(col[0], col[1], col[2], d.alpha * 0.4); p.strokeWeight(1);
        v.forEach((v, i) => { if (i % 8 === 0) p.line(v.pos.x, v.pos.y, v.pos.x, v.pos.y + 30 * v.seed); });
        this.drawDefault(p, col, d, v);
    }

    drawComplex(p, col, d, v) {
        p.noStroke();
        v.forEach((v, i) => {
            if (i % 5 === 0) {
                const noise = p.noise(v.pos.x*0.05, v.pos.y*0.05, p.frameCount*0.01);
                p.fill(col[0], col[1], col[2], d.alpha * noise); p.rect(v.pos.x - 5, v.pos.y - 5, 10, 10);
            }
        });
    }

    drawStats(p, col, d, v) {
        p.fill(col[0], col[1], col[2], d.alpha);
        v.forEach((v, i) => { if (i % 20 === 0) p.rect(v.pos.x - 2, v.pos.y - 30*v.seed, 4, 30*v.seed); });
    }

    drawGeometry(p, col, d, v) {
        p.noFill(); p.stroke(col[0], col[1], col[2], d.alpha);
        v.forEach((v, i) => {
            if (i % 30 === 0) { if (v.seed > 0.5) p.circle(v.pos.x, v.pos.y, 20); else p.triangle(v.pos.x, v.pos.y-10, v.pos.x-10, v.pos.y+10, v.pos.x+10, v.pos.y+10); }
        });
        this.drawDefault(p, col, d, v);
    }

    drawLogic(p, col, d, v) {
        p.fill(col[0], col[1], col[2], d.alpha); p.textSize(8);
        v.forEach((v, i) => { if (i % 12 === 0) p.text(v.seed > 0.5 ? "1" : "0", v.pos.x, v.pos.y); });
    }

    drawExpr(p, col, d, v) {
        p.noFill(); p.stroke(col[0], col[1], col[2], d.alpha);
        v.forEach((v, i) => {
            if (i % 40 === 0) {
                p.beginShape(); for (let x = 0; x < 30; x++) p.vertex(v.pos.x + x, v.pos.y - Math.exp(x * 0.1) * 2); p.endShape();
            }
        });
        this.drawDefault(p, col, d, v);
    }

    drawRelativity(p, col, d, v) {
        p.noFill(); p.stroke(col[0], col[1], col[2], d.alpha * 0.5);
        for (let r = 20; r < 200; r += 40) p.ellipse(0, 0, r * 2, r * 1.5);
        v.forEach(v => { p.push(); p.translate(v.pos.x, v.pos.y); p.rotate(v.pos.heading()); p.line(0, 0, 20, 0); p.pop(); });
    }

    drawQuantumWave(p, col, d, v) {
        p.noFill(); p.stroke(col[0], col[1], col[2], d.alpha);
        p.beginShape(); v.forEach((v, i) => {
            const amp = 30 * p.noise(i * 0.1, p.frameCount * 0.05);
            p.vertex(v.pos.x, v.pos.y + Math.sin(i * 0.5) * amp);
        }); p.endShape();
    }

    drawEntropy(p, col, d, v) {
        p.noStroke();
        v.forEach(v => {
            const noise = p.noise(v.pos.x * 0.01, v.pos.y * 0.01, p.frameCount * 0.02);
            p.fill(col[0], col[1], col[2], d.alpha * noise); p.circle(v.pos.x + rand(-20, 20), v.pos.y + rand(-20, 20), 4);
        });
    }

    drawElectromagnetic(p, col, d, v) {
        p.stroke(col[0], col[1], col[2], d.alpha * 0.6);
        v.forEach((v, i) => {
            if (i % 30 === 0) {
                for (let r = 5; r < 40; r += 10) p.circle(v.pos.x, v.pos.y, r);
            }
        });
        this.drawDefault(p, col, d, v);
    }

    drawGravity(p, col, d, v) {
        p.strokeWeight(1); p.stroke(col[0], col[1], col[2], d.alpha * 0.4);
        v.forEach(v => p.line(v.pos.x, v.pos.y, 0, 0));
        this.drawDefault(p, col, d, v);
    }

    drawKinetics(p, col, d, v) {
        v.forEach((v, i) => {
            if (i % 15 === 0) {
                p.push(); p.translate(v.pos.x, v.pos.y); p.rotate(v.vel.heading());
                p.stroke(col[0], col[1], col[2], d.alpha); p.line(-20, 0, 20, 0); p.circle(20, 0, 5); p.pop();
            }
        });
    }

    drawFluidDyn(p, col, d, v) {
        p.noFill(); p.stroke(col[0], col[1], col[2], d.alpha * 0.3);
        v.forEach((v, i) => {
            if (i % 10 === 0) {
                p.beginShape(); for (let k = 0; k < 10; k++) p.vertex(v.pos.x + k * v.vel.x, v.pos.y + k * v.vel.y); p.endShape();
            }
        });
        this.drawDefault(p, col, d, v);
    }

    drawOptics(p, col, d, v) {
        p.blendMode(p.ADD);
        [ [255, 0, 0], [0, 255, 0], [0, 0, 255] ].forEach((rgb, idx) => {
            p.stroke(rgb[0], rgb[1], rgb[2], d.alpha * 0.5);
            p.push(); p.translate(idx * 2, idx * 2); this.drawDefault(p, rgb, d); p.pop();
        });
    }

    drawAstrophys(p, col, d, v) {
        p.noFill(); p.stroke(col[0], col[1], col[2], d.alpha * 0.5);
        v.forEach((v, i) => {
            if (i % 50 === 0) {
                p.circle(v.pos.x, v.pos.y, 40);
                p.push(); p.translate(v.pos.x, v.pos.y); p.rotate(p.frameCount * 0.1); p.fill(255, d.alpha); p.circle(20, 0, 5); p.pop();
            }
        });
    }

    drawCellular(p, col, d, v) {
        p.noStroke(); p.fill(col[0], col[1], col[2], d.alpha * 0.6);
        v.forEach((v, i) => {
            if (i % 10 === 0) { const sz = 6; p.rect(Math.round(v.pos.x / sz) * sz, Math.round(v.pos.y / sz) * sz, sz-1, sz-1); }
        });
    }

    drawVoronoi(p, col, d, v) {
        p.stroke(col[0], col[1], col[2], d.alpha * 0.4); p.noFill();
        v.forEach((v, i) => {
            if (i % 30 === 0) {
                p.beginShape(); for (let a = 0; a < 6.28; a += 1.04) p.vertex(v.pos.x + p.cos(a) * 20, v.pos.y + p.sin(a) * 20); p.endShape(p.CLOSE);
            }
        });
        this.drawDefault(p, col, d, v);
    }

    drawASCII(p, col, d, v) {
        p.fill(col[0], col[1], col[2], d.alpha); p.textSize(9); const chars = "@#S%?*+;:,.";
        v.forEach((v, i) => {
            if (i % 12 === 0) p.text(chars[Math.floor(v.seed * chars.length)], v.pos.x, v.pos.y);
        });
    }

    drawPixelSort(p, col, d, v) {
        p.stroke(col[0], col[1], col[2], d.alpha * 0.5);
        v.forEach((v, i) => {
            if (i % 10 === 0) p.line(v.pos.x, v.pos.y, v.pos.x, v.pos.y + p.noise(v.pos.x * 0.1, p.frameCount * 0.05) * 60);
        });
        this.drawDefault(p, col, d, v);
    }

    drawTuring(p, col, d, v) {
        p.noStroke();
        v.forEach((v, i) => {
            if (i % 5 === 0) {
                const n = p.noise(v.pos.x * 0.04, v.pos.y * 0.04, p.frameCount * 0.02);
                if (n > 0.6) { p.fill(255, d.alpha * n); p.circle(v.pos.x, v.pos.y, 8); }
            }
        });
    }

    drawDelaunay(p, col, d, v) {
        p.stroke(col[0], col[1], col[2], d.alpha * 0.3); p.noFill();
        for (let i = 0; i < v.length; i += 20) {
            const v1=v[i], v2=v[(i+40)%v.length], v3=v[(i+80)%v.length];
            p.triangle(v1.pos.x, v1.pos.y, v2.pos.x, v2.pos.y, v3.pos.x, v3.pos.y);
        }
    }

    drawFlowField(p, col, d, v) {
        p.noFill(); p.stroke(col[0], col[1], col[2], d.alpha * 0.6);
        this.vertices.forEach((v, i) => {
            if (i % 15 === 0) {
                p.beginShape(); let x = v.pos.x, y = v.pos.y;
                for (let k = 0; k < 5; k++) {
                    const ang = p.noise(x*0.01, y*0.01, p.frameCount*0.01)*6.28*2;
                    x += p.cos(ang)*10; y += p.sin(ang)*10; p.vertex(x, y);
                }
                p.endShape();
            }
        });
    }

    drawAttractor(p, col, d, v) {
        p.noFill(); p.stroke(col[0], col[1], col[2], d.alpha * 0.4);
        this.vertices.forEach((v, i) => {
            if (i % 50 === 0) {
                p.push(); p.translate(v.pos.x, v.pos.y); p.beginShape(); let lx = 0, ly = 0;
                for (let k = 0; k < 30; k++) { const nx=p.sin(ly*0.1)*10, ny=p.cos(lx*0.1)*10; lx+=nx; ly+=ny; p.vertex(lx, ly); }
                p.endShape(); p.pop();
            }
        });
    }

    drawParametric(p, col, d, v) {
        p.noFill(); p.stroke(col[0], col[1], col[2], d.alpha);
        this.vertices.forEach((v, i) => {
            if (i % 40 === 0) {
                p.push(); p.translate(v.pos.x, v.pos.y); p.beginShape();
                for (let a = 0; a < 6.28; a += 0.2) { const r = 20 * p.sin(a*4 + p.frameCount*0.1); p.vertex(p.cos(a)*r, p.sin(a)*r); }
                p.endShape(p.CLOSE); p.pop();
            }
        });
        this.drawDefault(p, col, d, v);
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
        this.particles = [];
    }

    addAtom(forcedType = null, x = null, y = null, char = '', dna = null) {
        this.history.push([...APP_STATE.atoms]);
        const atom = new LivingTypo(this.p, char, null, { x, y, dna });
        if (forcedType) atom.dna.type = forcedType;
        APP_STATE.atoms.push(atom);
        this.updateMoleculeList();
        return atom;
    }

    removeAtom(id) {
        APP_STATE.atoms = APP_STATE.atoms.filter(a => a.atomId !== id);
        this.updateMoleculeList();
    }

    checkFusion(moved) {
        const p = this.p;
        const other = APP_STATE.atoms.find(o => o !== moved && Math.hypot(o.x - moved.x, o.y - moved.y) < 150);
        if (!other) return;

        const childDNA = BioGenome.cross(moved.dna, other.dna, this.p);
        if (!childDNA) {
            this.explode(moved.x, moved.y, [255, 0, 0]);
            this.removeAtom(moved.atomId);
            this.removeAtom(other.atomId);
            return;
        }

        let childChar = Math.random() > 0.5 ? moved.char : other.char;
        if (Math.random() < 0.2) childChar = pick("ABCDEFGHIJKLMNOPQRSTUVWXYZΣΔΩΨΠΦΞΛΘ");

        const nx = (moved.x + other.x) / 2;
        const ny = (moved.y + other.y) / 2;
        this.addAtom(childDNA.type, nx, ny, childChar, childDNA);
        this.removeAtom(moved.atomId);
        this.removeAtom(other.atomId);
    }

    explode(x, y, col) {
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * 6.28, spd = Math.random() * 8;
            this.particles.push({
                pos: this.p.createVector(x, y),
                vel: this.p.createVector(Math.cos(angle) * spd, Math.sin(angle) * spd),
                sz: rand(2, 10),
                life: 1.0,
                color: col
            });
        }
    }

    update() {
        this.particles.forEach((pt, i) => {
            pt.pos.add(pt.vel); pt.life -= 0.02;
            if (pt.life <= 0) this.particles.splice(i, 1);
        });
    }

    drawParticles() {
        this.p.noStroke();
        this.particles.forEach(pt => {
            this.p.fill(pt.color[0], pt.color[1], pt.color[2], pt.life * 255);
            this.p.circle(pt.pos.x, pt.pos.y, pt.sz);
        });
    }

    initUI() {
        document.getElementById('add-atom').onclick = () => this.addAtom();
        document.getElementById('undo-btn').onclick = () => { if (this.history.length) APP_STATE.atoms = this.history.pop(); this.updateMoleculeList(); };
    }

    initInteraction() {
        let dragged = null, panning = false, lx = 0, ly = 0;
        const world = (cx, cy) => ({ wx: (cx-this.p.width/2-APP_STATE.view.x)/APP_STATE.view.zoom, wy: (cy-this.p.height/2-APP_STATE.view.y)/APP_STATE.view.zoom });
        window.addEventListener('mousedown', e => {
            if (e.target.closest('.ui-overlay')) return;
            const { wx, wy } = world(e.clientX, e.clientY);
            dragged = APP_STATE.atoms.find(a => Math.hypot(a.x-wx, a.y-wy) < 200/APP_STATE.view.zoom);
            if (!dragged) { panning = true; lx = e.clientX; ly = e.clientY; }
        });
        window.addEventListener('mousemove', e => {
            if (dragged) { dragged.x += e.movementX/APP_STATE.view.zoom; dragged.y += e.movementY/APP_STATE.view.zoom; }
            else if (panning) { APP_STATE.view.targetX += (e.clientX-lx); APP_STATE.view.targetY += (e.clientY-ly); APP_STATE.view.x=APP_STATE.view.targetX; APP_STATE.view.y=APP_STATE.view.targetY; lx=e.clientX; ly=e.clientY; }
        });
        window.addEventListener('mouseup', () => { 
            try { if (dragged) this.checkFusion(dragged); } catch(e) { console.error(e); }
            dragged = null; 
            panning = false; 
        });
        window.addEventListener('wheel', e => { if (e.target.closest('.ui-overlay')) return; e.preventDefault(); APP_STATE.view.zoom = clamp(APP_STATE.view.zoom * (e.deltaY > 0 ? 0.9 : 1.1), 0.05, 5); }, { passive: false });
    }

    updateMoleculeList() {
        const ml = document.getElementById('molecule-list');
        if (ml) ml.innerHTML = APP_STATE.atoms.map(a => `
            <li class="molecule-item" data-atom-id="${a.atomId}">
                <span class="status-dot" style="background:rgb(${a.dna.colorR},${a.dna.colorG},${a.dna.colorB})"></span>
                <div class="molecule-info"><div class="name">${a.char} [${a.dna.type}]</div><div class="meta">GEN ${a.gen} | ${a.dna.material}</div></div>
            </li>
        `).join('');
    }
}

const sketch = (p) => {
    let TU;
    p.preload = () => { FONT_SOURCES.forEach(s => FONTS.push({ name: s.name, obj: p.loadFont(s.url) })); };
    p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight).parent('stage');
        TU = new TypoUniverse(p);
        const starters = BioGenome.TYPES.sort(() => 0.5 - Math.random()).slice(0, 8);
        starters.forEach((type, i) => {
            const x = (i % 4 - 1.5) * 350; const y = (Math.floor(i / 4) - 0.5) * 450;
            TU.addAtom(type, x, y);
        });
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
    };
    p.draw = () => {
        p.background(5, 5, 10);
        p.push();
        p.translate(p.width/2 + APP_STATE.view.x, p.height/2 + APP_STATE.view.y);
        p.scale(APP_STATE.view.zoom);
        TU.update();
        TU.drawParticles();
        APP_STATE.atoms.forEach(a => { a.update(); a.draw(); });
        p.pop();
        
        p.resetMatrix();
        p.fill(255, 40); p.noStroke(); p.textSize(10);
        p.text(`SPORE ENGINE v52.2 | FAMILIES: ${BioGenome.TYPES.length} | MOLECULES: ${APP_STATE.atoms.length}`, 20, p.height - 20);
        
        // BIG SPLASH
        if (p.frameCount < 120) {
            p.fill(255, 255 - p.frameCount * 2); p.textSize(40); p.textAlign(p.CENTER);
            p.text("QUANTUM FUSION v52.2 ACTIVE", p.width/2, p.height/2);
        }
    };
    p.windowResized = () => p.resizeCanvas(window.innerWidth, window.innerHeight);
};

new p5(sketch);

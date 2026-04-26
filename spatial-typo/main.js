// Typography Lab - Spore "Ecosystem" Engine v53.0
// THE "SPORE" REVOLUTION: Variable Stroke, Condensed Width, and Chimera Hybridization.

console.log("TypoLab v53.0 — VARIABLE WIDTH & CHIMERA FUSION ACTIVE");

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
        
        if (roll < 0.45) { // HYBRID/CHIMERA
            newType = d1.type;
            secondaryType = d2.type;
        } else if (roll < 0.75) { // DOMINANT
            newType = Math.random() > 0.5 ? d1.type : d2.type;
        } else if (roll < 0.96) { // MUTANT
            newType = pick(this.TYPES);
        } else { // LETHAL
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
            v_complexity: (d1.v_complexity + d2.v_complexity) / 1.4,
            v_strokeW: rand(0.5, 12), // Bold range
            v_width: rand(0.3, 1.8), // Condensed range
            g_amplitude: (d1.g_amplitude + d2.g_amplitude) / 2,
            g_speed: (d1.g_speed + d2.g_speed) / 2,
            g_drift: (d1.g_drift + d2.g_drift) / 2,
            g_viscosity: (d1.g_viscosity + d2.g_viscosity) / 2,
            cohesion: (d1.cohesion + d2.cohesion) * 1.1,
            breathing: (d1.breathing + d2.breathing) / 2,
            anim_offset: p5.Vector.random2D()
        };
    }

    static createRandom() {
        return {
            type: pick(BioGenome.TYPES),
            material: pick(BioGenome.MATERIALS),
            g_speed: rand(0.05, 0.2),
            g_amplitude: rand(0.1, 0.5),
            g_viscosity: rand(0.8, 0.96), 
            g_drift: rand(0.01, 0.05),
            v_complexity: rand(0.05, 0.3),
            v_strokeW: rand(1, 10),
            v_width: rand(0.4, 1.5),
            v_resolution: 0.12,
            v_speed: rand(0.5, 2.0),
            alpha: 255,
            cohesion: rand(0.1, 0.4),
            breathing: rand(0.01, 0.04),
            anim_offset: new p5.Vector(0,0),
            colorR: Math.random() * 255,
            colorG: Math.random() * 255,
            colorB: Math.random() * 255
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
        
        if (config.dna) {
            this.dna = config.dna;
            this.char = config.char || char;
            this.x = config.x;
            this.y = config.y;
            this.fontName = config.fontName;
            if (config.vertices) {
                config.vertices.forEach(v => {
                    this.vertices.push({ pos: v.pos.copy(), basePos: v.basePos.copy(), vel: v.vel.copy(), seed: v.seed });
                });
            }
        } else {
            this.x = (Math.random() - 0.5) * 1000;
            this.y = (Math.random() - 0.5) * 800;
            this.char = char || pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
            this.dna = BioGenome.createRandom();
            const font = fontData || (FONTS.length ? FONTS[0] : null);
            this.fontName = font ? font.name : 'System';
            if (font && font.obj) {
                const b = font.obj.textBounds(this.char, 0, 0, 400);
                const pts = font.obj.textToPoints(this.char, -b.x - b.w/2, -b.y - b.h/2, 400, { sampleFactor: this.dna.v_resolution });
                pts.forEach(pt => {
                    if (this.vertices.length < 350) {
                        this.vertices.push({ pos: p.createVector(pt.x, pt.y), basePos: p.createVector(pt.x, pt.y), vel: p.createVector(0, 0), seed: Math.random() });
                    }
                });
            }
        }
    }

    update() {
        const d = this.dna; const p = this.p;
        const t = p.frameCount * 0.01 * d.g_speed;
        this.breathingStage += d.breathing;
        this.vertices.forEach((v, i) => {
            const force = p5.Vector.fromAngle(p.noise(v.pos.x * 0.005, v.pos.y * 0.005, t) * 8 * p.PI).mult(d.g_amplitude);
            force.add(p5.Vector.sub(v.basePos, v.pos).mult(d.cohesion * 0.15));
            v.vel.add(force); v.vel.mult(d.g_viscosity); v.pos.add(v.vel);
            const breath = Math.sin(this.breathingStage + v.seed * p.TWO_PI) * 5 * d.v_complexity;
            v.pos.add(p5.Vector.mult(v.pos, breath * 0.001));
        });
    }

    draw() {
        const p = this.p; const d = this.dna;
        p.push();
        p.translate(this.x, this.y);
        p.rotate(this.angle);
        p.scale(d.v_width, 1.0); // CONDENSED / EXPANDED LOGIC

        const col = [d.colorR, d.colorG, d.colorB];
        if (d.material === 'NEON') p.blendMode(p.ADD);
        if (d.material === 'GLASS') p.drawingContext.shadowBlur = 15;
        p.drawingContext.shadowColor = `rgba(${col[0]},${col[1]},${col[2]}, 0.5)`;

        if (d.secondaryType) { // CHIMERA FUSION
            const mid = Math.floor(this.vertices.length / 2);
            this.renderDNA(p, col, d, d.type, 0, mid);
            this.renderDNA(p, [255,255,255,150], d, d.secondaryType, mid, this.vertices.length);
        } else {
            this.renderDNA(p, col, d, d.type);
        }
        p.blendMode(p.BLEND);
        p.pop();
    }

    renderDNA(p, col, d, type, start = 0, end = null) {
        const vSet = end !== null ? this.vertices.slice(start, end) : this.vertices;
        if (vSet.length < 2) return;

        switch (type) {
            case 'CRYSTAL': this.drawCrystal(p, col, d, vSet); break;
            case 'FLUID': this.drawFluid(p, col, d, vSet); break;
            case 'NEURAL': this.drawNeural(p, col, d, vSet); break;
            case 'MECHANIC': this.drawMechanic(p, col, d, vSet); break;
            case 'GASEOUS': this.drawGaseous(p, col, d, vSet); break;
            case 'FRAGMENTED': this.drawFragmented(p, col, d, vSet); break;
            case 'OP_ART': this.drawOpArt(p, col, d, vSet); break;
            case 'KINETIC': this.drawKinetic(p, col, d, vSet); break;
            case 'VORONOI': this.drawVoronoi(p, col, d, vSet); break;
            case 'ASCII_ART': this.drawASCII(p, col, d, vSet); break;
            case 'PIXEL_SORT': this.drawPixelSort(p, col, d, vSet); break;
            case 'TURING': this.drawTuring(p, col, d, vSet); break;
            case 'DELAUNAY': this.drawDelaunay(p, col, d, vSet); break;
            case 'ATTRACTOR': this.drawAttractor(p, col, d, vSet); break;
            case 'PARAMETRIC': this.drawParametric(p, col, d, vSet); break;
            case 'TRIGONOMETRY': this.drawTrig(p, col, d, vSet); break;
            case 'DNA': this.drawDna(p, col, d, vSet); break;
            case 'LYMPHOCYTE': this.drawLymphocyte(p, col, d, vSet); break;
            case 'GLOBULE': this.drawGlobule(p, col, d, vSet); break;
            default: this.drawDefault(p, col, d, vSet);
        }
    }

    // --- REFINED MODULES WITH VARIABLE STROKE ---
    drawDefault(p, col, d, vSet) {
        p.noFill();
        for (let i = 0; i < vSet.length - 1; i++) {
            const v1 = vSet[i], v2 = vSet[i+1];
            // Variable weight based on vertex seed and noise
            const sw = d.v_strokeW * (0.3 + p.noise(i * 0.1, p.frameCount * 0.05) * 2);
            p.strokeWeight(sw);
            p.stroke(col[0], col[1], col[2], d.alpha);
            p.line(v1.pos.x, v1.pos.y, v2.pos.x, v2.pos.y);
        }
    }

    drawFluid(p, col, d, vSet) {
        p.fill(col[0], col[1], col[2], d.alpha * 0.3);
        p.noStroke();
        p.beginShape();
        vSet.forEach(v => p.curveVertex(v.pos.x, v.pos.y));
        p.endShape(p.CLOSE);
        this.drawDefault(p, col, d, vSet);
    }

    drawCrystal(p, col, d, vSet) {
        p.noStroke();
        for (let i = 0; i < vSet.length - 2; i += 3) {
            p.fill(col[0], col[1], col[2], d.alpha * 0.4);
            p.triangle(vSet[i].pos.x, vSet[i].pos.y, vSet[i+1].pos.x, vSet[i+1].pos.y, vSet[i+2].pos.x, vSet[i+2].pos.y);
            p.stroke(255, 30); p.line(vSet[i].pos.x, vSet[i].pos.y, vSet[i+2].pos.x, vSet[i+2].pos.y);
        }
    }

    drawNeural(p, col, d, vSet) {
        p.stroke(col[0], col[1], col[2], d.alpha * 0.8);
        const limit = 80 * (1 + d.v_complexity);
        for (let i = 0; i < vSet.length; i += 8) {
            for (let j = i + 8; j < vSet.length; j += 16) {
                if (p5.Vector.dist(vSet[i].pos, vSet[j].pos) < limit) {
                    p.strokeWeight(0.5);
                    p.line(vSet[i].pos.x, vSet[i].pos.y, vSet[j].pos.x, vSet[j].pos.y);
                }
            }
        }
        this.drawDefault(p, col, d, vSet);
    }

    drawMechanic(p, col, d, vSet) {
        vSet.forEach((v, i) => {
            if (i % 12 === 0) {
                const len = 20 * p.sin(p.frameCount * 0.1 + v.seed * 5);
                p.strokeWeight(1); p.stroke(col[0], col[1], col[2], d.alpha);
                p.line(v.pos.x, v.pos.y, v.pos.x + len, v.pos.y + len);
                p.rect(v.pos.x + len - 2, v.pos.y + len - 2, 4, 4);
            }
        });
        this.drawDefault(p, col, d, vSet);
    }

    drawGaseous(p, col, d, vSet) {
        p.noStroke();
        vSet.forEach((v, i) => {
            if (i % 5 === 0) {
                p.fill(col[0], col[1], col[2], d.alpha * 0.2);
                p.circle(v.pos.x + rand(-10,10), v.pos.y + rand(-10,10), 15 * v.seed);
            }
        });
    }

    drawFragmented(p, col, d, vSet) {
        p.noStroke(); p.fill(col[0], col[1], col[2], d.alpha);
        vSet.forEach((v, i) => {
            if (i % 6 === 0) {
                const sz = 12 * v.seed;
                p.push(); p.translate(v.pos.x, v.pos.y); p.rotate(v.seed * 6.28 + p.frameCount * 0.05);
                p.rect(-sz/2, -sz/2, sz, sz); p.pop();
            }
        });
    }

    drawOpArt(p, col, d, vSet) {
        p.noFill(); p.strokeWeight(1);
        for (let k = 0; k < 4; k++) {
            p.stroke(255, d.alpha * (0.5 - k*0.1));
            p.beginShape(); vSet.forEach(v => p.vertex(v.pos.x * (1 + k*0.1), v.pos.y * (1 + k*0.1))); p.endShape(p.CLOSE);
        }
    }

    drawKinetic(p, col, d, vSet) {
        vSet.forEach((v, i) => {
            if (i % 15 === 0) {
                p.push(); p.translate(v.pos.x, v.pos.y); p.rotate(p.frameCount * 0.1);
                p.stroke(col[0], col[1], col[2], d.alpha); p.line(-15, 0, 15, 0); p.pop();
            }
        });
        this.drawDefault(p, col, d, vSet);
    }

    drawVoronoi(p, col, d, vSet) {
        p.noFill(); p.stroke(col[0], col[1], col[2], d.alpha * 0.5);
        vSet.forEach((v, i) => {
            if (i % 25 === 0) {
                p.beginShape(); for(let a=0; a<6.28; a+=1.04) p.vertex(v.pos.x + p.cos(a)*15, v.pos.y + p.sin(a)*15); p.endShape(p.CLOSE);
            }
        });
        this.drawDefault(p, col, d, vSet);
    }

    drawASCII(p, col, d, vSet) {
        p.fill(col[0], col[1], col[2], d.alpha); p.textSize(8);
        vSet.forEach((v, i) => { if (i % 10 === 0) p.text(pick(["#","*","+","-",":","."]), v.pos.x, v.pos.y); });
    }

    drawPixelSort(p, col, d, vSet) {
        p.stroke(col[0], col[1], col[2], d.alpha * 0.4);
        vSet.forEach((v, i) => { if (i % 8 === 0) p.line(v.pos.x, v.pos.y, v.pos.x, v.pos.y + p.noise(v.pos.x*0.1, t)*50); });
        this.drawDefault(p, col, d, vSet);
    }

    drawTuring(p, col, d, vSet) {
        p.noStroke();
        vSet.forEach(v => {
            if (p.noise(v.pos.x*0.05, v.pos.y*0.05) > 0.6) { p.fill(255, d.alpha * 0.5); p.circle(v.pos.x, v.pos.y, 6); }
        });
    }

    drawDelaunay(p, col, d, vSet) {
        p.stroke(col[0], col[1], col[2], d.alpha * 0.2); p.noFill();
        for (let i = 0; i < vSet.length - 20; i += 20) {
            p.triangle(vSet[i].pos.x, vSet[i].pos.y, vSet[i+10].pos.x, vSet[i+10].pos.y, vSet[i+20].pos.x, vSet[i+20].pos.y);
        }
    }

    drawAttractor(p, col, d, vSet) {
        vSet.forEach((v, i) => {
            if (i % 40 === 0) {
                p.noFill(); p.stroke(col[0], col[1], col[2], d.alpha * 0.4);
                p.beginShape(); let lx=v.pos.x, ly=v.pos.y;
                for(let k=0; k<20; k++) { lx+=p.sin(ly*0.1)*5; ly+=p.cos(lx*0.1)*5; p.vertex(lx, ly); }
                p.endShape();
            }
        });
    }

    drawParametric(p, col, d, vSet) {
        vSet.forEach((v, i) => {
            if (i % 30 === 0) {
                p.noFill(); p.stroke(col[0], col[1], col[2], d.alpha);
                p.beginShape(); for(let a=0; a<6.28; a+=0.3) p.vertex(v.pos.x + p.cos(a*3)*20, v.pos.y + p.sin(a*2)*20); p.endShape(p.CLOSE);
            }
        });
        this.drawDefault(p, col, d, vSet);
    }

    drawTrig(p, col, d, vSet) {
        p.noFill(); p.stroke(col[0], col[1], col[2], d.alpha);
        p.beginShape(); vSet.forEach((v, i) => p.vertex(v.pos.x, v.pos.y + p.sin(p.frameCount * 0.1 + i * 0.3) * 20)); p.endShape();
    }

    drawDna(p, col, d, vSet) {
        for (let i = 0; i < vSet.length - 1; i += 10) {
            p.stroke(col[0], col[1], col[2], d.alpha); p.line(vSet[i].pos.x - 10, vSet[i].pos.y, vSet[i].pos.x + 10, vSet[i].pos.y);
            p.fill(255, d.alpha); p.circle(vSet[i].pos.x - 10, vSet[i].pos.y, 4); p.circle(vSet[i].pos.x + 10, vSet[i].pos.y, 4);
        }
        this.drawDefault(p, col, d, vSet);
    }

    drawLymphocyte(p, col, d, vSet) {
        vSet.forEach((v, i) => {
            if (i % 30 === 0) {
                p.fill(col[0], col[1], col[2], d.alpha * 0.6); p.stroke(255, d.alpha);
                p.circle(v.pos.x, v.pos.y, 10);
                for(let a=0; a<6.28; a+=1) p.line(v.pos.x, v.pos.y, v.pos.x + p.cos(a)*15, v.pos.y + p.sin(a)*15);
            }
        });
        this.drawDefault(p, col, d, vSet);
    }

    drawGlobule(p, col, d, vSet) {
        vSet.forEach((v, i) => {
            if (i % 8 === 0) {
                p.noStroke(); p.fill(200, 20, 40, d.alpha); p.circle(v.pos.x, v.pos.y, 10 + p.sin(p.frameCount*0.1 + i)*3);
                p.fill(255, 100); p.circle(v.pos.x-3, v.pos.y-3, 3);
            }
        });
    }
}

// ═══════════════════════════════════════════════════════════
// ECOSYSTEM MANAGER
// ═══════════════════════════════════════════════════════════
class TypoUniverse {
    constructor(p) {
        this.p = p; this.history = []; this.particles = []; this.initUI(); this.initInteraction();
    }

    addAtom(forcedType = null, x = null, y = null, char = '', dna = null) {
        this.history.push([...APP_STATE.atoms]);
        const atom = new LivingTypo(this.p, char, null, { x, y, dna });
        if (forcedType) atom.dna.type = forcedType;
        APP_STATE.atoms.push(atom); this.updateMoleculeList(); return atom;
    }

    removeAtom(id) { APP_STATE.atoms = APP_STATE.atoms.filter(a => a.atomId !== id); this.updateMoleculeList(); }

    checkFusion(moved) {
        const other = APP_STATE.atoms.find(o => o !== moved && Math.hypot(o.x - moved.x, o.y - moved.y) < 130);
        if (!other) return;

        const childDNA = BioGenome.cross(moved.dna, other.dna);
        if (!childDNA) { this.explode(moved.x, moved.y, [255, 0, 0]); this.removeAtom(moved.atomId); this.removeAtom(other.atomId); return; }

        let childChar = pick([moved.char, other.char]);
        if (Math.random() < 0.25) childChar = pick("ABCDEFGHIJKLMNOPQRSTUVWXYZΣΔΩΨΠΦΞΛΘ");

        const nx = (moved.x + other.x) / 2; const ny = (moved.y + other.y) / 2;
        this.explode(nx, ny, [childDNA.colorR, childDNA.colorG, childDNA.colorB]);
        this.addAtom(childDNA.type, nx, ny, childChar, childDNA);
        this.removeAtom(moved.atomId); this.removeAtom(other.atomId);
    }

    explode(x, y, col) {
        for (let i = 0; i < 40; i++) {
            const ang = Math.random() * 6.28; const spd = Math.random() * 6;
            this.particles.push({ pos: this.p.createVector(x, y), vel: this.p.createVector(Math.cos(ang)*spd, Math.sin(ang)*spd), sz: rand(2, 8), life: 1.0, color: col });
        }
    }

    update() {
        this.particles.forEach((pt, i) => { pt.pos.add(pt.vel); pt.life -= 0.025; if (pt.life <= 0) this.particles.splice(i, 1); });
    }

    drawParticles() {
        this.p.noStroke(); this.particles.forEach(pt => { this.p.fill(pt.color[0], pt.color[1], pt.color[2], pt.life * 255); this.p.circle(pt.pos.x, pt.pos.y, pt.sz); });
    }

    updateMoleculeList() {
        const ml = document.getElementById('molecule-list');
        if (ml) ml.innerHTML = APP_STATE.atoms.map(a => `<li class="molecule-item" data-atom-id="${a.atomId}"><span class="status-dot" style="background:rgb(${a.dna.colorR},${a.dna.colorG},${a.dna.colorB})"></span><div class="molecule-info"><div class="name">${a.char} [${a.dna.type}]</div><div class="meta">W ${a.dna.v_width?.toFixed(1) || 1} | ST ${a.dna.v_strokeW?.toFixed(0) || 1}</div></div></li>`).join('');
    }

    initUI() { document.getElementById('add-atom').onclick = () => this.addAtom(); }

    initInteraction() {
        let dragged = null, panning = false, lx = 0, ly = 0;
        const world = (cx, cy) => ({ wx: (cx-this.p.width/2-APP_STATE.view.x)/APP_STATE.view.zoom, wy: (cy-this.p.height/2-APP_STATE.view.y)/APP_STATE.view.zoom });
        window.addEventListener('mousedown', e => { if (e.target.closest('.ui-overlay')) return; const { wx, wy } = world(e.clientX, e.clientY); dragged = APP_STATE.atoms.find(a => Math.hypot(a.x-wx, a.y-wy) < 200/APP_STATE.view.zoom); if (!dragged) { panning = true; lx = e.clientX; ly = e.clientY; } });
        window.addEventListener('mousemove', e => { if (dragged) { dragged.x += e.movementX/APP_STATE.view.zoom; dragged.y += e.movementY/APP_STATE.view.zoom; } else if (panning) { APP_STATE.view.targetX += (e.clientX-lx); APP_STATE.view.targetY += (e.clientY-ly); APP_STATE.view.x=APP_STATE.view.targetX; APP_STATE.view.y=APP_STATE.view.targetY; lx=e.clientX; ly=e.clientY; } });
        window.addEventListener('mouseup', () => { if (dragged) this.checkFusion(dragged); dragged = null; panning = false; });
        window.addEventListener('wheel', e => { if (e.target.closest('.ui-overlay')) return; e.preventDefault(); APP_STATE.view.zoom = clamp(APP_STATE.view.zoom * (e.deltaY > 0 ? 0.9 : 1.1), 0.05, 5); }, { passive: false });
    }
}

const sketch = (p) => {
    let TU;
    p.preload = () => { FONT_SOURCES.forEach(s => FONTS.push({ name: s.name, obj: p.loadFont(s.url) })); };
    p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight); TU = new TypoUniverse(p);
        BioGenome.TYPES.sort(() => 0.5 - Math.random()).slice(0, 8).forEach((type, i) => {
            const x = (i % 4 - 1.5) * 350; const y = (Math.floor(i / 4) - 0.5) * 450;
            TU.addAtom(type, x, y);
        });
        const loader = document.getElementById('loader'); if (loader) loader.style.display = 'none';
    };
    p.draw = () => {
        p.background(5, 5, 10);
        p.push(); p.translate(p.width/2+APP_STATE.view.x, p.height/2+APP_STATE.view.y); p.scale(APP_STATE.view.zoom);
        TU.update(); TU.drawParticles();
        APP_STATE.atoms.forEach(a => { a.update(); a.draw(); });
        p.pop();
        p.resetMatrix(); p.fill(255, 40); p.textSize(10); p.text(`ENGINE v53.0 | CHIMERA FUSION ACTIVE`, 20, p.height - 20);
        if (p.frameCount < 120) { p.fill(255, 255-p.frameCount*2); p.textSize(40); p.textAlign(p.CENTER); p.text("VARIABLE WIDTH v53.0 ACTIVE", p.width/2, p.height/2); }
    };
    p.windowResized = () => p.resizeCanvas(window.innerWidth, window.innerHeight);
};
new p5(sketch);

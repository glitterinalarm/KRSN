// Typography Lab - Alchemy Engine v40.0
// PORT FROM v25.1 (the version that actually worked)
// KEY INSIGHT: Phenotypes are ADDITIVE weights (0→1), not mutually exclusive styles
// Gen 1: letters stay as text (clean). Fusion: vertex physics + additive phenotypes
console.log("TypoLab Engine v40.0 - ADDITIVE PHENOTYPES | REAL FILIATION | DIVERSITY");

let _uid = 0;

const APP_STATE = {
    atoms: [],
    view: { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0 },
    isRecording: false
};

const FONT_SOURCES = [
    { name: 'Roboto',       url: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-black-webfont.ttf' },
    { name: 'Source Sans',  url: 'https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceSansPro-Black.otf' },
    { name: 'Source Code',  url: 'https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf' },
    { name: 'Roboto Mono',  url: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-mediumitalic-webfont.ttf' }
];
const FONTS = [];

function rPow(p = 3) { return Math.pow(Math.random(), p); }
function rand(a, b)   { return Math.random() * (b - a) + a; }
function clamp(v,a,b) { return Math.max(a, Math.min(b, v)); }
function pick(arr)    { return arr[Math.floor(Math.random() * arr.length)]; }

// ─────────────────────────────────────────────────────────────
// GENOME — ADDITIVE MULTI-PHENOTYPE SYSTEM
// Each trait is a 0→1 weight. Multiple can be non-zero at once.
// This is WHY the old version had diversity: combinations, not exclusions.
// ─────────────────────────────────────────────────────────────
class Genome {
    static gen1() {
        return {
            isStable: true,

            // Visual style for Gen 1 text rendering
            textStyle:  pick(['solid','outline','dual','shadow','glow','outline_thick']),
            fxStyle:    pick(['breathe','pulse','shift','static','static','static']),
            fxSpeed:    rand(0.3, 2.5),
            fontSize:   rand(100, 400),

            // Colors & stroke
            v_strokeW: rand(1, 10),
            v_alphaFill: rand(60, 230),
            v_alphaStr:  rand(140, 255),

            colorR: Math.random() * 255,
            colorG: Math.random() * 255,
            colorB: Math.random() * 255
        };
    }

    // For fusion children: full additive phenotype genome
    static gen1_vertex() {
        // This is what gets attached as the "vertex genome" when creating the letter's vertex data
        // Used when building vertex arrays for future fusion
        return {
            // PHYSICS
            g_fluid:    rPow(3),
            g_mycelium: rPow(4),
            g_swarm:    rPow(3),
            g_orbit:    rPow(2),
            g_pulse:    rPow(3),
            g_speed:    rand(0.2, 3),
            g_amplitude:rand(0.5, 2.5),
            cohesion:   rand(0.6, 1.0),  // Gen 1: high cohesion

            // VERTEX TOPOLOGY
            v_roughness: rPow(3) * 50,   // scramble at birth
            v_resolution: rand(0.04, 0.18),

            // PHENOTYPE WEIGHTS (additive — all can coexist)
            v_neural:   rPow(2),
            v_membrane: rPow(2),
            v_spine:    rPow(2),
            v_spores:   rPow(2),
            v_sharp:    rPow(2),

            // STROKE
            v_strokeW: rand(0.3, 7),
            v_dashA:   rPow(2) * 50,
            v_dashB:   rPow(1.5) * 50,
            v_alphaF:  rand(40, 180),
            v_alphaS:  rand(100, 255),

            blend_additive: Math.random() > 0.72,
            colorR: Math.random() * 255,
            colorG: Math.random() * 255,
            colorB: Math.random() * 255
        };
    }

    // Biological dominance model:
    // Dominant phenotype (>0.6) → inherited strongly. Mutation small (±12%).
    // Cohesion decays ~10% per generation (not halved).
    static fuse(A, B) {
        const child = {};
        const PHENOTYPES = ['v_membrane','v_neural','v_spine','v_spores','v_sharp'];
        const PHYSICS    = ['g_fluid','g_mycelium','g_swarm','g_orbit','g_pulse'];
        const DOM = 0.6;

        for (const k in A) {
            const av = A[k] || 0, bv = B[k] || 0;
            if (typeof A[k] === 'boolean' || k === 'blend_additive') { child[k] = Math.random() > 0.5 ? A[k] : B[k]; continue; }
            if (typeof A[k] === 'string') { child[k] = Math.random() > 0.5 ? A[k] : B[k]; continue; }

            if (PHENOTYPES.includes(k)) {
                // Dominant gene expresses — child inherits strong parent's value
                const maxV = Math.max(av, bv), minV = Math.min(av, bv);
                child[k] = maxV > DOM
                    ? clamp(maxV * rand(0.82, 1.08), 0, 1.5)        // dominant: keep strong
                    : clamp((maxV + minV) / 2 * rand(0.75, 1.15), 0, 1.5); // recessive: blend
            } else if (PHYSICS.includes(k)) {
                // Stronger physics gene carries through
                const maxV = Math.max(av, bv);
                child[k] = maxV > DOM
                    ? clamp(maxV * rand(0.85, 1.05), 0, 5)
                    : clamp((av + bv) / 2 * rand(0.8, 1.1), 0, 5);
            } else if (k === 'cohesion') {
                // Gentle decay per generation (~10%), not halved
                child[k] = clamp((av + bv) / 2 * 0.88, 0.08, 0.96);
            } else if (k.startsWith('color')) {
                // Color: blend with small tint shift
                child[k] = clamp((av + bv) / 2 + rand(-20, 20), 0, 255);
            } else {
                // Everything else: modest blend + ±12% noise
                child[k] = (av + bv) / 2 + (Math.random() - 0.5) * (av + bv) * 0.12;
                if (k.startsWith('v_alpha')) child[k] = clamp(child[k], 0, 255);
                else if (k.startsWith('g_') || k.startsWith('v_')) child[k] = Math.max(0, child[k]);
            }
        }
        child.isStable = false;
        child.fontSize = clamp(((A.fontSize||250) + (B.fontSize||250)) / 2 + rand(-60, 60), 80, 500);
        return child;
    }
}

// ─────────────────────────────────────────────────────────────
// SKETCH

// ─────────────────────────────────────────────────────────────
const sketch = (p) => {
    p.preload = () => FONT_SOURCES.forEach(f => p.loadFont(f.url, font => FONTS.push({ name: f.name, obj: font })));

    p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight).parent('stage');
        document.getElementById('loader').classList.add('hidden');
        window.TU = new TypoUniverse(p);
        injectExportUI(p);
        for (let i = 0; i < 7; i++) window.TU.addAtom();
    };

    p.draw = () => {
        p.background(10, 10, 12);
        APP_STATE.view.x += (APP_STATE.view.targetX - APP_STATE.view.x) * 0.1;
        APP_STATE.view.y += (APP_STATE.view.targetY - APP_STATE.view.y) * 0.1;
        p.push();
        p.translate(p.width / 2 + APP_STATE.view.x, p.height / 2 + APP_STATE.view.y);
        p.scale(APP_STATE.view.zoom);
        APP_STATE.atoms.forEach(a => { a.update(); a.draw(); });
        p.pop();
        if (APP_STATE.isRecording) {
            p.push(); p.fill(255,0,0); p.noStroke(); p.circle(28,28,14);
            p.fill(255); p.textSize(13); p.text('REC',40,33); p.pop();
        }
    };

    p.windowResized = () => p.resizeCanvas(window.innerWidth, window.innerHeight);
};

// ─────────────────────────────────────────────────────────────
// LIVING TYPO
// ─────────────────────────────────────────────────────────────
class LivingTypo {
    constructor(p, char, fontData, parentData = null) {
        this.p       = p;
        this.atomId  = _uid++;
        this.age     = 0;
        this.vertices = [];
        this.fontObj  = null;
        this.vDna     = null; // vertex genome (separate from display genome)

        if (parentData) {
            // ── Fusion child ──
            this.x        = parentData.x;
            this.y        = parentData.y;
            this.char     = parentData.char;
            this.fontName = parentData.fontName;
            this.dna      = parentData.dna;   // fused vertex genome
            this.gen      = parentData.gen;
            this.vDna     = this.dna;
            parentData.vertices.forEach(v => this.vertices.push({
                pos:     v.pos.copy(),
                basePos: p.createVector(v.pos.x, v.pos.y),
                vel:     p.createVector(0, 0)
            }));
            while (this.vertices.length > 450) this.vertices.splice(Math.floor(Math.random() * this.vertices.length), 1);
        } else {
            // ── Fresh Gen-1 atom ──
            this.x    = (Math.random() - 0.5) * 1600;
            this.y    = (Math.random() - 0.5) * 1200;
            const CH  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            this.char = char || CH[Math.floor(Math.random() * CH.length)];
            this.gen  = 1;
            this.dna  = Genome.gen1();              // display genome
            this.vDna = Genome.gen1_vertex();        // vertex genome for future fusions

            const font = fontData || (FONTS.length ? FONTS[Math.floor(Math.random() * FONTS.length)] : null);
            this.fontName = font ? font.name : 'System';
            this.fontObj  = font ? font.obj : null;

            // Build vertex cloud from font outlines (used when fusing, not for Gen1 display)
            if (font && font.obj) {
                const fs  = this.vDna.fontSize || 300;
                const b   = font.obj.textBounds(this.char, 0, 0, fs);
                const pts = font.obj.textToPoints(
                    this.char, -b.x - b.w / 2, -b.y - b.h / 2, fs,
                    { sampleFactor: Math.min(0.18, this.vDna.v_resolution), simplifyThreshold: 0 }
                );
                pts.forEach(pt => {
                    // Apply roughness at birth for vertex data
                    const nx = pt.x + (Math.random() - 0.5) * this.vDna.v_roughness;
                    const ny = pt.y + (Math.random() - 0.5) * this.vDna.v_roughness;
                    this.vertices.push({
                        pos:     p.createVector(nx, ny),
                        basePos: p.createVector(nx, ny),
                        vel:     p.createVector(0, 0)
                    });
                });
                // Store font size for Gen1 display
                this.dna.fontSize = this.vDna.fontSize || fs;
                // Sync colors between genomes
                this.vDna.colorR = this.dna.colorR;
                this.vDna.colorG = this.dna.colorG;
                this.vDna.colorB = this.dna.colorB;
            }
        }
    }

    // ── PHYSICS (fusion children only) ──
    update() {
        this.age++;
        const d = this.vDna || this.dna;
        if (!d || d.isStable) return;

        const t   = this.p.frameCount * 0.01 * (d.g_speed || 1);
        const amp = d.g_amplitude || 1;

        let cmX = 0, cmY = 0;
        this.vertices.forEach(v => { cmX += v.pos.x; cmY += v.pos.y; });
        if (this.vertices.length > 0) { cmX /= this.vertices.length; cmY /= this.vertices.length; }
        const center = this.p.createVector(cmX, cmY);

        for (let i = 0; i < this.vertices.length; i++) {
            const v     = this.vertices[i];
            const force = this.p.createVector(0, 0);

            if (d.g_fluid > 0.01) {
                const a = this.p.noise(v.pos.x * 0.005 + t, v.pos.y * 0.005) * this.p.TWO_PI * 4;
                force.add(p5.Vector.fromAngle(a).mult(d.g_fluid * amp));
            }
            if (d.g_orbit > 0.01) {
                const toCenter = p5.Vector.sub(center, v.pos);
                const perp     = this.p.createVector(-toCenter.y, toCenter.x).normalize();
                force.add(perp.mult(d.g_orbit * amp));
            }
            if (d.g_pulse > 0.01) {
                const outward = p5.Vector.sub(v.pos, center).normalize();
                force.add(outward.mult(Math.sin(t * 8 - p5.Vector.dist(center, v.pos) * 0.02) * d.g_pulse * amp));
            }
            if (d.g_swarm > 0.01) {
                const n = this.vertices[(i + 1) % this.vertices.length];
                force.add(p5.Vector.sub(n.pos, v.pos).normalize().mult(d.g_swarm * amp));
            }

            v.vel.add(force);

            if (d.g_mycelium > 0.01) {
                const heading = v.vel.heading();
                const snap    = Math.round(heading / this.p.HALF_PI) * this.p.HALF_PI;
                v.vel.rotate((snap - heading) * d.g_mycelium * 0.6);
            }

            // Spring back to base
            v.vel.add(p5.Vector.sub(v.basePos, v.pos).mult((d.cohesion || 0.5) * 0.05));
            v.vel.mult(0.85);
            v.pos.add(v.vel);

            // Base drift (erosion for low-cohesion)
            if ((d.cohesion || 1) < 0.9) {
                v.basePos.add(this.p.createVector(Math.random()-0.5, Math.random()-0.5).mult(0.5 * (1 - d.cohesion) * amp));
            }
        }
    }

    // ── RENDERING ──
    draw() {
        const p    = this.p;
        const d    = this.dna;
        const t    = p.frameCount * 0.015 * (d.fxSpeed || 1);
        const pulse  = 0.5 + 0.5 * Math.sin(t);
        const pulse2 = 0.5 + 0.5 * Math.cos(t * 1.3);

        let R = d.colorR, G = d.colorG, B = d.colorB;
        if (d.fxStyle === 'shift') {
            R = clamp(R + Math.sin(t*0.7)*30, 0, 255);
            G = clamp(G + Math.sin(t*0.5)*30, 0, 255);
            B = clamp(B + Math.sin(t*0.9)*30, 0, 255);
        }
        const alphaF = (d.v_alphaFill || d.v_alphaF || 140) * (d.fxStyle === 'breathe' ? (0.55 + pulse * 0.45) : 1);
        const alphaS = (d.v_alphaStr  || d.v_alphaS || 200) * (d.fxStyle === 'pulse'   ? (0.5 + pulse2 * 0.5) : 1);

        // ════════════════════════════════════════════
        //  GEN 1 — PURE CANVAS TEXT (no vertex chaos)
        // ════════════════════════════════════════════
        if (d.isStable && this.fontObj) {
            p.push();
            p.translate(this.x, this.y);
            p.textAlign(p.CENTER, p.CENTER);
            p.textFont(this.fontObj);
            p.textSize(d.fontSize || 250);
            const ctx = p.drawingContext;

            switch (d.textStyle) {
                case 'solid':
                    p.noStroke(); p.fill(R, G, B, alphaF); p.text(this.char, 0, 0); break;
                case 'outline':
                    p.noFill(); p.stroke(R, G, B, alphaS); p.strokeWeight(d.v_strokeW); p.text(this.char, 0, 0); break;
                case 'outline_thick':
                    p.noFill();
                    p.stroke(R, G, B, alphaS * 0.25); p.strokeWeight(d.v_strokeW * 4); p.text(this.char, 0, 0);
                    p.stroke(R, G, B, alphaS); p.strokeWeight(d.v_strokeW); p.text(this.char, 0, 0);
                    break;
                case 'dual':
                    p.fill(R, G, B, alphaF * 0.6); p.stroke(R, G, B, alphaS); p.strokeWeight(d.v_strokeW * 0.5); p.text(this.char, 0, 0); break;
                case 'shadow':
                    ctx.shadowColor = `rgba(${R},${G},${B},0.9)`; ctx.shadowBlur = 25;
                    p.noStroke(); p.fill(R, G, B, alphaF); p.text(this.char, 0, 0);
                    ctx.shadowBlur = 0; break;
                case 'glow':
                    for (let pass = 4; pass >= 0; pass--) {
                        ctx.shadowColor = `rgba(${R},${G},${B},${0.8 - pass*0.12})`; ctx.shadowBlur = 60 - pass*10;
                        p.noStroke(); p.fill(R, G, B, pass === 0 ? alphaF : alphaF * 0.15); p.text(this.char, 0, 0);
                    }
                    ctx.shadowBlur = 0; break;
            }
            p.pop();
            return;
        }

        // ════════════════════════════════════════════
        //  FUSION — ADDITIVE MULTI-PHENOTYPE RENDERING
        //  Multiple phenotypes can layer simultaneously
        //  This is the secret of v25.1's diversity
        // ════════════════════════════════════════════
        const vd = this.vDna || d;
        const vs  = this.vertices;
        if (vs.length < 3) return;

        p.push();
        p.translate(this.x, this.y);
        if (vd.blend_additive) p.blendMode(p.ADD);

        // PHENOTYPE 1: MEMBRANE (soft blobby fill, weighted by v_membrane)
        if (vd.v_membrane > 0.05) {
            p.noStroke();
            p.fill(R, G, B, vd.v_alphaF * vd.v_membrane);
            p.beginShape();
            this.vertices.forEach(v => p.curveVertex(v.pos.x, v.pos.y));
            p.endShape();
        }

        // PHENOTYPE 2: SPINE (continuous stroke trace, weighted by v_spine)
        if (vd.v_spine > 0.05) {
            p.noFill();
            p.stroke(R, G, B, vd.v_alphaS * vd.v_spine);
            p.strokeWeight(vd.v_strokeW * vd.v_spine);
            if (vd.v_dashA > 2) p.drawingContext.setLineDash([vd.v_dashA, vd.v_dashB]);
            p.beginShape();
            this.vertices.forEach(v => p.vertex(v.pos.x, v.pos.y));
            p.endShape();
            p.drawingContext.setLineDash([]);
        }

        // PHENOTYPE 3: NEURAL (proximity mesh, weighted by v_neural)
        if (vd.v_neural > 0.05) {
            p.stroke(R, G, B, vd.v_alphaS * vd.v_neural * 0.6);
            p.strokeWeight(Math.max(0.2, vd.v_strokeW * 0.5));
            const distLimit = vd.v_neural * 120;
            if (vd.v_dashA > 5) p.drawingContext.setLineDash([vd.v_dashA / 2, vd.v_dashB]);
            for (let i = 0; i < vs.length; i += 2) {
                for (let j = i + 1; j < vs.length; j += 4) {
                    if (vs[i].pos.dist(vs[j].pos) < distLimit) {
                        p.line(vs[i].pos.x, vs[i].pos.y, vs[j].pos.x, vs[j].pos.y);
                    }
                }
            }
            p.drawingContext.setLineDash([]);
        }

        // PHENOTYPE 4: SHARP (crystal shards, weighted by v_sharp)
        if (vd.v_sharp > 0.05) {
            p.noStroke();
            p.fill(R, G, B, vd.v_alphaF * vd.v_sharp);
            p.beginShape(p.TRIANGLES);
            for (let i = 0; i < vs.length - 2; i += 3) {
                if (vs[i].pos.dist(vs[i+1].pos) < vd.v_sharp * 150) {
                    p.vertex(vs[i].pos.x,   vs[i].pos.y);
                    p.vertex(vs[i+1].pos.x, vs[i+1].pos.y);
                    p.vertex(vs[i+2].pos.x, vs[i+2].pos.y);
                }
            }
            p.endShape();
        }

        // PHENOTYPE 5: SPORES (floating nodes, weighted by v_spores)
        if (vd.v_spores > 0.05) {
            p.noStroke();
            p.fill(R, G, B, vd.v_alphaS * vd.v_spores);
            const sz = vd.v_spores * 15;
            for (const v of vs) {
                p.push(); p.translate(v.pos.x, v.pos.y); p.rotate(v.vel?.heading() || 0);
                if (vd.g_mycelium > 0.5) p.rect(0, 0, sz, sz);
                else p.circle(0, 0, sz);
                p.pop();
            }
        }

        p.blendMode(p.BLEND);
        p.pop();
    }
}

// ─────────────────────────────────────────────────────────────
// TYPO UNIVERSE
// ─────────────────────────────────────────────────────────────
class TypoUniverse {
    constructor(p) {
        this.p = p; this.history = [];
        this.initUI(); this.initInteraction();
    }

    addAtom() {
        this.history.push([...APP_STATE.atoms]);
        const font = FONTS.length ? FONTS[Math.floor(Math.random() * FONTS.length)] : null;
        APP_STATE.atoms.push(new LivingTypo(this.p, '', font));
        this.updateMoleculeList();
    }

    undo() {
        if (this.history.length) { APP_STATE.atoms = this.history.pop(); this.updateMoleculeList(); }
    }

    focusOn(atomId) {
        const atom = APP_STATE.atoms.find(a => a.atomId === atomId);
        if (!atom) return;
        APP_STATE.view.targetX = -atom.x * APP_STATE.view.zoom;
        APP_STATE.view.targetY = -atom.y * APP_STATE.view.zoom;
    }

    checkFusion(moved) {
        const other = APP_STATE.atoms.find(o => o !== moved && Math.hypot(o.x - moved.x, o.y - moved.y) < 200);
        if (!other) return;
        this.history.push([...APP_STATE.atoms]);
        const childGen = Math.max(moved.gen, other.gen) + 1;

        // Fuse the VERTEX genomes (not display genomes)
        const fusedVDna = Genome.fuse(moved.vDna || moved.dna, other.vDna || other.dna);
        fusedVDna.isStable = false;

        // Sync colors to fused dna
        const child = new LivingTypo(this.p, '?', null, {
            x: (moved.x + other.x) / 2,
            y: (moved.y + other.y) / 2,
            char: '?',
            fontName: `${moved.fontName} × ${other.fontName}`,
            gen:  childGen,
            dna:  fusedVDna,
            vertices: [...moved.vertices, ...other.vertices]
        });
        APP_STATE.atoms = APP_STATE.atoms.filter(a => a !== moved && a !== other);
        APP_STATE.atoms.push(child);
        this.updateMoleculeList();
    }

    initUI() {
        document.getElementById('add-atom').addEventListener('click', () => this.addAtom());
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('molecule-list').addEventListener('click', e => {
            const li = e.target.closest('[data-atom-id]');
            if (li) this.focusOn(parseInt(li.dataset.atomId, 10));
        });
    }

    initInteraction() {
        const toggle = document.getElementById('menu-toggle');
        const overlay = document.querySelector('.ui-overlay');
        if (toggle) toggle.addEventListener('click', () => {
            overlay.classList.toggle('active');
            toggle.innerText = overlay.classList.contains('active') ? '✕' : '☰';
        });

        let dragged = null, panning = false, lx = 0, ly = 0;
        const toWorld = (cx, cy) => ({
            wx: (cx - this.p.width  / 2 - APP_STATE.view.x) / APP_STATE.view.zoom,
            wy: (cy - this.p.height / 2 - APP_STATE.view.y) / APP_STATE.view.zoom
        });
        const onStart = (cx, cy, target) => {
            if (target.closest('.ui-overlay')) return;
            const { wx, wy } = toWorld(cx, cy);
            dragged = APP_STATE.atoms.find(a => Math.hypot(a.x - wx, a.y - wy) < 300 / APP_STATE.view.zoom) || null;
            if (!dragged) { panning = true; lx = cx; ly = cy; }
        };
        const onMove = (cx, cy, dx, dy) => {
            if (dragged) { dragged.x += dx / APP_STATE.view.zoom; dragged.y += dy / APP_STATE.view.zoom; }
            else if (panning) {
                APP_STATE.view.targetX += (cx - lx); APP_STATE.view.x = APP_STATE.view.targetX;
                APP_STATE.view.targetY += (cy - ly); APP_STATE.view.y = APP_STATE.view.targetY;
                lx = cx; ly = cy;
            }
        };
        const onEnd = () => { if (dragged) this.checkFusion(dragged); dragged = null; panning = false; };

        window.addEventListener('mousedown',  e => onStart(e.clientX, e.clientY, e.target));
        window.addEventListener('mousemove',  e => onMove(e.clientX, e.clientY, e.movementX, e.movementY));
        window.addEventListener('mouseup',    onEnd);
        window.addEventListener('touchstart', e => { const t=e.touches[0]; onStart(t.clientX,t.clientY,e.target); if(dragged) e.preventDefault(); }, {passive:false});
        window.addEventListener('touchmove',  e => { const t=e.touches[0]; onMove(t.clientX,t.clientY,t.clientX-lx,t.clientY-ly); lx=t.clientX; ly=t.clientY; if(dragged||panning) e.preventDefault(); }, {passive:false});
        window.addEventListener('touchend',   onEnd);
        window.addEventListener('wheel', e => {
            e.preventDefault();
            APP_STATE.view.zoom = Math.max(0.1, Math.min(6, APP_STATE.view.zoom * (e.deltaY > 0 ? 0.92 : 1.09)));
        }, { passive: false });
    }

    updateMoleculeList() {
        const ml = document.getElementById('molecule-list');
        if (!ml) return;
        ml.innerHTML = APP_STATE.atoms.map(a => {
            const d = a.dna;
            const R = Math.round(d.colorR), G = Math.round(d.colorG), B = Math.round(d.colorB);
            const fusion = !d.isStable;
            // Show phenotype weights for fusion children
            let sub = fusion
                ? `M:${((a.vDna||d).v_membrane||0).toFixed(1)} N:${((a.vDna||d).v_neural||0).toFixed(1)} Sp:${((a.vDna||d).v_spine||0).toFixed(1)}`
                : `${d.textStyle} · ${d.fxStyle}`;
            return `<li class="molecule-item" data-atom-id="${a.atomId}"
                style="cursor:pointer;display:flex;align-items:center;gap:10px;padding:8px 6px;border-bottom:1px solid rgba(255,255,255,0.05);transition:background 0.2s"
                onmouseenter="this.style.background='rgba(255,255,255,0.07)'"
                onmouseleave="this.style.background='none'">
                <span style="width:11px;height:11px;border-radius:50%;flex-shrink:0;background:rgb(${R},${G},${B});box-shadow:0 0 ${fusion?10:4}px rgb(${R},${G},${B})"></span>
                <div>
                    <div style="font-weight:700;font-size:0.82rem;color:${fusion?`rgb(${R},${G},${B})`:'#eee'}">
                        ${fusion?'⚡':'○'} [${a.char}] G${a.gen}
                    </div>
                    <div style="opacity:0.4;font-size:0.58rem;margin-top:2px">${sub}</div>
                </div>
            </li>`;
        }).join('');
    }
}

// ─────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────
function injectExportUI(p) {
    const parent = document.querySelector('.side-panel');
    if (!parent) return;
    const div = document.createElement('div');
    div.style.cssText = 'margin-top:auto;padding-top:14px;border-top:1px solid rgba(255,255,255,0.08)';
    div.innerHTML = `<div style="display:flex;gap:8px">
        <button id="btn-snap" style="flex:1;background:rgba(255,255,255,0.06);color:#fff;border:1px solid rgba(255,255,255,0.12);padding:9px 4px;cursor:pointer;font-size:.72rem;border-radius:4px">📸 IMAGE</button>
        <button id="btn-vid"  style="flex:1;background:rgba(200,30,30,.18);color:#fff;border:1px solid rgba(255,80,80,.25);padding:9px 4px;cursor:pointer;font-size:.72rem;border-radius:4px">🎥 VIDÉO</button>
    </div>`;
    parent.appendChild(div);
    document.getElementById('btn-snap').onclick = () => p.saveCanvas('typolab','png');
    let recorder, chunks = [];
    document.getElementById('btn-vid').onclick = () => {
        if (APP_STATE.isRecording) return; APP_STATE.isRecording = true;
        try { recorder = new MediaRecorder(document.querySelector('canvas').captureStream(60), {mimeType:'video/webm'}); }
        catch (_) { APP_STATE.isRecording = false; return; }
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => {
            const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(chunks, {type:'video/webm'}));
            a.download = 'typolab.webm'; a.click(); chunks = []; APP_STATE.isRecording = false;
        };
        recorder.start(); setTimeout(() => recorder.stop(), 4000);
    };
}

new p5(sketch);

// Typography Lab - Omniverse Engine v49.2
// THE "TOTAL STABILITY" UPDATE
// Focus: Fixing potential crashes in ES modules and ensuring the loader ALWAYS closes.
console.log("TypoLab v49.2 — STABILITY FIXES | EXCLUSION | CLEAN BIRTH");

let _uid = 0;

const APP_STATE = {
    atoms: [],
    view: { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0 },
    isRecording: false
};

// Simplified fonts for stability - using only the most reliable cdn links
const FONT_SOURCES = [
    { name: 'Roboto', url: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-black-webfont.ttf' }
];
const FONTS = [];

function rand(a, b)   { return Math.random() * (b - a) + a; }
function clamp(v,a,b) { return Math.max(a, Math.min(b, v)); }

// ═══════════════════════════════════════════════════════════
// GENOME
// ═══════════════════════════════════════════════════════════
class Genome {
    static createRandom() {
        // Clean birth, but we seed a modest amount of physics so later generations can evolve.
        return {
            // Geometry – start neutral
            v_scaleX: 1, v_scaleY: 1, v_rotation: 0,
            // Physics – moderate forces for smoother motion
            g_fluid: rand(0.05, 0.15),
            g_mycelium: rand(0.02, 0.08),
            g_swarm: rand(0.05, 0.12),
            g_orbit: rand(0.03, 0.09),
            g_pulse: rand(0.04, 0.1),
            g_vortex: rand(0.05, 0.12),
            g_gravity: rand(0.03, 0.09),
            g_speed: 0.2, // modest flow
            g_amplitude: 0.4,
            cohesion: 0.95, // high cohesion but not absolute
            // Topology – subtle jitter
            v_resolution: 0.15,
            v_roughness: rand(0.0, 0.2),
            v_fisheye: rand(0.0, 0.1),
            v_shear: rand(0.0, 0.1),
            v_complexity: rand(0.1, 0.3),
            // Archetype selection
            v_archetype: Math.floor(Math.random() * 4),
            // Phenotype activation (probabilistic, but at least one is always on)
            v_neural: Math.random() > 0.5 ? 1 : 0,
            v_membrane: Math.random() > 0.7 ? 1 : 0,
            v_spine: 1,
            v_spores: Math.random() > 0.6 ? 1 : 0,
            v_sharp: Math.random() > 0.85 ? 1 : 0,
            v_liquid: 0,
            v_glitch: 0,
            // Element scales – base values that will be mutated later
            v_elementScale: rand(0.5, 1.2),
            v_elementCount: rand(0.4, 0.9),
            // Style
            v_strokeW: rand(1.2, 2.5), v_dashA: 0, v_dashB: 0,
            v_alphaF: 80, v_alphaS: 220,
            blend_additive: false,
            // Random colour seed
            colorR: Math.random() * 255,
            colorG: Math.random() * 255,
            colorB: Math.random() * 255
        };
    }

    static merge(A, B) {
        const child = {};
        // 50 % chance to inherit a dominant set of traits from one parent (pure) – keeps lineage recognizable.
        const pureInheritance = Math.random() < 0.5;
        const dominant = Math.random() > 0.5 ? A : B;
        const EXCLUSIVE = ['v_archetype', 'v_scaleX', 'v_scaleY', 'v_strokeW', 'blend_additive'];
        const ACCUM = ['g_fluid','g_mycelium','g_swarm','g_orbit','g_pulse','g_vortex','g_gravity','v_roughness','v_glitch'];
        for (const k in A) {
            if (EXCLUSIVE.includes(k)) {
                child[k] = pureInheritance ? dominant[k] : (Math.random() > 0.5 ? A[k] : B[k]);
            } else if (ACCUM.includes(k)) {
                // Accumulate forces with a modest mutation boost
                const base = ((A[k]||0)+(B[k]||0))/2;
                const boost = Math.random() < 0.3 ? rand(0.05, 0.2) : 0;
                child[k] = clamp(base + boost, 0, 5);
            } else if (k === 'cohesion') {
                child[k] = clamp(((A[k]||1)+(B[k]||1))/2 * 0.92, 0.1, 0.98);
            } else if (k.startsWith('color')) {
                // Allow occasional dramatic colour jumps (lower chance)
                child[k] = Math.random() < 0.15 ? Math.random()*255 : clamp(((A[k]||128)+(B[k]||128))/2 + rand(-30,30), 0, 255);
            } else if (k.startsWith('v_alpha')) {
                child[k] = ((A[k]||100)+(B[k]||100))/2;
            } else {
                child[k] = pureInheritance ? dominant[k] : ((A[k]||0)+(B[k]||0))/2;
            }
        }
        // Moderate increase of complexity and speed after fusion
        child.v_complexity = clamp((A.v_complexity + B.v_complexity)/2 + rand(0.05, 0.15), 0.1, 1.0);
        child.g_speed = clamp((A.g_speed + B.g_speed)/2 + rand(0.02, 0.1), 0.05, 2.0);
        child.g_amplitude = clamp((A.g_amplitude + B.g_amplitude)/2 + rand(0.02, 0.1), 0.1, 2.5);
        return child;
    }
}

// ═══════════════════════════════════════════════════════════
// SKETCH
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
        setTimeout(hide, 1000);
        window.TU = new TypoUniverse(p);
        injectExportUI(p);
        for (let i = 0; i < 7; i++) window.TU.addAtom();
    };

    p.draw = () => {
        p.background(5, 5, 7);
        APP_STATE.view.x += (APP_STATE.view.targetX - APP_STATE.view.x) * 0.1;
        APP_STATE.view.y += (APP_STATE.view.targetY - APP_STATE.view.y) * 0.1;
        p.push();
        p.translate(p.width/2 + APP_STATE.view.x, p.height/2 + APP_STATE.view.y);
        p.scale(APP_STATE.view.zoom);
        APP_STATE.atoms.forEach(a => { a.update(); a.draw(); });
        p.pop();
    };

    p.windowResized = () => p.resizeCanvas(window.innerWidth, window.innerHeight);
};

// ═══════════════════════════════════════════════════════════
// LIVING TYPO
// ═══════════════════════════════════════════════════════════
class LivingTypo {
    constructor(p, char, fontData, parentData = null) {
        this.p = p; this.atomId = _uid++; this.vertices = [];
        if (parentData) {
            this.x = parentData.x; this.y = parentData.y; this.char = parentData.char;
            this.fontName = parentData.fontName; this.dna = parentData.dna; this.gen = parentData.gen;
            parentData.vertices.forEach((v, i) => {
                const step = Math.max(1, Math.floor(1.2 / (this.dna.v_complexity + 0.2)));
                if (i % step === 0) this.vertices.push({ pos: v.pos.copy(), basePos: v.pos.copy(), vel: p.createVector(0,0), seed: v.seed || Math.random() });
            });
            const MAX_VERTICES = 500;
            if (this.vertices.length > MAX_VERTICES) this.vertices = this.vertices.slice(0, MAX_VERTICES);
        } else {
            this.x = (Math.random()-0.5)*1400; this.y = (Math.random()-0.5)*1000;
            this.char = char || "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random()*36)];
            this.gen = 1; this.dna = Genome.createRandom();
            const font = fontData || (FONTS.length ? FONTS[0] : null);
            this.fontName = font ? font.name : 'System';
            if (font && font.obj) {
                const b = font.obj.textBounds(this.char, 0, 0, 400);
                const pts = font.obj.textToPoints(this.char, -b.x - b.w/2, -b.y - b.h/2, 400, { sampleFactor: this.dna.v_resolution });
                pts.forEach(pt => { this.vertices.push({ pos: p.createVector(pt.x, pt.y), basePos: p.createVector(pt.x, pt.y), vel: p.createVector(0,0), seed: Math.random() }); });
            }
        }
    }

    update() {
        const d = this.dna; const t = this.p.frameCount * 0.01 * d.g_speed; const amp = d.g_amplitude;
        let cmX = 0, cmY = 0; this.vertices.forEach(v => { cmX += v.pos.x; cmY += v.pos.y; });
        if (this.vertices.length) { cmX /= this.vertices.length; cmY /= this.vertices.length; }
        const center = this.p.createVector(cmX, cmY);
        this.vertices.forEach((v, i) => {
            const force = this.p.createVector(0,0);
            if (d.g_fluid > 0.01) force.add(p5.Vector.fromAngle(this.p.noise(v.pos.x*0.006+t, v.pos.y*0.006)*this.p.TWO_PI*4).mult(d.g_fluid*amp));
            if (d.g_gravity > 0.01) force.y += d.g_gravity * 12;
            v.vel.add(force); v.vel.add(p5.Vector.sub(v.basePos, v.pos).mult(d.cohesion*0.1));
            // Cap velocity magnitude for performance stability
            const MAX_FORCE = 5;
            if (v.vel.mag() > MAX_FORCE) v.vel.setMag(MAX_FORCE);
            v.vel.mult(0.8); v.pos.add(v.vel);
            if (d.cohesion < 1) v.basePos.add(this.p.createVector(Math.random()-0.5, Math.random()-0.5).mult(0.6*(1-d.cohesion)*amp));
        });
    }

    draw() {
        const p = this.p; const d = this.dna; const R = d.colorR, G = d.colorG, B = d.colorB;
        p.push();
        // Position & basic scale with a random rotation offset for depth perception
        p.translate(this.x, this.y);
        // Apply a subtle rotation based on complexity to give a 3‑D twist
        const rotOffset = (d.v_complexity - 0.5) * 0.3; // range approx -0.15..0.15 rad
        p.rotate(rotOffset);
        // Depth scaling amplified for richer visual hierarchy
        const depthScale = 1 + d.v_complexity * 0.6;
        p.scale(d.v_scaleX * depthScale, d.v_scaleY * depthScale);
        if (d.blend_additive) p.blendMode(p.ADD);
        // Base spine – always drawn for legibility, thicker for higher complexity
        p.noFill(); p.stroke(R, G, B, d.v_alphaS); p.strokeWeight(d.v_strokeW * (1 + d.v_complexity * 0.5));
        p.beginShape(); this.vertices.forEach(v => p.vertex(v.pos.x, v.pos.y)); p.endShape();
        // Archetype‑specific overlays
        if (d.v_archetype === 0 && d.v_membrane > 0.1) {
            p.noStroke(); p.fill(R, G, B, d.v_alphaF);
            p.beginShape();
            if (this.vertices.length > 3) this.vertices.forEach(v => p.curveVertex(v.pos.x, v.pos.y));
            else this.vertices.forEach(v => p.vertex(v.pos.x, v.pos.y));
            p.endShape(p.CLOSE);
        }
        if (d.v_archetype === 1 && d.v_sharp > 0.1) {
            p.noStroke(); p.beginShape(p.TRIANGLES);
            for (let i = 0; i < this.vertices.length - 2; i += 4) {
                const shade = 0.7 + 0.3 * Math.sin(p.frameCount * 0.02 + i);
                p.fill(R * shade, G * shade, B * shade, d.v_alphaF * 1.5);
                p.vertex(this.vertices[i].pos.x, this.vertices[i].pos.y);
                p.vertex(this.vertices[i + 1].pos.x, this.vertices[i + 1].pos.y);
                p.vertex(this.vertices[i + 2].pos.x, this.vertices[i + 2].pos.y);
            }
            p.endShape();
        }
        if (d.v_archetype === 2 && d.v_spores > 0.1) {
            p.noStroke(); p.fill(R, G, B, d.v_alphaS);
            // Increase spore density based on elementCount and complexity
            const sporeStep = Math.max(1, Math.floor(2 / (d.v_elementCount * (1 + d.v_complexity))));
            for (let i = 0; i < this.vertices.length; i += sporeStep) {
                const v = this.vertices[i];
                const sz = (10 + v.seed * 35) * d.v_elementScale * (1 + d.v_complexity * 0.3);
                p.push(); p.translate(v.pos.x, v.pos.y); p.rotate(v.vel.heading() + v.seed * p.TWO_PI);
                if (i % 3 === 0) p.rect(-sz / 2, -sz / 2, sz, sz);
                else p.circle(0, 0, sz);
                p.pop();
            }
        }
        if (d.v_archetype === 3 && d.v_neural > 0.1) {
            p.stroke(R, G, B, d.v_alphaS * 0.5); p.strokeWeight(d.v_strokeW * 0.5);
            const limit = 120 * d.v_elementScale;
            for (let i=0; i<this.vertices.length; i+=10) { for (let j=i+1; j<this.vertices.length; j+=25) { if (this.vertices[i].pos.dist(this.vertices[j].pos) < limit) p.line(this.vertices[i].pos.x, this.vertices[i].pos.y, this.vertices[j].pos.x, this.vertices[j].pos.y); } }
        }
        p.blendMode(p.BLEND); p.pop();
    }
}

// ═══════════════════════════════════════════════════════════
// TYPO UNIVERSE
// ═══════════════════════════════════════════════════════════
class TypoUniverse {
    constructor(p) { this.p = p; this.history = []; this.initUI(); this.initInteraction(); }
    addAtom() { this.history.push([...APP_STATE.atoms]); APP_STATE.atoms.push(new LivingTypo(this.p, '', null)); this.updateMoleculeList(); }
    undo() { if (this.history.length) { APP_STATE.atoms = this.history.pop(); this.updateMoleculeList(); } }
    focusOn(atomId) { const a = APP_STATE.atoms.find(o => o.atomId === atomId); if (a) { APP_STATE.view.targetX = -a.x * APP_STATE.view.zoom; APP_STATE.view.targetY = -a.y * APP_STATE.view.zoom; } }
    checkFusion(moved) {
        const other = APP_STATE.atoms.find(o => o !== moved && Math.hypot(o.x-moved.x, o.y-moved.y) < 200);
        if (!other) return;
        const child = new LivingTypo(this.p, moved.char, null, { x: (moved.x+other.x)/2, y: (moved.y+other.y)/2, char: moved.char, fontName: moved.fontName, gen: Math.max(moved.gen, other.gen)+1, dna: Genome.merge(moved.dna, other.dna), vertices: [...moved.vertices, ...other.vertices] });
        APP_STATE.atoms = APP_STATE.atoms.filter(a => a!==moved && a!==other); APP_STATE.atoms.push(child); this.updateMoleculeList();
    }
    initUI() {
        document.getElementById('add-atom').onclick = () => this.addAtom();
        document.getElementById('undo-btn').onclick = () => this.undo();
        document.getElementById('molecule-list').onclick = (e) => { const li = e.target.closest('[data-atom-id]'); if (li) this.focusOn(parseInt(li.dataset.atomId, 10)); };
    }
    initInteraction() {
        let dragged=null, panning=false, lx=0, ly=0;
        const toWorld = (cx,cy) => ({ wx: (cx-this.p.width/2-APP_STATE.view.x)/APP_STATE.view.zoom, wy: (cy-this.p.height/2-APP_STATE.view.y)/APP_STATE.view.zoom });
        const onStart = (cx,cy,target) => { if (target.closest('.ui-overlay')) return; const {wx,wy} = toWorld(cx,cy); dragged = APP_STATE.atoms.find(a => Math.hypot(a.x-wx, a.y-wy) < 300/APP_STATE.view.zoom)||null; if (!dragged) { panning=true; lx=cx; ly=cy; } };
        const onMove = (cx,cy,dx,dy) => { if (dragged) { dragged.x+=dx/APP_STATE.view.zoom; dragged.y+=dy/APP_STATE.view.zoom; } else if (panning) { APP_STATE.view.targetX+=(cx-lx); APP_STATE.view.targetY+=(cy-ly); APP_STATE.view.x=APP_STATE.view.targetX; APP_STATE.view.y=APP_STATE.view.targetY; lx=cx; ly=cy; } };
        const onEnd = () => { if (dragged) this.checkFusion(dragged); dragged=null; panning=false; };
        window.addEventListener('mousedown', e=>onStart(e.clientX,e.clientY,e.target));
        window.addEventListener('mousemove', e=>onMove(e.clientX,e.clientY,e.movementX,e.movementY));
        window.addEventListener('mouseup', onEnd);
        window.addEventListener('wheel', e=>{ e.preventDefault(); APP_STATE.view.zoom = clamp(APP_STATE.view.zoom*(e.deltaY>0?0.9:1.1), 0.05, 10); }, {passive:false});
    }
    updateMoleculeList() {
        const ml = document.getElementById('molecule-list'); if (!ml) return;
        ml.innerHTML = APP_STATE.atoms.map(a => `<li class="molecule-item" data-atom-id="${a.atomId}"><span style="color:rgb(${a.dna.colorR},${a.dna.colorG},${a.dna.colorB})">○</span> [${a.char}] G${a.gen}</li>`).join('');
    }
}

function injectExportUI(p) {
    const parent = document.querySelector('.side-panel'); if (!parent) return;
    const div = document.createElement('div'); div.innerHTML = `<button id="btn-snap">IMAGE</button>`;
    parent.appendChild(div);
    document.getElementById('btn-snap').onclick = () => p.saveCanvas('krsn','png');
}

new p5(sketch);

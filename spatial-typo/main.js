// Typography Lab - Additive Phenotype Engine v45.0
// Back to the architecture that works: Genome.merge + additive phenotypes
// BUG FIX: `for (const k in A)` — all references use uppercase A/B, never lowercase
// Gen 1: letters as vertices (same render system as children = visual filiation)
// Fusion: Genome.merge preserves dominant traits, activates new behaviors
console.log("TypoLab v45.0 — ADDITIVE PHENOTYPES | GENOME.MERGE FIXED | TRUE FILIATION");

let _uid = 0;

const APP_STATE = {
    atoms: [],
    view: { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0 },
    isRecording: false
};

const FONT_SOURCES = [
    { name: 'Roboto',      url: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-black-webfont.ttf' },
    { name: 'Source Sans', url: 'https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceSansPro-Black.otf' },
    { name: 'Source Code', url: 'https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf' },
    { name: 'Roboto Mono', url: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-mediumitalic-webfont.ttf' }
];
const FONTS = [];

function rPow(p = 3) { return Math.pow(Math.random(), p); }
function rand(a, b)   { return Math.random() * (b - a) + a; }
function clamp(v,a,b) { return Math.max(a, Math.min(b, v)); }

// ═══════════════════════════════════════════════════════════
// GENOME — additive multi-phenotype system
// ═══════════════════════════════════════════════════════════
class Genome {
    static createRandom() {
        return {
            // PHYSICS
            g_fluid:     rPow(3),
            g_mycelium:  rPow(4),
            g_swarm:     rPow(3),
            g_orbit:     rPow(2),
            g_pulse:     rPow(3),
            g_speed:     rand(0.2, 3),
            g_amplitude: rand(0.5, 2.5),
            cohesion:    rand(0.6, 1.0),

            // TOPOLOGY
            v_resolution: rand(0.04, 0.18),
            v_roughness:  rPow(3) * 60,

            // PHENOTYPE WEIGHTS (additive — all can coexist simultaneously)
            v_neural:   rPow(2),
            v_membrane: rPow(2),
            v_spine:    rPow(2),
            v_spores:   rPow(2),
            v_sharp:    rPow(2),

            // STYLE
            v_strokeW: rand(0.2, 7),
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

    // ── BIOLOGICAL DOMINANCE MERGE ──
    // BUG NOTE: all keys use uppercase A and B — never a/b lowercase
    // Dominant traits (> threshold) are preserved for the child
    static merge(A, B) {
        const child = {};

        const PHENOTYPES = ['v_membrane','v_neural','v_spine','v_spores','v_sharp'];
        const PHYSICS    = ['g_fluid','g_mycelium','g_swarm','g_orbit','g_pulse'];
        const DOM_THRESH = 0.5;

        for (const k in A) {  // <-- uppercase A — the fixed bug was here
            if (k === 'blend_additive') {
                child[k] = Math.random() > 0.5 ? A[k] : B[k];
                continue;
            }

            const av = A[k] || 0;  // uppercase A
            const bv = B[k] || 0;  // uppercase B

            if (PHENOTYPES.includes(k)) {
                // Dominant phenotype gene stays strong
                const maxV = Math.max(av, bv);
                child[k] = maxV > DOM_THRESH
                    ? clamp(maxV * rand(0.85, 1.1), 0, 2)
                    : clamp((av + bv) / 2 * rand(0.7, 1.2), 0, 2);

            } else if (PHYSICS.includes(k)) {
                // Stronger motion type dominates
                const maxV = Math.max(av, bv);
                child[k] = maxV > DOM_THRESH
                    ? clamp(maxV * rand(0.85, 1.1), 0, 5)
                    : clamp((av + bv) / 2 * rand(0.8, 1.15), 0, 5);

            } else if (k === 'cohesion') {
                // Gentle generational decay (~12%)
                child[k] = clamp((av + bv) / 2 * 0.88, 0.08, 0.98);

            } else if (k.startsWith('color')) {
                // Color lineage preserved + small shift
                child[k] = clamp((av + bv) / 2 + rand(-22, 22), 0, 255);

            } else if (k.startsWith('v_alpha') || k === 'v_strokeW' || k === 'v_dashA' || k === 'v_dashB') {
                child[k] = clamp((av + bv) / 2 + (Math.random()-0.5) * av * 0.15, 0, 255);

            } else {
                child[k] = (av + bv) / 2 + (Math.random()-0.5) * av * 0.15;
                if (k.startsWith('g_') || k.startsWith('v_')) child[k] = Math.max(0, child[k]);
            }
        }

        return child;
    }
}

// ═══════════════════════════════════════════════════════════
// SKETCH
// ═══════════════════════════════════════════════════════════
const sketch = (p) => {
    // Return-value form: p5's preload waits for these correctly
    p.preload = () => {
        FONT_SOURCES.forEach(f => FONTS.push({ name: f.name, obj: p.loadFont(f.url) }));
    };

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
        p.translate(p.width/2 + APP_STATE.view.x, p.height/2 + APP_STATE.view.y);
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

// ═══════════════════════════════════════════════════════════
// LIVING TYPO — single render pipeline for all generations
// ═══════════════════════════════════════════════════════════
class LivingTypo {
    constructor(p, char, fontData, parentData = null) {
        this.p        = p;
        this.atomId   = _uid++;
        this.vertices = [];

        if (parentData) {
            this.x        = parentData.x;
            this.y        = parentData.y;
            this.char     = parentData.char;
            this.fontName = parentData.fontName;
            this.dna      = parentData.dna;
            this.gen      = parentData.gen;
            parentData.vertices.forEach(v => this.vertices.push({
                pos:     v.pos.copy(),
                basePos: p.createVector(v.pos.x, v.pos.y),
                vel:     p.createVector(0, 0)
            }));
            // Hard cap
            while (this.vertices.length > 420) this.vertices.splice(Math.floor(Math.random()*this.vertices.length), 1);
        } else {
            this.x    = (Math.random()-0.5) * 1400;
            this.y    = (Math.random()-0.5) * 1000;
            const CH  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            this.char = char || CH[Math.floor(Math.random()*CH.length)];
            this.gen  = 1;
            this.dna  = Genome.createRandom();
            const font = fontData || (FONTS.length ? FONTS[Math.floor(Math.random()*FONTS.length)] : null);
            this.fontName = font ? font.name : 'System';
            this.fontObj  = font ? font.obj : null;

            if (font && font.obj) {
                const b   = font.obj.textBounds(this.char, 0, 0, 400);
                const pts = font.obj.textToPoints(
                    this.char, -b.x - b.w/2, -b.y - b.h/2, 400,
                    { sampleFactor: Math.min(0.2, this.dna.v_resolution), simplifyThreshold: 0 }
                );
                pts.forEach(pt => {
                    const nx = pt.x + (Math.random()-0.5) * this.dna.v_roughness;
                    const ny = pt.y + (Math.random()-0.5) * this.dna.v_roughness;
                    this.vertices.push({
                        pos:     p.createVector(nx, ny),
                        basePos: p.createVector(nx, ny),
                        vel:     p.createVector(0, 0)
                    });
                });
            }
        }
    }

    update() {
        const d   = this.dna;
        const t   = this.p.frameCount * 0.01 * d.g_speed;
        const amp = d.g_amplitude;

        let cmX = 0, cmY = 0;
        this.vertices.forEach(v => { cmX += v.pos.x; cmY += v.pos.y; });
        if (this.vertices.length > 0) { cmX /= this.vertices.length; cmY /= this.vertices.length; }
        const center = this.p.createVector(cmX, cmY);

        for (let i = 0; i < this.vertices.length; i++) {
            const v     = this.vertices[i];
            const force = this.p.createVector(0, 0);

            if (d.g_fluid > 0.01) {
                const a = this.p.noise(v.pos.x*0.005+t, v.pos.y*0.005) * this.p.TWO_PI * 4;
                force.add(p5.Vector.fromAngle(a).mult(d.g_fluid * amp));
            }
            if (d.g_orbit > 0.01) {
                const toC  = p5.Vector.sub(center, v.pos);
                const perp = this.p.createVector(-toC.y, toC.x).normalize();
                force.add(perp.mult(d.g_orbit * amp));
            }
            if (d.g_pulse > 0.01) {
                const outward = p5.Vector.sub(v.pos, center).normalize();
                force.add(outward.mult(Math.sin(t*8 - p5.Vector.dist(center,v.pos)*0.02) * d.g_pulse * amp));
            }
            if (d.g_swarm > 0.01) {
                const n = this.vertices[(i+1) % this.vertices.length];
                force.add(p5.Vector.sub(n.pos, v.pos).normalize().mult(d.g_swarm * amp));
            }

            v.vel.add(force);

            if (d.g_mycelium > 0.01) {
                const heading = v.vel.heading();
                const snap    = Math.round(heading / this.p.HALF_PI) * this.p.HALF_PI;
                v.vel.rotate((snap-heading) * d.g_mycelium * 0.6);
            }

            v.vel.add(p5.Vector.sub(v.basePos, v.pos).mult(d.cohesion * 0.05));
            v.vel.mult(0.85);
            v.pos.add(v.vel);

            if (d.cohesion < 0.9) {
                v.basePos.add(this.p.createVector(Math.random()-0.5, Math.random()-0.5)
                    .mult(0.5 * (1-d.cohesion) * amp));
            }
        }
    }

    draw() {
        const p = this.p;
        const d = this.dna;
        const R = d.colorR, G = d.colorG, B = d.colorB;

        p.push();
        p.translate(this.x, this.y);
        if (d.blend_additive) p.blendMode(p.ADD);

        // ── PHENOTYPE 1: MEMBRANE (blobby cellular fill) ──
        if (d.v_membrane > 0.01) {
            p.noStroke();
            p.fill(R, G, B, d.v_alphaF * d.v_membrane);
            p.beginShape();
            this.vertices.forEach(v => p.curveVertex(v.pos.x, v.pos.y));
            p.endShape();
        }

        // ── PHENOTYPE 2: SPINE (continuous stroke trace) ──
        if (d.v_spine > 0.01) {
            p.noFill();
            p.stroke(R, G, B, d.v_alphaS * d.v_spine);
            p.strokeWeight(d.v_strokeW * d.v_spine);
            if (d.v_dashA > 2) p.drawingContext.setLineDash([d.v_dashA, d.v_dashB]);
            p.beginShape();
            this.vertices.forEach(v => p.vertex(v.pos.x, v.pos.y));
            p.endShape();
            p.drawingContext.setLineDash([]);
        }

        // ── PHENOTYPE 3: NEURAL (proximity web) ──
        if (d.v_neural > 0.01) {
            p.stroke(R, G, B, d.v_alphaS * d.v_neural * 0.6);
            p.strokeWeight(Math.max(0.2, d.v_strokeW * 0.5));
            const distLimit = d.v_neural * 120;
            if (d.v_dashA > 5) p.drawingContext.setLineDash([d.v_dashA/2, d.v_dashB]);
            for (let i=0; i<this.vertices.length; i+=2) {
                for (let j=i+1; j<this.vertices.length; j+=4) {
                    if (this.vertices[i].pos.dist(this.vertices[j].pos) < distLimit)
                        p.line(this.vertices[i].pos.x, this.vertices[i].pos.y,
                               this.vertices[j].pos.x, this.vertices[j].pos.y);
                }
            }
            p.drawingContext.setLineDash([]);
        }

        // ── PHENOTYPE 4: SHARP (crystal shards) ──
        if (d.v_sharp > 0.01) {
            p.noStroke();
            p.fill(R, G, B, d.v_alphaF * d.v_sharp);
            p.beginShape(p.TRIANGLES);
            for (let i=0; i<this.vertices.length-2; i+=3) {
                if (this.vertices[i].pos.dist(this.vertices[i+1].pos) < d.v_sharp * 150) {
                    p.vertex(this.vertices[i].pos.x,   this.vertices[i].pos.y);
                    p.vertex(this.vertices[i+1].pos.x, this.vertices[i+1].pos.y);
                    p.vertex(this.vertices[i+2].pos.x, this.vertices[i+2].pos.y);
                }
            }
            p.endShape();
        }

        // ── PHENOTYPE 5: SPORES (floating nodes) ──
        if (d.v_spores > 0.01) {
            p.noStroke();
            p.fill(R, G, B, d.v_alphaS * d.v_spores);
            const sz = d.v_spores * 15;
            for (const v of this.vertices) {
                p.push();
                p.translate(v.pos.x, v.pos.y);
                p.rotate(v.vel.heading());
                if (d.g_mycelium > 0.5) p.rect(0, 0, sz, sz);
                else p.circle(0, 0, sz);
                p.pop();
            }
        }

        p.blendMode(p.BLEND);
        p.pop();
    }
}

// ═══════════════════════════════════════════════════════════
// TYPO UNIVERSE
// ═══════════════════════════════════════════════════════════
class TypoUniverse {
    constructor(p) { this.p = p; this.history = []; this.initUI(); this.initInteraction(); }

    addAtom() {
        this.history.push([...APP_STATE.atoms]);
        const font = FONTS.length ? FONTS[Math.floor(Math.random()*FONTS.length)] : null;
        APP_STATE.atoms.push(new LivingTypo(this.p, '', font));
        this.updateMoleculeList();
    }

    undo() { if (this.history.length) { APP_STATE.atoms = this.history.pop(); this.updateMoleculeList(); } }

    focusOn(atomId) {
        const atom = APP_STATE.atoms.find(a => a.atomId === atomId);
        if (!atom) return;
        APP_STATE.view.targetX = -atom.x * APP_STATE.view.zoom;
        APP_STATE.view.targetY = -atom.y * APP_STATE.view.zoom;
    }

    checkFusion(moved) {
        const other = APP_STATE.atoms.find(o => o !== moved && Math.hypot(o.x-moved.x, o.y-moved.y) < 200);
        if (!other) return;
        this.history.push([...APP_STATE.atoms]);
        const child = new LivingTypo(this.p, '?', null, {
            x:        (moved.x + other.x) / 2,
            y:        (moved.y + other.y) / 2,
            char:     '?',
            fontName: `${moved.fontName}/${other.fontName}`,
            gen:      Math.max(moved.gen, other.gen) + 1,
            dna:      Genome.merge(moved.dna, other.dna),   // ← uppercase A, B inside
            vertices: [...moved.vertices, ...other.vertices]
        });
        APP_STATE.atoms = APP_STATE.atoms.filter(a => a!==moved && a!==other);
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
        const toggle  = document.getElementById('menu-toggle');
        const overlay = document.querySelector('.ui-overlay');
        if (toggle) toggle.addEventListener('click', () => {
            overlay.classList.toggle('active');
            toggle.innerText = overlay.classList.contains('active') ? '✕' : '☰';
        });
        let dragged=null, panning=false, lx=0, ly=0;
        const toWorld = (cx,cy) => ({
            wx: (cx-this.p.width/2-APP_STATE.view.x)/APP_STATE.view.zoom,
            wy: (cy-this.p.height/2-APP_STATE.view.y)/APP_STATE.view.zoom
        });
        const onStart = (cx,cy,target) => {
            if (target.closest('.ui-overlay')) return;
            const {wx,wy} = toWorld(cx,cy);
            dragged = APP_STATE.atoms.find(a => Math.hypot(a.x-wx,a.y-wy) < 320/APP_STATE.view.zoom)||null;
            if (!dragged) { panning=true; lx=cx; ly=cy; }
        };
        const onMove = (cx,cy,dx,dy) => {
            if (dragged) { dragged.x+=dx/APP_STATE.view.zoom; dragged.y+=dy/APP_STATE.view.zoom; }
            else if (panning) {
                APP_STATE.view.targetX+=(cx-lx); APP_STATE.view.x=APP_STATE.view.targetX;
                APP_STATE.view.targetY+=(cy-ly); APP_STATE.view.y=APP_STATE.view.targetY;
                lx=cx; ly=cy;
            }
        };
        const onEnd = () => { if(dragged) this.checkFusion(dragged); dragged=null; panning=false; };
        window.addEventListener('mousedown',  e=>onStart(e.clientX,e.clientY,e.target));
        window.addEventListener('mousemove',  e=>onMove(e.clientX,e.clientY,e.movementX,e.movementY));
        window.addEventListener('mouseup',    onEnd);
        window.addEventListener('touchstart', e=>{const t=e.touches[0];onStart(t.clientX,t.clientY,e.target);if(dragged)e.preventDefault();},{passive:false});
        window.addEventListener('touchmove',  e=>{const t=e.touches[0];onMove(t.clientX,t.clientY,t.clientX-lx,t.clientY-ly);lx=t.clientX;ly=t.clientY;if(dragged||panning)e.preventDefault();},{passive:false});
        window.addEventListener('touchend',   onEnd);
        window.addEventListener('wheel', e=>{e.preventDefault();APP_STATE.view.zoom=Math.max(0.1,Math.min(6,APP_STATE.view.zoom*(e.deltaY>0?0.92:1.09)));},{passive:false});
    }

    updateMoleculeList() {
        const ml = document.getElementById('molecule-list');
        if (!ml) return;
        ml.innerHTML = APP_STATE.atoms.map(a => {
            const d = a.dna;
            const R = Math.round(d.colorR), G = Math.round(d.colorG), B = Math.round(d.colorB);
            const traits = [];
            if ((d.v_membrane||0)>0.3) traits.push(`mem:${d.v_membrane.toFixed(1)}`);
            if ((d.v_neural||0)>0.3)   traits.push(`net:${d.v_neural.toFixed(1)}`);
            if ((d.v_spine||0)>0.3)    traits.push(`spi:${d.v_spine.toFixed(1)}`);
            if ((d.v_spores||0)>0.3)   traits.push(`spo:${d.v_spores.toFixed(1)}`);
            if ((d.v_sharp||0)>0.3)    traits.push(`shp:${d.v_sharp.toFixed(1)}`);
            const sub = traits.length ? traits.join(' ') : 'subtil';
            return `<li class="molecule-item" data-atom-id="${a.atomId}"
                style="cursor:pointer;display:flex;align-items:center;gap:10px;padding:8px 6px;
                border-bottom:1px solid rgba(255,255,255,0.05);transition:background 0.2s"
                onmouseenter="this.style.background='rgba(255,255,255,0.07)'"
                onmouseleave="this.style.background='none'">
                <span style="width:11px;height:11px;border-radius:50%;flex-shrink:0;
                    background:rgb(${R},${G},${B});
                    box-shadow:0 0 ${a.gen>1?10:4}px rgb(${R},${G},${B})"></span>
                <div>
                    <div style="font-weight:700;font-size:0.82rem;
                        color:${a.gen>1?`rgb(${R},${G},${B})`:'#eee'}">
                        ${a.gen>1?'⚡':'○'} [${a.char}] G${a.gen}
                    </div>
                    <div style="opacity:0.4;font-size:0.58rem;margin-top:2px;font-family:monospace">${sub}</div>
                </div>
            </li>`;
        }).join('');
    }
}

// ═══════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════
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
    let recorder, chunks=[];
    document.getElementById('btn-vid').onclick = () => {
        if (APP_STATE.isRecording) return; APP_STATE.isRecording=true;
        try { recorder=new MediaRecorder(document.querySelector('canvas').captureStream(60),{mimeType:'video/webm'}); }
        catch(_){ APP_STATE.isRecording=false; return; }
        recorder.ondataavailable = e=>chunks.push(e.data);
        recorder.onstop = () => {
            const a=document.createElement('a');
            a.href=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));
            a.download='typolab.webm'; a.click(); chunks=[]; APP_STATE.isRecording=false;
        };
        recorder.start(); setTimeout(()=>recorder.stop(),4000);
    };
}

new p5(sketch);

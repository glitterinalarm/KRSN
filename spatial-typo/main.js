// Typography Lab - Omniverse Engine v48.0
// THE "IDENTITY & STRUCTURAL EXTREMES" UPDATE
// Focus: Breaking the "identical blob" look by introducing strong geometric archetypes.
// Fusions now have a 40% chance of "Pure Inheritance" (one parent's phenotype dominates).
console.log("TypoLab v48.0 — Archetype Topology | Pure Inheritance | Structural Extremes");

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
// GENOME — THE ALCHEMICAL CODE
// ═══════════════════════════════════════════════════════════
class Genome {
    static createRandom() {
        return {
            // [STRUCTURAL EXTREMES]
            v_scaleX:     rand(0.7, 1.3),
            v_scaleY:     rand(0.7, 1.3),
            v_rotation:   rand(-0.2, 0.2),

            // [PHYSICS]
            g_fluid:      rPow(4),
            g_mycelium:   rPow(5),
            g_swarm:      rPow(4),
            g_orbit:      rPow(3),
            g_pulse:      rPow(4),
            g_vortex:     rPow(5),
            g_gravity:    rPow(6),
            g_speed:      rand(0.1, 1.2),
            g_amplitude:  rand(0.2, 1.0),
            cohesion:     rand(0.9, 1.0),

            // [TOPOLOGY ARCHETYPES]
            v_resolution: rand(0.1, 0.22),
            v_roughness:  rPow(5) * 5,
            v_fisheye:    0, 
            v_shear:      0,
            v_complexity: rand(0.1, 0.25),
            
            // ARCHETYPE MODE: 0=Smooth, 1=Brutalist(Sharp), 2=Airy(Spores), 3=Neural
            v_archetype:  Math.floor(Math.random() * 4),

            // [PHENOTYPES]
            v_neural:     rPow(3),
            v_membrane:   rPow(2),
            v_spine:      rPow(2),
            v_spores:     rPow(3),
            v_sharp:      rPow(4),
            v_liquid:     rPow(5),
            v_glitch:     rPow(6),
            
            v_elementScale: rand(0.5, 1.2),
            v_elementCount: rand(0.3, 0.7),

            // [STYLE]
            v_strokeW: rand(1, 3),
            v_dashA:   rPow(3) * 20,
            v_dashB:   rPow(2) * 15,
            v_alphaF:  rand(40, 120),
            v_alphaS:  rand(160, 255),

            blend_additive: Math.random() > 0.85,
            colorR: Math.random() * 255,
            colorG: Math.random() * 255,
            colorB: Math.random() * 255
        };
    }

    static merge(A, B) {
        const child = {};
        
        // PURE INHERITANCE: 40% chance to take one parent's visual "Extreme"
        const forcePureTopology = Math.random() < 0.4;
        const domParent = Math.random() > 0.5 ? A : B;

        const PHENOTYPES = ['v_membrane','v_neural','v_spine','v_spores','v_sharp','v_liquid','v_glitch','v_archetype'];
        const PHYSICS    = ['g_fluid','g_mycelium','g_swarm','g_orbit','g_pulse','g_vortex','g_gravity','g_speed','g_amplitude'];
        const STRUCTURE  = ['v_scaleX','v_scaleY','v_rotation','v_elementScale','v_elementCount','v_complexity','v_resolution'];

        for (const k in A) {
            if (k === 'blend_additive') { child[k] = Math.random() > 0.5 ? A[k] : B[k]; continue; }

            const av = A[k] || 0;
            const bv = B[k] || 0;

            if (forcePureTopology && PHENOTYPES.includes(k)) {
                // Pure genetic takeover for phenotypes
                child[k] = domParent[k];
                continue;
            }

            if (STRUCTURE.includes(k)) {
                // Structural extremes can be inherited or mutated wildly
                if (Math.random() < 0.2) child[k] = domParent[k] * rand(0.5, 2.0); // Extreme mutation
                else child[k] = (av + bv) / 2 * rand(0.9, 1.1);
            } else if (PHENOTYPES.includes(k) || PHYSICS.includes(k)) {
                const maxV = Math.max(av, bv);
                // Dominance threshold logic
                child[k] = maxV > 0.45
                    ? clamp(maxV * rand(0.9, 1.2), 0, 10)
                    : clamp((av + bv) / 2 * rand(0.5, 1.5), 0, 10);
            } else if (k === 'cohesion') {
                child[k] = clamp((av + bv) / 2 * 0.85, 0.02, 0.98);
            } else if (k.startsWith('color')) {
                // Occasional dramatic color shift
                if (Math.random() < 0.15) child[k] = Math.random() * 255; 
                else child[k] = clamp((av + bv) / 2 + rand(-40, 40), 0, 255);
            } else {
                child[k] = (av + bv) / 2 + (Math.random()-0.5) * av * 0.3;
                if (k.startsWith('g_') || k.startsWith('v_')) child[k] = Math.max(0, child[k]);
            }
        }
        return child;
    }
}

// ═══════════════════════════════════════════════════════════
// LIVING TYPO
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
            parentData.vertices.forEach((v, i) => {
                const step = Math.max(1, Math.floor(1.5 / (this.dna.v_complexity + 0.3)));
                if (i % step === 0) {
                    this.vertices.push({
                        pos:     v.pos.copy(),
                        basePos: p.createVector(v.pos.x, v.pos.y),
                        vel:     p.createVector(0, 0),
                        seed:    v.seed || Math.random()
                    });
                }
            });
            // Cap but allow more for complex generations
            const maxPts = 400 + this.gen * 50;
            while (this.vertices.length > Math.min(maxPts, 800)) this.vertices.splice(Math.floor(Math.random()*this.vertices.length), 1);
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
                const b   = font.obj.textBounds(this.char, 0, 0, 420);
                const pts = font.obj.textToPoints(
                    this.char, -b.x - b.w/2, -b.y - b.h/2, 420,
                    { sampleFactor: this.dna.v_resolution, simplifyThreshold: 0 }
                );
                pts.forEach(pt => {
                    this.vertices.push({
                        pos:     p.createVector(pt.x, pt.y),
                        basePos: p.createVector(pt.x, pt.y),
                        vel:     p.createVector(0, 0),
                        seed:    Math.random()
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

            if (d.g_fluid > 0.02) {
                const a = this.p.noise(v.pos.x*0.006+t, v.pos.y*0.006) * this.p.TWO_PI * 5;
                force.add(p5.Vector.fromAngle(a).mult(d.g_fluid * amp));
            }
            if (d.g_orbit > 0.02) {
                const toC  = p5.Vector.sub(center, v.pos);
                const perp = this.p.createVector(-toC.y, toC.x).normalize();
                force.add(perp.mult(d.g_orbit * amp));
            }
            if (d.g_vortex > 0.02) {
                const toC = p5.Vector.sub(center, v.pos);
                const dist = toC.mag();
                toC.normalize().mult(d.g_vortex * 6);
                const rot = this.p.createVector(-toC.y, toC.x).mult(d.g_vortex * 200 / (dist + 30));
                force.add(toC).add(rot);
            }
            if (d.g_gravity > 0.02) { force.y += d.g_gravity * 20; }
            if (d.g_pulse > 0.02) {
                const outward = p5.Vector.sub(v.pos, center).normalize();
                force.add(outward.mult(Math.sin(t*10 - p5.Vector.dist(center,v.pos)*0.018) * d.g_pulse * amp));
            }
            if (d.g_swarm > 0.02) {
                const n = this.vertices[(i+1) % this.vertices.length];
                force.add(p5.Vector.sub(n.pos, v.pos).normalize().mult(d.g_swarm * amp));
            }

            v.vel.add(force);
            if (d.g_mycelium > 0.05) {
                const heading = v.vel.heading();
                const snap    = Math.round(heading / (this.p.PI/2)) * (this.p.PI/2); // Orthogonal snapping
                v.vel.rotate((snap-heading) * d.g_mycelium * 0.45);
            }

            v.vel.add(p5.Vector.sub(v.basePos, v.pos).mult(d.cohesion * 0.08));
            v.vel.mult(0.8);
            v.pos.add(v.vel);

            if (d.v_glitch > 0.08 && Math.random() < d.v_glitch * 0.12) {
                v.pos.add(this.p.createVector(Math.random()-0.5, Math.random()-0.5).mult(d.v_glitch * 120));
            }

            if (d.cohesion < 0.98) {
                v.basePos.add(this.p.createVector(Math.random()-0.5, Math.random()-0.5)
                    .mult(1.2 * (1-d.cohesion) * amp));
            }
        }
    }

    draw() {
        const p = this.p;
        const d = this.dna;
        const R = d.colorR, G = d.colorG, B = d.colorB;
        const t = p.frameCount * 0.02;

        p.push();
        p.translate(this.x, this.y);
        p.rotate(d.v_rotation || 0);
        p.scale(d.v_scaleX || 1, d.v_scaleY || 1);
        if (d.blend_additive) p.blendMode(p.ADD);

        // ── PHENOTYPE: MEMBRANE ──
        if (d.v_membrane > 0.05) {
            p.noStroke();
            p.fill(R, G, B, d.v_alphaF * d.v_membrane);
            p.beginShape();
            this.vertices.forEach(v => {
                if (d.v_archetype === 0) p.curveVertex(v.pos.x, v.pos.y);
                else p.vertex(v.pos.x, v.pos.y);
            });
            p.endShape(p.CLOSE);
        }

        // ── PHENOTYPE: SPINE ──
        if (d.v_spine > 0.05) {
            p.noFill();
            p.stroke(R, G, B, d.v_alphaS * d.v_spine);
            p.strokeWeight(d.v_strokeW * d.v_spine);
            if (d.v_dashA > 2) p.drawingContext.setLineDash([d.v_dashA, d.v_dashB]);
            p.beginShape();
            this.vertices.forEach(v => p.vertex(v.pos.x, v.pos.y));
            p.endShape();
            p.drawingContext.setLineDash([]);
        }

        // ── PHENOTYPE: LIQUID / CRYSTAL ──
        if (d.v_liquid > 0.05) {
            p.noStroke();
            p.fill(R, G, B, d.v_alphaF * 0.4);
            p.beginShape(p.TRIANGLES);
            const limit = (70 + d.v_liquid * 120) * d.v_elementScale;
            const skip  = Math.max(1, Math.floor(10 / (d.v_elementCount + 0.1)));
            for (let i=0; i<this.vertices.length; i+=skip) {
                const v1 = this.vertices[i];
                const v2 = this.vertices[(i+15)%this.vertices.length];
                const v3 = this.vertices[(i+30)%this.vertices.length];
                if (v1.pos.dist(v2.pos) < limit) {
                    p.vertex(v1.pos.x, v1.pos.y);
                    p.vertex(v2.pos.x, v2.pos.y);
                    p.vertex(v3.pos.x, v3.pos.y);
                }
            }
            p.endShape();
        }

        // ── PHENOTYPE: NEURAL ──
        if (d.v_neural > 0.05) {
            p.stroke(R, G, B, d.v_alphaS * d.v_neural * 0.45);
            p.strokeWeight(d.v_strokeW * 0.35 * d.v_elementScale);
            const distLimit = d.v_neural * 150 * d.v_elementScale;
            const skip = Math.max(1, Math.floor(4 / (d.v_elementCount + 0.1)));
            for (let i=0; i<this.vertices.length; i+=skip) {
                for (let j=i+1; j<this.vertices.length; j+=skip*3) {
                    if (this.vertices[i].pos.dist(this.vertices[j].pos) < distLimit)
                        p.line(this.vertices[i].pos.x, this.vertices[i].pos.y,
                               this.vertices[j].pos.x, this.vertices[j].pos.y);
                }
            }
        }

        // ── PHENOTYPE: SHARP ──
        if (d.v_sharp > 0.05) {
            p.noStroke();
            const alphaS = d.v_alphaF * d.v_sharp * 0.75;
            p.beginShape(p.TRIANGLES);
            const step = Math.max(2, Math.floor(5 / (d.v_elementCount + 0.1)));
            for (let i=0; i<this.vertices.length-2; i+=step) {
                const shade = 0.65 + 0.35 * Math.sin(t + i*0.12);
                p.fill(R*shade, G*shade, B*shade, alphaS);
                p.vertex(this.vertices[i].pos.x, this.vertices[i].pos.y);
                p.vertex(this.vertices[i+1].pos.x, this.vertices[i+1].pos.y);
                p.vertex(this.vertices[i+2].pos.x, this.vertices[i+2].pos.y);
            }
            p.endShape();
        }

        // ── PHENOTYPE: SPORES ──
        if (d.v_spores > 0.05) {
            p.noStroke(); p.fill(R, G, B, d.v_alphaS * d.v_spores);
            const step = Math.max(1, Math.floor(2 / (d.v_elementCount + 0.1)));
            for (let i=0; i<this.vertices.length; i+=step) {
                const v = this.vertices[i];
                const sz = (5 + v.seed * 25) * d.v_spores * d.v_elementScale;
                p.push();
                p.translate(v.pos.x, v.pos.y);
                p.rotate(v.vel.heading() + v.seed * p.TWO_PI);
                
                // Form variation
                const mode = (i + d.v_archetype) % 3;
                if (mode === 0) p.rect(-sz/2, -sz/2, sz, sz);
                else if (mode === 1) { p.rotate(p.QUARTER_PI); p.rect(-sz/2, -sz/2, sz, sz); }
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
        this.history.push([...APP_STATE.atoms.map(a => new LivingTypo(this.p, a.char, null, a))]);
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
        const other = APP_STATE.atoms.find(o => o !== moved && Math.hypot(o.x-moved.x, o.y-moved.y) < 240);
        if (!other) return;
        this.history.push([...APP_STATE.atoms.map(a => new LivingTypo(this.p, a.char, null, a))]);
        
        const child = new LivingTypo(this.p, moved.char, null, {
            x:        (moved.x + other.x) / 2,
            y:        (moved.y + other.y) / 2,
            char:     moved.char,
            fontName: `${moved.fontName}+${other.fontName}`,
            gen:      Math.max(moved.gen, other.gen) + 1,
            dna:      Genome.merge(moved.dna, other.dna),
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
            dragged = APP_STATE.atoms.find(a => Math.hypot(a.x-wx,a.y-wy) < 380 / APP_STATE.view.zoom)||null;
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
        window.addEventListener('wheel', e=>{e.preventDefault();APP_STATE.view.zoom=Math.max(0.04,Math.min(15,APP_STATE.view.zoom*(e.deltaY>0?0.85:1.15)));},{passive:false});
    }

    updateMoleculeList() {
        const ml = document.getElementById('molecule-list');
        if (!ml) return;
        ml.innerHTML = APP_STATE.atoms.map(a => {
            const d = a.dna;
            const R = Math.round(d.colorR), G = Math.round(d.colorG), B = Math.round(d.colorB);
            const arch = ['SMOOTH','BRUTAL','AIRY','NEURAL'][d.v_archetype || 0];
            return `<li class="molecule-item" data-atom-id="${a.atomId}"
                style="cursor:pointer;display:flex;align-items:center;gap:12px;padding:12px 8px;
                border-bottom:1px solid rgba(255,255,255,0.06);transition:all 0.3s"
                onmouseenter="this.style.background='rgba(255,255,255,0.08)'"
                onmouseleave="this.style.background='none'">
                <div style="width:14px;height:14px;border-radius:50%;flex-shrink:0;
                    background:rgb(${R},${G},${B});
                    box-shadow:0 0 ${a.gen>1?14:6}px rgb(${R},${G},${B})"></div>
                <div style="flex:1">
                    <div style="font-weight:700;font-size:0.85rem;letter-spacing:0.02em;color:#fff">${a.gen>1?'🧬':'⚡'} [${a.char}] G${a.gen}</div>
                    <div style="font-size:0.55rem;margin-top:4px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(${R},${G},${B},0.8)">${arch}</div>
                </div>
            </li>`;
        }).join('');
    }
}

// ═══════════════════════════════════════════════════════════
// EXPORT UI
// ═══════════════════════════════════════════════════════════
function injectExportUI(p) {
    const parent = document.querySelector('.side-panel');
    if (!parent) return;
    const div = document.createElement('div');
    div.style.cssText = 'margin-top:auto;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1)';
    div.innerHTML = `<div style="display:flex;gap:8px">
        <button id="btn-snap" style="flex:1;background:rgba(255,255,255,0.08);color:#fff;border:1px solid rgba(255,255,255,0.15);padding:10px 4px;cursor:pointer;font-size:.7rem;border-radius:6px;font-weight:700;text-transform:uppercase">Image</button>
        <button id="btn-vid"  style="flex:1;background:rgba(255,50,50,.2);color:#fff;border:1px solid rgba(255,100,100,.3);padding:10px 4px;cursor:pointer;font-size:.7rem;border-radius:6px;font-weight:700;text-transform:uppercase">Video</button>
    </div>`;
    parent.appendChild(div);
    document.getElementById('btn-snap').onclick = () => p.saveCanvas('krsn_spatial','png');
    let recorder, chunks=[];
    document.getElementById('btn-vid').onclick = () => {
        if (APP_STATE.isRecording) return; APP_STATE.isRecording=true;
        try { recorder=new MediaRecorder(document.querySelector('canvas').captureStream(60),{mimeType:'video/webm'}); }
        catch(_){ APP_STATE.isRecording=false; return; }
        recorder.ondataavailable = e=>chunks.push(e.data);
        recorder.onstop = () => {
            const a=document.createElement('a');
            a.href=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));
            a.download='krsn_spatial.webm'; a.click(); chunks=[]; APP_STATE.isRecording=false;
        };
        recorder.start(); setTimeout(()=>recorder.stop(),5000);
    };
}

new p5(sketch);

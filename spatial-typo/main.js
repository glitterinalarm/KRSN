// Typography Lab - Omniverse Engine v49.0
// THE "RADICAL EXCLUSION" UPDATE
// Focus: Drastically reducing velocity and preventing "visual soup" by enforcing phenotype exclusion.
console.log("TypoLab v49.0 — PURE BIRTH | EXCLUSIVE PHENOTYPES | LOWER VELOCITY");

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
            // [STRUCTURE]
            v_scaleX:     1,
            v_scaleY:     1,
            v_rotation:   0,

            // [PHYSICS] - Start at ZERO for Gen 1 (Clean birth)
            g_fluid:      0,
            g_mycelium:   0,
            g_swarm:      0,
            g_orbit:      0,
            g_pulse:      0,
            g_vortex:     0,
            g_gravity:    0,
            g_speed:      0.1, // Very slow flow
            g_amplitude:  0.2,
            cohesion:     1.0, // Maximum cohesion at birth

            // [TOPOLOGY ARCHETYPE]
            v_resolution: 0.15,
            v_roughness:  0,
            v_fisheye:    0, 
            v_shear:      0,
            v_complexity: 0.1,
            
            // 0:SMOOTH, 1:BRUTAL(Facets), 2:AIRY(Spores), 3:NEURAL(Lines)
            v_archetype:  Math.floor(Math.random() * 4),

            // [PHENOTYPES] - Probabilistic activation
            v_neural:   Math.random() > 0.4 ? 1 : 0,
            v_membrane: Math.random() > 0.7 ? 1 : 0,
            v_spine:    1, // Baseline
            v_spores:   Math.random() > 0.6 ? 1 : 0,
            v_sharp:    Math.random() > 0.8 ? 1 : 0,
            v_liquid:   0,
            v_glitch:   0,
            
            v_elementScale: rand(0.5, 1.0),
            v_elementCount: rand(0.3, 0.6),

            // [STYLE]
            v_strokeW: rand(1, 2),
            v_dashA:   0,
            v_dashB:   0,
            v_alphaF:  80,
            v_alphaS:  220,

            blend_additive: false, // Default is standard blend for legibility
            colorR: Math.random() * 255,
            colorG: Math.random() * 255,
            colorB: Math.random() * 255
        };
    }

    static merge(A, B) {
        const child = {};
        const pPure = Math.random() < 0.5; // 50% chance of dominant trait
        const dom = Math.random() > 0.5 ? A : B;

        const EXCLUSIVE = ['v_archetype', 'v_scaleX', 'v_scaleY', 'v_strokeW', 'blend_additive'];
        const ACCUMULATIVE = ['g_fluid','g_mycelium','g_swarm','g_orbit','g_pulse','g_vortex','g_gravity','v_roughness','v_fisheye','v_shear','v_glitch'];

        for (const k in A) {
            const av = A[k] || 0;
            const bv = B[k] || 0;

            if (EXCLUSIVE.includes(k)) {
                child[k] = pPure ? dom[k] : (Math.random() > 0.5 ? A[k] : B[k]);
            } else if (ACCUMULATIVE.includes(k)) {
                // Accumulate forces + new mutation
                child[k] = clamp((av + bv) / 2 + (Math.random() < 0.3 ? rand(0.05, 0.25) : 0), 0, 4);
            } else if (k === 'cohesion') {
                child[k] = clamp((av + bv) / 2 * 0.88, 0.05, 0.98);
            } else if (k.startsWith('color')) {
                child[k] = clamp((av + bv) / 2 + rand(-30, 30), 0, 255);
            } else if (k.startsWith('v_alpha')) {
                child[k] = (av + bv) / 2;
            } else {
                // Phenotypes activation
                if (Math.random() < 0.2) child[k] = Math.random() > 0.5 ? 1 : 0; // Mutation
                else child[k] = pPure ? dom[k] : (av + bv) / 2;
            }
        }
        
        // Ensure some physics always appears after fusion
        if (child.g_fluid < 0.05) child.g_fluid = rand(0.1, 0.3);
        child.v_complexity = clamp((A.v_complexity + B.v_complexity) / 2 + 0.1, 0.1, 1.0);
        child.g_speed = clamp((A.g_speed + B.g_speed) / 2 + 0.05, 0.05, 1.5);
        child.g_amplitude = clamp((A.g_amplitude + B.g_amplitude) / 2 + 0.05, 0.1, 2.0);

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
                const step = Math.max(1, Math.floor(1.2 / (this.dna.v_complexity + 0.2)));
                if (i % step === 0) {
                    this.vertices.push({
                        pos:     v.pos.copy(),
                        basePos: p.createVector(v.pos.x, v.pos.y),
                        vel:     p.createVector(0, 0),
                        seed:    v.seed || Math.random()
                    });
                }
            });
            while (this.vertices.length > 500) this.vertices.splice(Math.floor(Math.random()*this.vertices.length), 1);
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

            if (d.g_fluid > 0.01) {
                const a = this.p.noise(v.pos.x*0.006+t, v.pos.y*0.006) * this.p.TWO_PI * 4;
                force.add(p5.Vector.fromAngle(a).mult(d.g_fluid * amp));
            }
            if (d.g_vortex > 0.01) {
                const toC = p5.Vector.sub(center, v.pos);
                const dist = toC.mag();
                toC.normalize().mult(d.g_vortex * 4);
                const rot = this.p.createVector(-toC.y, toC.x).mult(d.g_vortex * 150 / (dist + 40));
                force.add(toC).add(rot);
            }
            if (d.g_gravity > 0.01) { force.y += d.g_gravity * 12; }
            if (d.g_pulse > 0.01) {
                const outward = p5.Vector.sub(v.pos, center).normalize();
                force.add(outward.mult(Math.sin(t*8 - p5.Vector.dist(center,v.pos)*0.02) * d.g_pulse * amp));
            }

            v.vel.add(force);
            v.vel.add(p5.Vector.sub(v.basePos, v.pos).mult(d.cohesion * 0.1));
            v.vel.mult(0.8);
            v.pos.add(v.vel);

            if (d.cohesion < 1.0) {
                v.basePos.add(this.p.createVector(Math.random()-0.5, Math.random()-0.5)
                    .mult(0.6 * (1-d.cohesion) * amp));
            }
        }
    }

    draw() {
        const p = this.p;
        const d = this.dna;
        const R = d.colorR, G = d.colorG, B = d.colorB;
        const t = p.frameCount * 0.02;
        const arch = d.v_archetype;

        p.push();
        p.translate(this.x, this.y);
        p.scale(d.v_scaleX, d.v_scaleY);
        if (d.blend_additive) p.blendMode(p.ADD);

        // ── ARCHETYPE FILTERED RENDERING ──
        
        // SPINE - Always for legibility
        p.noFill();
        p.stroke(R, G, B, d.v_alphaS);
        p.strokeWeight(d.v_strokeW);
        p.beginShape();
        this.vertices.forEach(v => p.vertex(v.pos.x, v.pos.y));
        p.endShape();

        // 0: SMOOTH (Membrane)
        if (arch === 0 && d.v_membrane > 0.1) {
            p.noStroke();
            p.fill(R, G, B, d.v_alphaF);
            p.beginShape();
            this.vertices.forEach(v => p.curveVertex(v.pos.x, v.pos.y));
            p.endShape(p.CLOSE);
        }

        // 1: BRUTAL (Facets)
        if (arch === 1 && d.v_sharp > 0.1) {
            p.noStroke();
            p.beginShape(p.TRIANGLES);
            for (let i=0; i<this.vertices.length-2; i+=4) {
                const shade = 0.6 + 0.4 * Math.sin(t + i*0.1);
                p.fill(R*shade, G*shade, B*shade, d.v_alphaF * 1.5);
                p.vertex(this.vertices[i].pos.x, this.vertices[i].pos.y);
                p.vertex(this.vertices[i+1].pos.x, this.vertices[i+1].pos.y);
                p.vertex(this.vertices[i+2].pos.x, this.vertices[i+2].pos.y);
            }
            p.endShape();
        }

        // 2: AIRY (Spores)
        if (arch === 2 && d.v_spores > 0.1) {
            p.noStroke(); p.fill(R, G, B, d.v_alphaS);
            for (let i=0; i<this.vertices.length; i+=Math.floor(3/d.v_elementCount)) {
                const v = this.vertices[i];
                const sz = (8 + v.seed * 30) * d.v_elementScale;
                p.push();
                p.translate(v.pos.x, v.pos.y);
                p.rotate(v.vel.heading() + v.seed * p.TWO_PI);
                if (i % 2 === 0) p.rect(-sz/2, -sz/2, sz, sz);
                else p.circle(0, 0, sz);
                p.pop();
            }
        }

        // 3: NEURAL (Connections)
        if (arch === 3 && d.v_neural > 0.1) {
            p.stroke(R, G, B, d.v_alphaS * 0.5);
            p.strokeWeight(d.v_strokeW * 0.5);
            const distLimit = 120 * d.v_elementScale;
            for (let i=0; i<this.vertices.length; i+=5) {
                for (let j=i+1; j<this.vertices.length; j+=15) {
                    if (this.vertices[i].pos.dist(this.vertices[j].pos) < distLimit)
                        p.line(this.vertices[i].pos.x, this.vertices[i].pos.y,
                               this.vertices[j].pos.x, this.vertices[j].pos.y);
                }
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
        const other = APP_STATE.atoms.find(o => o !== moved && Math.hypot(o.x-moved.x, o.y-moved.y) < 200);
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
            dragged = APP_STATE.atoms.find(a => Math.hypot(a.x-wx,a.y-wy) < 400 / APP_STATE.view.zoom)||null;
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
        window.addEventListener('wheel', e=>{e.preventDefault();APP_STATE.view.zoom=Math.max(0.04,Math.min(20,APP_STATE.view.zoom*(e.deltaY>0?0.9:1.11)));},{passive:false});
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
                    <div style="font-weight:700;font-size:0.85rem;color:#fff">${a.gen>1?'🧬':'⚡'} [${a.char}] G${a.gen}</div>
                    <div style="font-size:0.55rem;margin-top:4px;text-transform:uppercase;color:rgba(${R},${G},${B},0.8)">${arch}</div>
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
        <button id="btn-snap" style="flex:1;background:rgba(255,255,255,0.08);color:#fff;border:1px solid rgba(255,255,255,0.15);padding:10px 4px;cursor:pointer;font-size:.7rem;border-radius:6px;font-weight:700">IMAGE</button>
        <button id="btn-vid"  style="flex:1;background:rgba(255,50,50,.2);color:#fff;border:1px solid rgba(255,100,100,.3);padding:10px 4px;cursor:pointer;font-size:.7rem;border-radius:6px;font-weight:700">VIDEO</button>
    </div>`;
    parent.appendChild(div);
    document.getElementById('btn-snap').onclick = () => p.saveCanvas('krsn_spatial','png');
    let recorder, chunks=[];
    document.getElementById('btn-vid').onclick = () => {
        if (APP_STATE.isRecording) return; APP_STATE.isRecording=true;
        let recorder = null;
        try { 
            recorder = new MediaRecorder(document.querySelector('canvas').captureStream(60),{mimeType:'video/webm'}); 
        } catch(e) { 
            APP_STATE.isRecording=false; alert("Vidéo non supportée par ce navigateur."); return; 
        }
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => {
            const a=document.createElement('a');
            a.href=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));
            a.download='krsn_spatial.webm'; a.click(); chunks=[]; APP_STATE.isRecording=false;
        };
        recorder.start(); setTimeout(()=>recorder.stop(),5000);
    };
}

new p5(sketch);


// Typography Lab - Omniversal Diversity Engine v34.0
// PHILOSOPHY: Birth legible → Gradual organic mutation → Pure abstraction
console.log("TypoLab Engine v34.0 - LEGIBLE BIRTH | ORGANIC DECAY | MAXIMUM DIVERSITY");

const APP_STATE = { 
    atoms: [], 
    view: { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0 }, 
    isRecording: false 
};

const FONT_SOURCES = [
    { name: 'Roboto Black',   url: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-black-webfont.ttf' },
    { name: 'Source Sans Pro',url: 'https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceSansPro-Black.otf' },
    { name: 'Source Code Pro',url: 'https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf' },
    { name: 'Roboto Light',   url: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf' }
];
const FONTS = [];

function rand(a, b) { return Math.random() * (b - a) + a; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ==================================================================
// GENOME  — encodes biology, physics, aesthetic style
// ==================================================================
class Genome {
    static createRandom() {
        return {
            // Speed of mutation onset (when does the letter start visually decaying?)
            birthFrames: Math.floor(rand(60, 400)), // 1–7 seconds of stability

            // Animation physics type (all different feels)
            animType: pick(['liquid', 'frenetic', 'orbit', 'piston', 'nebula']),

            // Physics force values
            g_speed:     rand(0.5, 5),
            g_amplitude: rand(0.5, 6),
            g_friction:  rand(0.82, 0.96),
            cohesion:    1.0, // locked at birth, decays with age

            // Visual rendering style (one dominant + occasional accent)
            visualStyle: pick(['membrane', 'spine', 'neural', 'sharp', 'spores']),
            accentStyle: pick(['none', 'none', 'none', 'baroque', 'futurist', 'echo']),

            // Visual params
            v_strokeW:   rand(1, 10),
            v_dashGap:   Math.random() > 0.7 ? rand(2, 30) : 0,
            v_alphaFill: rand(80, 220),
            v_alphaStr:  rand(100, 255),
            
            blend_additive: Math.random() > 0.8,
            
            colorR: Math.random()*255, 
            colorG: Math.random()*255, 
            colorB: Math.random()*255
        };
    }

    static merge(A, B) {
        const child = {};
        for (const k in A) {
            if (typeof A[k] === 'string') { child[k] = Math.random() > 0.5 ? A[k] : B[k]; }
            else if (typeof A[k] === 'boolean') { child[k] = Math.random() > 0.5 ? A[k] : B[k]; }
            else {
                child[k] = (A[k] + B[k]) / 2 + (Math.random() - 0.5) * A[k] * 0.8;
                if (k.startsWith('v_alpha') || k.startsWith('color')) child[k] = Math.max(0, Math.min(255, child[k]));
                if (k === 'g_friction') child[k] = Math.max(0.8, Math.min(0.99, child[k]));
                child[k] = Math.max(0, child[k]);
            }
        }
        child.cohesion = 1.0;
        child.birthFrames = Math.floor(rand(60, 300));
        return child;
    }
}

// ==================================================================
// SKETCH
// ==================================================================
const sketch = (p) => {
    p.preload = () => {
        FONT_SOURCES.forEach(f => p.loadFont(f.url, font => FONTS.push({ name: f.name, obj: font })));
    };

    p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight).parent('stage');
        document.getElementById('loader').classList.add('hidden');
        window.TU = new TypoUniverse(p);
        injectExportUI(p);
        // Spawn initial population
        for (let i = 0; i < 6; i++) window.TU.addAtom();
    };

    p.draw = () => {
        p.background(5, 5, 8);

        // Smooth camera lerp
        APP_STATE.view.x += (APP_STATE.view.targetX - APP_STATE.view.x) * 0.12;
        APP_STATE.view.y += (APP_STATE.view.targetY - APP_STATE.view.y) * 0.12;

        p.push();
        p.translate(p.width / 2 + APP_STATE.view.x, p.height / 2 + APP_STATE.view.y);
        p.scale(APP_STATE.view.zoom);
        APP_STATE.atoms.forEach(a => { a.update(); a.draw(); });
        p.pop();

        if (APP_STATE.isRecording) {
            p.push(); p.fill(255, 0, 0); p.noStroke(); p.circle(30, 30, 16);
            p.fill(255); p.textSize(14); p.text('REC', 45, 35); p.pop();
        }
    };

    p.windowResized = () => p.resizeCanvas(window.innerWidth, window.innerHeight);
};

// ==================================================================
// LIVING TYPO — the atomic life form
// ==================================================================
class LivingTypo {
    constructor(p, char, fontData, parentData = null) {
        this.p   = p;
        this.id  = Math.random();
        this.age = 0;
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
        } else {
            this.x = (Math.random() - 0.5) * 1400;
            this.y = (Math.random() - 0.5) * 1400;
            const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?#@&';
            this.char = char || CHARS[Math.floor(Math.random() * CHARS.length)];
            this.gen  = 1;
            this.dna  = Genome.createRandom();

            const font = fontData || (FONTS.length ? FONTS[Math.floor(Math.random() * FONTS.length)] : null);
            this.fontName = font ? font.name : 'System';

            if (font && font.obj) {
                const sampleFactor = 0.12; // dense enough points, not too many
                let b = font.obj.textBounds(this.char, 0, 0, 500);
                let pts = font.obj.textToPoints(this.char, -b.x - b.w / 2, -b.y - b.h / 2, 500, { sampleFactor });
                pts.forEach(pt => this.vertices.push({
                    pos:     p.createVector(pt.x, pt.y),
                    basePos: p.createVector(pt.x, pt.y),
                    vel:     p.createVector(0, 0)
                }));
            }
        }

        // Hard vertex cap
        while (this.vertices.length > 600) {
            this.vertices.splice(Math.floor(Math.random() * this.vertices.length), 1);
        }
    }

    // ---- PHYSICS ----
    update() {
        this.age++;
        const d   = this.dna;
        const age = this.age;
        
        // Cohesion decays over time after birthFrames
        const maturity = Math.max(0, age - d.birthFrames);
        const decay    = maturity / 1200; // Very slow decay
        d.cohesion = Math.max(0.1, 1.0 - decay);

        const t   = this.p.frameCount * 0.01 * d.g_speed;
        const amp = d.g_amplitude * Math.min(1, maturity / 60); // Forces ramp up slowly

        let cmX = 0, cmY = 0;
        this.vertices.forEach(v => { cmX += v.pos.x; cmY += v.pos.y; });
        const center = this.p.createVector(cmX / this.vertices.length, cmY / this.vertices.length);

        this.vertices.forEach((v, i) => {
            const force = this.p.createVector(0, 0);

            if (amp > 0.01) {
                switch (d.animType) {
                    case 'liquid':
                        force.add(p5.Vector.fromAngle(
                            this.p.noise(v.pos.x * 0.005 + t, v.pos.y * 0.005) * this.p.TWO_PI * 4
                        ).mult(amp * 0.6));
                        break;
                    case 'frenetic':
                        force.add((Math.random() - 0.5) * amp * 3, (Math.random() - 0.5) * amp * 3);
                        break;
                    case 'orbit': {
                        const diff = p5.Vector.sub(v.pos, center);
                        force.add(new p5.Vector(-diff.y, diff.x).normalize().mult(amp * 0.5));
                        break;
                    }
                    case 'piston':
                        force.x += Math.sin(t * 3 + i * 0.1) * amp * 2;
                        force.y += Math.cos(t * 2 + i * 0.07) * amp;
                        break;
                    case 'nebula': {
                        const dist = p5.Vector.dist(v.pos, center);
                        const outward = p5.Vector.sub(v.pos, center).normalize();
                        force.add(outward.mult(Math.sin(t * 5 - dist * 0.03) * amp));
                        break;
                    }
                }
            }

            // Anchor spring (gives form its cohesion)
            force.add(p5.Vector.sub(v.basePos, v.pos).mult(d.cohesion * 0.08));

            v.vel.add(force);
            v.vel.mult(d.g_friction);
            v.pos.add(v.vel);

            // Base position slowly drifts away as coherence drops
            if (d.cohesion < 0.85) {
                const drift = (0.85 - d.cohesion) * amp * 0.5;
                v.basePos.add(this.p.createVector(
                    (Math.random() - 0.5) * drift,
                    (Math.random() - 0.5) * drift
                ));
            }
        });
    }

    // ---- RENDERING ----
    draw() {
        const p   = this.p;
        const d   = this.dna;
        const vs  = this.vertices;
        const R   = d.colorR, G = d.colorG, B = d.colorB;

        p.push();
        p.translate(this.x, this.y);
        if (d.blend_additive) p.blendMode(p.ADD);

        // === ACCENT: BAROQUE (subtle echoes) ===
        if (d.accentStyle === 'baroque') {
            p.noFill();
            p.stroke(R, G, B, 25);
            p.strokeWeight(1);
            for (let k = 1; k <= 3; k++) {
                p.push();
                p.scale(1 + k * 0.1);
                p.rotate(k * 0.05);
                p.beginShape(); vs.forEach(v => p.vertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                p.pop();
            }
        }

        // === ACCENT: FUTURIST (speed lines from velocity) ===
        if (d.accentStyle === 'futurist') {
            p.stroke(R, G, B, 60);
            p.strokeWeight(0.5);
            vs.forEach(v => {
                const spd = v.vel.mag();
                if (spd > 0.2) p.line(v.pos.x, v.pos.y, v.pos.x - v.vel.x * 8, v.pos.y - v.vel.y * 8);
            });
        }

        // === ACCENT: ECHO ===
        if (d.accentStyle === 'echo') {
            p.noFill();
            p.stroke(R, G, B, 20);
            p.strokeWeight(1.5);
            p.push(); p.translate(4, 4);
            p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape();
            p.pop();
        }

        // === DOMINANT VISUAL STYLE ===
        switch (d.visualStyle) {
            case 'membrane':
                p.noStroke();
                p.fill(R, G, B, d.v_alphaFill);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape();
                // Outline
                p.noFill();
                p.stroke(R, G, B, d.v_alphaStr);
                p.strokeWeight(d.v_strokeW * 0.3);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape();
                break;

            case 'spine':
                p.noFill();
                p.stroke(R, G, B, d.v_alphaStr);
                p.strokeWeight(d.v_strokeW);
                if (d.v_dashGap > 0) p.drawingContext.setLineDash([d.v_strokeW * 2, d.v_dashGap]);
                p.beginShape(); vs.forEach(v => p.vertex(v.pos.x, v.pos.y)); p.endShape();
                p.drawingContext.setLineDash([]);
                break;

            case 'neural': {
                p.stroke(R, G, B, d.v_alphaStr * 0.5);
                p.strokeWeight(0.8);
                const limit = 70;
                for (let i = 0; i < vs.length; i += 6) {
                    for (let j = i + 1; j < vs.length; j += 10) {
                        if (vs[i].pos.dist(vs[j].pos) < limit) {
                            p.line(vs[i].pos.x, vs[i].pos.y, vs[j].pos.x, vs[j].pos.y);
                        }
                    }
                }
                // fill the letter body lightly
                p.noStroke(); p.fill(R, G, B, d.v_alphaFill * 0.4);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape();
                break;
            }

            case 'sharp':
                p.noStroke(); p.fill(R, G, B, d.v_alphaFill);
                p.beginShape(p.TRIANGLES);
                for (let i = 0; i < vs.length - 2; i += 8) {
                    p.vertex(vs[i].pos.x,   vs[i].pos.y);
                    p.vertex(vs[i+1].pos.x, vs[i+1].pos.y);
                    p.vertex(vs[i+2].pos.x, vs[i+2].pos.y);
                }
                p.endShape();
                // always add outline for recognition
                p.noFill(); p.stroke(R, G, B, d.v_alphaStr * 0.7); p.strokeWeight(1.2);
                p.beginShape(); vs.forEach(v => p.vertex(v.pos.x, v.pos.y)); p.endShape();
                break;

            case 'spores':
                // dots along the letter path
                p.noStroke(); p.fill(R, G, B, d.v_alphaStr);
                vs.forEach((v, i) => {
                    if (i % 3 === 0) p.circle(v.pos.x, v.pos.y, d.v_strokeW * 0.8);
                });
                // faint outline beneath
                p.noFill(); p.stroke(R, G, B, 40); p.strokeWeight(1);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape();
                break;
        }

        p.blendMode(p.BLEND);
        p.pop();
    }
}

// ==================================================================
// TYPO UNIVERSE — orchestrator
// ==================================================================
class TypoUniverse {
    constructor(p) {
        this.p = p;
        this.history = []; // For undo
        this.initUI();
        this.initInteraction();
    }

    addAtom() {
        this.history.push(APP_STATE.atoms.map(a => a));
        const font = FONTS.length ? FONTS[Math.floor(Math.random() * FONTS.length)] : null;
        const atom = new LivingTypo(this.p, '', font);
        APP_STATE.atoms.push(atom);
        this.updateMoleculeList();
    }

    undo() {
        if (this.history.length > 0) {
            APP_STATE.atoms = this.history.pop();
            this.updateMoleculeList();
        }
    }

    focusOn(atom) {
        APP_STATE.view.targetX = -atom.x;
        APP_STATE.view.targetY = -atom.y;
    }

    checkFusion(moved) {
        const other = APP_STATE.atoms.find(o => o !== moved && Math.hypot(o.x - moved.x, o.y - moved.y) < 200);
        if (!other) return;
        this.history.push([...APP_STATE.atoms]);
        const childDNA = Genome.merge(moved.dna, other.dna);
        const child    = new LivingTypo(this.p, '?', null, {
            x:        (moved.x + other.x) / 2,
            y:        (moved.y + other.y) / 2,
            char:     '?',
            fontName: `${moved.fontName} + ${other.fontName}`,
            gen:      Math.max(moved.gen, other.gen) + 1,
            dna:      childDNA,
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
            const li = e.target.closest('[data-id]');
            if (!li) return;
            const atom = APP_STATE.atoms.find(a => a.id === +li.dataset.id);
            if (atom) this.focusOn(atom);
        });
    }

    initInteraction() {
        const toggle  = document.getElementById('menu-toggle');
        const overlay = document.querySelector('.ui-overlay');
        if (toggle) {
            toggle.addEventListener('click', () => {
                overlay.classList.toggle('active');
                toggle.innerText = overlay.classList.contains('active') ? '✕' : '☰';
            });
        }

        const toWorld = (cx, cy) => ({
            wx: (cx - window.innerWidth  / 2 - APP_STATE.view.x) / APP_STATE.view.zoom,
            wy: (cy - window.innerHeight / 2 - APP_STATE.view.y) / APP_STATE.view.zoom
        });

        let dragged = null, panning = false, lx = 0, ly = 0;

        const onStart = (cx, cy, target) => {
            if (target.closest('.ui-overlay')) return;
            const { wx, wy } = toWorld(cx, cy);
            dragged = APP_STATE.atoms.find(a => Math.hypot(a.x - wx, a.y - wy) < 260 / APP_STATE.view.zoom) || null;
            if (!dragged) { panning = true; lx = cx; ly = cy; }
        };

        const onMove = (cx, cy, dx, dy) => {
            if (dragged) {
                dragged.x += dx / APP_STATE.view.zoom;
                dragged.y += dy / APP_STATE.view.zoom;
            } else if (panning) {
                APP_STATE.view.targetX += cx - lx;
                APP_STATE.view.targetY += cy - ly;
                APP_STATE.view.x = APP_STATE.view.targetX;
                APP_STATE.view.y = APP_STATE.view.targetY;
                lx = cx; ly = cy;
            }
        };

        const onEnd = () => {
            if (dragged) this.checkFusion(dragged);
            dragged = null; panning = false;
        };

        window.addEventListener('mousedown',  e => onStart(e.clientX, e.clientY, e.target));
        window.addEventListener('mousemove',  e => onMove(e.clientX, e.clientY, e.movementX, e.movementY));
        window.addEventListener('mouseup',    onEnd);

        window.addEventListener('touchstart', e => {
            const t = e.touches[0]; onStart(t.clientX, t.clientY, e.target);
            if (dragged) e.preventDefault();
        }, { passive: false });

        window.addEventListener('touchmove', e => {
            const t = e.touches[0];
            onMove(t.clientX, t.clientY, t.clientX - lx, t.clientY - ly);
            lx = e.touches[0].clientX; ly = e.touches[0].clientY;
            if (dragged || panning) e.preventDefault();
        }, { passive: false });

        window.addEventListener('touchend', onEnd);

        window.addEventListener('wheel', e => {
            e.preventDefault();
            APP_STATE.view.zoom = Math.max(0.1, Math.min(5, APP_STATE.view.zoom * (e.deltaY > 0 ? 0.92 : 1.09)));
        }, { passive: false });
    }

    updateMoleculeList() {
        const ml = document.getElementById('molecule-list');
        if (!ml) return;
        ml.innerHTML = APP_STATE.atoms.map(a => {
            const R = Math.round(a.dna.colorR), G = Math.round(a.dna.colorG), B = Math.round(a.dna.colorB);
            return `<li class="molecule-item" data-id="${a.id}" style="cursor:pointer; display:flex; align-items:center; gap:8px; padding:6px 4px; border-bottom:1px solid rgba(255,255,255,0.06)">
                <span style="width:10px;height:10px;border-radius:50%;background:rgb(${R},${G},${B});flex-shrink:0"></span>
                <span style="color:rgb(${R},${G},${B}); font-weight:700">[${a.char}]</span>
                <span style="opacity:0.5; font-size:0.7rem">G${a.gen} · ${a.dna.animType} · ${a.dna.visualStyle}</span>
            </li>`;
        }).join('');
    }
}

// ==================================================================
// EXPORT TOOLS
// ==================================================================
function injectExportUI(p) {
    const parent = document.querySelector('.side-panel');
    if (!parent) return;
    const div = document.createElement('div');
    div.style.cssText = 'margin-top:auto; padding-top:12px; border-top:1px solid rgba(255,255,255,0.08)';
    div.innerHTML = `
        <div style="display:flex; gap:8px;">
            <button id="btn-snap" style="flex:1; background:rgba(255,255,255,0.07); color:#fff; border:1px solid rgba(255,255,255,0.15); padding:9px; cursor:pointer; font-size:0.75rem">📸 IMAGE</button>
            <button id="btn-vid"  style="flex:1; background:rgba(220,30,30,0.2);   color:#fff; border:1px solid rgba(255,0,0,0.3);   padding:9px; cursor:pointer; font-size:0.75rem">🎥 VIDÉO</button>
        </div>`;
    parent.appendChild(div);

    document.getElementById('btn-snap').onclick = () => p.saveCanvas('typolab', 'png');

    let recorder, chunks = [];
    document.getElementById('btn-vid').onclick = () => {
        if (APP_STATE.isRecording) return;
        APP_STATE.isRecording = true;
        const canvas = document.querySelector('canvas');
        try { recorder = new MediaRecorder(canvas.captureStream(60), { mimeType: 'video/webm' }); }
        catch (e) { APP_STATE.isRecording = false; return; }
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob(chunks, { type: 'video/webm' }));
            a.download = 'typolab.webm'; a.click();
            chunks = []; APP_STATE.isRecording = false;
        };
        recorder.start();
        setTimeout(() => recorder.stop(), 4000);
    };
}

new p5(sketch);

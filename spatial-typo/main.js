// Typography Lab - Omniversal Diversity Engine v35.0
// PHILOSOPHY: Legible birth → Organic decay → Pure abstraction
// FIXED: Camera focus on molecule click | Better visual diversity | No "sharp" overload
console.log("TypoLab Engine v35.0 - FOCUS FIX | DIVERSITY | ORGANIC");

let atomCounter = 0; // integer IDs, no float precision issues

const APP_STATE = { 
    atoms: [], 
    view: { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0 }, 
    isRecording: false 
};

const FONT_SOURCES = [
    { name: 'Roboto Black',    url: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-black-webfont.ttf' },
    { name: 'Source Sans Pro', url: 'https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceSansPro-Black.otf' },
    { name: 'Source Code Pro', url: 'https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf' },
    { name: 'Roboto Light',    url: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf' }
];
const FONTS = [];

function rand(a, b) { return Math.random() * (b - a) + a; }
function pick(arr)  { return arr[Math.floor(Math.random() * arr.length)]; }

// ==================================================================
// GENOME
// ==================================================================
class Genome {
    static createRandom() {
        return {
            id_anim:    atomCounter++,
            birthDelay: Math.floor(rand(80, 500)),   // frames before forces kick in
            animType:   pick(['liquid', 'frenetic', 'orbit', 'piston', 'nebula', 'mycelium']),

            g_speed:     rand(0.4, 5),
            g_amplitude: rand(0.3, 5),
            g_friction:  rand(0.84, 0.97),
            cohesion:    1.0,

            // VISUAL: 6 possible looks, each radically different
            visualStyle: pick(['membrane', 'outline', 'neural', 'spores', 'contour_fill', 'glowing']),
            // ACCENT: rare bonus layer
            accentStyle: pick(['none','none','none','none','echo','futurist','baroque','glitch']),

            v_strokeW:     rand(1, 12),
            v_dashGap:     Math.random() > 0.65 ? rand(2, 40) : 0,
            v_alphaFill:   rand(60, 210),
            v_alphaStr:    rand(120, 255),
            v_noiseScale:  rand(0.002, 0.012),
            blend_additive: Math.random() > 0.85,

            colorR: Math.random() * 255,
            colorG: Math.random() * 255,
            colorB: Math.random() * 255
        };
    }

    static merge(A, B) {
        const child = {};
        for (const k in A) {
            if (typeof A[k] === 'string' || typeof A[k] === 'boolean') {
                child[k] = Math.random() > 0.5 ? A[k] : B[k];
            } else {
                const av = A[k] || 0, bv = B[k] || 0;
                child[k] = (av + bv) / 2 + (Math.random() - 0.5) * av * 0.9;
                if (k.startsWith('v_alpha') || k.startsWith('color')) child[k] = Math.max(0, Math.min(255, child[k]));
                if (k === 'g_friction') child[k] = Math.max(0.8, Math.min(0.99, child[k]));
                child[k] = Math.max(0, child[k]);
            }
        }
        child.cohesion    = 1.0;
        child.birthDelay  = Math.floor(rand(80, 300));
        child.id_anim     = atomCounter++;
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
        for (let i = 0; i < 6; i++) window.TU.addAtom();
    };

    p.draw = () => {
        p.background(5, 5, 8);

        // Smooth camera lerp
        APP_STATE.view.x += (APP_STATE.view.targetX - APP_STATE.view.x) * 0.1;
        APP_STATE.view.y += (APP_STATE.view.targetY - APP_STATE.view.y) * 0.1;

        p.push();
        p.translate(p.width / 2 + APP_STATE.view.x, p.height / 2 + APP_STATE.view.y);
        p.scale(APP_STATE.view.zoom);
        APP_STATE.atoms.forEach(a => { a.update(); a.draw(); });
        p.pop();

        if (APP_STATE.isRecording) {
            p.push(); p.fill(255, 0, 0); p.noStroke(); p.circle(30, 30, 16);
            p.fill(255); p.textSize(14); p.text('REC', 44, 35); p.pop();
        }
    };

    p.windowResized = () => p.resizeCanvas(window.innerWidth, window.innerHeight);
};

// ==================================================================
// LIVING TYPO
// ==================================================================
class LivingTypo {
    constructor(p, char, fontData, parentData = null) {
        this.p        = p;
        this.atomId   = atomCounter++;
        this.age      = 0;
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
            this.x    = (Math.random() - 0.5) * 1600;
            this.y    = (Math.random() - 0.5) * 1200;
            const CH  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?#@&';
            this.char = char || CH[Math.floor(Math.random() * CH.length)];
            this.gen  = 1;
            this.dna  = Genome.createRandom();

            const font = fontData || (FONTS.length ? FONTS[Math.floor(Math.random() * FONTS.length)] : null);
            this.fontName = font ? font.name : 'System';

            if (font && font.obj) {
                const b   = font.obj.textBounds(this.char, 0, 0, 500);
                const pts = font.obj.textToPoints(this.char, -b.x - b.w / 2, -b.y - b.h / 2, 500, { sampleFactor: 0.13 });
                pts.forEach(pt => this.vertices.push({
                    pos:     p.createVector(pt.x, pt.y),
                    basePos: p.createVector(pt.x, pt.y),
                    vel:     p.createVector(0, 0)
                }));
            }
        }

        while (this.vertices.length > 600) {
            this.vertices.splice(Math.floor(Math.random() * this.vertices.length), 1);
        }
    }

    update() {
        this.age++;
        const d = this.dna;

        // Compute how "mature" the atom is (0→1 ramp after birthDelay)
        const maturity = Math.max(0, this.age - d.birthDelay);
        const ramp     = Math.min(1, maturity / 120); // ramps over 2 seconds

        // Cohesion slowly decays long after birth
        d.cohesion = Math.max(0.08, 1.0 - (maturity / 2000));

        if (ramp < 0.001) return; // Still in stable birth period, don't update physics

        const t   = this.p.frameCount * 0.01 * d.g_speed;
        const amp = d.g_amplitude * ramp;

        let cmX = 0, cmY = 0;
        this.vertices.forEach(v => { cmX += v.pos.x; cmY += v.pos.y; });
        const cx = cmX / this.vertices.length, cy = cmY / this.vertices.length;
        const center = this.p.createVector(cx, cy);

        this.vertices.forEach((v, i) => {
            const force = this.p.createVector(0, 0);
            const lx = v.pos.x, ly = v.pos.y;

            switch (d.animType) {
                case 'liquid':
                    force.add(p5.Vector.fromAngle(
                        this.p.noise(lx * d.v_noiseScale + t, ly * d.v_noiseScale) * this.p.TWO_PI * 4
                    ).mult(amp * 0.8));
                    break;
                case 'frenetic':
                    force.add((Math.random() - 0.5) * amp * 3, (Math.random() - 0.5) * amp * 3);
                    break;
                case 'orbit': {
                    const diff = p5.Vector.sub(v.pos, center);
                    force.add(new p5.Vector(-diff.y, diff.x).normalize().mult(amp * 0.7));
                    break;
                }
                case 'piston':
                    force.x += Math.sin(t * 2.5 + i * 0.12) * amp * 2.5;
                    force.y += Math.cos(t * 1.8 + i * 0.09) * amp;
                    break;
                case 'nebula': {
                    const dist    = p5.Vector.dist(v.pos, center);
                    const outward = p5.Vector.sub(v.pos, center).normalize();
                    force.add(outward.mult(Math.sin(t * 4 - dist * 0.04) * amp * 1.5));
                    break;
                }
                case 'mycelium': {
                    const angle = Math.round(this.p.atan2(v.vel.y, v.vel.x) / (Math.PI / 3)) * (Math.PI / 3);
                    force.add(Math.cos(angle) * amp * 0.5, Math.sin(angle) * amp * 0.5);
                    break;
                }
            }

            // Spring back to base
            force.add(p5.Vector.sub(v.basePos, v.pos).mult(d.cohesion * 0.09));
            v.vel.add(force);
            v.vel.mult(d.g_friction);
            v.pos.add(v.vel);

            // Drift base position (erosion)
            if (d.cohesion < 0.8) {
                const erosion = (0.8 - d.cohesion) * amp * 0.4;
                v.basePos.add((Math.random() - 0.5) * erosion, (Math.random() - 0.5) * erosion);
            }
        });
    }

    draw() {
        const p  = this.p;
        const d  = this.dna;
        const vs = this.vertices;
        const R  = d.colorR, G = d.colorG, B = d.colorB;
        if (vs.length < 3) return;

        p.push();
        p.translate(this.x, this.y);
        if (d.blend_additive) p.blendMode(p.ADD);

        // ---- ACCENT LAYERS ----
        if (d.accentStyle === 'baroque') {
            p.noFill(); p.stroke(R, G, B, 20); p.strokeWeight(0.8);
            for (let k = 1; k <= 3; k++) {
                p.push(); p.scale(1 + k * 0.12); p.rotate(k * 0.04);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                p.pop();
            }
        }
        if (d.accentStyle === 'futurist') {
            p.stroke(R, G, B, 70); p.strokeWeight(0.5);
            vs.forEach(v => {
                if (v.vel.mag() > 0.25) p.line(v.pos.x, v.pos.y, v.pos.x - v.vel.x * 10, v.pos.y - v.vel.y * 10);
            });
        }
        if (d.accentStyle === 'echo') {
            p.noFill(); p.stroke(R, G, B, 18); p.strokeWeight(1.5);
            p.push(); p.translate(5, 5);
            p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
            p.pop();
        }
        if (d.accentStyle === 'glitch' && p.frameCount % 15 < 3) {
            p.noStroke(); p.fill(R, G, B, 80);
            p.push(); p.translate((Math.random() - 0.5) * 20, 0);
            p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
            p.pop();
        }

        // ---- DOMINANT VISUAL ----
        switch (d.visualStyle) {

            case 'membrane':
                // Solid filled form - the closest to "original letter"
                p.noStroke(); p.fill(R, G, B, d.v_alphaFill);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                // Colored edge
                p.noFill(); p.stroke(R, G, B, d.v_alphaStr * 0.6); p.strokeWeight(1.5);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                break;

            case 'outline':
                // Just the stroke, no fill — beautiful with dashes
                p.noFill(); p.stroke(R, G, B, d.v_alphaStr); p.strokeWeight(d.v_strokeW);
                if (d.v_dashGap > 0) p.drawingContext.setLineDash([d.v_strokeW * 2, d.v_dashGap]);
                p.beginShape(); vs.forEach(v => p.vertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                p.drawingContext.setLineDash([]);
                break;

            case 'neural': {
                // Mesh of connections  
                p.stroke(R, G, B, d.v_alphaStr * 0.45); p.strokeWeight(0.7);
                const limit = 65;
                for (let i = 0; i < vs.length; i += 6) {
                    for (let j = i + 1; j < vs.length; j += 10) {
                        const d2 = vs[i].pos.dist(vs[j].pos);
                        if (d2 < limit) p.line(vs[i].pos.x, vs[i].pos.y, vs[j].pos.x, vs[j].pos.y);
                    }
                }
                // Faint fill
                p.noStroke(); p.fill(R, G, B, d.v_alphaFill * 0.35);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                break;
            }

            case 'spores':
                // Glowing dots along letter path
                p.noStroke(); p.fill(R, G, B, d.v_alphaStr);
                vs.forEach((v, i) => {
                    if (i % 4 === 0) {
                        const s = d.v_strokeW * rand(0.4, 1.2);
                        p.circle(v.pos.x, v.pos.y, s);
                    }
                });
                // Ghost outline
                p.noFill(); p.stroke(R, G, B, 30); p.strokeWeight(0.8);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                break;

            case 'contour_fill':
                // Fill + thick outline = graphic poster feel
                p.fill(R, G, B, d.v_alphaFill * 0.7); p.stroke(R, G, B, d.v_alphaStr); p.strokeWeight(d.v_strokeW * 0.8);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                break;

            case 'glowing':
                // Additive multi-pass glow
                for (let pass = 0; pass < 3; pass++) {
                    const scale = 1 + pass * 0.04;
                    p.noFill(); p.stroke(R, G, B, (d.v_alphaStr / 3) * (1 - pass * 0.2)); p.strokeWeight(d.v_strokeW * (1 + pass));
                    p.push(); p.scale(scale);
                    p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                    p.pop();
                }
                // Core fill
                p.noStroke(); p.fill(R, G, B, d.v_alphaFill * 0.8);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                break;
        }

        p.blendMode(p.BLEND);
        p.pop();
    }
}

// ==================================================================
// TYPO UNIVERSE
// ==================================================================
class TypoUniverse {
    constructor(p) {
        this.p       = p;
        this.history = [];
        this.initUI();
        this.initInteraction();
    }

    addAtom() {
        this.history.push([...APP_STATE.atoms]);
        const font = FONTS.length ? FONTS[Math.floor(Math.random() * FONTS.length)] : null;
        APP_STATE.atoms.push(new LivingTypo(this.p, '', font));
        this.updateMoleculeList();
    }

    undo() {
        if (this.history.length) {
            APP_STATE.atoms = this.history.pop();
            this.updateMoleculeList();
        }
    }

    // CENTER CAMERA ON AN ATOM
    focusOn(atomId) {
        const atom = APP_STATE.atoms.find(a => a.atomId === atomId);
        if (!atom) return;
        // With the canvas translate: screenCenter + view = worldPos
        // So to center atom: view.target = -atom.x, -atom.y
        APP_STATE.view.targetX = -atom.x * APP_STATE.view.zoom;
        APP_STATE.view.targetY = -atom.y * APP_STATE.view.zoom;
    }

    checkFusion(moved) {
        const other = APP_STATE.atoms.find(o => o !== moved && Math.hypot(o.x - moved.x, o.y - moved.y) < 200);
        if (!other) return;
        this.history.push([...APP_STATE.atoms]);
        const child = new LivingTypo(this.p, '?', null, {
            x:        (moved.x + other.x) / 2,
            y:        (moved.y + other.y) / 2,
            char:     '?',
            fontName: `${moved.fontName} × ${other.fontName}`,
            gen:      Math.max(moved.gen, other.gen) + 1,
            dna:      Genome.merge(moved.dna, other.dna),
            vertices: [...moved.vertices, ...other.vertices]
        });
        while (child.vertices.length > 600) child.vertices.splice(Math.floor(Math.random() * child.vertices.length), 1);
        APP_STATE.atoms = APP_STATE.atoms.filter(a => a !== moved && a !== other);
        APP_STATE.atoms.push(child);
        this.updateMoleculeList();
    }

    initUI() {
        document.getElementById('add-atom').addEventListener('click', () => this.addAtom());
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());

        // MOLECULE LIST CLICK → camera focus
        document.getElementById('molecule-list').addEventListener('click', e => {
            const li = e.target.closest('[data-atom-id]');
            if (!li) return;
            this.focusOn(parseInt(li.dataset.atomId, 10));
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

        let dragged = null, panning = false, lx = 0, ly = 0;

        const toWorld = (cx, cy) => ({
            wx: (cx - this.p.width  / 2 - APP_STATE.view.x) / APP_STATE.view.zoom,
            wy: (cy - this.p.height / 2 - APP_STATE.view.y) / APP_STATE.view.zoom
        });

        const onStart = (cx, cy, target) => {
            if (target.closest('.ui-overlay')) return;
            const { wx, wy } = toWorld(cx, cy);
            // Grab radius in world space
            const grabR = 260 / APP_STATE.view.zoom;
            dragged = APP_STATE.atoms.find(a => Math.hypot(a.x - wx, a.y - wy) < grabR) || null;
            if (!dragged) { panning = true; lx = cx; ly = cy; }
        };

        const onMove = (cx, cy, dx, dy) => {
            if (dragged) {
                dragged.x += dx / APP_STATE.view.zoom;
                dragged.y += dy / APP_STATE.view.zoom;
            } else if (panning) {
                APP_STATE.view.targetX += (cx - lx);
                APP_STATE.view.targetY += (cy - ly);
                APP_STATE.view.x  = APP_STATE.view.targetX;
                APP_STATE.view.y  = APP_STATE.view.targetY;
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
        window.addEventListener('touchmove',  e => {
            const t   = e.touches[0];
            const dtx = t.clientX - lx, dty = t.clientY - ly;
            onMove(t.clientX, t.clientY, dtx, dty);
            lx = t.clientX; ly = t.clientY;
            if (dragged || panning) e.preventDefault();
        }, { passive: false });
        window.addEventListener('touchend', onEnd);

        window.addEventListener('wheel', e => {
            e.preventDefault();
            const factor = e.deltaY > 0 ? 0.92 : 1.09;
            APP_STATE.view.zoom = Math.max(0.1, Math.min(6, APP_STATE.view.zoom * factor));
        }, { passive: false });
    }

    updateMoleculeList() {
        const ml = document.getElementById('molecule-list');
        if (!ml) return;
        ml.innerHTML = APP_STATE.atoms.map(a => {
            const R = Math.round(a.dna.colorR), G = Math.round(a.dna.colorG), B = Math.round(a.dna.colorB);
            return `<li class="molecule-item" data-atom-id="${a.atomId}"
                style="cursor:pointer; display:flex; align-items:center; gap:10px; padding:8px 6px;
                       border-bottom:1px solid rgba(255,255,255,0.06); transition: background 0.2s;"
                onmouseenter="this.style.background='rgba(255,255,255,0.05)'"
                onmouseleave="this.style.background='none'">
                <span style="width:12px;height:12px;border-radius:50%;background:rgb(${R},${G},${B});flex-shrink:0;box-shadow:0 0 6px rgb(${R},${G},${B})"></span>
                <div>
                    <div style="font-weight:700; color:rgb(${R},${G},${B}); font-size:0.85rem">Gen ${a.gen} | <span style="color:#fff">[${a.char}]</span></div>
                    <div style="opacity:0.45; font-size:0.62rem; margin-top:2px">${a.dna.visualStyle} · ${a.dna.animType}</div>
                </div>
            </li>`;
        }).join('');
    }
}

// ==================================================================
// EXPORT
// ==================================================================
function injectExportUI(p) {
    const parent = document.querySelector('.side-panel');
    if (!parent) return;
    const div = document.createElement('div');
    div.style.cssText = 'margin-top:auto; padding-top:14px; border-top:1px solid rgba(255,255,255,0.08)';
    div.innerHTML = `
        <div style="display:flex; gap:8px;">
            <button id="btn-snap" style="flex:1; background:rgba(255,255,255,0.06); color:#fff; border:1px solid rgba(255,255,255,0.12); padding:9px 4px; cursor:pointer; font-size:0.72rem; border-radius:4px">📸 IMAGE</button>
            <button id="btn-vid"  style="flex:1; background:rgba(200,30,30,0.18); color:#fff; border:1px solid rgba(255,80,80,0.25); padding:9px 4px; cursor:pointer; font-size:0.72rem; border-radius:4px">🎥 VIDÉO</button>
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

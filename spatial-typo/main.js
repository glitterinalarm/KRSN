// Typography Lab - Alchemy Engine v36.0
// CORE PHILOSOPHY:
//   Gen 1 letters → stable forever, beautiful, animated but LEGIBLE
//   Fusion → triggers mutation, child inherits chaos, gets progressively abstract
//   No auto-decay unless you've fused
console.log("TypoLab Engine v36.0 - STABLE GEN1 | FUSION DRIVEN CHAOS");

let _atomIdCounter = 0;

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

function rand(a, b)  { return Math.random() * (b - a) + a; }
function pick(arr)   { return arr[Math.floor(Math.random() * arr.length)]; }
function rPow(p = 3) { return Math.pow(Math.random(), p); }

// ─────────────────────────────────────────────
// GENOME
// ─────────────────────────────────────────────
class Genome {
    // Called for fresh Gen-1 atoms — stable, varied, legible
    static gen1() {
        return {
            generation: 1,
            cohesion:   1.0,   // NEVER auto-decays for Gen 1

            // Animation: gives life without destroying form
            animType:   pick(['liquid', 'piston', 'orbit', 'nebula', 'mycelium', 'shimmer']),
            g_speed:    rand(0.3, 2.5),
            g_amplitude: rand(0.2, 1.2),  // deliberately low for Gen 1
            g_friction: rand(0.90, 0.97),
            v_noiseScale: rand(0.003, 0.009),

            // Visual rendering
            visualStyle: pick(['membrane', 'outline', 'neural', 'spores', 'contour_fill', 'glowing']),
            accentStyle: pick(['none','none','none','none','echo','futurist','baroque']),

            v_strokeW:   rand(1.5, 9),
            v_dashGap:   Math.random() > 0.65 ? rand(3, 35) : 0,
            v_alphaFill: rand(90, 220),
            v_alphaStr:  rand(140, 255),

            blend_additive: Math.random() > 0.88,
            colorR: Math.random() * 255,
            colorG: Math.random() * 255,
            colorB: Math.random() * 255
        };
    }

    // Called on FUSION — radically different from parents, chaos unlocked
    static fuse(A, B, childGen) {
        // The higher the generation, the more chaotic
        const chaosFactor = Math.min(1.0, (childGen - 1) * 0.25);

        const child = {
            generation: childGen,
            cohesion: Math.max(0.05, 1.0 - chaosFactor * rand(0.4, 0.9)),

            // Completely re-roll animation on fusion for diversity
            animType:    pick(['liquid', 'frenetic', 'orbit', 'piston', 'nebula', 'mycelium', 'shimmer', 'vortex']),
            g_speed:     rand(0.5, 5) * (1 + chaosFactor * 2),
            g_amplitude: rand(0.3, 6) * (1 + chaosFactor * 3),
            g_friction:  Math.max(0.75, rand(0.82, 0.97) - chaosFactor * 0.15),
            v_noiseScale: rand(0.002, 0.015),

            // Re-roll visual style entirely for diversity
            visualStyle: pick(['membrane', 'outline', 'neural', 'spores', 'contour_fill', 'glowing', 'fragmented', 'wireframe']),
            accentStyle: pick(['none','none','echo','futurist','baroque','glitch', 'ghost']),

            v_strokeW:   rand(0.5, 14) * (1 + chaosFactor),
            v_dashGap:   Math.random() > 0.5 ? rand(1, 50) : 0,
            v_alphaFill: rand(40, 220) * (1 - chaosFactor * 0.3),
            v_alphaStr:  rand(80, 255),

            // Color: sometimes inherit, sometimes mutate wildly
            blend_additive: Math.random() > (0.8 - chaosFactor * 0.4),
            colorR: Math.random() < chaosFactor * 0.6 ? Math.random() * 255 : (A.colorR + B.colorR) / 2 + rand(-60, 60),
            colorG: Math.random() < chaosFactor * 0.6 ? Math.random() * 255 : (A.colorG + B.colorG) / 2 + rand(-60, 60),
            colorB: Math.random() < chaosFactor * 0.6 ? Math.random() * 255 : (A.colorB + B.colorB) / 2 + rand(-60, 60),
        };
        child.colorR = Math.max(0, Math.min(255, child.colorR));
        child.colorG = Math.max(0, Math.min(255, child.colorG));
        child.colorB = Math.max(0, Math.min(255, child.colorB));
        return child;
    }
}

// ─────────────────────────────────────────────
// SKETCH
// ─────────────────────────────────────────────
const sketch = (p) => {
    p.preload = () => FONT_SOURCES.forEach(f => p.loadFont(f.url, font => FONTS.push({ name: f.name, obj: font })));

    p.setup   = () => {
        p.createCanvas(window.innerWidth, window.innerHeight).parent('stage');
        document.getElementById('loader').classList.add('hidden');
        window.TU = new TypoUniverse(p);
        injectExportUI(p);
        for (let i = 0; i < 6; i++) window.TU.addAtom();
    };

    p.draw = () => {
        p.background(5, 5, 8);
        APP_STATE.view.x += (APP_STATE.view.targetX - APP_STATE.view.x) * 0.1;
        APP_STATE.view.y += (APP_STATE.view.targetY - APP_STATE.view.y) * 0.1;
        p.push();
        p.translate(p.width / 2 + APP_STATE.view.x, p.height / 2 + APP_STATE.view.y);
        p.scale(APP_STATE.view.zoom);
        APP_STATE.atoms.forEach(a => { a.update(); a.draw(); });
        p.pop();
        if (APP_STATE.isRecording) { p.push(); p.fill(255,0,0); p.noStroke(); p.circle(28,28,14); p.fill(255); p.text('REC',38,33); p.pop(); }
    };

    p.windowResized = () => p.resizeCanvas(window.innerWidth, window.innerHeight);
};

// ─────────────────────────────────────────────
// LIVING TYPO
// ─────────────────────────────────────────────
class LivingTypo {
    constructor(p, char, fontData, parentData = null) {
        this.p        = p;
        this.atomId   = _atomIdCounter++;
        this.age      = 0;
        this.vertices = [];

        if (parentData) {
            // ── Fusion child ──
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
            // ── Fresh Gen-1 atom ──
            this.x    = (Math.random() - 0.5) * 1600;
            this.y    = (Math.random() - 0.5) * 1200;
            const CH  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?#@&';
            this.char = char || CH[Math.floor(Math.random() * CH.length)];
            this.gen  = 1;
            this.dna  = Genome.gen1();
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
        while (this.vertices.length > 600) this.vertices.splice(Math.floor(Math.random() * this.vertices.length), 1);
    }

    update() {
        this.age++;
        const d   = this.dna;
        const t   = this.p.frameCount * 0.01 * d.g_speed;
        const amp = d.g_amplitude;

        // Gen-1: cohesion stays at 1.0 → base spring pulls everything back STRONGLY
        // Fusion children: cohesion starts low → they drift and fragment
        const springForce = d.cohesion * 0.12;

        // For fusion children with low cohesion: slow drift of base position
        const drifting = d.cohesion < 0.9;

        let cmX = 0, cmY = 0;
        this.vertices.forEach(v => { cmX += v.pos.x; cmY += v.pos.y; });
        const center = this.p.createVector(cmX / this.vertices.length, cmY / this.vertices.length);

        this.vertices.forEach((v, i) => {
            const force = this.p.createVector(0, 0);

            switch (d.animType) {
                case 'liquid':
                    force.add(p5.Vector.fromAngle(
                        this.p.noise(v.pos.x * d.v_noiseScale + t, v.pos.y * d.v_noiseScale) * this.p.TWO_PI * 4
                    ).mult(amp * 0.7));
                    break;
                case 'frenetic':
                    force.add((Math.random() - 0.5) * amp * 4, (Math.random() - 0.5) * amp * 4);
                    break;
                case 'orbit': {
                    const diff = p5.Vector.sub(v.pos, center);
                    force.add(new p5.Vector(-diff.y, diff.x).normalize().mult(amp * 0.6));
                    break;
                }
                case 'piston':
                    force.x += Math.sin(t * 2 + i * 0.11) * amp * 2;
                    force.y += Math.cos(t * 1.5 + i * 0.08) * amp;
                    break;
                case 'nebula': {
                    const outward = p5.Vector.sub(v.pos, center).normalize();
                    force.add(outward.mult(Math.sin(t * 4 - p5.Vector.dist(v.pos, center) * 0.04) * amp * 1.5));
                    break;
                }
                case 'mycelium': {
                    const snap = Math.round(this.p.atan2(v.vel.y || 0, v.vel.x || 0.001) / (Math.PI / 4)) * (Math.PI / 4);
                    force.add(Math.cos(snap) * amp * 0.5, Math.sin(snap) * amp * 0.5);
                    break;
                }
                case 'shimmer':
                    force.x += Math.sin(t * 6 + i * 0.3) * amp * 0.5;
                    force.y += Math.cos(t * 6 + i * 0.3) * amp * 0.5;
                    break;
                case 'vortex': {
                    const d2   = p5.Vector.dist(v.pos, center);
                    const perp  = p5.Vector.sub(v.pos, center);
                    const ang  = this.p.atan2(perp.y, perp.x) + 0.05;
                    force.add(Math.cos(ang) * amp, Math.sin(ang) * amp);
                    force.add(p5.Vector.sub(center, v.pos).normalize().mult(amp * 0.2));
                    break;
                }
            }

            // Spring: pulls vertex back to its intended position
            force.add(p5.Vector.sub(v.basePos, v.pos).mult(springForce));
            v.vel.add(force);
            v.vel.mult(d.g_friction);
            v.pos.add(v.vel);

            // Only fusion children erode their base position
            if (drifting) {
                const erosion = (0.9 - d.cohesion) * amp * 0.3;
                v.basePos.add((Math.random() - 0.5) * erosion, (Math.random() - 0.5) * erosion);
            }
        });
    }

    draw() {
        const p  = this.p;
        const d  = this.dna;
        const vs = this.vertices;
        if (vs.length < 3) return;
        const R = d.colorR, G = d.colorG, B = d.colorB;

        p.push();
        p.translate(this.x, this.y);
        if (d.blend_additive) p.blendMode(p.ADD);

        // ───── ACCENT LAYER ─────
        switch (d.accentStyle) {
            case 'baroque':
                p.noFill(); p.stroke(R, G, B, 18); p.strokeWeight(0.8);
                for (let k = 1; k <= 3; k++) {
                    p.push(); p.scale(1 + k * 0.1); p.rotate(k * 0.05);
                    p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                    p.pop();
                }
                break;
            case 'futurist':
                p.stroke(R, G, B, 65); p.strokeWeight(0.5);
                vs.forEach(v => { if (v.vel.mag() > 0.2) p.line(v.pos.x, v.pos.y, v.pos.x - v.vel.x * 10, v.pos.y - v.vel.y * 10); });
                break;
            case 'echo':
                p.noFill(); p.stroke(R, G, B, 16); p.strokeWeight(2);
                p.push(); p.translate(6, 6);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                p.pop();
                break;
            case 'glitch':
                if (p.frameCount % 12 < 3) {
                    p.noStroke(); p.fill(R, G, B, 70);
                    p.push(); p.translate((Math.random() - 0.5) * 25, 0);
                    p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                    p.pop();
                }
                break;
            case 'ghost':
                p.noFill(); p.stroke(255, 255, 255, 12); p.strokeWeight(2);
                p.push(); p.translate(3, -3); p.scale(1.05);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                p.pop();
                break;
        }

        // ───── DOMINANT VISUAL STYLE ─────
        switch (d.visualStyle) {
            case 'membrane':
                p.noStroke(); p.fill(R, G, B, d.v_alphaFill);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                p.noFill(); p.stroke(R, G, B, d.v_alphaStr * 0.5); p.strokeWeight(1.5);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                break;

            case 'outline':
                p.noFill(); p.stroke(R, G, B, d.v_alphaStr); p.strokeWeight(d.v_strokeW);
                if (d.v_dashGap > 0) p.drawingContext.setLineDash([d.v_strokeW * 2, d.v_dashGap]);
                p.beginShape(); vs.forEach(v => p.vertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                p.drawingContext.setLineDash([]);
                break;

            case 'neural': {
                const lim = 70;
                p.stroke(R, G, B, d.v_alphaStr * 0.5); p.strokeWeight(0.8);
                for (let i = 0; i < vs.length; i += 5) {
                    for (let j = i + 1; j < vs.length; j += 9) {
                        if (vs[i].pos.dist(vs[j].pos) < lim) p.line(vs[i].pos.x, vs[i].pos.y, vs[j].pos.x, vs[j].pos.y);
                    }
                }
                p.noStroke(); p.fill(R, G, B, d.v_alphaFill * 0.35);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                break;
            }

            case 'spores':
                p.noStroke(); p.fill(R, G, B, d.v_alphaStr);
                vs.forEach((v, i) => { if (i % 4 === 0) p.circle(v.pos.x, v.pos.y, d.v_strokeW * rand(0.5, 1.3)); });
                p.noFill(); p.stroke(R, G, B, 25); p.strokeWeight(0.7);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                break;

            case 'contour_fill':
                p.fill(R, G, B, d.v_alphaFill * 0.8); p.stroke(R, G, B, d.v_alphaStr); p.strokeWeight(d.v_strokeW * 0.9);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                break;

            case 'glowing':
                for (let pass = 3; pass >= 0; pass--) {
                    p.noFill(); p.stroke(R, G, B, (d.v_alphaStr / 4) * (1 - pass * 0.18)); p.strokeWeight(d.v_strokeW * (1 + pass * 1.2));
                    p.push(); p.scale(1 + pass * 0.04);
                    p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                    p.pop();
                }
                p.noStroke(); p.fill(R, G, B, d.v_alphaFill);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                break;

            case 'fragmented':
                // Only for fusion children — triangles from the vertices
                p.noStroke(); p.fill(R, G, B, d.v_alphaFill);
                p.beginShape(p.TRIANGLES);
                for (let i = 0; i < vs.length - 2; i += 12) {
                    p.vertex(vs[i].pos.x,   vs[i].pos.y);
                    p.vertex(vs[i+1].pos.x, vs[i+1].pos.y);
                    p.vertex(vs[i+2].pos.x, vs[i+2].pos.y);
                }
                p.endShape();
                p.noFill(); p.stroke(R, G, B, d.v_alphaStr * 0.4); p.strokeWeight(0.7);
                p.beginShape(); vs.forEach(v => p.vertex(v.pos.x, v.pos.y)); p.endShape();
                break;

            case 'wireframe':
                // Structural lines only — sparse, geometric
                p.stroke(R, G, B, d.v_alphaStr * 0.7); p.strokeWeight(d.v_strokeW * 0.4);
                for (let i = 0; i < vs.length; i += 3) {
                    const j = (i + Math.floor(vs.length / 5)) % vs.length;
                    p.line(vs[i].pos.x, vs[i].pos.y, vs[j].pos.x, vs[j].pos.y);
                }
                p.noFill(); p.stroke(R, G, B, d.v_alphaStr * 0.3); p.strokeWeight(1);
                p.beginShape(); vs.forEach(v => p.vertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                break;
        }

        p.blendMode(p.BLEND);
        p.pop();
    }
}

// ─────────────────────────────────────────────
// TYPO UNIVERSE
// ─────────────────────────────────────────────
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
        const child = new LivingTypo(this.p, '?', null, {
            x:        (moved.x + other.x) / 2,
            y:        (moved.y + other.y) / 2,
            char:     '?',
            fontName: `${moved.fontName} × ${other.fontName}`,
            gen:      childGen,
            dna:      Genome.fuse(moved.dna, other.dna, childGen),
            vertices: [...moved.vertices, ...other.vertices]
        });
        while (child.vertices.length > 700) child.vertices.splice(Math.floor(Math.random() * child.vertices.length), 1);
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
            dragged = APP_STATE.atoms.find(a => Math.hypot(a.x - wx, a.y - wy) < 280 / APP_STATE.view.zoom) || null;
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
        window.addEventListener('touchmove', e => {
            const t = e.touches[0]; const dtx = t.clientX - lx, dty = t.clientY - ly;
            onMove(t.clientX, t.clientY, dtx, dty);
            lx = t.clientX; ly = t.clientY;
            if (dragged || panning) e.preventDefault();
        }, { passive: false });
        window.addEventListener('touchend', onEnd);
        window.addEventListener('wheel', e => {
            e.preventDefault();
            APP_STATE.view.zoom = Math.max(0.1, Math.min(6, APP_STATE.view.zoom * (e.deltaY > 0 ? 0.92 : 1.09)));
        }, { passive: false });
    }

    updateMoleculeList() {
        const ml = document.getElementById('molecule-list');
        if (!ml) return;
        ml.innerHTML = APP_STATE.atoms.map(a => {
            const R = Math.round(a.dna.colorR), G = Math.round(a.dna.colorG), B = Math.round(a.dna.colorB);
            const isFusion = a.gen > 1;
            return `<li class="molecule-item" data-atom-id="${a.atomId}"
                style="cursor:pointer; display:flex; align-items:center; gap:10px; padding:8px 6px;
                border-bottom:1px solid rgba(255,255,255,0.05); transition:background 0.2s;"
                onmouseenter="this.style.background='rgba(255,255,255,0.06)'"
                onmouseleave="this.style.background='none'">
                <span style="width:11px;height:11px;border-radius:50%;flex-shrink:0;
                    background:rgb(${R},${G},${B});
                    box-shadow:0 0 ${isFusion ? 8 : 4}px rgb(${R},${G},${B})">
                </span>
                <div>
                    <div style="font-weight:700; font-size:0.82rem; color:${isFusion ? `rgb(${R},${G},${B})` : '#fff'}">
                        ${isFusion ? '⚡' : ''} [${a.char}] Gen ${a.gen}
                    </div>
                    <div style="opacity:0.4; font-size:0.6rem; margin-top:2px">
                        ${a.dna.visualStyle} · ${a.dna.animType}
                    </div>
                </div>
            </li>`;
        }).join('');
    }
}

// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────
function injectExportUI(p) {
    const parent = document.querySelector('.side-panel');
    if (!parent) return;
    const div = document.createElement('div');
    div.style.cssText = 'margin-top:auto; padding-top:14px; border-top:1px solid rgba(255,255,255,0.08)';
    div.innerHTML = `
        <div style="display:flex; gap:8px;">
            <button id="btn-snap" style="flex:1; background:rgba(255,255,255,0.06); color:#fff; border:1px solid rgba(255,255,255,0.12); padding:9px 4px; cursor:pointer; font-size:0.72rem; border-radius:4px">📸 IMAGE</button>
            <button id="btn-vid"  style="flex:1; background:rgba(200,30,30,0.18);   color:#fff; border:1px solid rgba(255,80,80,0.25);  padding:9px 4px; cursor:pointer; font-size:0.72rem; border-radius:4px">🎥 VIDÉO</button>
        </div>`;
    parent.appendChild(div);
    document.getElementById('btn-snap').onclick = () => p.saveCanvas('typolab', 'png');

    let recorder, chunks = [];
    document.getElementById('btn-vid').onclick = () => {
        if (APP_STATE.isRecording) return; APP_STATE.isRecording = true;
        const canvas = document.querySelector('canvas');
        try { recorder = new MediaRecorder(canvas.captureStream(60), { mimeType: 'video/webm' }); }
        catch (_) { APP_STATE.isRecording = false; return; }
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob(chunks, { type: 'video/webm' }));
            a.download = 'typolab.webm'; a.click();
            chunks = []; APP_STATE.isRecording = false;
        };
        recorder.start(); setTimeout(() => recorder.stop(), 4000);
    };
}

new p5(sketch);

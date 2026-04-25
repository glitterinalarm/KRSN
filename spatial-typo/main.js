// Typography Lab - Alchemy Engine v37.0
// ═══════════════════════════════════════════════════════════
//  ABSOLUTE LAW:
//    Gen 1  → form NEVER changes. Only visual FX (color/glow/opacity).
//    Fusion → ONLY event that mutates form. Child gets chaos.
//    Every atom → unique size, style, color, animation.
// ═══════════════════════════════════════════════════════════
console.log("TypoLab Engine v37.0 - STATIC GEN1 | FUSION-ONLY MUTATION");

let _uid = 0;

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

function rand(a, b)    { return Math.random() * (b - a) + a; }
function pick(arr)     { return arr[Math.floor(Math.random() * arr.length)]; }
function clamp(v,a,b)  { return Math.max(a, Math.min(b, v)); }

// ─────────────────────────────────────────────────────────────
// GENOME
// ─────────────────────────────────────────────────────────────
class Genome {
    // Gen 1: stable, zero deformation, maximum visual diversity
    static gen1() {
        return {
            gen:        1,
            isStable:   true,   // ← never apply vertex physics

            // Letter SIZE - big diversity driver
            fontSize:   rand(180, 600),

            // Visual style - each letter looks fundamentally different
            visualStyle: pick(['membrane','outline','neural','spores','contour_fill','glowing']),
            // Subtle visual FX (no shape change)
            fxStyle:    pick(['breathe','pulse','shift','static','static']),

            // Accent (rare overlay)
            accentStyle: pick(['none','none','none','none','baroque','echo','ghost']),

            // Stroke & color
            v_strokeW:   rand(1.5, 10),
            v_dashGap:   Math.random() > 0.6 ? rand(3, 40) : 0,
            v_alphaFill: rand(80, 230),
            v_alphaStr:  rand(130, 255),
            fxSpeed:     rand(0.5, 3),    // speed of visual fx only

            blend_additive: Math.random() > 0.88,
            colorR: Math.random() * 255,
            colorG: Math.random() * 255,
            colorB: Math.random() * 255
        };
    }

    // Fusion child DNA — chaos proportional to generation depth
    static fuse(A, B, childGen) {
        const chaos = Math.min(0.95, (childGen - 1) * 0.28);
        return {
            gen:        childGen,
            isStable:   false,   // ← vertex physics active

            // Physics (unlocked on fusion)
            animType:   pick(['liquid','frenetic','orbit','piston','nebula','mycelium','vortex','shimmer']),
            g_speed:    rand(0.4, 4 + chaos * 3),
            g_amplitude:rand(0.3, 2 + chaos * 5),
            g_friction: clamp(rand(0.83, 0.97) - chaos * 0.12, 0.72, 0.99),
            v_noiseScale: rand(0.002, 0.013),
            cohesion:   clamp(1.0 - chaos * rand(0.5, 1.0), 0.03, 0.9),

            // Visual (re-rolled completely)
            visualStyle: pick(['membrane','outline','neural','spores','contour_fill','glowing','fragmented','wireframe']),
            accentStyle: pick(['none','none','futurist','glitch','echo','baroque','ghost']),

            // Size inherited + mutated
            fontSize: clamp((A.fontSize||350 + B.fontSize||350) / 2 + rand(-100,100), 150, 700),

            v_strokeW:   rand(0.4, 14) * (1 + chaos * 0.5),
            v_dashGap:   Math.random() > 0.45 ? rand(1, 55) : 0,
            v_alphaFill: clamp(rand(30, 230) * (1 - chaos * 0.25), 20, 230),
            v_alphaStr:  rand(60, 255),
            fxSpeed:     rand(0.5, 3),

            blend_additive: Math.random() > clamp(0.85 - chaos * 0.35, 0.3, 0.9),

            // Color: increasingly random with higher generations
            colorR: clamp((Math.random() < chaos * 0.5 ? Math.random()*255 : (A.colorR+B.colorR)/2) + rand(-50,50), 0, 255),
            colorG: clamp((Math.random() < chaos * 0.5 ? Math.random()*255 : (A.colorG+B.colorG)/2) + rand(-50,50), 0, 255),
            colorB: clamp((Math.random() < chaos * 0.5 ? Math.random()*255 : (A.colorB+B.colorB)/2) + rand(-50,50), 0, 255),
        };
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
        if (APP_STATE.isRecording) {
            p.push(); p.fill(255,0,0); p.noStroke(); p.circle(28,28,14);
            p.fill(255); p.textSize(13); p.text('REC', 40, 33); p.pop();
        }
    };

    p.windowResized = () => p.resizeCanvas(window.innerWidth, window.innerHeight);
};

// ─────────────────────────────────────────────────────────────
// LIVING TYPO
// ─────────────────────────────────────────────────────────────
class LivingTypo {
    constructor(p, char, fontData, parentData = null) {
        this.p        = p;
        this.atomId   = _uid++;
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
            this.x    = (Math.random() - 0.5) * 1800;
            this.y    = (Math.random() - 0.5) * 1200;
            const CH  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?#@&';
            this.char = char || CH[Math.floor(Math.random() * CH.length)];
            this.gen  = 1;
            this.dna  = Genome.gen1();
            const font = fontData || (FONTS.length ? FONTS[Math.floor(Math.random() * FONTS.length)] : null);
            this.fontName = font ? font.name : 'System';
            if (font && font.obj) {
                const fs  = this.dna.fontSize;
                const b   = font.obj.textBounds(this.char, 0, 0, fs);
                const pts = font.obj.textToPoints(this.char, -b.x - b.w / 2, -b.y - b.h / 2, fs, { sampleFactor: 0.14 });
                pts.forEach(pt => this.vertices.push({
                    pos:     p.createVector(pt.x, pt.y),
                    basePos: p.createVector(pt.x, pt.y),
                    vel:     p.createVector(0, 0)
                }));
            }
        }
        while (this.vertices.length > 700) this.vertices.splice(Math.floor(Math.random() * this.vertices.length), 1);
    }

    // ---- PHYSICS UPDATE ----
    update() {
        this.age++;
        const d = this.dna;

        // ══ Gen 1: ZERO vertex physics. Form is sacred. ══
        if (d.isStable) return;

        // ══ Fusion child: full physics ══
        const t   = this.p.frameCount * 0.01 * d.g_speed;
        const amp = d.g_amplitude;

        let cmX = 0, cmY = 0;
        this.vertices.forEach(v => { cmX += v.pos.x; cmY += v.pos.y; });
        const center = this.p.createVector(cmX / this.vertices.length, cmY / this.vertices.length);

        this.vertices.forEach((v, i) => {
            const force = this.p.createVector(0, 0);

            switch (d.animType) {
                case 'liquid':
                    force.add(p5.Vector.fromAngle(
                        this.p.noise(v.pos.x * d.v_noiseScale + t, v.pos.y * d.v_noiseScale) * this.p.TWO_PI * 4
                    ).mult(amp));
                    break;
                case 'frenetic':
                    force.add((Math.random() - 0.5) * amp * 5, (Math.random() - 0.5) * amp * 5);
                    break;
                case 'orbit': {
                    const diff = p5.Vector.sub(v.pos, center);
                    force.add(new p5.Vector(-diff.y, diff.x).normalize().mult(amp * 0.8));
                    break;
                }
                case 'piston':
                    force.x += Math.sin(t * 2 + i * 0.1) * amp * 2.5;
                    force.y += Math.cos(t * 1.5 + i * 0.08) * amp;
                    break;
                case 'nebula': {
                    const outward = p5.Vector.sub(v.pos, center).normalize();
                    force.add(outward.mult(Math.sin(t * 4 - p5.Vector.dist(v.pos, center) * 0.04) * amp * 2));
                    break;
                }
                case 'mycelium': {
                    const ang = Math.round(this.p.atan2(v.vel.y || 0, v.vel.x || 0.001) / (Math.PI / 4)) * (Math.PI / 4);
                    force.add(Math.cos(ang) * amp * 0.7, Math.sin(ang) * amp * 0.7);
                    break;
                }
                case 'vortex': {
                    const perp = p5.Vector.sub(v.pos, center);
                    const ang  = this.p.atan2(perp.y, perp.x) + 0.06;
                    force.add(Math.cos(ang) * amp * 0.8, Math.sin(ang) * amp * 0.8);
                    force.add(p5.Vector.sub(center, v.pos).normalize().mult(amp * 0.15));
                    break;
                }
                case 'shimmer':
                    force.x += Math.sin(t * 8 + i * 0.4) * amp * 0.6;
                    force.y += Math.cos(t * 8 + i * 0.4) * amp * 0.6;
                    break;
            }

            // Spring back to base  
            force.add(p5.Vector.sub(v.basePos, v.pos).mult(d.cohesion * 0.1));
            v.vel.add(force);
            v.vel.mult(d.g_friction);
            v.pos.add(v.vel);

            // Base erosion for low-cohesion entities
            if (d.cohesion < 0.75) {
                const erosion = (0.75 - d.cohesion) * amp * 0.35;
                v.basePos.add((Math.random() - 0.5) * erosion, (Math.random() - 0.5) * erosion);
            }
        });
    }

    // ---- RENDER ----
    draw() {
        const p  = this.p;
        const d  = this.dna;
        const vs = this.vertices;
        if (vs.length < 3) return;

        // Visual FX params (Gen 1: animated glow/alpha, Gen 2+: static)
        const t      = p.frameCount * 0.015 * (d.fxSpeed || 1);
        const pulse  = 0.5 + 0.5 * Math.sin(t);  // 0→1
        const pulse2 = 0.5 + 0.5 * Math.cos(t * 1.3);

        let R = d.colorR, G = d.colorG, B = d.colorB;

        // FX: color shift (Gen 1 only)
        if (d.isStable && d.fxStyle === 'shift') {
            R = clamp(R + Math.sin(t * 0.7) * 30, 0, 255);
            G = clamp(G + Math.sin(t * 0.5) * 30, 0, 255);
            B = clamp(B + Math.sin(t * 0.9) * 30, 0, 255);
        }

        const alphaF = d.v_alphaFill * (d.isStable && d.fxStyle === 'breathe' ? (0.6 + pulse * 0.4) : 1);
        const alphaS = d.v_alphaStr  * (d.isStable && d.fxStyle === 'pulse'   ? (0.5 + pulse2 * 0.5) : 1);

        p.push();
        p.translate(this.x, this.y);
        if (d.blend_additive) p.blendMode(p.ADD);

        // ── ACCENT LAYER ──
        switch (d.accentStyle) {
            case 'baroque':
                p.noFill(); p.stroke(R, G, B, 20); p.strokeWeight(0.8);
                for (let k = 1; k <= 3; k++) {
                    p.push(); p.scale(1 + k * 0.1); p.rotate(k * 0.04);
                    p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                    p.pop();
                }
                break;
            case 'echo':
                p.noFill(); p.stroke(R, G, B, 15); p.strokeWeight(2);
                p.push(); p.translate(7, 7);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                p.pop();
                break;
            case 'ghost':
                p.noFill(); p.stroke(255, 255, 255, 10); p.strokeWeight(2.5);
                p.push(); p.translate(4, -4); p.scale(1.06);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                p.pop();
                break;
            case 'futurist':
                p.stroke(R, G, B, 60); p.strokeWeight(0.5);
                vs.forEach(v => { if (v.vel && v.vel.mag() > 0.2) p.line(v.pos.x, v.pos.y, v.pos.x - v.vel.x * 10, v.pos.y - v.vel.y * 10); });
                break;
            case 'glitch':
                if (p.frameCount % 14 < 2) {
                    p.noStroke(); p.fill(R, G, B, 80);
                    p.push(); p.translate((Math.random() - 0.5) * 30, 0);
                    p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                    p.pop();
                }
                break;
        }

        // ── DOMINANT STYLE ──
        switch (d.visualStyle) {
            case 'membrane':
                p.noStroke(); p.fill(R, G, B, alphaF);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                p.noFill(); p.stroke(R, G, B, alphaS * 0.5); p.strokeWeight(1.5);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                break;

            case 'outline':
                p.noFill(); p.stroke(R, G, B, alphaS); p.strokeWeight(d.v_strokeW);
                if (d.v_dashGap > 0) p.drawingContext.setLineDash([d.v_strokeW * 2, d.v_dashGap]);
                p.beginShape(); vs.forEach(v => p.vertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                p.drawingContext.setLineDash([]);
                break;

            case 'neural': {
                const lim = 75;
                p.stroke(R, G, B, alphaS * 0.5); p.strokeWeight(0.8);
                for (let i = 0; i < vs.length; i += 5) {
                    for (let j = i + 1; j < vs.length; j += 9) {
                        if (vs[i].pos.dist(vs[j].pos) < lim) p.line(vs[i].pos.x, vs[i].pos.y, vs[j].pos.x, vs[j].pos.y);
                    }
                }
                p.noStroke(); p.fill(R, G, B, alphaF * 0.3);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                break;
            }

            case 'spores':
                p.noStroke(); p.fill(R, G, B, alphaS);
                vs.forEach((v, i) => { if (i % 4 === 0) p.circle(v.pos.x, v.pos.y, d.v_strokeW * rand(0.5, 1.4)); });
                p.noFill(); p.stroke(R, G, B, 22); p.strokeWeight(0.7);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                break;

            case 'contour_fill':
                p.fill(R, G, B, alphaF * 0.8); p.stroke(R, G, B, alphaS); p.strokeWeight(d.v_strokeW * 0.9);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                break;

            case 'glowing':
                for (let pass = 3; pass >= 0; pass--) {
                    p.noFill();
                    p.stroke(R, G, B, (alphaS / 4) * (1 - pass * 0.17));
                    p.strokeWeight(d.v_strokeW * (1 + pass * 1.3));
                    p.push(); p.scale(1 + pass * 0.04);
                    p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                    p.pop();
                }
                p.noStroke(); p.fill(R, G, B, alphaF);
                p.beginShape(); vs.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                break;

            case 'fragmented':
                p.noStroke(); p.fill(R, G, B, alphaF);
                p.beginShape(p.TRIANGLES);
                for (let i = 0; i < vs.length - 2; i += 10) {
                    p.vertex(vs[i].pos.x, vs[i].pos.y);
                    p.vertex(vs[i+1].pos.x, vs[i+1].pos.y);
                    p.vertex(vs[i+2].pos.x, vs[i+2].pos.y);
                }
                p.endShape();
                p.noFill(); p.stroke(R, G, B, alphaS * 0.4); p.strokeWeight(0.6);
                p.beginShape(); vs.forEach(v => p.vertex(v.pos.x, v.pos.y)); p.endShape();
                break;

            case 'wireframe':
                p.stroke(R, G, B, alphaS * 0.65); p.strokeWeight(d.v_strokeW * 0.4);
                for (let i = 0; i < vs.length; i += 3) {
                    const j = (i + Math.floor(vs.length / 5)) % vs.length;
                    p.line(vs[i].pos.x, vs[i].pos.y, vs[j].pos.x, vs[j].pos.y);
                }
                p.noFill(); p.stroke(R, G, B, alphaS * 0.25); p.strokeWeight(1);
                p.beginShape(); vs.forEach(v => p.vertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE);
                break;
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
        const other = APP_STATE.atoms.find(o => o !== moved && Math.hypot(o.x - moved.x, o.y - moved.y) < 220);
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
        while (child.vertices.length > 800) child.vertices.splice(Math.floor(Math.random() * child.vertices.length), 1);
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
            dragged = APP_STATE.atoms.find(a => Math.hypot(a.x - wx, a.y - wy) < 300 / APP_STATE.view.zoom) || null;
            if (!dragged) { panning = true; lx = cx; ly = cy; }
        };
        const onMove = (cx, cy, dx, dy) => {
            if (dragged) {
                dragged.x += dx / APP_STATE.view.zoom;
                dragged.y += dy / APP_STATE.view.zoom;
            } else if (panning) {
                APP_STATE.view.targetX += (cx - lx); APP_STATE.view.x = APP_STATE.view.targetX;
                APP_STATE.view.targetY += (cy - ly); APP_STATE.view.y = APP_STATE.view.targetY;
                lx = cx; ly = cy;
            }
        };
        const onEnd = () => { if (dragged) this.checkFusion(dragged); dragged = null; panning = false; };

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
            const fusion = !a.dna.isStable;
            return `<li class="molecule-item" data-atom-id="${a.atomId}"
                    style="cursor:pointer; display:flex; align-items:center; gap:10px; padding:8px 6px;
                    border-bottom:1px solid rgba(255,255,255,0.05); transition:background 0.2s;"
                    onmouseenter="this.style.background='rgba(255,255,255,0.07)'"
                    onmouseleave="this.style.background='none'">
                <span style="width:11px;height:11px;border-radius:50%;flex-shrink:0;
                    background:rgb(${R},${G},${B});
                    box-shadow:0 0 ${fusion ? 10 : 4}px rgb(${R},${G},${B})"></span>
                <div>
                    <div style="font-weight:700;font-size:0.82rem;color:${fusion?`rgb(${R},${G},${B})`:'#eee'}">
                        ${fusion ? '⚡' : '○'} [${a.char}] G${a.gen}
                    </div>
                    <div style="opacity:0.4;font-size:0.6rem;margin-top:2px">
                        ${a.dna.visualStyle} · ${a.dna.animType || a.dna.fxStyle}
                    </div>
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
    div.style.cssText = 'margin-top:auto; padding-top:14px; border-top:1px solid rgba(255,255,255,0.08)';
    div.innerHTML = `
        <div style="display:flex; gap:8px;">
            <button id="btn-snap" style="flex:1;background:rgba(255,255,255,0.06);color:#fff;border:1px solid rgba(255,255,255,0.12);padding:9px 4px;cursor:pointer;font-size:0.72rem;border-radius:4px">📸 IMAGE</button>
            <button id="btn-vid"  style="flex:1;background:rgba(200,30,30,0.18);color:#fff;border:1px solid rgba(255,80,80,0.25);padding:9px 4px;cursor:pointer;font-size:0.72rem;border-radius:4px">🎥 VIDÉO</button>
        </div>`;
    parent.appendChild(div);
    document.getElementById('btn-snap').onclick = () => p.saveCanvas('typolab', 'png');

    let recorder, chunks = [];
    document.getElementById('btn-vid').onclick = () => {
        if (APP_STATE.isRecording) return; APP_STATE.isRecording = true;
        try { recorder = new MediaRecorder(document.querySelector('canvas').captureStream(60), { mimeType: 'video/webm' }); }
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

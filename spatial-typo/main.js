// ═══════════════════════════════════════════════════════════════════
// TYPOGRAPHY ALCHEMY ENGINE v43.0
// ARCHITECTURE:
//   A letter has INTRINSIC properties (size, weight, style, color…)
//   External MUTATION DOMAINS transform it (physics, biology, math…)
//   Each domain produces a NAMED, RECOGNIZABLE visual state
//   Fusion = one letter meets another → a new transformation is activated
//   The letter stays recognizable; the transformation is what mutates
// ═══════════════════════════════════════════════════════════════════
console.log("TypoLab v43.0 — NAMED TRANSFORMATIONS | INTRINSIC + EXTRINSIC GENES");

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

function rand(a, b)    { return Math.random() * (b - a) + a; }
function pick(arr)     { return arr[Math.floor(Math.random() * arr.length)]; }
function clamp(v,a,b)  { return Math.max(a, Math.min(b, v)); }

// ─────────────────────────────────────────────────────────────────────
// THE 12 NAMED TRANSFORMATION STATES
// Each one = a completely distinct visual mode for a transformed letter
// ─────────────────────────────────────────────────────────────────────
const TRANSFORMATIONS = [
    // FORMAT: id, label, domain, render function name
    { id: 'gravity',     label: '↓ Gravité',      domain: 'physics'     },
    { id: 'explode',     label: '💥 Explosion',    domain: 'physics'     },
    { id: 'fragment',    label: '◈ Fragment',      domain: 'physics'     },
    { id: 'particle',    label: '✦ Particule',     domain: 'biology'     },
    { id: 'mycelium',    label: '🍄 Mycélium',     domain: 'biology'     },
    { id: 'dissolve',    label: '∿ Dissolution',   domain: 'biology'     },
    { id: 'crystallize', label: '◆ Cristal',       domain: 'math'        },
    { id: 'spiral',      label: '🌀 Spirale',      domain: 'math'        },
    { id: 'wave',        label: '〰 Vague',         domain: 'physics'     },
    { id: 'glow',        label: '✨ Lumière',       domain: 'quantum'     },
    { id: 'echo',        label: '◌ Écho',          domain: 'quantum'     },
    { id: 'tripod',      label: '⌂ Tripode',       domain: 'artistic'    },
];

// ─────────────────────────────────────────────────────────────────────
// DNA
// ─────────────────────────────────────────────────────────────────────
class DNA {

    // Gen 1: intrinsic letter properties only, no transformations
    static gen1(fontObj, char) {
        return {
            gen: 1,
            // ── INTRINSIC ──
            fontSize:     rand(120, 480),
            scaleX:       rand(0.7, 1.35),    // horizontal stretch
            scaleY:       rand(0.7, 1.35),    // vertical stretch
            rotation:     rand(-0.25, 0.25),   // tilt
            opacity:      rand(0.55, 1.0),
            strokeW:      rand(0.5, 12),
            textStyle:    pick(['solid','outline','dual','shadow','glow','outline_thick']),

            // ── INTRINSIC COLOR ──
            colorR: Math.random() * 255,
            colorG: Math.random() * 255,
            colorB: Math.random() * 255,

            // ── ANIMATION (subtle for Gen1, no deformation) ──
            fxStyle: pick(['breathe','pulse','shift','static','static']),
            fxSpeed: rand(0.3, 2),

            // ── TRANSFORMATIONS: all zero at birth ──
            t_gravity:     0,
            t_explode:     0,
            t_fragment:    0,
            t_particle:    0,
            t_mycelium:    0,
            t_dissolve:    0,
            t_crystallize: 0,
            t_spiral:      0,
            t_wave:        0,
            t_glow:        0,
            t_echo:        0,
            t_tripod:      0,
        };
    }

    // Fusion: inherit parent properties + activate ONE new transformation
    static fuse(A, B) {
        const child = {
            gen: Math.max(A.gen, B.gen) + 1,
        };

        // ── INHERIT INTRINSIC PROPERTIES ──
        // Color: blend + small mutation (color lineage is preserved)
        child.colorR = clamp((A.colorR + B.colorR) / 2 + rand(-30, 30), 0, 255);
        child.colorG = clamp((A.colorG + B.colorG) / 2 + rand(-30, 30), 0, 255);
        child.colorB = clamp((A.colorB + B.colorB) / 2 + rand(-30, 30), 0, 255);

        // Size: blend with slight variation
        child.fontSize  = clamp(((A.fontSize||200) + (B.fontSize||200)) / 2 + rand(-60, 60), 80, 500);
        child.scaleX    = clamp(((A.scaleX||1) + (B.scaleX||1)) / 2 + rand(-0.15, 0.15), 0.4, 2.0);
        child.scaleY    = clamp(((A.scaleY||1) + (B.scaleY||1)) / 2 + rand(-0.15, 0.15), 0.4, 2.0);
        child.rotation  = ((A.rotation||0) + (B.rotation||0)) / 2 + rand(-0.1, 0.1);
        child.opacity   = clamp(((A.opacity||1) + (B.opacity||1)) / 2 + rand(-0.1, 0.1), 0.2, 1.0);
        child.strokeW   = clamp(((A.strokeW||2) + (B.strokeW||2)) / 2 + rand(-2, 2), 0.3, 18);

        // ── INHERIT EXISTING TRANSFORMATIONS ──
        // Dominant transformations (>0.3) pass to child with some attenuation
        // Weak ones fade further. This creates generational "genealogy".
        const T_KEYS = ['t_gravity','t_explode','t_fragment','t_particle','t_mycelium',
                        't_dissolve','t_crystallize','t_spiral','t_wave','t_glow','t_echo','t_tripod'];
        for (const k of T_KEYS) {
            const av = A[k] || 0, bv = B[k] || 0;
            const max = Math.max(av, bv);
            if (max > 0.3) {
                // Dominant transformation carries through (90% retention)
                child[k] = clamp(max * rand(0.85, 1.08), 0, 1.5);
            } else {
                // Weak transformation attenuates further
                child[k] = clamp((av + bv) / 2 * rand(0.5, 0.8), 0, 1.5);
            }
        }

        // ── ACTIVATE ONE NEW TRANSFORMATION ──
        // Pick a transformation that neither parent had strongly
        const weakOnes = T_KEYS.filter(k => (A[k]||0) < 0.4 && (B[k]||0) < 0.4);
        const newT = weakOnes.length > 0
            ? pick(weakOnes)
            : pick(T_KEYS);
        child[newT] = clamp((child[newT] || 0) + rand(0.4, 0.9), 0, 1.5);

        // Animation params
        child.fxStyle = pick(['breathe','pulse','static','static']);
        child.fxSpeed = rand(0.5, 3);
        child.textStyle = 'solid';

        return child;
    }
}

// ─────────────────────────────────────────────────────────────────────
// SKETCH
// ─────────────────────────────────────────────────────────────────────
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
        APP_STATE.atoms.forEach(a => a.draw(p));
        p.pop();
        if (APP_STATE.isRecording) {
            p.push(); p.fill(255,0,0); p.noStroke(); p.circle(28,28,14);
            p.fill(255); p.textSize(13); p.text('REC',40,33); p.pop();
        }
    };

    p.windowResized = () => p.resizeCanvas(window.innerWidth, window.innerHeight);
};

// ─────────────────────────────────────────────────────────────────────
// LIVING TYPO
// ─────────────────────────────────────────────────────────────────────
class LivingTypo {
    constructor(p, char, fontData, parentData = null) {
        this.p       = p;
        this.atomId  = _uid++;
        this.frame   = 0;
        this.vertices = [];    // sampled letter points
        this.fontObj  = null;

        if (parentData) {
            this.x        = parentData.x;
            this.y        = parentData.y;
            this.char     = parentData.char;
            this.fontName = parentData.fontName;
            this.dna      = parentData.dna;
            this.gen      = parentData.gen;
            this.vertices = parentData.vertices;
            this.fontObj  = parentData.fontObj;
        } else {
            this.x    = (Math.random() - 0.5) * 1600;
            this.y    = (Math.random() - 0.5) * 1000;
            const CH  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            this.char = char || CH[Math.floor(Math.random() * CH.length)];
            this.gen  = 1;
            const font = fontData || (FONTS.length ? FONTS[Math.floor(Math.random() * FONTS.length)] : null);
            this.fontName = font ? font.name : 'System';
            this.fontObj  = font ? font.obj : null;
            this.dna  = DNA.gen1(this.fontObj, this.char);

            // Sample letter vertices for future fusions
            if (font && font.obj) {
                this._sampleVerts(font.obj, this.char, this.dna.fontSize);
            }
        }
    }

    _sampleVerts(fontObj, char, fontSize) {
        try {
            const b   = fontObj.textBounds(char, 0, 0, fontSize);
            const pts = fontObj.textToPoints(char, -b.x - b.w/2, -b.y - b.h/2, fontSize,
                { sampleFactor: 0.12, simplifyThreshold: 0 });
            this.vertices = pts.map(pt => ({
                ox: pt.x, oy: pt.y,  // original position
                x:  pt.x, y:  pt.y,  // current (used for drawing)
            }));
        } catch(e) { this.vertices = []; }
    }

    // Total transformation strength (sum of all active transformations)
    get totalTransform() {
        const d = this.dna;
        return (d.t_gravity||0) + (d.t_explode||0) + (d.t_fragment||0) + (d.t_particle||0) +
               (d.t_mycelium||0) + (d.t_dissolve||0) + (d.t_crystallize||0) + (d.t_spiral||0) +
               (d.t_wave||0) + (d.t_glow||0) + (d.t_echo||0) + (d.t_tripod||0);
    }

    // The DOMINANT transformation (highest weight)
    get dominantTransform() {
        const d = this.dna;
        const entries = [
            ['gravity',d.t_gravity||0],['explode',d.t_explode||0],['fragment',d.t_fragment||0],
            ['particle',d.t_particle||0],['mycelium',d.t_mycelium||0],['dissolve',d.t_dissolve||0],
            ['crystallize',d.t_crystallize||0],['spiral',d.t_spiral||0],['wave',d.t_wave||0],
            ['glow',d.t_glow||0],['echo',d.t_echo||0],['tripod',d.t_tripod||0],
        ];
        return entries.reduce((best, e) => e[1] > best[1] ? e : best, ['none', 0]);
    }

    draw(p) {
        this.frame++;
        const d   = this.dna;
        const t   = this.frame * 0.015 * (d.fxSpeed || 1);
        const pulse = 0.5 + 0.5 * Math.sin(t);

        let R = d.colorR, G = d.colorG, B = d.colorB;
        if (d.fxStyle === 'shift') {
            R = clamp(R + Math.sin(t*0.7)*25, 0, 255);
            G = clamp(G + Math.sin(t*0.5)*25, 0, 255);
            B = clamp(B + Math.sin(t*0.9)*25, 0, 255);
        }
        const alpha = (d.opacity || 1) * 255 * (d.fxStyle === 'breathe' ? (0.55 + pulse*0.45) : 1);
        const alphaS = alpha * (d.fxStyle === 'pulse' ? (0.5 + pulse*0.5) : 1);

        p.push();
        p.translate(this.x, this.y);
        p.rotate(d.rotation || 0);
        p.scale(d.scaleX || 1, d.scaleY || 1);

        // ════════════════════════════════════════════
        // GEN 1 — Clean canvas text (letter as it is)
        // ════════════════════════════════════════════
        if (d.gen === 1 && this.fontObj) {
            this._drawCleanText(p, R, G, B, alpha, alphaS, d, t);
            p.pop();
            return;
        }

        // ════════════════════════════════════════════
        // FUSION — Named transformation rendering
        // ════════════════════════════════════════════
        if (this.vertices.length < 3) {
            // Fallback: try to re-sample if font available
            if (this.fontObj) this._sampleVerts(this.fontObj, this.char, d.fontSize || 300);
            if (this.vertices.length < 3) { p.pop(); return; }
        }

        const vs = this.vertices;
        // Compute centroid
        let cmX = 0, cmY = 0;
        vs.forEach(v => { cmX += v.ox; cmY += v.oy; });
        cmX /= vs.length; cmY /= vs.length;

        // Apply all active transformations to get current positions
        this._applyTransformations(vs, d, t, cmX, cmY);

        const [dom, domStrength] = this.dominantTransform;

        // Render using dominant transformation's visual language
        this._drawTransformed(p, vs, d, dom, domStrength, R, G, B, alpha, alphaS, t, cmX, cmY);

        p.pop();
    }

    _drawCleanText(p, R, G, B, alpha, alphaS, d, t) {
        p.textAlign(p.CENTER, p.CENTER);
        p.textFont(this.fontObj);
        p.textSize(d.fontSize || 250);
        const ctx = p.drawingContext;

        switch (d.textStyle) {
            case 'solid':
                p.noStroke(); p.fill(R, G, B, alpha); p.text(this.char, 0, 0); break;
            case 'outline':
                p.noFill(); p.stroke(R, G, B, alphaS); p.strokeWeight(d.strokeW); p.text(this.char, 0, 0); break;
            case 'outline_thick':
                p.noFill();
                p.stroke(R, G, B, alphaS * 0.2); p.strokeWeight(d.strokeW * 4); p.text(this.char, 0, 0);
                p.stroke(R, G, B, alphaS); p.strokeWeight(d.strokeW * 0.8); p.text(this.char, 0, 0); break;
            case 'dual':
                p.fill(R, G, B, alpha * 0.5); p.stroke(R, G, B, alphaS); p.strokeWeight(d.strokeW * 0.5);
                p.text(this.char, 0, 0); break;
            case 'shadow':
                ctx.shadowColor = `rgba(${R},${G},${B},0.9)`; ctx.shadowBlur = 28;
                p.noStroke(); p.fill(R, G, B, alpha); p.text(this.char, 0, 0);
                ctx.shadowBlur = 0; break;
            case 'glow':
                for (let pass = 4; pass >= 0; pass--) {
                    ctx.shadowColor = `rgba(${R},${G},${B},${0.85-pass*0.13})`; ctx.shadowBlur = 70 - pass*12;
                    p.noStroke(); p.fill(R, G, B, pass === 0 ? alpha : alpha * 0.12); p.text(this.char, 0, 0);
                }
                ctx.shadowBlur = 0; break;
        }
    }

    _applyTransformations(vs, d, t, cmX, cmY) {
        const bboxR = 250; // approximate letter radius at size 400

        vs.forEach((v, i) => {
            // Start from original position
            let nx = v.ox, ny = v.oy;
            const dx = v.ox - cmX, dy = v.oy - cmY;
            const dist = Math.sqrt(dx*dx + dy*dy) || 1;
            const angle = Math.atan2(dy, dx);

            // t_gravity: letter sags downward, bottom stretches
            if (d.t_gravity > 0) {
                ny += dy * d.t_gravity * 0.8 + d.t_gravity * 80;
            }

            // t_explode: letter expands outward maintaining form
            if (d.t_explode > 0) {
                nx += (dx / dist) * d.t_explode * 200;
                ny += (dy / dist) * d.t_explode * 200;
            }

            // t_wave: letter oscillates like fabric
            if (d.t_wave > 0) {
                nx += Math.sin(t * 3 + v.oy * 0.02) * d.t_wave * 40;
                ny += Math.cos(t * 2 + v.ox * 0.015) * d.t_wave * 25;
            }

            // t_crystallize: snap to grid
            if (d.t_crystallize > 0) {
                const gridSize = 30 + (1-d.t_crystallize) * 70;
                nx = Math.round((nx * (1-d.t_crystallize) + Math.round(nx/gridSize)*gridSize * d.t_crystallize));
                ny = Math.round((ny * (1-d.t_crystallize) + Math.round(ny/gridSize)*gridSize * d.t_crystallize));
            }

            // t_spiral: vertices unwind along spiral
            if (d.t_spiral > 0) {
                const spiralAngle = angle + d.t_spiral * (dist / 50);
                const spiralDist  = dist * (1 + d.t_spiral * 0.5);
                nx = nx * (1 - d.t_spiral) + (cmX + Math.cos(spiralAngle) * spiralDist) * d.t_spiral;
                ny = ny * (1 - d.t_spiral) + (cmY + Math.sin(spiralAngle) * spiralDist) * d.t_spiral;
            }

            // t_dissolve: vertices drift in random directions
            if (d.t_dissolve > 0) {
                const drift = d.t_dissolve * 120;
                nx += Math.sin(i * 7.3 + t * 0.5) * drift;
                ny += Math.cos(i * 3.7 + t * 0.4) * drift;
            }

            // t_mycelium: snap motion to 60° angles (mycelial growth)
            if (d.g_mycelium > 0 || d.t_mycelium > 0) {
                const strength = d.t_mycelium || 0;
                const snapAngle = Math.round(angle / (Math.PI/3)) * (Math.PI/3);
                const snapDist  = dist * (1 + strength * 0.4);
                nx = nx * (1 - strength) + (cmX + Math.cos(snapAngle) * snapDist) * strength;
                ny = ny * (1 - strength) + (cmY + Math.sin(snapAngle) * snapDist) * strength;
            }

            v.x = nx; v.y = ny;
        });
    }

    _drawTransformed(p, vs, d, dom, domStr, R, G, B, alpha, alphaS, t, cmX, cmY) {
        const ctx = p.drawingContext;

        // ── t_particle / t_dissolve: letter becomes floating dust ──
        if (dom === 'particle' || dom === 'dissolve') {
            p.noStroke();
            vs.forEach((v, i) => {
                if (i % 2 === 0) {
                    const sz  = rand(1, (d.strokeW||2) * domStr * 4);
                    const a   = alpha * rand(0.4, 1.0);
                    p.fill(R, G, B, a);
                    p.circle(v.x, v.y, sz);
                }
            });
            return;
        }

        // ── t_glow: letter becomes pure light ──
        if (dom === 'glow') {
            ctx.shadowColor = `rgba(${R},${G},${B},0.9)`;
            ctx.shadowBlur  = domStr * 60;
            p.noStroke();
            p.fill(R, G, B, alpha * 0.4);
            const step = Math.max(5, Math.floor(vs.length/40));
            const pts  = vs.filter((_,i) => i%step===0);
            p.beginShape(); pts.forEach(v => p.curveVertex(v.x, v.y)); p.endShape(p.CLOSE);
            ctx.shadowBlur = 0;
            // Individual glowing nodes
            ctx.shadowColor = `rgba(${R},${G},${B},0.95)`; ctx.shadowBlur = 20;
            p.fill(R, G, B, alpha); p.noStroke();
            vs.forEach((v,i) => { if(i%8===0) p.circle(v.x, v.y, 4); });
            ctx.shadowBlur = 0;
            return;
        }

        // ── t_fragment: crystal shatter ──
        if (dom === 'fragment') {
            p.noStroke();
            for (let i = 0; i < vs.length - 4; i += 5) {
                const shade = rand(0.5, 1.0);
                p.fill(R*shade, G*shade, B*shade, alpha * rand(0.6, 1.0));
                p.triangle(vs[i].x, vs[i].y, vs[i+1].x, vs[i+1].y, vs[i+3].x, vs[i+3].y);
            }
            p.noFill(); p.stroke(R, G, B, alphaS * 0.4); p.strokeWeight(0.6);
            vs.forEach((v,i) => { if(i<vs.length-1) p.line(v.x,v.y,vs[i+1].x,vs[i+1].y); });
            return;
        }

        // ── t_explode: radial scatter, form preserved as constellation ──
        if (dom === 'explode') {
            p.noStroke(); p.fill(R, G, B, alpha * 0.6);
            vs.forEach((v,i) => { if(i%3===0) p.circle(v.x, v.y, (d.strokeW||2)*rand(0.5,1.5)); });
            p.stroke(R, G, B, alphaS * 0.25); p.strokeWeight(0.5);
            for (let i=0; i<vs.length; i+=4) {
                const j = (i + Math.floor(vs.length/6)) % vs.length;
                p.line(vs[i].x, vs[i].y, vs[j].x, vs[j].y);
            }
            return;
        }

        // ── t_gravity: dripping form ──
        if (dom === 'gravity') {
            // Membrane below (drip pool)
            p.noStroke(); p.fill(R, G, B, alpha * 0.5);
            const step = Math.max(4, Math.floor(vs.length/50));
            const pts = vs.filter((_,i) => i%step===0);
            p.beginShape(); pts.forEach(v => p.curveVertex(v.x, v.y)); p.endShape(p.CLOSE);
            // Drip strands
            p.stroke(R, G, B, alphaS * 0.6); p.strokeWeight(d.strokeW * 0.4);
            vs.forEach((v,i) => {
                if (i % 7 === 0 && v.oy > cmY) {
                    p.line(v.ox, v.oy, v.x, v.y + Math.sin(t*3+i)*10);
                }
            });
            return;
        }

        // ── t_wave: oscillating fabric ──
        if (dom === 'wave') {
            const step = Math.max(5, Math.floor(vs.length/45));
            const pts = vs.filter((_,i) => i%step===0);
            p.noFill(); p.stroke(R, G, B, alphaS); p.strokeWeight(d.strokeW * 0.6);
            p.beginShape(); pts.forEach(v => p.curveVertex(v.x, v.y)); p.endShape(p.CLOSE);
            p.noStroke(); p.fill(R, G, B, alpha * 0.2);
            p.beginShape(); pts.forEach(v => p.curveVertex(v.x, v.y)); p.endShape(p.CLOSE);
            return;
        }

        // ── t_crystallize: geometric facets ──
        if (dom === 'crystallize') {
            p.noStroke(); p.fill(R, G, B, alpha * 0.5);
            p.beginShape(); vs.forEach(v => p.vertex(v.x, v.y)); p.endShape(p.CLOSE);
            p.noFill(); p.stroke(R, G, B, alphaS); p.strokeWeight(1);
            for (let i=0; i<vs.length; i+=6) {
                const j = (i + Math.floor(vs.length/4)) % vs.length;
                p.line(vs[i].x, vs[i].y, vs[j].x, vs[j].y);
            }
            return;
        }

        // ── t_spiral: unwinding form ──
        if (dom === 'spiral') {
            p.noFill(); p.stroke(R, G, B, alphaS); p.strokeWeight(d.strokeW * 0.5);
            p.beginShape(); vs.forEach(v => p.curveVertex(v.x, v.y)); p.endShape();
            p.noStroke(); p.fill(R, G, B, alpha * 0.4);
            vs.forEach((v,i) => { if(i%5===0) p.circle(v.x,v.y,(d.strokeW||2)*0.8); });
            return;
        }

        // ── t_mycelium: branching fiber network ──
        if (dom === 'mycelium') {
            p.stroke(R, G, B, alphaS * 0.6); p.strokeWeight(0.8);
            for (let i=0; i<vs.length; i+=3) {
                const j = (i + Math.floor(vs.length/5)) % vs.length;
                p.line(vs[i].x, vs[i].y, vs[j].x, vs[j].y);
            }
            p.noStroke(); p.fill(R, G, B, alpha * 0.7);
            vs.forEach((v,i) => { if(i%6===0) p.circle(v.x,v.y,3+domStr*3); });
            return;
        }

        // ── t_echo: phantom echoes ──
        if (dom === 'echo') {
            const step = Math.max(6, Math.floor(vs.length/35));
            const pts = vs.filter((_,i) => i%step===0);
            for (let echo=0; echo<=3; echo++) {
                const scale = 1 + echo * 0.12 * domStr;
                const a = (alpha/(echo+1)) * 0.6;
                p.noFill(); p.stroke(R, G, B, a); p.strokeWeight(1 + echo * 0.5);
                p.push(); p.scale(scale);
                p.beginShape(); pts.forEach(v => p.curveVertex(v.x/scale, v.y/scale)); p.endShape(p.CLOSE);
                p.pop();
            }
            return;
        }

        // ── t_tripod: 3 structural anchors ──
        if (dom === 'tripod') {
            const step = Math.max(1, Math.floor(vs.length/3));
            const anchors = [vs[0], vs[Math.floor(vs.length/3)], vs[Math.floor(2*vs.length/3)]];
            p.stroke(R, G, B, alphaS * 0.4); p.strokeWeight(d.strokeW * 0.4);
            vs.forEach((v,i) => {
                const closest = anchors.reduce((c,a) => Math.hypot(a.x-v.x,a.y-v.y) < Math.hypot(c.x-v.x,c.y-v.y) ? a : c, anchors[0]);
                p.line(v.x, v.y, closest.x, closest.y);
            });
            p.noStroke(); p.fill(R, G, B, alpha);
            anchors.forEach(a => p.circle(a.x, a.y, 14 + domStr * 20));
            return;
        }

        // ── DEFAULT fallback: membrane ──
        const step = Math.max(5, Math.floor(vs.length/50));
        const pts = vs.filter((_,i) => i%step===0);
        p.noStroke(); p.fill(R, G, B, alpha * 0.6);
        p.beginShape(); pts.forEach(v => p.curveVertex(v.x, v.y)); p.endShape(p.CLOSE);
    }
}

// ─────────────────────────────────────────────────────────────────────
// TYPO UNIVERSE
// ─────────────────────────────────────────────────────────────────────
class TypoUniverse {
    constructor(p) { this.p = p; this.history = []; this.initUI(); this.initInteraction(); }

    addAtom() {
        this.history.push([...APP_STATE.atoms]);
        const font = FONTS.length ? FONTS[Math.floor(Math.random() * FONTS.length)] : null;
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

        // Use the DOMINANT parent's vertices as base form
        const dominant = moved.vertices.length >= other.vertices.length ? moved : other;
        const recessive = dominant === moved ? other : moved;

        // Mix vertex clouds (mostly dominant, some recessive)
        const childVerts = [
            ...dominant.vertices,
            ...recessive.vertices.filter((_, i) => i % 3 === 0)
        ];
        while (childVerts.length > 450) childVerts.splice(Math.floor(Math.random()*childVerts.length), 1);

        const childDna = DNA.fuse(moved.dna, other.dna);

        const child = new LivingTypo(this.p, '?', null, {
            x:        (moved.x + other.x) / 2,
            y:        (moved.y + other.y) / 2,
            char:     dominant.char,   // inherits letter from dominant parent
            fontName: `${moved.fontName}×${other.fontName}`,
            gen:      Math.max(moved.gen, other.gen) + 1,
            dna:      childDna,
            vertices: childVerts,
            fontObj:  dominant.fontObj
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
        let dragged=null, panning=false, lx=0, ly=0;
        const toWorld = (cx,cy) => ({
            wx: (cx-this.p.width/2-APP_STATE.view.x)/APP_STATE.view.zoom,
            wy: (cy-this.p.height/2-APP_STATE.view.y)/APP_STATE.view.zoom
        });
        const onStart = (cx,cy,target) => {
            if (target.closest('.ui-overlay')) return;
            const {wx,wy} = toWorld(cx,cy);
            dragged = APP_STATE.atoms.find(a => Math.hypot(a.x-wx, a.y-wy) < 320/APP_STATE.view.zoom)||null;
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
            const [dom] = a.dominantTransform;
            const info = TRANSFORMATIONS.find(t => t.id === dom);
            const sub = d.gen === 1
                ? d.textStyle
                : (info ? `${info.label} · ${info.domain}` : '…');
            return `<li class="molecule-item" data-atom-id="${a.atomId}"
                style="cursor:pointer;display:flex;align-items:center;gap:10px;padding:8px 6px;
                border-bottom:1px solid rgba(255,255,255,0.05);transition:background 0.2s"
                onmouseenter="this.style.background='rgba(255,255,255,0.07)'"
                onmouseleave="this.style.background='none'">
                <span style="width:11px;height:11px;border-radius:50%;flex-shrink:0;
                    background:rgb(${R},${G},${B});
                    box-shadow:0 0 ${d.gen>1?10:4}px rgb(${R},${G},${B})"></span>
                <div>
                    <div style="font-weight:700;font-size:0.82rem;
                        color:${d.gen>1?`rgb(${R},${G},${B})`:'#eee'}">
                        ${d.gen>1?'⚡':'○'} [${a.char}] G${a.gen}
                    </div>
                    <div style="opacity:0.4;font-size:0.6rem;margin-top:2px">${sub}</div>
                </div>
            </li>`;
        }).join('');
    }
}

// ─────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────
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
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => {
            const a=document.createElement('a');
            a.href=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));
            a.download='typolab.webm'; a.click(); chunks=[]; APP_STATE.isRecording=false;
        };
        recorder.start(); setTimeout(()=>recorder.stop(),4000);
    };
}

new p5(sketch);

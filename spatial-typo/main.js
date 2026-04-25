// ═══════════════════════════════════════════════════════════════════
// TYPOGRAPHY ALCHEMY ENGINE v44.0
// CORE PRINCIPLE:
//   p5.text() is the ONLY way to render a readable letter.
//   ALL atoms use p.text() as their base.
//   Transformations are visual overlays ON TOP of the clean letter.
//   textToPoints() is used ONLY to sample position data (never for paths).
// ═══════════════════════════════════════════════════════════════════
console.log("TypoLab v44.0 — TEXT-FIRST RENDERING | CLEAN LETTERS | DIVERSE TRANSFORMS");

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

function rand(a, b)   { return Math.random() * (b - a) + a; }
function pick(arr)    { return arr[Math.floor(Math.random() * arr.length)]; }
function clamp(v,a,b) { return Math.max(a, Math.min(b, v)); }
function lerp(a,b,t)  { return a + (b-a) * t; }

// Named transformations visible to the user
const T_IDS = ['gravity','explode','fragment','particle','wave','echo','glow','crystallize','spiral','tripod','mycelium','dissolve'];
const T_INFO = {
    gravity:     { label:'↓ Gravité',     domain:'physique'     },
    explode:     { label:'💥 Explosion',  domain:'physique'     },
    fragment:    { label:'◈ Fragment',    domain:'physique'     },
    particle:    { label:'✦ Particule',   domain:'biologie'     },
    wave:        { label:'〰 Vague',       domain:'physique'     },
    echo:        { label:'◌ Écho',        domain:'quantique'    },
    glow:        { label:'✨ Lumière',     domain:'quantique'    },
    crystallize: { label:'◆ Cristal',     domain:'math'         },
    spiral:      { label:'🌀 Spirale',    domain:'math'         },
    tripod:      { label:'⌂ Tripode',     domain:'artistique'   },
    mycelium:    { label:'🍄 Mycélium',   domain:'biologie'     },
    dissolve:    { label:'∿ Dissolution', domain:'biologie'     },
};

// ─────────────────────────────────────────────────────────────────────
// DNA
// ─────────────────────────────────────────────────────────────────────
class DNA {
    static gen1() {
        const d = {
            gen: 1,
            // Intrinsic visual properties
            fontSize:   rand(100, 420),
            scaleX:     rand(0.65, 1.4),
            scaleY:     rand(0.65, 1.4),
            rotation:   rand(-0.3, 0.3),
            opacity:    rand(0.55, 1.0),
            strokeW:    rand(0.5, 14),
            textStyle:  pick(['solid','outline','dual','shadow','glow_soft','outline_thick']),
            fxAnim:     pick(['breathe','pulse','hue_shift','static','static','static']),
            fxSpeed:    rand(0.3, 2.2),
            colorR: Math.random() * 255,
            colorG: Math.random() * 255,
            colorB: Math.random() * 255,
        };
        // All transformations = 0 at birth
        T_IDS.forEach(k => d['t_' + k] = 0);
        return d;
    }

    static fuse(A, B) {
        const child = { gen: Math.max(A.gen, B.gen) + 1 };

        // Color lineage: clearly inherited + small shift
        child.colorR = clamp((A.colorR + B.colorR) / 2 + rand(-30, 30), 0, 255);
        child.colorG = clamp((A.colorG + B.colorG) / 2 + rand(-30, 30), 0, 255);
        child.colorB = clamp((A.colorB + B.colorB) / 2 + rand(-30, 30), 0, 255);

        // Intrinsic
        child.fontSize  = clamp(((A.fontSize||200)+(B.fontSize||200))/2 + rand(-50,50), 80, 500);
        child.scaleX    = clamp(((A.scaleX||1)+(B.scaleX||1))/2 + rand(-0.15,0.15), 0.4, 2.0);
        child.scaleY    = clamp(((A.scaleY||1)+(B.scaleY||1))/2 + rand(-0.15,0.15), 0.4, 2.0);
        child.rotation  = lerp(A.rotation||0, B.rotation||0, 0.5) + rand(-0.08, 0.08);
        child.opacity   = clamp(((A.opacity||1)+(B.opacity||1))/2 + rand(-0.08,0.08), 0.2, 1.0);
        child.strokeW   = clamp(((A.strokeW||2)+(B.strokeW||2))/2 + rand(-3,3), 0.3, 20);
        child.textStyle = Math.random() > 0.5 ? A.textStyle : B.textStyle;
        child.fxAnim    = pick(['breathe','pulse','hue_shift','static','static']);
        child.fxSpeed   = rand(0.5, 3);

        // Inherit transformations (dominant gene stays)
        T_IDS.forEach(k => {
            const tk = 't_' + k;
            const av = A[tk] || 0, bv = B[tk] || 0;
            const max = Math.max(av, bv);
            child[tk] = max > 0.3
                ? clamp(max * rand(0.87, 1.1), 0, 2)   // dominant: preserved
                : clamp((av+bv)/2 * rand(0.5, 0.8), 0, 2); // recessive: fades
        });

        // Add ONE new transformation (pick what's weakest in both parents)
        const candidates = T_IDS.filter(k => (A['t_'+k]||0) < 0.35 && (B['t_'+k]||0) < 0.35);
        const target = candidates.length > 0 ? pick(candidates) : pick(T_IDS);
        child['t_' + target] = clamp((child['t_'+target]||0) + rand(0.45, 1.0), 0, 2);

        return child;
    }

    static dominantTransform(dna) {
        let best = null, bestVal = 0;
        T_IDS.forEach(k => {
            const v = dna['t_'+k] || 0;
            if (v > bestVal) { bestVal = v; best = k; }
        });
        return [best, bestVal];
    }
}

// ─────────────────────────────────────────────────────────────────────
// SKETCH
// ─────────────────────────────────────────────────────────────────────
const sketch = (p) => {
    // Use RETURN value, not callback — ensures fonts block preload correctly
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
        this.pts     = [];  // letter sample points (for particle/tripod effects only)

        if (parentData) {
            this.x       = parentData.x;
            this.y       = parentData.y;
            this.char    = parentData.char;
            this.fontName= parentData.fontName;
            this.dna     = parentData.dna;
            this.gen     = parentData.gen;
            this.fontObj = parentData.fontObj;
            this.pts     = parentData.pts || [];
        } else {
            this.x    = (Math.random()-0.5) * 1400;
            this.y    = (Math.random()-0.5) * 1000;
            const ch  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            this.char = char || ch[Math.floor(Math.random() * ch.length)];
            this.gen  = 1;
            const fnt = fontData || (FONTS.length ? FONTS[Math.floor(Math.random()*FONTS.length)] : null);
            this.fontName = fnt ? fnt.name : 'System';
            this.fontObj  = fnt ? fnt.obj : null;
            this.dna  = DNA.gen1();

            // Sample letter points for future overlay effects
            if (this.fontObj) this._samplePoints(this.dna.fontSize);
        }
    }

    _samplePoints(fs) {
        try {
            const b = this.fontObj.textBounds(this.char, 0, 0, fs);
            const raw = this.fontObj.textToPoints(
                this.char, -b.x - b.w/2, -b.y - b.h/2, fs,
                { sampleFactor: 0.08, simplifyThreshold: 0 }
            );
            // Store as plain {x,y} — only used for position data, never connected as path
            this.pts = raw.map(pt => ({ x: pt.x, y: pt.y, ox: pt.x, oy: pt.y }));
        } catch(e) { this.pts = []; }
    }

    draw(p) {
        this.frame++;
        const d   = this.dna;
        const t   = this.frame * 0.015 * (d.fxSpeed || 1);
        const pulse  = 0.5 + 0.5 * Math.sin(t);
        const pulse2 = 0.5 + 0.5 * Math.cos(t * 1.3);

        let R = d.colorR, G = d.colorG, B = d.colorB;
        if (d.fxAnim === 'hue_shift') {
            // Shift hue by rotating RGB
            const ang = t * 0.3;
            const cos = Math.cos(ang), sin = Math.sin(ang);
            const r = d.colorR, g = d.colorG, b = d.colorB;
            R = clamp(r*cos - g*sin*0.5 + b*sin*0.5, 0, 255);
            G = clamp(r*sin*0.5 + g*cos + b*sin*0.5, 0, 255);
            B = clamp(-r*sin*0.5 + g*sin*0.5 + b*cos, 0, 255);
        }
        const baseAlpha = (d.opacity||1) * 255 * (d.fxAnim === 'breathe' ? (0.5 + pulse * 0.5) : 1);
        const strokeMod = d.fxAnim === 'pulse' ? (0.5 + pulse2 * 0.5) : 1;

        const [dom, domStr] = DNA.dominantTransform(d);
        // How much has this letter transformed? (0 = pure letter, 1+ = strong transform)
        const totalT = T_IDS.reduce((s, k) => s + (d['t_'+k]||0), 0);

        p.push();
        p.translate(this.x, this.y);
        p.rotate(d.rotation || 0);
        p.scale(d.scaleX || 1, d.scaleY || 1);

        if (!this.fontObj) { p.pop(); return; }

        p.textAlign(p.CENTER, p.CENTER);
        p.textFont(this.fontObj);
        p.textSize(d.fontSize || 250);
        const ctx = p.drawingContext;

        // ════════════════════════════════════════════════════
        // BASE LETTER — always rendered as clean canvas text
        // Opacity decreases slightly as transformation gets stronger
        // but never below 30% — always recognizable
        // ════════════════════════════════════════════════════
        const baseOpacityMod = clamp(1 - totalT * 0.15, 0.3, 1.0);
        const letterAlpha = baseAlpha * baseOpacityMod;

        switch (d.textStyle) {
            case 'solid':
                p.noStroke();
                p.fill(R, G, B, letterAlpha);
                p.text(this.char, 0, 0);
                break;
            case 'outline':
                p.noFill();
                p.stroke(R, G, B, letterAlpha);
                p.strokeWeight(d.strokeW);
                p.text(this.char, 0, 0);
                break;
            case 'outline_thick':
                p.noFill();
                p.stroke(R, G, B, letterAlpha * 0.2); p.strokeWeight(d.strokeW * 4);
                p.text(this.char, 0, 0);
                p.stroke(R, G, B, letterAlpha); p.strokeWeight(d.strokeW * 0.8);
                p.text(this.char, 0, 0);
                break;
            case 'dual':
                p.fill(R, G, B, letterAlpha * 0.45);
                p.stroke(R, G, B, letterAlpha); p.strokeWeight(d.strokeW * 0.5);
                p.text(this.char, 0, 0);
                break;
            case 'shadow':
                ctx.shadowColor = `rgba(${R},${G},${B},0.85)`;
                ctx.shadowBlur  = 24;
                p.noStroke(); p.fill(R, G, B, letterAlpha);
                p.text(this.char, 0, 0);
                ctx.shadowBlur = 0;
                break;
            case 'glow_soft':
                for (let pass=3; pass>=0; pass--) {
                    ctx.shadowColor = `rgba(${R},${G},${B},${0.85-pass*0.16})`;
                    ctx.shadowBlur  = 55 - pass * 12;
                    p.noStroke(); p.fill(R, G, B, pass===0 ? letterAlpha : letterAlpha*0.12);
                    p.text(this.char, 0, 0);
                }
                ctx.shadowBlur = 0;
                break;
        }

        // ════════════════════════════════════════════════════
        // TRANSFORMATION OVERLAYS
        // Each transformation adds its UNIQUE visual effect
        // on top of (or around) the clean letter
        // ════════════════════════════════════════════════════
        if (!dom || domStr < 0.05) { p.pop(); return; }

        const fx  = domStr;
        const fs  = d.fontSize || 250;
        const bnd = this.fontObj.textBounds(this.char, 0, 0, fs);
        const W   = bnd.w || fs * 0.6;
        const H   = bnd.h || fs * 0.7;

        switch (dom) {

            case 'gravity': {
                // Letter "drips" — copies slide down with decreasing opacity
                for (let drip=1; drip<=5; drip++) {
                    const dy    = drip * fx * 35;
                    const dalpha = letterAlpha * (0.35 - drip * 0.06);
                    if (dalpha < 5) break;
                    const scl = 1 + drip * fx * 0.05;
                    ctx.shadowColor = `rgba(${R},${G},${B},0.4)`;
                    ctx.shadowBlur  = drip * 5;
                    p.noStroke(); p.fill(R, G, B, dalpha);
                    p.push(); p.scale(1, scl); p.text(this.char, drip * fx * 3, dy); p.pop();
                }
                ctx.shadowBlur = 0;
                // Drip streaks from letter bottom
                p.stroke(R, G, B, letterAlpha * 0.5 * strokeMod);
                p.strokeWeight(d.strokeW * 0.3);
                const nDrips = Math.floor(fx * 12);
                for (let i=0; i<nDrips; i++) {
                    const bx = (i/nDrips - 0.5) * W * 0.8;
                    const by = H * 0.4;
                    const len = fx * rand(20, 80);
                    const wave = Math.sin(t * 2 + i * 1.2) * fx * 8;
                    p.line(bx + wave, by, bx + wave * 0.5, by + len);
                }
                break;
            }

            case 'explode': {
                // Letter appears to burst — offset copies fly outward
                const nCopies = 6;
                for (let i=0; i<nCopies; i++) {
                    const angle = (i/nCopies) * Math.PI * 2 + t * 0.3;
                    const dist  = fx * (40 + i * 20) + Math.sin(t+i) * 10;
                    const frag_alpha = letterAlpha * (0.35 - dist/500);
                    if (frag_alpha < 3) continue;
                    const sc = 1 - fx * 0.3 + i * 0.04;
                    p.push();
                    p.translate(Math.cos(angle)*dist, Math.sin(angle)*dist);
                    p.scale(sc);
                    p.noStroke(); p.fill(R, G, B, frag_alpha);
                    p.text(this.char, 0, 0);
                    p.pop();
                }
                // Radial lines from center
                p.stroke(R, G, B, letterAlpha * 0.3); p.strokeWeight(1);
                const nLines = Math.floor(fx * 16);
                for (let i=0; i<nLines; i++) {
                    const ang = (i/nLines)*Math.PI*2;
                    p.line(0, 0, Math.cos(ang)*W*0.5*fx, Math.sin(ang)*H*0.5*fx);
                }
                break;
            }

            case 'fragment': {
                // Letter seems to crack — geometric fault lines drawn over it
                p.noFill();
                const nCracks = Math.floor(fx * 10 + 3);
                for (let i=0; i<nCracks; i++) {
                    const angle = rand(0, Math.PI * 2);
                    const len   = rand(W * 0.2, W * 0.8) * fx;
                    const sx    = rand(-W*0.4, W*0.4), sy = rand(-H*0.4, H*0.4);
                    p.stroke(R, G, B, letterAlpha * rand(0.3, 0.8));
                    p.strokeWeight(rand(0.5, d.strokeW * 0.8));
                    p.line(sx, sy, sx + Math.cos(angle)*len, sy + Math.sin(angle)*len);
                }
                // Micro-echo of letter shifted
                const shiftX = Math.sin(t*0.5) * fx * 8;
                const shiftY = Math.cos(t*0.7) * fx * 5;
                p.noStroke(); p.fill(R, G, B, letterAlpha * 0.2 * fx);
                p.text(this.char, shiftX, shiftY);
                break;
            }

            case 'particle': {
                // Letter surrounded by dots sampled from its own form
                if (this.pts.length === 0 && this.fontObj) this._samplePoints(fs);
                const spread = fx * 60;
                p.noStroke();
                this.pts.forEach((pt, i) => {
                    if (i % 2 !== 0) return;
                    const drift_x = Math.sin(i * 3.7 + t * 0.8) * spread;
                    const drift_y = Math.cos(i * 2.3 + t * 0.6) * spread;
                    const sz      = rand(1, d.strokeW * fx * 1.5);
                    const a       = letterAlpha * rand(0.3, 0.9) * fx;
                    p.fill(R, G, B, a);
                    p.circle(pt.x + drift_x, pt.y + drift_y, sz);
                });
                break;
            }

            case 'wave': {
                // Multiple wave-shifted copies of the letter, very transparent
                const nWaves = 4;
                for (let i=1; i<=nWaves; i++) {
                    const wAlpha = letterAlpha * (0.18 * fx - i * 0.03);
                    if (wAlpha < 2) break;
                    const offX = Math.sin(t * 2 + i * 1.1) * fx * 25;
                    const offY = Math.sin(t * 1.5 + i * 0.8) * fx * 15;
                    p.noStroke(); p.fill(R, G, B, wAlpha);
                    p.push(); p.translate(offX, offY); p.text(this.char, 0, 0); p.pop();
                }
                // Oscillating underline wave
                p.noFill(); p.stroke(R, G, B, letterAlpha * 0.5 * fx); p.strokeWeight(d.strokeW * 0.4);
                p.beginShape();
                for (let wx = -W*0.6; wx <= W*0.6; wx += 4) {
                    const wy = H * 0.55 + Math.sin(wx * 0.05 + t * 3) * fx * 18;
                    p.curveVertex(wx, wy);
                }
                p.endShape();
                break;
            }

            case 'echo': {
                // Concentric ghost copies — rings of the same letter
                const nEchos = Math.min(5, Math.round(fx * 5));
                for (let i=nEchos; i>=1; i--) {
                    const sc     = 1 + i * fx * 0.18;
                    const eAlpha = letterAlpha * (0.25 - i * 0.04) * fx;
                    if (eAlpha < 3) continue;
                    ctx.shadowColor = `rgba(${R},${G},${B},0.3)`;
                    ctx.shadowBlur  = i * 8;
                    p.noStroke(); p.fill(R, G, B, eAlpha);
                    p.push(); p.scale(sc); p.text(this.char, 0, 0); p.pop();
                }
                ctx.shadowBlur = 0;
                break;
            }

            case 'glow': {
                // Intense luminous halo — letter becomes light itself
                for (let pass=6; pass>=0; pass--) {
                    ctx.shadowColor = `rgba(${R},${G},${B},${0.9 - pass*0.1})`;
                    ctx.shadowBlur  = (80 - pass*8) * fx;
                    p.noStroke(); p.fill(R, G, B, pass===0 ? letterAlpha : letterAlpha * 0.05 * fx);
                    p.text(this.char, 0, 0);
                }
                ctx.shadowBlur = 0;
                break;
            }

            case 'crystallize': {
                // Geometric grid lines overlay — crystal facet pattern
                const grid = Math.max(10, 60 - fx * 40);
                p.stroke(R, G, B, letterAlpha * 0.3 * fx); p.strokeWeight(0.5);
                for (let gx = -W*0.6; gx <= W*0.6; gx += grid) {
                    p.line(gx, -H*0.6, gx, H*0.6);
                }
                for (let gy = -H*0.6; gy <= H*0.6; gy += grid) {
                    p.line(-W*0.6, gy, W*0.6, gy);
                }
                // Diagonal lattice
                p.stroke(R, G, B, letterAlpha * 0.15 * fx);
                for (let d_=0; d_<5; d_++) {
                    const off = (d_-2) * grid * 2;
                    p.line(-W*0.6+off, -H*0.6, W*0.6+off, H*0.6);
                }
                break;
            }

            case 'spiral': {
                // Spiral trace emanates from letter center
                p.noFill(); p.stroke(R, G, B, letterAlpha * 0.6 * fx);
                p.strokeWeight(d.strokeW * 0.4);
                p.beginShape();
                const turns = 3 + fx * 4;
                const maxR  = W * 0.7 * fx;
                for (let ang=0; ang<turns*Math.PI*2; ang+=0.08) {
                    const r   = (ang/(turns*Math.PI*2)) * maxR;
                    const sx  = Math.cos(ang + t) * r;
                    const sy  = Math.sin(ang + t) * r;
                    p.curveVertex(sx, sy);
                }
                p.endShape();
                break;
            }

            case 'tripod': {
                // Three dominant structural anchor points with lines
                const anchors = [
                    { x: 0,        y: -H*0.5 },
                    { x: -W*0.45,  y:  H*0.4 },
                    { x:  W*0.45,  y:  H*0.4 }
                ];
                p.stroke(R, G, B, letterAlpha * 0.5 * fx); p.strokeWeight(d.strokeW * 0.5);
                for (let i=0; i<anchors.length; i++) {
                    for (let j=i+1; j<anchors.length; j++) {
                        p.line(anchors[i].x, anchors[i].y, anchors[j].x, anchors[j].y);
                    }
                }
                // Anchor nodes
                p.noStroke();
                anchors.forEach(a => {
                    ctx.shadowColor = `rgba(${R},${G},${B},0.8)`; ctx.shadowBlur = 15;
                    p.fill(R, G, B, letterAlpha);
                    p.circle(a.x, a.y, 8 + fx * 12);
                });
                ctx.shadowBlur = 0;
                // Extension lines to bounding box
                p.stroke(R, G, B, letterAlpha * 0.2 * fx); p.strokeWeight(0.6);
                anchors.forEach(a => {
                    p.line(a.x, a.y, a.x + Math.cos(t+a.x)*W*0.3*fx, a.y + Math.sin(t+a.y)*H*0.3*fx);
                });
                break;
            }

            case 'mycelium': {
                // Branching fiber network grows outward from letter
                const nBranches = Math.floor(fx * 14 + 4);
                p.stroke(R, G, B, letterAlpha * 0.55 * fx); p.strokeWeight(0.7);
                for (let i=0; i<nBranches; i++) {
                    const startAng = (i/nBranches) * Math.PI * 2;
                    const startR   = W * 0.35;
                    let bx = Math.cos(startAng) * startR;
                    let by = Math.sin(startAng) * startR;
                    for (let step=0; step<5; step++) {
                        const snapAng = Math.round(startAng / (Math.PI/3)) * (Math.PI/3) + step * 0.2;
                        const segLen  = rand(15, 40) * fx;
                        const ex = bx + Math.cos(snapAng) * segLen;
                        const ey = by + Math.sin(snapAng) * segLen;
                        p.line(bx, by, ex, ey);
                        p.noStroke(); p.fill(R, G, B, letterAlpha * 0.4 * fx);
                        p.circle(ex, ey, 3 + fx * 3);
                        p.stroke(R, G, B, letterAlpha * 0.4 * fx); p.strokeWeight(0.5);
                        bx = ex; by = ey;
                    }
                }
                break;
            }

            case 'dissolve': {
                // Particles drift away from letter shape
                if (this.pts.length === 0 && this.fontObj) this._samplePoints(fs);
                const maxSpread = fx * 100;
                p.noStroke();
                this.pts.forEach((pt, i) => {
                    if (i % 3 !== 0) return;
                    const angle = i * 2.399; // golden angle for even distribution
                    const drift = maxSpread * rand(0, 1);
                    const px = pt.x + Math.cos(angle) * drift;
                    const py = pt.y + Math.sin(angle) * drift;
                    const a = letterAlpha * (1 - drift/maxSpread) * 0.5;
                    p.fill(R, G, B, a);
                    p.circle(px, py, d.strokeW * rand(0.3, 1.2));
                });
                break;
            }
        }

        p.pop();
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
        const other = APP_STATE.atoms.find(o => o !== moved && Math.hypot(o.x-moved.x, o.y-moved.y) < 210);
        if (!other) return;
        this.history.push([...APP_STATE.atoms]);

        // Dominant parent provides letter form
        const dom = moved.pts.length >= other.pts.length ? moved : other;
        const rec = dom === moved ? other : moved;
        // Merge sample points (dom major, rec minor)
        const mergedPts = [
            ...dom.pts,
            ...rec.pts.filter((_,i) => i%4===0)
        ];

        const child = new LivingTypo(this.p, '?', null, {
            x:       (moved.x + other.x) / 2,
            y:       (moved.y + other.y) / 2,
            char:    dom.char,
            fontName:`${moved.fontName}×${other.fontName}`,
            gen:     Math.max(moved.gen, other.gen) + 1,
            dna:     DNA.fuse(moved.dna, other.dna),
            fontObj: dom.fontObj,
            pts:     mergedPts
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
            const [dom] = DNA.dominantTransform(d);
            const info = dom ? T_INFO[dom] : null;
            const sub = d.gen === 1 ? d.textStyle : (info ? `${info.label} · ${info.domain}` : '…');
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

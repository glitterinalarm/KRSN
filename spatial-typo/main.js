// Typography Lab - Omniversal Diversity Engine v32.0
console.log("TypoLab Engine v32.0 - ABSOLUTE GRAPHIC DIVERSITY");

const APP_STATE = { atoms: [], view: { x: 0, y: 0, zoom: 1 }, isRecording: false };

const FONT_SOURCES = [
    { name: 'Roboto', url: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-black-webfont.ttf' },
    { name: 'SourceSans', url: 'https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceSansPro-Black.otf' },
    { name: 'SourceCode', url: 'https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf' },
    { name: 'RobotoLight', url: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf' }
];
const FONTS = [];

function powerRand(p = 3) { return Math.pow(Math.random(), p); }

class Genome {
    static createRandom() {
        // To ensure diversity, we use a "Profile" system
        // Each letter will only have a few active visual 'modules'
        return {
            // BEHAVIORS
            g_speed: Math.random() * 4 + 0.1,
            g_amplitude: Math.random() * 3 + 0.5,
            g_friction: 0.75 + Math.random() * 0.2,
            cohesion: 0.6 + Math.random() * 0.4, // Increased default cohesion for legibility
            
            // TOPOLOGY
            v_resolution: Math.random() * 0.1 + 0.05,
            v_roughness: powerRand(4) * 50, // Reduced default roughness
            
            // VISUAL MODULES (Probabilistic activation for diversity)
            // Old school phenotypes
            m_neural: Math.random() > 0.7 ? Math.random() : 0,
            m_membrane: Math.random() > 0.6 ? Math.random() : 0,
            m_spine: Math.random() > 0.5 ? Math.random() : 0,
            m_spores: Math.random() > 0.8 ? Math.random() : 0,
            m_sharp: Math.random() > 0.8 ? Math.random() : 0,

            // Art History phenotypes
            m_baroque: Math.random() > 0.9 ? Math.random() : 0,
            m_suprematist: Math.random() > 0.9 ? Math.random() : 0,
            m_futurist: Math.random() > 0.8 ? Math.random() : 0,
            m_dada: Math.random() > 0.95 ? Math.random() : 0,
            
            // Physics/Math phenotypes
            m_echo: Math.random() > 0.8 ? Math.random() : 0,
            m_glitch: Math.random() > 0.9 ? Math.random() : 0,
            m_ghost: Math.random() > 0.9 ? Math.random() : 0,

            // FORCES
            f_plasma: powerRand(2),
            f_harmonic: powerRand(3),
            f_charge: (Math.random()-0.5) * 4,
            f_vortex: powerRand(4),

            // STYLE
            v_strokeW: Math.random() * 10 + 0.1,
            v_dashA: Math.random() > 0.8 ? Math.random() * 50 : 0,
            v_dashB: Math.random() * 20,
            v_alphaF: Math.random() * 200,
            v_alphaS: Math.random() * 200 + 50,
            blend_additive: Math.random() > 0.8,
            colorR: Math.random()*255, colorG: Math.random()*255, colorB: Math.random()*255
        };
    }

    static merge(A, B) {
        let child = {};
        for(let k in (Object.keys(A).length ? A : B)) {
            if (typeof A[k] === 'boolean') child[k] = Math.random() > 0.5 ? A[k] : B[k];
            else {
                child[k] = (A[k] || 0) * 0.5 + (B[k] || 0) * 0.5;
                child[k] += (Math.random()-0.5) * (child[k]||1) * 0.8; // Mutation
                if(k.startsWith('v_alpha') || k.startsWith('color')) child[k] = Math.max(0, Math.min(255, child[k]));
                if(k.startsWith('g_friction')) child[k] = Math.max(0.6, Math.min(0.99, child[k]));
                child[k] = Math.max(0, child[k]); 
            }
        }
        child.cohesion *= 0.7; // Gradual decay but slower than before
        return child;
    }
}

const sketch = (p) => {
    p.preload = () => { FONT_SOURCES.forEach(f => p.loadFont(f.url, (font) => FONTS.push({ name: f.name, obj: font }))); };

    p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight).parent('stage');
        document.getElementById('loader').classList.add('hidden');
        window.typoUniverse = new TypoUniverse(p);
        injectExportUI(p);
        for(let i=0; i<7; i++) window.typoUniverse.addAtom();
    };

    p.draw = () => {
        p.background(6, 6, 9);
        p.push(); p.translate(p.width/2 + APP_STATE.view.x, p.height/2 + APP_STATE.view.y); p.scale(APP_STATE.view.zoom);
        APP_STATE.atoms.forEach(atom => { atom.update(); atom.draw(); });
        p.pop();
        if (APP_STATE.isRecording) { p.push(); p.fill(255,0,0); p.circle(50, 50, 20); p.fill(255); p.text("REC", 70, 50); p.pop(); }
    };
    p.windowResized = () => p.resizeCanvas(window.innerWidth, window.innerHeight);
};

class LivingTypo {
    constructor(p, char, fontData, parentData = null) {
        this.p = p; this.id = Math.random(); this.vertices = [];
        if (parentData) {
            this.x = parentData.x; this.y = parentData.y; this.char = parentData.char; this.fontName = parentData.fontName;
            this.dna = parentData.dna; this.gen = parentData.gen;
            parentData.vertices.forEach(v => this.vertices.push({ pos: v.pos.copy(), basePos: p.createVector(v.pos.x, v.pos.y), vel: p.createVector(0,0) }));
        } else {
            this.x = (Math.random()-0.5)*1200; this.y = (Math.random()-0.5)*1200;
            const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#@$%&*";
            this.char = char || alphabet[Math.floor(Math.random() * alphabet.length)];
            this.gen = 1; this.dna = Genome.createRandom();
            let font = fontData || (FONTS.length > 0 ? FONTS[Math.floor(Math.random()*FONTS.length)] : null);
            this.fontName = font ? font.name : "System";
            if (font && font.obj) {
                let b = font.obj.textBounds(this.char, 0, 0, 500);
                let pts = font.obj.textToPoints(this.char, -b.x - b.w/2, -b.y - b.h/2, 500, { sampleFactor: this.dna.v_resolution });
                pts.forEach(pt => {
                    let nx = pt.x + (Math.random()-0.5)*this.dna.v_roughness;
                    let ny = pt.y + (Math.random()-0.5)*this.dna.v_roughness;
                    this.vertices.push({ pos: p.createVector(nx, ny), basePos: p.createVector(nx, ny), vel: p.createVector(0,0) });
                });
            }
        }
        while(this.vertices.length > 400) this.vertices.splice(Math.floor(Math.random()*this.vertices.length), 1);
    }

    update() {
        let t = this.p.frameCount * 0.01 * this.dna.g_speed;
        let d = this.dna; let amp = d.g_amplitude;
        let cmX=0, cmY=0; this.vertices.forEach(v => { cmX+=v.pos.x; cmY+=v.pos.y; });
        let center = this.p.createVector(cmX/this.vertices.length, cmY/this.vertices.length);

        for (let v of this.vertices) {
            let force = this.p.createVector(0, 0);
            if (d.f_plasma > 0.01) force.add(p5.Vector.fromAngle(this.p.noise(v.pos.x*0.005+t, v.pos.y*0.005)*this.p.TWO_PI*4).mult(d.f_plasma*amp));
            if (d.f_harmonic > 0.01) { force.x += Math.sin(t + v.pos.y*0.01)*d.f_harmonic*amp*5; force.y += Math.cos(t*1.2 + v.pos.x*0.01)*d.f_harmonic*amp*5; }
            if (Math.abs(d.f_charge) > 0.01) force.add(p5.Vector.sub(v.pos, center).normalize().mult(d.f_charge*amp));
            if (d.f_vortex > 0.01) { let diff = p5.Vector.sub(v.pos, center); force.add(new p5.Vector(-diff.y, diff.x).normalize().mult(d.f_vortex*amp*5)); }
            
            v.vel.add(force); v.vel.add(p5.Vector.sub(v.basePos, v.pos).mult(d.cohesion*0.04));
            v.vel.mult(d.g_friction); v.pos.add(v.vel);
            if (d.cohesion < 1) v.basePos.add(this.p.createVector(Math.random()-0.5, Math.random()-0.5).mult((1-d.cohesion)*amp*5));
        }
    }

    draw() {
        let p = this.p; let d = this.dna; p.push(); p.translate(this.x, this.y);
        if (d.blend_additive) p.blendMode(p.ADD);

        // --- DIVERSITY RENDERER ---
        
        // 1. MEMBRANE (Old)
        if (d.m_membrane > 0.01) {
            p.noStroke(); p.fill(d.colorR, d.colorG, d.colorB, d.v_alphaF * d.m_membrane);
            p.beginShape(); this.vertices.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape();
        }

        // 2. SPINE (Old)
        if (d.m_spine > 0.01) {
            p.noFill(); p.stroke(d.colorR, d.colorG, d.colorB, d.v_alphaS * d.m_spine);
            p.strokeWeight(d.v_strokeW * d.m_spine);
            if (d.v_dashA > 1) p.drawingContext.setLineDash([d.v_dashA, d.v_dashB]);
            p.beginShape(); this.vertices.forEach(v => p.vertex(v.pos.x, v.pos.y)); p.endShape();
            p.drawingContext.setLineDash([]);
        }

        // 3. NEURAL (Old)
        if (d.m_neural > 0.01) {
            p.stroke(d.colorR, d.colorG, d.colorB, d.v_alphaS * d.m_neural * 0.4);
            p.strokeWeight(0.5);
            let limit = 80 * d.m_neural;
            for(let i=0; i<this.vertices.length; i+=10) {
                for(let j=i+1; j<this.vertices.length; j+=20) {
                    if (this.vertices[i].pos.dist(this.vertices[j].pos) < limit) p.line(this.vertices[i].pos.x, this.vertices[i].pos.y, this.vertices[j].pos.x, this.vertices[j].pos.y);
                }
            }
        }

        // 4. SHARP (Old)
        if (d.m_sharp > 0.01) {
            p.noStroke(); p.fill(d.colorR, d.colorG, d.colorB, d.v_alphaF * d.m_sharp);
            p.beginShape(p.TRIANGLES);
            for(let i=0; i<this.vertices.length-2; i+=15) {
                p.vertex(this.vertices[i].pos.x, this.vertices[i].pos.y);
                p.vertex(this.vertices[i+1].pos.x, this.vertices[i+1].pos.y);
                p.vertex(this.vertices[i+2].pos.x, this.vertices[i+2].pos.y);
            }
            p.endShape();
        }

        // 5. BAROQUE (Synthesis)
        if (d.m_baroque > 0.01) {
            p.noFill(); p.stroke(d.colorR, d.colorG, d.colorB, d.v_alphaS * 0.15);
            for(let k=1; k<4; k++) { p.push(); p.rotate(k*0.1); p.scale(1+k*0.1); p.beginShape(); this.vertices.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(); p.pop(); }
        }

        // 6. SUPREMATIST (Synthesis)
        if (d.m_suprematist > 0.01) {
            p.noStroke(); p.fill(d.colorR, d.colorG, d.colorB, d.v_alphaF * d.m_suprematist);
            for(let i=0; i<this.vertices.length; i+=25) { let v = this.vertices[i]; p.rect(v.pos.x, v.pos.y, 20*d.m_suprematist, 10); }
        }

        // 7. FUTURIST (Synthesis)
        if (d.m_futurist > 0.01) {
            p.stroke(d.colorR, d.colorG, d.colorB, d.v_alphaS * d.m_futurist);
            this.vertices.forEach(v => p.line(v.pos.x, v.pos.y, v.pos.x - v.vel.x*10, v.pos.y - v.vel.y*10));
        }

        // 8. GLITCH
        if (d.m_glitch > 0.01 && p.frameCount % 10 === 0) {
            p.fill(255, d.m_glitch * 100); p.rect((Math.random()-0.5)*200, (Math.random()-0.5)*200, 100, 1);
        }

        p.blendMode(p.BLEND); p.pop();
    }
}

class TypoUniverse {
    constructor(p) { this.p = p; this.initInteraction(); }
    addAtom() {
        const fontData = FONTS.length > 0 ? FONTS[Math.floor(Math.random() * FONTS.length)] : null;
        APP_STATE.atoms.push(new LivingTypo(this.p, '', fontData));
        this.updateUI();
    }
    checkCollisions(a) {
        const other = APP_STATE.atoms.find(o => o !== a && Math.hypot(a.x - o.x, a.y - o.y) < 200);
        if (other) {
            let childDNA = Genome.merge(a.dna, other.dna);
            APP_STATE.atoms.push(new LivingTypo(this.p, '', null, {
                x: (a.x+other.x)/2, y: (a.y+other.y)/2, char: "?", fontName: `${a.fontName}/${other.fontName}`,
                gen: Math.max(a.gen, other.gen)+1, dna: childDNA, vertices: [...a.vertices, ...other.vertices]
            }));
            APP_STATE.atoms = APP_STATE.atoms.filter(at => at !== a && at !== other);
            this.updateUI();
        }
    }
    initInteraction() {
        const toggle = document.getElementById('menu-toggle');
        const overlay = document.querySelector('.ui-overlay');
        if (toggle) toggle.onclick = () => { overlay.classList.toggle('active'); toggle.innerText = overlay.classList.contains('active') ? '✕' : '☰'; };
        const handleStart = (cx, cy, target) => {
            if (target.tagName === 'BUTTON' || target.closest('#molecule-list')) return;
            const mx = (cx - window.innerWidth/2 - APP_STATE.view.x) / APP_STATE.view.zoom;
            const my = (cy - window.innerHeight/2 - APP_STATE.view.y) / APP_STATE.view.zoom;
            this.dragged = APP_STATE.atoms.find(a => Math.hypot(a.x - mx, a.y - my) < 250);
            if (!this.dragged) { this.isPanning = true; this.lx = cx; this.ly = cy; }
        };
        const handleMove = (cx, cy, mx, my) => {
            if (this.dragged) { this.dragged.x += mx / APP_STATE.view.zoom; this.dragged.y += my / APP_STATE.view.zoom; }
            else if (this.isPanning) { APP_STATE.view.x += cx - this.lx; APP_STATE.view.y += cy - this.ly; this.lx = cx; this.ly = cy; }
        };
        window.addEventListener('mousedown', (e) => handleStart(e.clientX, e.clientY, e.target));
        window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY, e.movementX, e.movementY));
        window.addEventListener('mouseup', () => { if (this.dragged) this.checkCollisions(this.dragged); this.dragged = null; this.isPanning = false; });
        window.addEventListener('touchstart', (e) => { const t = e.touches[0]; handleStart(t.clientX, t.clientY, e.target); if(this.dragged) e.preventDefault(); }, { passive: false });
        window.addEventListener('touchmove', (e) => { const t = e.touches[0]; handleMove(t.clientX, t.clientY, t.clientX - this.lx, t.clientY - this.ly); if(this.dragged || this.isPanning) e.preventDefault(); }, { passive: false });
        window.addEventListener('touchend', () => { if (this.dragged) this.checkCollisions(this.dragged); this.dragged = null; this.isPanning = false; });
        window.addEventListener('wheel', (e) => { e.preventDefault(); APP_STATE.view.zoom = Math.max(0.1, Math.min(4, APP_STATE.view.zoom * (e.deltaY > 0 ? 0.9 : 1.1))); }, { passive: false });
    }
    updateUI() {
        const ml = document.getElementById('molecule-list'); if (ml) ml.innerHTML = APP_STATE.atoms.map(a => `<li class="molecule-item">DNA#${Math.floor(a.id*10000)} | G${a.gen}</li>`).join('');
    }
}

function injectExportUI(p) {
    const parent = document.querySelector('.side-panel'); if(!parent) return;
    const div = document.createElement('div'); div.innerHTML = `<button id="btn-snap" style="width:100%; border:1px solid #fff; background:none; color:#fff; padding:10px; cursor:pointer">SNAP IMAGE</button>`;
    parent.appendChild(div); document.getElementById('btn-snap').onclick = () => p.saveCanvas('mutation', 'png');
}

new p5(sketch);

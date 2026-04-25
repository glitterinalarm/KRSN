// Typography Lab - Universal Synthesis Engine v30.1
console.log("TypoLab Engine v30.1 - STABILITY FIX | MATH | PHYSICS | BIOLOGY | ART HISTORY");

const APP_STATE = { atoms: [], view: { x: 0, y: 0, zoom: 1 }, isRecording: false };

// Confirmed working TTF/OTF URLs from reliable CDNs
const FONT_SOURCES = [
    { name: 'Roboto Black', url: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-black-webfont.ttf' },
    { name: 'Source Sans', url: 'https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceSansPro-Black.otf' },
    { name: 'Source Code', url: 'https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf' },
    { name: 'Roboto Light', url: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf' },
    { name: 'Liberation Sans', url: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/standard_fonts/LiberationSans-Bold.ttf' }
];
const FONTS = [];

function powerRand(p = 3) { return Math.pow(Math.random(), p); }

class Genome {
    static createRandom() {
        return {
            m_fractal: powerRand(4), m_harmonic: powerRand(2), m_geometry: Math.random() > 0.7,
            p_entropy: powerRand(2), p_plasma: powerRand(3), p_charge: (Math.random()-0.5) * 5,
            g_friction: 0.8 + Math.random() * 0.15,
            b_mitosis: powerRand(4), b_metabolism: Math.random(), b_nerves: powerRand(2),
            a_suprematist: powerRand(3), a_baroque: powerRand(3), a_futurist: powerRand(2), a_dada: powerRand(5),
            g_speed: Math.random() * 3 + 0.1, g_amplitude: Math.random() * 2 + 0.5, cohesion: Math.random() * 0.6 + 0.4,
            v_resolution: Math.random() * 0.12 + 0.03, v_roughness: powerRand(3) * 80,
            v_strokeW: Math.random() * 8 + 0.2, v_alphaF: Math.random() * 180, v_alphaS: Math.random() * 200 + 55,
            blend_additive: Math.random() > 0.7,
            colorR: Math.random()*255, colorG: Math.random()*255, colorB: Math.random()*255
        };
    }
    static merge(A, B) {
        let child = {};
        let keys = Object.keys(A).length ? Object.keys(A) : Object.keys(B);
        for(let k of keys) {
            if (typeof A[k] === 'boolean') child[k] = Math.random() > 0.5 ? A[k] : B[k];
            else {
                let valA = A[k] || 0; let valB = B[k] || 0;
                child[k] = (valA + valB) / 2 + (Math.random()-0.5) * valA * 1.5;
                if(k.startsWith('v_alpha') || k.startsWith('color')) child[k] = Math.max(0, Math.min(255, child[k]));
                if(k.startsWith('g_friction')) child[k] = Math.max(0.5, Math.min(0.99, child[k]));
                child[k] = Math.max(0, child[k]); 
            }
        }
        child.cohesion *= 0.5; return child;
    }
}

const sketch = (p) => {
    p.preload = () => { 
        FONT_SOURCES.forEach(f => {
            p.loadFont(f.url, (font) => FONTS.push({ name: f.name, obj: font }), (err) => console.error("Font failed:", f.name));
        }); 
    };

    p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight).parent('stage');
        document.getElementById('loader').classList.add('hidden');
        window.typoUniverse = new TypoUniverse(p);
        injectExportUI(p);
    };

    p.draw = () => {
        p.background(5, 5, 8);
        p.push(); p.translate(p.width/2 + APP_STATE.view.x, p.height/2 + APP_STATE.view.y); p.scale(APP_STATE.view.zoom);
        APP_STATE.atoms.forEach(atom => { atom.update(); atom.draw(); });
        p.pop();
        if (APP_STATE.isRecording) { p.push(); p.fill(255,0,0); p.circle(50, 50, 20); p.fill(255); p.text("REC", 70, 50); p.pop(); }
    };
    p.windowResized = () => p.resizeCanvas(window.innerWidth, window.innerHeight);
};

class LivingTypo {
    constructor(p, char, fontData, parentData = null) {
        this.p = p; this.id = Math.random(); this.vertices = []; this.age = 0;
        if (parentData) {
            this.x = parentData.x; this.y = parentData.y; this.char = parentData.char; this.fontName = parentData.fontName;
            this.dna = parentData.dna; this.gen = parentData.gen;
            parentData.vertices.forEach(v => this.vertices.push({ pos: v.pos.copy(), basePos: p.createVector(v.pos.x, v.pos.y), vel: p.createVector(0,0) }));
        } else {
            this.x = (Math.random()-0.5)*1200; this.y = (Math.random()-0.5)*1200;
            const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?#$@&%";
            this.char = char || alphabet[Math.floor(Math.random() * alphabet.length)];
            this.fontName = fontData ? fontData.name : "System";
            this.gen = 1; this.dna = Genome.createRandom();
            let fontObj = (fontData && fontData.obj) ? fontData.obj : (FONTS.length > 0 ? FONTS[0].obj : null);
            if (fontObj) {
                let b = fontObj.textBounds(this.char, 0, 0, 500);
                let rawPoints = fontObj.textToPoints(this.char, -b.x - b.w/2, -b.y - b.h/2, 500, { sampleFactor: this.dna.v_resolution });
                rawPoints.forEach(pt => {
                    let nx = pt.x + (Math.random()-0.5)*this.dna.v_roughness;
                    let ny = pt.y + (Math.random()-0.5)*this.dna.v_roughness;
                    this.vertices.push({ pos: p.createVector(nx, ny), basePos: p.createVector(nx, ny), vel: p.createVector(0,0) });
                });
            }
        }
        while(this.vertices.length > 400) this.vertices.splice(Math.floor(Math.random()*this.vertices.length), 1);
    }

    update() {
        this.age++; let t = this.p.frameCount * 0.01 * this.dna.g_speed;
        let d = this.dna; let amp = d.g_amplitude;
        if (d.b_metabolism > 0.5) t *= (1 + Math.sin(this.p.frameCount * 0.05) * 0.5);
        let cmX=0, cmY=0; this.vertices.forEach(v => { cmX+=v.pos.x; cmY+=v.pos.y; });
        let center = this.p.createVector(cmX/this.vertices.length, cmY/this.vertices.length);
        for (let v of this.vertices) {
            let force = this.p.createVector(0, 0);
            if (d.p_plasma > 0.1) force.add(p5.Vector.fromAngle(this.p.noise(v.pos.x*0.005+t, v.pos.y*0.005)*this.p.TWO_PI*4).mult(d.p_plasma*amp));
            if (d.m_harmonic > 0.1) { force.x += Math.sin(t*2.1 + v.pos.y*0.01)*d.m_harmonic*amp; force.y += Math.cos(t*1.7 + v.pos.x*0.01)*d.m_harmonic*amp; }
            if (Math.abs(d.p_charge) > 0.1) force.add(p5.Vector.sub(v.pos, center).normalize().mult(d.p_charge*amp));
            v.vel.add(force); v.vel.add(p5.Vector.sub(v.basePos, v.pos).mult(d.cohesion*0.05));
            v.vel.mult(d.g_friction); v.pos.add(v.vel);
            if (d.cohesion < 1) v.basePos.add(this.p.createVector(Math.random()-0.5, Math.random()-0.5).mult((1-d.cohesion)*amp));
        }
        if (d.b_mitosis > 0.99 && this.vertices.length > 200 && Math.random() < 0.001) this.split();
    }

    split() {
        let childDNA = JSON.parse(JSON.stringify(this.dna));
        let child = new LivingTypo(this.p, this.char, null, {
            x: this.x+50, y: this.y+50, char: this.char, fontName: this.fontName, dna: childDNA, gen: this.gen+1,
            vertices: this.vertices.slice(0, Math.floor(this.vertices.length/2))
        });
        APP_STATE.atoms.push(child); this.vertices = this.vertices.slice(Math.floor(this.vertices.length/2));
    }

    draw() {
        let p = this.p; let d = this.dna; p.push(); p.translate(this.x, this.y);
        if (d.blend_additive) p.blendMode(p.ADD);
        if (d.a_baroque > 0.1) {
            p.noFill(); p.stroke(d.colorR, d.colorG, d.colorB, d.v_alphaS * 0.1);
            for(let k=1; k<4; k++) { p.push(); p.rotate(k*0.1); p.scale(1+k*0.05); p.beginShape(); this.vertices.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(); p.pop(); }
        }
        if (d.a_suprematist > 0.1) {
            p.noStroke(); p.fill(d.colorR, d.colorG, d.colorB, d.v_alphaF * d.a_suprematist);
            for(let i=0; i<this.vertices.length; i+=15) { let v = this.vertices[i]; if (i%30==0) p.rect(v.pos.x, v.pos.y, 20, 10); else p.circle(v.pos.x, v.pos.y, 15); }
        }
        if (d.a_futurist > 0.1) {
            p.stroke(d.colorR, d.colorG, d.colorB, d.v_alphaS * 0.5); p.strokeWeight(1);
            this.vertices.forEach(v => p.line(v.pos.x, v.pos.y, v.pos.x - v.vel.x*8, v.pos.y - v.vel.y*8));
        }
        p.noStroke(); p.fill(d.colorR, d.colorG, d.colorB, d.v_alphaF);
        p.beginShape(); this.vertices.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape();
        p.blendMode(p.BLEND); p.pop();
    }
}

class TypoUniverse {
    constructor(p) {
        this.p = p; this.initInteraction();
        document.getElementById('add-atom').onclick = () => this.addAtom();
        setTimeout(() => { if(FONTS.length>0) for(let i=0; i<6; i++) this.addAtom(); }, 500);
    }
    addAtom() {
        const fontData = FONTS.length > 0 ? FONTS[Math.floor(Math.random() * FONTS.length)] : null;
        APP_STATE.atoms.push(new LivingTypo(this.p, '', fontData));
        this.updateUI();
    }
    checkCollisions(a) {
        const other = APP_STATE.atoms.find(o => o !== a && Math.hypot(a.x - o.x, a.y - o.y) < 180);
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
    const div = document.createElement('div'); div.style.marginTop = 'auto'; div.innerHTML = `<button id="btn-snap" style="width:100%; background:#fff; color:#000; padding:10px; border:none; cursor:pointer">SNAP IMAGE</button>`;
    parent.appendChild(div); document.getElementById('btn-snap').onclick = () => p.saveCanvas('mutation', 'png');
}
new p5(sketch);

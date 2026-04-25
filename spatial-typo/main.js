// Typography Lab - Omniversal Diversity Engine v33.0
console.log("TypoLab Engine v33.0 - LEGIBILITY | CAMERA | DIVERSITY");

const APP_STATE = { 
    atoms: [], 
    view: { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0, zooming: false }, 
    isRecording: false 
};

// Selection of highly readable/bold fonts to prevent "spaghetti" effect
const FONT_SOURCES = [
    { name: 'Roboto Black', url: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-black-webfont.ttf' },
    { name: 'Source Sans Bold', url: 'https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceSansPro-Black.otf' },
    { name: 'Source Code Bold', url: 'https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf' }
];
const FONTS = [];

function powerRand(p = 3) { return Math.pow(Math.random(), p); }

class Genome {
    static createRandom() {
        // Diversify Animation Logic
        const animStyles = ['liquid', 'frenetic', 'nebula', 'clockwork', 'static'];
        const animType = animStyles[Math.floor(Math.random() * animStyles.length)];
        
        return {
            animType: animType,
            g_speed: Math.random() * 5 + 0.1,
            g_amplitude: Math.random() * 4 + 0.5,
            g_friction: 0.8 + Math.random() * 0.18,
            cohesion: 0.85 + Math.random() * 0.15, // CRITICAL: High cohesion for legibility
            
            v_resolution: 0.1, 
            v_roughness: 0, // NO ROUGHNESS AT BIRTH for legibility
            
            // Visual Styles Selection (Only 1 or 2 per atom)
            m_membrane: Math.random() > 0.4, 
            m_neural: Math.random() > 0.8,
            m_spine: Math.random() > 0.6,
            m_baroque: Math.random() > 0.9,
            m_futurist: Math.random() > 0.9,
            m_sharp: Math.random() > 0.9,
            
            // Math/Physics
            f_chaos: powerRand(2),
            f_orbit: powerRand(3),
            
            v_strokeW: Math.random() * 12 + 1,
            v_alphaF: 100 + Math.random() * 100,
            v_alphaS: 150 + Math.random() * 100,
            
            colorR: Math.random()*255, colorG: Math.random()*255, colorB: Math.random()*255
        };
    }

    static merge(A, B) {
        let child = {};
        for(let k in (Object.keys(A).length ? A : B)) {
            if (typeof A[k] === 'string' || typeof A[k] === 'boolean') child[k] = Math.random() > 0.5 ? A[k] : B[k];
            else {
                child[k] = (A[k] || 0) * 0.5 + (B[k] || 0) * 0.5;
                child[k] += (Math.random()-0.5) * child[k] * 0.4;
                child[k] = Math.max(0, child[k]);
            }
        }
        child.v_roughness = 0; // Reset roughness for child too
        child.cohesion = Math.min(1, child.cohesion + 0.05); // Child is even more stable
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
        for(let i=0; i<6; i++) window.typoUniverse.addAtom();
    };

    p.draw = () => {
        p.background(4, 4, 6);
        
        // --- SMOOTH CAMERA FOLLOW ---
        APP_STATE.view.x += (APP_STATE.view.targetX - APP_STATE.view.x) * 0.1;
        APP_STATE.view.y += (APP_STATE.view.targetY - APP_STATE.view.y) * 0.1;

        p.push(); 
        p.translate(p.width/2 + APP_STATE.view.x, p.height/2 + APP_STATE.view.y); 
        p.scale(APP_STATE.view.zoom);
        
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
            this.x = (Math.random()-0.5)*1500; this.y = (Math.random()-0.5)*1500;
            const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?";
            this.char = char || alphabet[Math.floor(Math.random() * alphabet.length)];
            this.gen = 1; this.dna = Genome.createRandom();
            let font = fontData || (FONTS.length > 0 ? FONTS[Math.floor(Math.random()*FONTS.length)] : null);
            this.fontName = font ? font.name : "System";
            if (font && font.obj) {
                let b = font.obj.textBounds(this.char, 0, 0, 500);
                let pts = font.obj.textToPoints(this.char, -b.x - b.w/2, -b.y - b.h/2, 500, { sampleFactor: this.dna.v_resolution });
                pts.forEach(pt => {
                    this.vertices.push({ pos: p.createVector(pt.x, pt.y), basePos: p.createVector(pt.x, pt.y), vel: p.createVector(0,0) });
                });
            }
        }
    }

    update() {
        let t = this.p.frameCount * 0.01 * this.dna.g_speed;
        let d = this.dna; let amp = d.g_amplitude;
        
        for (let v of this.vertices) {
            let force = this.p.createVector(0, 0);
            
            // PHYSICS DIVERSITY BY TYPE
            if (d.animType === 'liquid') {
                force.add(p5.Vector.fromAngle(this.p.noise(v.pos.x*0.005+t, v.pos.y*0.005)*this.p.TWO_PI*4).mult(amp));
            } else if (d.animType === 'frenetic') {
                force.add((Math.random()-0.5)*amp*5, (Math.random()-0.5)*amp*5);
            } else if (d.animType === 'nebula') {
                let dist = p5.Vector.dist(v.pos, this.p.createVector(0,0));
                force.add(p5.Vector.fromAngle(t + dist*0.01).mult(amp));
            } else if (d.animType === 'clockwork') {
                force.x += Math.sin(t*2 + v.pos.y*0.02) * amp;
            }

            v.vel.add(force); 
            v.vel.add(p5.Vector.sub(v.basePos, v.pos).mult(d.cohesion * 0.1));
            v.vel.mult(d.g_friction); 
            v.pos.add(v.vel);
        }
    }

    draw() {
        let p = this.p; let d = this.dna; p.push(); p.translate(this.x, this.y);
        
        // 1. SOLID MEMBRANE (For Legibility)
        if (d.m_membrane) {
            p.noStroke(); p.fill(d.colorR, d.colorG, d.colorB, d.v_alphaF);
            p.beginShape(); this.vertices.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape();
        }

        // 2. SPINE (Structural)
        if (d.m_spine) {
            p.noFill(); p.stroke(d.colorR, d.colorG, d.colorB, d.v_alphaS);
            p.strokeWeight(d.v_strokeW * 0.5);
            p.beginShape(); this.vertices.forEach(v => p.vertex(v.pos.x, v.pos.y)); p.endShape();
        }

        // 3. SPECIAL EFFECTS (Probabilistic)
        if (d.m_neural) {
            p.stroke(255, 50); p.strokeWeight(0.5);
            for(let i=0; i<this.vertices.length; i+=15) {
                let n = this.vertices[(i+1)%this.vertices.length];
                p.line(this.vertices[i].pos.x, this.vertices[i].pos.y, n.pos.x, n.pos.y);
            }
        }
        
        if (d.m_baroque) {
            p.noFill(); p.stroke(d.colorR, d.colorG, d.colorB, 30);
            for(let k=1; k<3; k++) { p.push(); p.rotate(t*0.5); p.scale(1+k*0.1); p.beginShape(); this.vertices.forEach(v => p.vertex(v.pos.x, v.pos.y)); p.endShape(); p.pop(); }
        }

        p.pop();
    }
}

class TypoUniverse {
    constructor(p) { this.p = p; this.initInteraction(); }
    
    addAtom() {
        const fontData = FONTS.length > 0 ? FONTS[Math.floor(Math.random() * FONTS.length)] : null;
        APP_STATE.atoms.push(new LivingTypo(this.p, '', fontData));
        this.updateUI();
    }

    focusOn(atomId) {
        const atom = APP_STATE.atoms.find(a => Math.floor(a.id*10000) == atomId);
        if (atom) {
            APP_STATE.view.targetX = -atom.x;
            APP_STATE.view.targetY = -atom.y;
            APP_STATE.view.zoom = 1;
        }
    }

    initInteraction() {
        const toggle = document.getElementById('menu-toggle');
        const overlay = document.querySelector('.ui-overlay');
        if (toggle) toggle.onclick = () => { overlay.classList.toggle('active'); toggle.innerText = overlay.classList.contains('active') ? '✕' : '☰'; };
        
        const ml = document.getElementById('molecule-list');
        if (ml) {
            ml.onclick = (e) => {
                const item = e.target.closest('.molecule-item');
                if (item) {
                    const id = item.dataset.id;
                    this.focusOn(id);
                }
            };
        }

        const handleStart = (cx, cy, target) => {
            if (target.tagName === 'BUTTON' || target.closest('#molecule-list')) return;
            const mx = (cx - window.innerWidth/2 - APP_STATE.view.x) / APP_STATE.view.zoom;
            const my = (cy - window.innerHeight/2 - APP_STATE.view.y) / APP_STATE.view.zoom;
            this.dragged = APP_STATE.atoms.find(a => Math.hypot(a.x - mx, a.y - my) < 250 / APP_STATE.view.zoom);
            if (!this.dragged) { this.isPanning = true; this.lx = cx; this.ly = cy; }
        };

        const handleMove = (cx, cy, mx, my) => {
            if (this.dragged) {
                this.dragged.x += mx / APP_STATE.view.zoom;
                this.dragged.y += my / APP_STATE.view.zoom;
            } else if (this.isPanning) {
                APP_STATE.view.targetX += cx - this.lx; 
                APP_STATE.view.targetY += cy - this.ly;
                APP_STATE.view.x = APP_STATE.view.targetX;
                APP_STATE.view.y = APP_STATE.view.targetY;
                this.lx = cx; this.ly = cy;
            }
        };

        window.addEventListener('mousedown', (e) => handleStart(e.clientX, e.clientY, e.target));
        window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY, e.movementX, e.movementY));
        window.addEventListener('mouseup', () => { 
            if (this.dragged) {
                const other = APP_STATE.atoms.find(o => o !== this.dragged && Math.hypot(this.dragged.x - o.x, this.dragged.y - o.y) < 200);
                if (other) {
                    let childDNA = Genome.merge(this.dragged.dna, other.dna);
                    APP_STATE.atoms.push(new LivingTypo(this.p, '?', null, { x: (this.dragged.x+other.x)/2, y: (this.dragged.y+other.y)/2, char: '?', fontName: '-', gen: Math.max(this.dragged.gen, other.gen)+1, dna: childDNA, vertices: [...this.dragged.vertices, ...other.vertices] }));
                    APP_STATE.atoms = APP_STATE.atoms.filter(at => at !== this.dragged && at !== other);
                    this.updateUI();
                }
            }
            this.dragged = null; this.isPanning = false; 
        });

        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            APP_STATE.view.zoom = Math.max(0.1, Math.min(4, APP_STATE.view.zoom * (e.deltaY > 0 ? 0.9 : 1.1)));
        }, { passive: false });
    }

    updateUI() {
        const ml = document.getElementById('molecule-list');
        if (ml) ml.innerHTML = APP_STATE.atoms.map(a => {
            const aid = Math.floor(a.id*10000);
            return `<li class="molecule-item" data-id="${aid}" style="cursor:pointer; padding:8px; border-bottom:1px solid rgba(255,255,255,0.05)">
                <div style="font-weight:bold; color:rgb(${a.dna.colorR}, ${a.dna.colorG}, ${a.dna.colorB})">DNA#${aid} | G${a.gen} [${a.char}]</div>
                <div style="font-size:0.6rem; opacity:0.5">${a.dna.animType.toUpperCase()}</div>
            </li>`;
        }).join('');
    }
}

function injectExportUI(p) {
    const parent = document.querySelector('.side-panel'); if(!parent) return;
    const div = document.createElement('div'); div.innerHTML = `<button id="btn-snap" style="width:100%; border:1px solid #fff; background:none; color:#fff; padding:10px; cursor:pointer; margin-top:20px">SNAP IMAGE</button>`;
    parent.appendChild(div); document.getElementById('btn-snap').onclick = () => p.saveCanvas('mutation', 'png');
}

new p5(sketch);

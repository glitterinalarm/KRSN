// Typography Lab - Spore "Ecosystem" Engine v53.3
// THE "SPORE" REVOLUTION: Safety Hardened & Error Resilient.

console.log("TypoLab v53.3 — SAFETY MODE ACTIVE");

let _uid = 0;

const APP_STATE = {
    atoms: [],
    view: { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0 },
    isRecording: false
};

const FONT_SOURCES = [
    { name: 'Roboto', url: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-black-webfont.ttf' },
    { name: 'Playfair', url: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf' },
    { name: 'SpaceMono', url: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/spacemono/SpaceMono-Bold.ttf' }
];
const FONTS = [];

const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════
// BIOCONTROL / GENOME
// ═══════════════════════════════════════════════════════════
class BioGenome {
    static TYPES = [
        'CRYSTAL', 'FLUID', 'NEURAL', 'MECHANIC', 'GASEOUS', 'FRAGMENTED', 'LIGHT',
        'QUANTUM', 'FRACTAL', 'GRID', 'ARTISTIC', 'LIQUID_METAL', 'GHOST',
        'VOXEL', 'FUNGAL', 'GLITCH', 'VECTOR', 'STRING',
        'OP_ART', 'KINETIC', 'STIPPLE', 'AURA', 'FLUX',
        'MITOSIS', 'DNA', 'PHOTOSYNTHESIS', 'LYMPHOCYTE', 'GLOBULE',
        'TRIGONOMETRY', 'GOLDEN_RATIO', 'DERIVATIVE', 'INTEGRAL', 'COMPLEX_PLANE',
        'STATISTICS', 'GEOMETRY', 'LOGIC', 'EXPONENTIAL',
        'RELATIVITY', 'QUANTUM_WAVE', 'THERMODYNAMICS', 'ELECTROMAGNETISM',
        'GRAVITY_WELL', 'KINETICS', 'FLUID_DYNAMICS', 'OPTICS', 'ASTROPHYSICS',
        'CELLULAR_AUTOMATA', 'VORONOI', 'ASCII_ART', 'PIXEL_SORT', 'TURING',
        'DELAUNAY', 'FLOW_FIELD', 'ATTRACTOR', 'PARAMETRIC'
    ];
    
    static createRandom() {
        return {
            type: pick(BioGenome.TYPES),
            material: pick(['MATTE', 'NEON', 'GLASS', 'MEAT', 'METAL', 'CHROME']),
            g_speed: rand(0.05, 0.2),
            g_amplitude: rand(0.1, 0.5),
            g_viscosity: rand(0.8, 0.96), 
            g_drift: rand(0.01, 0.05),
            v_complexity: rand(0.05, 0.3),
            v_strokeW: rand(1, 10),
            v_width: rand(0.4, 1.5),
            alpha: 255,
            cohesion: rand(0.1, 0.4),
            breathing: rand(0.01, 0.04),
            colorR: Math.random() * 255,
            colorG: Math.random() * 255,
            colorB: Math.random() * 255
        };
    }

    static cross(d1, d2) {
        const roll = Math.random();
        if (roll > 0.96) return null; // Lethal
        
        const child = this.createRandom();
        child.type = roll < 0.4 ? d1.type : (roll < 0.8 ? d2.type : pick(this.TYPES));
        child.secondaryType = roll < 0.4 ? d2.type : null;
        child.colorR = (d1.colorR + d2.colorR) / 2;
        child.colorG = (d1.colorG + d2.colorG) / 2;
        child.colorB = (d1.colorB + d2.colorB) / 2;
        child.v_width = rand(0.3, 1.8);
        child.v_strokeW = rand(0.5, 12);
        return child;
    }
}

// ═══════════════════════════════════════════════════════════
// LIVING ORGANISM
// ═══════════════════════════════════════════════════════════
class LivingTypo {
    constructor(p, char, config = {}) {
        this.p = p;
        this.atomId = _uid++;
        this.vertices = [];
        this.angle = config.angle || 0;
        this.gen = config.gen || 0;
        this.breathingStage = Math.random() * 6.28;
        this.x = config.x !== undefined ? config.x : (Math.random() - 0.5) * 800;
        this.y = config.y !== undefined ? config.y : (Math.random() - 0.5) * 600;
        this.char = config.char || char || pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        this.dna = config.dna || BioGenome.createRandom();

        // Generate points if needed
        if (!config.dna || !config.vertices) {
            const font = (FONTS.length > 0) ? FONTS[0].obj : null;
            if (font) {
                try {
                    const b = font.textBounds(this.char, 0, 0, 400);
                    const pts = font.textToPoints(this.char, -b.x - b.w/2, -b.y - b.h/2, 400, { sampleFactor: 0.1 });
                    pts.forEach(pt => {
                        if (this.vertices.length < 300) {
                            this.vertices.push({
                                pos: p.createVector(pt.x, pt.y),
                                basePos: p.createVector(pt.x, pt.y),
                                vel: p.createVector(0, 0),
                                seed: Math.random()
                            });
                        }
                    });
                } catch(e) { console.error("TextToPoints Error", e); }
            }
        } else if (config.vertices) {
            config.vertices.forEach(v => {
                this.vertices.push({ pos: v.pos.copy(), basePos: v.basePos.copy(), vel: v.vel.copy(), seed: v.seed });
            });
        }
    }

    update() {
        const d = this.dna; const p = this.p;
        const t = p.frameCount * 0.01 * d.g_speed;
        this.breathingStage += d.breathing;
        this.vertices.forEach((v) => {
            const noiseVal = p.noise(v.pos.x * 0.005, v.pos.y * 0.005, t);
            const force = p5.Vector.fromAngle(noiseVal * 8 * p.PI).mult(d.g_amplitude);
            force.add(p5.Vector.sub(v.basePos, v.pos).mult(d.cohesion * 0.1));
            v.vel.add(force); v.vel.mult(d.g_viscosity); v.pos.add(v.vel);
        });
    }

    draw() {
        const p = this.p; const d = this.dna;
        p.push();
        p.translate(this.x, this.y);
        p.scale(d.v_width || 1, 1);
        const col = [d.colorR || 255, d.colorG || 255, d.colorB || 255];
        
        try {
            if (d.secondaryType) {
                const mid = Math.floor(this.vertices.length / 2);
                this.renderDNA(p, col, d, d.type, 0, mid);
                this.renderDNA(p, [255,255,255,100], d, d.secondaryType, mid, this.vertices.length);
            } else {
                this.renderDNA(p, col, d, d.type);
            }
        } catch(e) { 
            p.fill(255, 0, 0); p.rect(-20,-20,40,40); 
            console.error("Rendering Error", e);
        }
        p.pop();
    }

    renderDNA(p, col, d, type, start = 0, end = null) {
        const vSet = (end !== null) ? this.vertices.slice(start, end) : this.vertices;
        if (vSet.length < 2) {
            p.fill(col[0], col[1], col[2], 100); p.rect(-40, -40, 80, 80);
            p.fill(255); p.textAlign(p.CENTER); p.text(this.char, 0, 0);
            return;
        }

        const methods = {
            'CRYSTAL': this.drawCrystal, 'FLUID': this.drawFluid, 'NEURAL': this.drawNeural,
            'MECHANIC': this.drawMechanic, 'GASEOUS': this.drawGaseous, 'FRAGMENTED': this.drawFragmented,
            'OP_ART': this.drawOpArt, 'KINETIC': this.drawKinetic, 'VORONOI': this.drawVoronoi,
            'ASCII_ART': this.drawASCII, 'PIXEL_SORT': this.drawPixelSort, 'TURING': this.drawTuring,
            'DELAUNAY': this.drawDelaunay, 'ATTRACTOR': this.drawAttractor, 'PARAMETRIC': this.drawParametric,
            'TRIGONOMETRY': this.drawTrig, 'DNA': this.drawDna, 'LYMPHOCYTE': this.drawLymphocyte,
            'GLOBULE': this.drawGlobule, 'AURA': this.drawAura, 'FLUX': this.drawFlux,
            'ASTROPHYSICS': this.drawAstrophys, 'CELLULAR_AUTOMATA': this.drawCellular, 'ARTISTIC': this.drawArtistic
        };

        const engine = methods[type] || this.drawDefault;
        engine.call(this, p, col, d, vSet);
    }

    drawDefault(p, col, d, vSet) {
        p.noFill(); p.stroke(col[0], col[1], col[2], d.alpha);
        for (let i = 0; i < vSet.length - 1; i++) {
            p.strokeWeight(d.v_strokeW * (0.4 + p.noise(i*0.1, p.frameCount*0.05)*2));
            p.line(vSet[i].pos.x, vSet[i].pos.y, vSet[i+1].pos.x, vSet[i+1].pos.y);
        }
    }

    drawFluid(p, col, d, vSet) { p.fill(col[0], col[1], col[2], 80); p.noStroke(); p.beginShape(); vSet.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape(p.CLOSE); this.drawDefault(p, col, d, vSet); }
    drawCrystal(p, col, d, vSet) { p.noStroke(); for(let i=0; i<vSet.length-2; i+=3) { p.fill(col[0], col[1], col[2], 100); p.triangle(vSet[i].pos.x, vSet[i].pos.y, vSet[i+1].pos.x, vSet[i+1].pos.y, vSet[i+2].pos.x, vSet[i+2].pos.y); } }
    drawNeural(p, col, d, vSet) { p.stroke(col[0], col[1], col[2], 100); for(let i=0; i<vSet.length; i+=10) { for(let j=i+10; j<vSet.length; j+=20) { if(p.dist(vSet[i].pos.x, vSet[i].pos.y, vSet[j].pos.x, vSet[j].pos.y) < 80) p.line(vSet[i].pos.x, vSet[i].pos.y, vSet[j].pos.x, vSet[j].pos.y); } } this.drawDefault(p, col, d, vSet); }
    drawMechanic(p, col, d, vSet) { vSet.forEach((v, i) => { if(i%15==0) { const l=20*p.sin(p.frameCount*0.1); p.stroke(col[0], col[1], col[2]); p.line(v.pos.x, v.pos.y, v.pos.x+l, v.pos.y+l); p.rect(v.pos.x+l-2, v.pos.y+l-2, 4, 4); } }); this.drawDefault(p, col, d, vSet); }
    drawGaseous(p, col, d, vSet) { p.noStroke(); vSet.forEach((v,i) => { if(i%5==0) { p.fill(col[0], col[1], col[2], 50); p.circle(v.pos.x+rand(-5,5), v.pos.y+rand(-5,5), 10); } }); }
    drawFragmented(p, col, d, vSet) { p.noStroke(); p.fill(col[0], col[1], col[2]); vSet.forEach((v,i) => { if(i%6==0) { p.push(); p.translate(v.pos.x, v.pos.y); p.rotate(v.seed*6); p.rect(-5,-5,10,10); p.pop(); } }); }
    drawOpArt(p, col, d, vSet) { p.noFill(); for(let k=0; k<3; k++) { p.stroke(255, 100-k*30); p.beginShape(); vSet.forEach(v => p.vertex(v.pos.x*(1+k*0.1),v.pos.y*(1+k*0.1))); p.endShape(p.CLOSE); } }
    drawKinetic(p, col, d, vSet) { vSet.forEach((v,i) => { if(i%20==0) { p.push(); p.translate(v.pos.x, v.pos.y); p.rotate(p.frameCount*0.1); p.stroke(col[0],col[1],col[2]); p.line(-10,0,10,0); p.pop(); } }); this.drawDefault(p, col, d, vSet); }
    drawVoronoi(p, col, d, vSet) { p.noFill(); p.stroke(col[0],col[1],col[2],100); vSet.forEach((v,i) => { if(i%30==0) { p.beginShape(); for(let a=0; a<6; a+=1) p.vertex(v.pos.x+p.cos(a)*15, v.pos.y+p.sin(a)*15); p.endShape(p.CLOSE); } }); this.drawDefault(p, col, d, vSet); }
    drawASCII(p, col, d, vSet) { p.fill(col[0], col[1], col[2]); p.textSize(8); vSet.forEach((v,i) => { if(i%12==0) p.text(pick(["@","#","+","."]), v.pos.x, v.pos.y); }); }
    drawPixelSort(p, col, d, vSet) { p.stroke(col[0], col[1], col[2], 100); vSet.forEach((v,i) => { if(i%8==0) p.line(v.pos.x, v.pos.y, v.pos.x, v.pos.y+p.noise(v.pos.x*0.1, p.frameCount*0.02)*60); }); this.drawDefault(p, col, d, vSet); }
    drawTuring(p, col, d, vSet) { p.noStroke(); vSet.forEach(v => { if(p.noise(v.pos.x*0.05, v.pos.y*0.05)>0.6) { p.fill(255, 100); p.circle(v.pos.x, v.pos.y, 6); } }); }
    drawDelaunay(p, col, d, vSet) { p.stroke(col[0],col[1],col[2],50); for(let i=0; i<vSet.length-20; i+=20) p.triangle(vSet[i].pos.x,vSet[i].pos.y,vSet[i+10].pos.x,vSet[i+10].pos.y,vSet[i+20].pos.x,vSet[i+20].pos.y); }
    drawAttractor(p, col, d, vSet) { vSet.forEach((v,i) => { if(i%40==0) { p.noFill(); p.stroke(col[0],col[1],col[2],100); p.beginShape(); let lx=v.pos.x, ly=v.pos.y; for(let k=0; k<15; k++) { lx+=p.sin(ly*0.1)*5; ly+=p.cos(lx*0.1)*5; p.vertex(lx,ly); } p.endShape(); } }); }
    drawParametric(p, col, d, vSet) { vSet.forEach((v,i) => { if(i%35==0) { p.noFill(); p.stroke(col[0],col[1],col[2]); p.beginShape(); for(let a=0; a<6; a+=0.5) p.vertex(v.pos.x+p.cos(a*3)*15, v.pos.y+p.sin(a*2)*15); p.endShape(p.CLOSE); } }); this.drawDefault(p,col,d,vSet); }
    drawTrig(p, col, d, vSet) { p.noFill(); p.stroke(col[0],col[1],col[2]); p.beginShape(); vSet.forEach((v,i) => p.vertex(v.pos.x, v.pos.y+p.sin(p.frameCount*0.1+i*0.3)*20)); p.endShape(); }
    drawDna(p, col, d, vSet) { for(let i=0; i<vSet.length-1; i+=12) { p.stroke(col[0],col[1],col[2]); p.line(vSet[i].pos.x-10,vSet[i].pos.y,vSet[i].pos.x+10,vSet[i].pos.y); p.fill(255); p.circle(vSet[i].pos.x-10,vSet[i].pos.y,4); p.circle(vSet[i].pos.x+10,vSet[i].pos.y,4); } this.drawDefault(p,col,d,vSet); }
    drawLymphocyte(p, col, d, vSet) { vSet.forEach((v,i) => { if(i%30==0) { p.fill(col[0],col[1],col[2],150); p.stroke(255); p.circle(v.pos.x, v.pos.y, 8); for(let a=0; a<6; a+=1) p.line(v.pos.x, v.pos.y, v.pos.x+p.cos(a)*12, v.pos.y+p.sin(a)*12); } }); this.drawDefault(p,col,d,vSet); }
    drawGlobule(p, col, d, vSet) { vSet.forEach((v,i) => { if(i%10==0) { p.noStroke(); p.fill(200,20,40); p.circle(v.pos.x,v.pos.y,8+p.sin(p.frameCount*0.1+i)*3); p.fill(255,150); p.circle(v.pos.x-2,v.pos.y-2,2); } }); }
    drawAura(p, col, d, vSet) { p.noStroke(); for(let r=30; r>0; r-=10) { p.fill(col[0],col[1],col[2],30); vSet.forEach(v => p.circle(v.pos.x,v.pos.y,r)); } }
    drawFlux(p, col, d, vSet) { p.noFill(); p.stroke(col[0],col[1],col[2],150); p.beginShape(); vSet.forEach((v,i) => p.vertex(v.pos.x + p.sin(i*0.2+p.frameCount*0.1)*15, v.pos.y)); p.endShape(); }
    drawAstrophys(p, col, d, vSet) { vSet.forEach((v,i) => { if(i%50==0) { p.noFill(); p.stroke(col[0],col[1],col[2],100); p.circle(v.pos.x, v.pos.y, 30); p.fill(255); p.circle(v.pos.x+p.cos(p.frameCount*0.1)*15, v.pos.y+p.sin(p.frameCount*0.1)*15, 4); } }); }
    drawCellular(p, col, d, vSet) { p.noStroke(); p.fill(col[0],col[1],col[2],150); vSet.forEach((v,i) => { if(i%8==0) p.rect(v.pos.x, v.pos.y, 5, 5); }); }
    drawArtistic(p, col, d, vSet) { p.noStroke(); vSet.forEach((v,i) => { if(i%15==0) { p.fill(pick([[255,0,0],[255,255,0],[0,0,255]])); p.push(); p.translate(v.pos.x,v.pos.y); p.rotate(v.seed*6); p.rect(-10,-2,20,4); p.pop(); } }); }
}

// ═══════════════════════════════════════════════════════════
// ECOSYSTEM MANAGER
// ═══════════════════════════════════════════════════════════
class TypoUniverse {
    constructor(p) {
        this.p = p; this.history = []; this.particles = [];
        document.getElementById('add-atom').onclick = () => this.addAtom();
        this.initInteraction();
    }

    addAtom(forcedType = null, x = null, y = null, char = '', dna = null) {
        const atom = new LivingTypo(this.p, char, { x, y, dna });
        if (forcedType) atom.dna.type = forcedType;
        APP_STATE.atoms.push(atom); this.updateMoleculeList(); return atom;
    }

    removeAtom(id) { APP_STATE.atoms = APP_STATE.atoms.filter(a => a.atomId !== id); this.updateMoleculeList(); }

    checkFusion(moved) {
        const other = APP_STATE.atoms.find(o => o !== moved && Math.hypot(o.x - moved.x, o.y - moved.y) < 120);
        if (!other) return;
        const childDNA = BioGenome.cross(moved.dna, other.dna);
        if (!childDNA) { this.explode(moved.x, moved.y, [255, 0, 0]); this.removeAtom(moved.atomId); this.removeAtom(other.atomId); return; }
        const nx = (moved.x + other.x) / 2; const ny = (moved.y + other.y) / 2;
        this.explode(nx, ny, [childDNA.colorR, childDNA.colorG, childDNA.colorB]);
        this.addAtom(childDNA.type, nx, ny, pick([moved.char, other.char]), childDNA);
        this.removeAtom(moved.atomId); this.removeAtom(other.atomId);
    }

    explode(x, y, col) {
        for (let i = 0; i < 30; i++) {
            const ang = Math.random() * 6.28, spd = Math.random() * 5;
            this.particles.push({ pos: this.p.createVector(x,y), vel: this.p.createVector(Math.cos(ang)*spd, Math.sin(ang)*spd), sz: rand(2,6), life: 1.0, color: col });
        }
    }

    update() { this.particles.forEach((pt, i) => { pt.pos.add(pt.vel); pt.life -= 0.03; if (pt.life <= 0) this.particles.splice(i, 1); }); }
    drawParticles() { this.p.noStroke(); this.particles.forEach(pt => { this.p.fill(pt.color[0], pt.color[1], pt.color[2], pt.life * 255); this.p.circle(pt.pos.x, pt.pos.y, pt.sz); }); }

    updateMoleculeList() {
        const ml = document.getElementById('molecule-list');
        if (ml) ml.innerHTML = APP_STATE.atoms.map(a => `<li class="molecule-item" data-atom-id="${a.atomId}"><span class="status-dot" style="background:rgb(${a.dna.colorR},${a.dna.colorG},${a.dna.colorB})"></span><div class="molecule-info"><div class="name">${a.char} [${a.dna.type}]</div><div class="meta">W ${a.dna.v_width?.toFixed(1)} | ST ${a.dna.v_strokeW?.toFixed(0)}</div></div></li>`).join('');
    }

    initInteraction() {
        let dragged = null, panning = false, lx = 0, ly = 0;
        const world = (cx, cy) => ({ wx: (cx-this.p.width/2-APP_STATE.view.x)/APP_STATE.view.zoom, wy: (cy-this.p.height/2-APP_STATE.view.y)/APP_STATE.view.zoom });
        window.addEventListener('mousedown', e => { if (e.target.closest('.ui-overlay')) return; const { wx, wy } = world(e.clientX, e.clientY); dragged = APP_STATE.atoms.find(a => Math.hypot(a.x-wx, a.y-wy) < 150/APP_STATE.view.zoom); if (!dragged) { panning = true; lx = e.clientX; ly = e.clientY; } });
        window.addEventListener('mousemove', e => { if (dragged) { dragged.x += e.movementX/APP_STATE.view.zoom; dragged.y += e.movementY/APP_STATE.view.zoom; } else if (panning) { APP_STATE.view.targetX += (e.clientX-lx); APP_STATE.view.targetY += (e.clientY-ly); APP_STATE.view.x=APP_STATE.view.targetX; APP_STATE.view.y=APP_STATE.view.targetY; lx=e.clientX; ly=e.clientY; } });
        window.addEventListener('mouseup', () => { if (dragged) this.checkFusion(dragged); dragged = null; panning = false; });
        window.addEventListener('wheel', e => { if (e.target.closest('.ui-overlay')) return; e.preventDefault(); APP_STATE.view.zoom = clamp(APP_STATE.view.zoom * (e.deltaY > 0 ? 0.9 : 1.1), 0.05, 5); }, { passive: false });
    }
}

const sketch = (p) => {
    let TU;
    p.preload = () => { FONT_SOURCES.forEach(s => FONTS.push({ name: s.name, obj: p.loadFont(s.url) })); };
    p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight); TU = new TypoUniverse(p);
        BioGenome.TYPES.sort(() => 0.5 - Math.random()).slice(0, 8).forEach((type, i) => {
            TU.addAtom(type, (i % 4 - 1.5) * 300, (Math.floor(i / 4) - 0.5) * 350);
        });
        const loader = document.getElementById('loader'); if (loader) loader.style.display = 'none';
    };
    p.draw = () => {
        p.background(5, 5, 10);
        p.push(); p.translate(p.width/2+APP_STATE.view.x, p.height/2+APP_STATE.view.y); p.scale(APP_STATE.view.zoom);
        // DIAGNOSTIC CENTER CROSS
        p.stroke(255, 20); p.line(-2000, 0, 2000, 0); p.line(0, -2000, 0, 2000);
        TU.update(); TU.drawParticles();
        APP_STATE.atoms.forEach(a => { try { a.update(); a.draw(); } catch(e) { console.error("Atom Crash", e); } });
        p.pop();
        p.resetMatrix(); p.fill(255, 40); p.textSize(10); p.text(`ENGINE v53.3 | STABLE MODE`, 20, p.height - 20);
        if (p.frameCount < 120) { p.fill(255, 255-p.frameCount*2); p.textSize(40); p.textAlign(p.CENTER); p.text("SAFETY v53.3 ACTIVE", p.width/2, p.height/2); }
    };
};
new p5(sketch);

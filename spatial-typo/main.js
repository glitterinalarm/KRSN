// Typography Lab - Spore Engine v54.0
// NO FONT DEPENDENCY - Pure algorithmic point generation

console.log("TypoLab v54.0 — ALGORITHM-FIRST, NO FONT DEPENDENCY");

let _uid = 0;
const APP_STATE = { atoms: [], view: { x: 0, y: 0, zoom: 1 } };
const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════════
// POINT GENERATOR — no font needed, pure math shapes
// Each "letter" is a geometric signature cluster
// ═══════════════════════════════════════════════════════════════
function generateCluster(p, shape, count = 200) {
    const pts = [];
    const R = 130;
    
    switch(shape) {
        case 'CIRCLE':
            for(let i = 0; i < count; i++) {
                const a = (i / count) * p.TWO_PI;
                const jitter = rand(0.85, 1.15);
                pts.push({ x: p.cos(a) * R * jitter, y: p.sin(a) * R * jitter });
            }
            break;
        case 'SQUARE':
            for(let i = 0; i < count; i++) {
                const side = Math.floor(i / (count/4));
                const t = (i % (count/4)) / (count/4) * 2 * R - R;
                if(side === 0) pts.push({ x: t, y: -R });
                else if(side === 1) pts.push({ x: R, y: t });
                else if(side === 2) pts.push({ x: -t, y: R });
                else pts.push({ x: -R, y: -t });
            }
            break;
        case 'TRIANGLE':
            for(let i = 0; i < count; i++) {
                const a = Math.floor(i / (count/3));
                const t = (i % (count/3)) / (count/3);
                const p1 = [0, -R]; const p2 = [R*0.866, R*0.5]; const p3 = [-R*0.866, R*0.5];
                const corners = [p1, p2, p3];
                const c1 = corners[a]; const c2 = corners[(a+1)%3];
                pts.push({ x: c1[0] + (c2[0]-c1[0])*t, y: c1[1] + (c2[1]-c1[1])*t });
            }
            break;
        case 'STAR':
            for(let i = 0; i < count; i++) {
                const a = (i / count) * p.TWO_PI;
                const r = i % 2 === 0 ? R : R * 0.45;
                pts.push({ x: p.cos(a) * r, y: p.sin(a) * r });
            }
            break;
        case 'SPIRAL':
            for(let i = 0; i < count; i++) {
                const a = (i / count) * p.TWO_PI * 4;
                const r = (i / count) * R;
                pts.push({ x: p.cos(a) * r, y: p.sin(a) * r });
            }
            break;
        case 'INFINITY':
            for(let i = 0; i < count; i++) {
                const t = (i / count) * p.TWO_PI;
                pts.push({ x: R * p.cos(t) / (1 + p.sin(t)*p.sin(t)), y: R * p.sin(t) * p.cos(t) / (1 + p.sin(t)*p.sin(t)) });
            }
            break;
        case 'LISSAJOUS':
            for(let i = 0; i < count; i++) {
                const t = (i / count) * p.TWO_PI;
                pts.push({ x: R * p.cos(3*t), y: R * p.sin(2*t) });
            }
            break;
        case 'PHI':  // Golden ratio spiral
            for(let i = 0; i < count; i++) {
                const a = i * 2.399;
                const r = Math.sqrt(i) * R * 0.1;
                pts.push({ x: p.cos(a) * r, y: p.sin(a) * r });
            }
            break;
        default:  // Cross
            for(let i = 0; i < count; i++) {
                const t = (i / count) * 2 - 1;
                if(i % 2 === 0) pts.push({ x: t * R, y: rand(-20, 20) });
                else pts.push({ x: rand(-20, 20), y: t * R });
            }
    }
    
    return pts.map(pt => ({
        pos: p.createVector(pt.x, pt.y),
        basePos: p.createVector(pt.x, pt.y),
        vel: p.createVector(0, 0),
        seed: Math.random()
    }));
}

const SHAPES = ['CIRCLE', 'SQUARE', 'TRIANGLE', 'STAR', 'SPIRAL', 'INFINITY', 'LISSAJOUS', 'PHI', 'CROSS'];

// ═══════════════════════════════════════════════════════════════
// GENOME
// ═══════════════════════════════════════════════════════════════
class BioGenome {
    static TYPES = [
        'CRYSTAL', 'FLUID', 'NEURAL', 'MECHANIC', 'GASEOUS', 'FRAGMENTED', 'LIGHT',
        'QUANTUM', 'FRACTAL', 'GRID', 'ARTISTIC', 'LIQUID_METAL', 'GHOST',
        'VOXEL', 'FUNGAL', 'GLITCH', 'VECTOR', 'STRING', 'OP_ART', 'KINETIC',
        'STIPPLE', 'AURA', 'FLUX', 'MITOSIS', 'DNA_HELIX', 'PHOTOSYNTHESIS',
        'LYMPHOCYTE', 'GLOBULE', 'TRIGONOMETRY', 'GOLDEN_RATIO', 'ATTRACTOR',
        'PARAMETRIC', 'DELAUNAY', 'CELLULAR', 'VORONOI', 'TURING', 'ASCII_ART',
        'FLOW_FIELD', 'PIXEL_SORT', 'ELECTRO', 'GRAVITY', 'OPTICS', 'ASTRO'
    ];

    static createRandom() {
        return {
            type: pick(this.TYPES),
            secondaryType: null,
            shape: pick(SHAPES),
            colorR: Math.random() * 255,
            colorG: Math.random() * 255,
            colorB: Math.random() * 255,
            v_strokeW: rand(0.5, 9),     // ultra-thin to bold
            v_width: rand(0.3, 1.6),      // condensed to extended
            g_speed: rand(0.03, 0.18),
            g_amplitude: rand(0.1, 0.45),
            g_viscosity: rand(0.82, 0.97),
            cohesion: rand(0.1, 0.4),
            breathing: rand(0.01, 0.04),
            alpha: 220
        };
    }

    static cross(d1, d2) {
        if(Math.random() > 0.96) return null; // Lethal
        const r = Math.random();
        const child = this.createRandom();
        child.type = r < 0.4 ? d1.type : (r < 0.75 ? d2.type : pick(this.TYPES));
        child.secondaryType = r < 0.4 ? d2.type : null;
        child.colorR = (d1.colorR + d2.colorR) / 2;
        child.colorG = (d1.colorG + d2.colorG) / 2;
        child.colorB = (d1.colorB + d2.colorB) / 2;
        child.v_strokeW = rand(0.5, 9);
        child.v_width = rand(0.3, 1.6);
        child.shape = r < 0.5 ? d1.shape : d2.shape;
        return child;
    }
}

// ═══════════════════════════════════════════════════════════════
// LIVING ORGANISM
// ═══════════════════════════════════════════════════════════════
class LivingTypo {
    constructor(p, config = {}) {
        this.p = p;
        this.atomId = _uid++;
        this.gen = config.gen || 0;
        this.breathingStage = Math.random() * 6.28;
        this.x = config.x !== undefined ? config.x : (Math.random() - 0.5) * 800;
        this.y = config.y !== undefined ? config.y : (Math.random() - 0.5) * 600;
        this.char = config.char || pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        this.dna = config.dna || BioGenome.createRandom();
        this.vertices = generateCluster(p, this.dna.shape, 200);
    }

    update() {
        const d = this.dna; const p = this.p;
        const t = p.frameCount * 0.01 * d.g_speed;
        this.breathingStage += d.breathing;
        this.vertices.forEach(v => {
            const a = p.noise(v.pos.x * 0.005, v.pos.y * 0.005, t) * p.TWO_PI * 4;
            const force = p.createVector(p.cos(a), p.sin(a)).mult(d.g_amplitude);
            force.add(p5.Vector.sub(v.basePos, v.pos).mult(d.cohesion * 0.1));
            v.vel.add(force); v.vel.mult(d.g_viscosity); v.pos.add(v.vel);
        });
    }

    draw() {
        const p = this.p; const d = this.dna;
        const col = [d.colorR, d.colorG, d.colorB];
        p.push();
        p.translate(this.x, this.y);
        p.scale(d.v_width, 1.0);

        if (d.secondaryType) {
            const mid = Math.floor(this.vertices.length / 2);
            this.dispatch(p, col, d, d.type, 0, mid);
            this.dispatch(p, [255, 255, 255, 80], d, d.secondaryType, mid, this.vertices.length);
        } else {
            this.dispatch(p, col, d, d.type);
        }
        p.pop();
    }

    dispatch(p, col, d, type, s = 0, e = null) {
        const v = e ? this.vertices.slice(s, e) : this.vertices;
        if(!v.length) return;
        const map = {
            'CRYSTAL': this.eCrystal, 'FLUID': this.eFluid, 'NEURAL': this.eNeural,
            'MECHANIC': this.eMechanic, 'GASEOUS': this.eGaseous, 'FRAGMENTED': this.eFragmented,
            'LIGHT': this.eLight, 'QUANTUM': this.eQuantum, 'FRACTAL': this.eFractal,
            'GRID': this.eGrid, 'ARTISTIC': this.eArtistic, 'LIQUID_METAL': this.eLiqMetal,
            'GHOST': this.eGhost, 'VOXEL': this.eVoxel, 'FUNGAL': this.eFungal,
            'GLITCH': this.eGlitch, 'VECTOR': this.eVector, 'STRING': this.eString,
            'OP_ART': this.eOpArt, 'KINETIC': this.eKinetic, 'STIPPLE': this.eStipple,
            'AURA': this.eAura, 'FLUX': this.eFlux, 'MITOSIS': this.eMitosis,
            'DNA_HELIX': this.eDna, 'PHOTOSYNTHESIS': this.ePhotoSyn, 'LYMPHOCYTE': this.eLympho,
            'GLOBULE': this.eGlobule, 'TRIGONOMETRY': this.eTrig, 'GOLDEN_RATIO': this.eGolden,
            'ATTRACTOR': this.eAttractor, 'PARAMETRIC': this.eParametric, 'DELAUNAY': this.eDelaunay,
            'CELLULAR': this.eCellular, 'VORONOI': this.eVoronoi, 'TURING': this.eTuring,
            'ASCII_ART': this.eAscii, 'FLOW_FIELD': this.eFlow, 'PIXEL_SORT': this.ePixelSort,
            'ELECTRO': this.eElectro, 'GRAVITY': this.eGravity, 'OPTICS': this.eOptics, 'ASTRO': this.eAstro
        };
        (map[type] || this.eDefault).call(this, p, col, d, v);
    }

    // VARIABLE STROKE baseline
    eDefault(p, col, d, v) {
        p.noFill();
        for(let i = 0; i < v.length - 1; i++) {
            const sw = d.v_strokeW * (0.5 + p.noise(i*0.08, p.frameCount*0.03) * 2.5);
            p.strokeWeight(sw);
            p.stroke(col[0], col[1], col[2], d.alpha);
            p.line(v[i].pos.x, v[i].pos.y, v[i+1].pos.x, v[i+1].pos.y);
        }
    }

    eCrystal(p, col, d, v) {
        p.noStroke();
        for(let i = 0; i < v.length - 2; i += 3) {
            p.fill(col[0], col[1], col[2], 80+v[i].seed*80);
            p.triangle(v[i].pos.x,v[i].pos.y, v[i+1].pos.x,v[i+1].pos.y, v[i+2].pos.x,v[i+2].pos.y);
        }
        p.noFill(); p.stroke(255, 30); p.strokeWeight(0.5);
        p.beginShape(); v.forEach(vt => p.vertex(vt.pos.x, vt.pos.y)); p.endShape(p.CLOSE);
    }

    eFluid(p, col, d, v) {
        p.fill(col[0], col[1], col[2], 70); p.noStroke();
        p.beginShape(); v.forEach(vt => p.curveVertex(vt.pos.x, vt.pos.y)); p.endShape(p.CLOSE);
        this.eDefault(p, col, d, v);
    }

    eNeural(p, col, d, v) {
        p.strokeWeight(0.8); p.stroke(col[0], col[1], col[2], 120);
        for(let i=0; i<v.length; i+=8) for(let j=i+8; j<v.length; j+=16) {
            if(p.dist(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y)<100) p.line(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y);
        }
        this.eDefault(p, col, d, v);
    }

    eMechanic(p, col, d, v) {
        v.forEach((vt, i) => {
            if(i%15===0) {
                const l = 25 * p.sin(p.frameCount*0.1+vt.seed*5);
                p.stroke(col[0],col[1],col[2]); p.strokeWeight(1.5);
                p.line(vt.pos.x, vt.pos.y, vt.pos.x+l, vt.pos.y+l);
                p.fill(col[0],col[1],col[2]); p.noStroke(); p.rect(vt.pos.x+l-2,vt.pos.y+l-2,5,5);
            }
        });
        this.eDefault(p,col,d,v);
    }

    eGaseous(p, col, d, v) {
        p.noStroke();
        v.forEach((vt,i) => {
            if(i%4===0) { p.fill(col[0],col[1],col[2],40); p.circle(vt.pos.x+rand(-6,6), vt.pos.y+rand(-6,6), 14*vt.seed); }
        });
    }

    eFragmented(p, col, d, v) {
        p.noStroke();
        v.forEach((vt,i) => {
            if(i%5===0) {
                p.fill(col[0],col[1],col[2], d.alpha); p.push();
                p.translate(vt.pos.x, vt.pos.y); p.rotate(vt.seed*6.28+p.frameCount*0.05);
                const s = 6+vt.seed*10; p.rect(-s/2,-s/2,s,s); p.pop();
            }
        });
    }

    eLight(p, col, d, v) {
        p.blendMode(p.ADD);
        for(let r=0; r<3; r++) {
            p.strokeWeight(d.v_strokeW*(3-r)); p.stroke(col[0],col[1],col[2], 30+r*20); p.noFill();
            p.beginShape(); v.forEach(vt => p.vertex(vt.pos.x,vt.pos.y)); p.endShape(p.CLOSE);
        }
        p.blendMode(p.BLEND);
    }

    eQuantum(p, col, d, v) {
        if(p.random()>0.8) return;
        for(let g=0; g<2; g++) {
            p.push(); p.translate(p.noise(p.frameCount*0.05,g)*20-10, p.noise(p.frameCount*0.05,g+50)*20-10);
            p.stroke(col[0],col[1],col[2],60); p.noFill(); p.beginShape(); v.forEach((vt,i) => { if(i%2===0) p.vertex(vt.pos.x,vt.pos.y); }); p.endShape(); p.pop();
        }
        this.eDefault(p,col,d,v);
    }

    eFractal(p, col, d, v) { this.eDefault(p,col,d,v); p.push(); p.scale(0.3); v.forEach((vt,i) => { if(i%80===0) { p.push(); p.translate(vt.pos.x*3,vt.pos.y*3); this.eDefault(p,col,d,v); p.pop(); } }); p.pop(); }
    eGrid(p, col, d, v) { const g=20; p.stroke(col[0],col[1],col[2],d.alpha); p.noFill(); p.beginShape(p.LINES); v.forEach(vt => { p.vertex(Math.round(vt.pos.x/g)*g, Math.round(vt.pos.y/g)*g); p.vertex(vt.pos.x, vt.pos.y); }); p.endShape(); }
    eArtistic(p, col, d, v) { p.noStroke(); v.forEach((vt,i) => { if(i%15===0) { const c=pick([[255,0,0],[255,200,0],[0,100,255]]); p.fill(c[0],c[1],c[2],150); p.push(); p.translate(vt.pos.x,vt.pos.y); p.rotate(vt.seed*6.28); p.rect(-15,-3,30,6); p.pop(); } }); }
    eLiqMetal(p, col, d, v) { p.noStroke(); v.forEach(vt => { p.fill(col[0],col[1],col[2],d.alpha); p.circle(vt.pos.x,vt.pos.y,7+p.sin(p.frameCount*0.1+vt.seed*10)*3); }); }
    eGhost(p, col, d, v) { for(let g=0; g<3; g++) { p.stroke(col[0],col[1],col[2],80-g*25); p.noFill(); p.beginShape(); v.forEach((vt,i) => { const off=p.noise(i*0.1,p.frameCount*0.02+g)*25; p.curveVertex(vt.pos.x+off, vt.pos.y+off); }); p.endShape(); } }
    eVoxel(p, col, d, v) { p.noStroke(); v.forEach((vt,i) => { if(i%7===0) { const s=10*vt.seed; p.fill(col[0],col[1],col[2],d.alpha); p.rect(vt.pos.x-s/2,vt.pos.y-s/2,s,s); p.fill(255,40); p.rect(vt.pos.x-s/2,vt.pos.y-s/2,s/2,s/2); } }); }
    eFungal(p, col, d, v) { p.stroke(col[0],col[1],col[2],120); v.forEach((vt,i) => { if(i%20===0) { p.strokeWeight(1); p.line(vt.pos.x,vt.pos.y, vt.pos.x+p.cos(vt.seed*6)*30, vt.pos.y+p.sin(vt.seed*6)*30); p.fill(col[0],col[1],col[2],d.alpha); p.circle(vt.pos.x+p.cos(vt.seed*6)*30, vt.pos.y+p.sin(vt.seed*6)*30, 5); } }); this.eDefault(p,col,d,v); }
    eGlitch(p, col, d, v) { if(p.random()>0.9) return; v.forEach((vt,i) => { if(p.random()>0.97) { p.stroke(col[0],col[1],col[2]); p.strokeWeight(rand(1,8)); p.line(vt.pos.x-50,vt.pos.y,vt.pos.x+50,vt.pos.y); } }); this.eDefault(p,col,d,v); }
    eVector(p, col, d, v) { p.stroke(col[0],col[1],col[2]); v.forEach((vt,i) => { if(i%10===0) { p.strokeWeight(1); p.line(vt.pos.x,vt.pos.y,vt.pos.x+vt.vel.x*15,vt.pos.y+vt.vel.y*15); p.fill(col[0],col[1],col[2]); p.noStroke(); p.circle(vt.pos.x+vt.vel.x*15,vt.pos.y+vt.vel.y*15,3); } }); }
    eString(p, col, d, v) { p.noFill(); p.stroke(col[0],col[1],col[2],100); v.forEach((vt,i) => { if(i%12===0) p.line(vt.pos.x,vt.pos.y,0,0); }); this.eDefault(p,col,d,v); }
    eOpArt(p, col, d, v) { p.noFill(); for(let k=0; k<4; k++) { p.stroke(255,80-k*15); p.strokeWeight(1); p.beginShape(); v.forEach(vt => p.vertex(vt.pos.x*(1+k*0.08),vt.pos.y*(1+k*0.08))); p.endShape(p.CLOSE); } }
    eKinetic(p, col, d, v) { v.forEach((vt,i) => { if(i%18===0) { p.push(); p.translate(vt.pos.x,vt.pos.y); p.rotate(p.frameCount*0.08+vt.seed*6); p.stroke(col[0],col[1],col[2]); p.strokeWeight(d.v_strokeW); p.line(-12,0,12,0); p.pop(); } }); this.eDefault(p,col,d,v); }
    eStipple(p, col, d, v) { p.noStroke(); v.forEach(vt => { p.fill(col[0],col[1],col[2],d.alpha); p.circle(vt.pos.x+rand(-3,3),vt.pos.y+rand(-3,3),rand(1,3)); }); }
    eAura(p, col, d, v) { p.noStroke(); for(let r=35; r>0; r-=8) { p.fill(col[0],col[1],col[2],25); v.forEach(vt => p.circle(vt.pos.x,vt.pos.y,r)); } }
    eFlux(p, col, d, v) { p.noFill(); p.stroke(col[0],col[1],col[2],150); p.strokeWeight(d.v_strokeW); p.beginShape(); v.forEach((vt,i) => p.vertex(vt.pos.x+p.sin(i*0.2+p.frameCount*0.08)*20,vt.pos.y)); p.endShape(); }
    eMitosis(p, col, d, v) { [-25,25].forEach(off => { p.push(); p.translate(off,0); this.eDefault(p,col,d,v); p.pop(); }); }
    eDna(p, col, d, v) { for(let i=0; i<v.length-1; i+=12) { p.stroke(col[0],col[1],col[2]); p.strokeWeight(2); p.line(v[i].pos.x-12,v[i].pos.y,v[i].pos.x+12,v[i].pos.y); p.fill(255,d.alpha); p.noStroke(); p.circle(v[i].pos.x-12,v[i].pos.y,5); p.circle(v[i].pos.x+12,v[i].pos.y,5); } this.eDefault(p,col,d,v); }
    ePhotoSyn(p, col, d, v) { p.stroke(0,200,80,140); v.forEach((vt,i) => { if(i%15===0) { p.push(); p.translate(vt.pos.x,vt.pos.y); p.rotate(vt.seed*6); p.ellipse(0,0,8,18); p.line(0,0,0,12); p.pop(); } }); this.eDefault(p,[0,200,80],d,v); }
    eLympho(p, col, d, v) { v.forEach((vt,i) => { if(i%30===0) { p.fill(col[0],col[1],col[2],150); p.stroke(255,d.alpha); p.circle(vt.pos.x,vt.pos.y,8); for(let a=0;a<6;a++) p.line(vt.pos.x,vt.pos.y,vt.pos.x+p.cos(a)*15,vt.pos.y+p.sin(a)*15); } }); this.eDefault(p,col,d,v); }
    eGlobule(p, col, d, v) { v.forEach((vt,i) => { if(i%8===0) { p.noStroke(); p.fill(200,20,40,d.alpha); p.circle(vt.pos.x,vt.pos.y,10+p.sin(p.frameCount*0.1+i)*3); p.fill(255,120); p.circle(vt.pos.x-2,vt.pos.y-2,3); } }); }
    eTrig(p, col, d, v) { p.noFill(); p.stroke(col[0],col[1],col[2]); p.strokeWeight(d.v_strokeW); p.beginShape(); v.forEach((vt,i) => p.vertex(vt.pos.x, vt.pos.y+p.sin(p.frameCount*0.08+i*0.25)*25)); p.endShape(); }
    eGolden(p, col, d, v) { p.noFill(); p.stroke(col[0],col[1],col[2],100); v.forEach((vt,i) => { if(i%40===0) { p.push(); p.translate(vt.pos.x,vt.pos.y); p.beginShape(); let a=0,r=0; for(let k=0;k<24;k++) { p.vertex(p.cos(a)*r,p.sin(a)*r); a+=1.618;r+=2; } p.endShape(); p.pop(); } }); this.eDefault(p,col,d,v); }
    eAttractor(p, col, d, v) { v.forEach((vt,i) => { if(i%40===0) { p.noFill(); p.stroke(col[0],col[1],col[2],100); p.beginShape(); let lx=vt.pos.x,ly=vt.pos.y; for(let k=0;k<20;k++) { lx+=p.sin(ly*0.08)*6; ly+=p.cos(lx*0.08)*6; p.vertex(lx,ly); } p.endShape(); } }); }
    eParametric(p, col, d, v) { v.forEach((vt,i) => { if(i%35===0) { p.noFill(); p.stroke(col[0],col[1],col[2]); p.strokeWeight(d.v_strokeW); p.beginShape(); for(let a=0;a<6.28;a+=0.3) p.vertex(vt.pos.x+p.cos(a*3)*18,vt.pos.y+p.sin(a*2)*18); p.endShape(p.CLOSE); } }); this.eDefault(p,col,d,v); }
    eDelaunay(p, col, d, v) { p.stroke(col[0],col[1],col[2],60); p.noFill(); for(let i=0;i<v.length-20;i+=20) p.triangle(v[i].pos.x,v[i].pos.y,v[i+10].pos.x,v[i+10].pos.y,v[i+20].pos.x,v[i+20].pos.y); }
    eCellular(p, col, d, v) { p.noStroke(); p.fill(col[0],col[1],col[2],d.alpha); v.forEach((vt,i) => { if(i%7===0) p.rect(vt.pos.x,vt.pos.y,5,5); }); }
    eVoronoi(p, col, d, v) { p.noFill(); p.stroke(col[0],col[1],col[2],100); v.forEach((vt,i) => { if(i%30===0) { p.beginShape(); for(let a=0;a<6;a+=1) p.vertex(vt.pos.x+p.cos(a)*15,vt.pos.y+p.sin(a)*15); p.endShape(p.CLOSE); } }); this.eDefault(p,col,d,v); }
    eTuring(p, col, d, v) { p.noStroke(); v.forEach(vt => { if(p.noise(vt.pos.x*0.06,vt.pos.y*0.06,p.frameCount*0.01)>0.6) { p.fill(255,120); p.circle(vt.pos.x,vt.pos.y,7); } }); }
    eAscii(p, col, d, v) { p.fill(col[0],col[1],col[2]); p.textSize(9); v.forEach((vt,i) => { if(i%10===0) p.text(pick(["@","#","*","+","."]),vt.pos.x,vt.pos.y); }); }
    eFlow(p, col, d, v) { p.noFill(); p.stroke(col[0],col[1],col[2],150); p.strokeWeight(1); v.forEach((vt,i) => { if(i%15===0) { p.beginShape(); let x=vt.pos.x,y=vt.pos.y; for(let k=0;k<5;k++) { const a=p.noise(x*0.01,y*0.01,p.frameCount*0.01)*6.28*2; x+=p.cos(a)*8; y+=p.sin(a)*8; p.vertex(x,y); } p.endShape(); } }); }
    ePixelSort(p, col, d, v) { p.stroke(col[0],col[1],col[2],100); const t=p.frameCount*0.02; v.forEach((vt,i) => { if(i%8===0) p.line(vt.pos.x, vt.pos.y, vt.pos.x, vt.pos.y+p.noise(vt.pos.x*0.1,t)*70); }); this.eDefault(p,col,d,v); }
    eElectro(p, col, d, v) { p.stroke(col[0],col[1],col[2],100); v.forEach((vt,i) => { if(i%25===0) for(let r=5;r<40;r+=10) p.circle(vt.pos.x,vt.pos.y,r); }); this.eDefault(p,col,d,v); }
    eGravity(p, col, d, v) { p.strokeWeight(0.5); p.stroke(col[0],col[1],col[2],80); v.forEach(vt => p.line(vt.pos.x,vt.pos.y,0,0)); this.eDefault(p,col,d,v); }
    eOptics(p, col, d, v) { p.blendMode(p.ADD); [[255,0,0],[0,255,0],[0,0,255]].forEach((c,i) => { p.stroke(c[0],c[1],c[2],80); p.push(); p.translate(i*3,i*3); this.eDefault(p,c,d,v); p.pop(); }); p.blendMode(p.BLEND); }
    eAstro(p, col, d, v) { v.forEach((vt,i) => { if(i%50===0) { p.noFill(); p.stroke(col[0],col[1],col[2],100); p.circle(vt.pos.x,vt.pos.y,35); p.fill(255,d.alpha); p.noStroke(); p.circle(vt.pos.x+p.cos(p.frameCount*0.1)*17,vt.pos.y+p.sin(p.frameCount*0.1)*17,5); } }); }
}

// ═══════════════════════════════════════════════════════════════
// ECOSYSTEM MANAGER
// ═══════════════════════════════════════════════════════════════
class TypoUniverse {
    constructor(p) { this.p=p; this.particles=[]; document.getElementById('add-atom').onclick=()=>this.addAtom(); this.initInteraction(); }

    addAtom(forcedType=null, x=null, y=null, char='', dna=null) {
        const cfg = { x, y, char, dna };
        const a = new LivingTypo(this.p, cfg);
        if(forcedType) a.dna.type = forcedType;
        APP_STATE.atoms.push(a); this.updateList(); return a;
    }

    removeAtom(id) { APP_STATE.atoms=APP_STATE.atoms.filter(a=>a.atomId!==id); this.updateList(); }

    checkFusion(moved) {
        const other = APP_STATE.atoms.find(o=>o!==moved && Math.hypot(o.x-moved.x,o.y-moved.y)<120);
        if(!other) return;
        const childDNA = BioGenome.cross(moved.dna, other.dna);
        if(!childDNA) { this.explode(moved.x,moved.y,[255,0,0]); this.removeAtom(moved.atomId); this.removeAtom(other.atomId); return; }
        const nx=(moved.x+other.x)/2, ny=(moved.y+other.y)/2;
        this.explode(nx,ny,[childDNA.colorR,childDNA.colorG,childDNA.colorB]);
        this.addAtom(childDNA.type, nx, ny, pick([moved.char,other.char]), childDNA);
        this.removeAtom(moved.atomId); this.removeAtom(other.atomId);
    }

    explode(x,y,col) { for(let i=0;i<30;i++) { const a=Math.random()*6.28,s=Math.random()*5; this.particles.push({pos:this.p.createVector(x,y),vel:this.p.createVector(Math.cos(a)*s,Math.sin(a)*s),sz:rand(2,8),life:1,color:col}); } }
    update() { this.particles.forEach((pt,i)=>{pt.pos.add(pt.vel);pt.life-=0.03;if(pt.life<=0)this.particles.splice(i,1);}); }
    drawParticles() { this.p.noStroke(); this.particles.forEach(pt=>{this.p.fill(pt.color[0],pt.color[1],pt.color[2],pt.life*255);this.p.circle(pt.pos.x,pt.pos.y,pt.sz);}); }

    updateList() {
        const ml=document.getElementById('molecule-list');
        if(ml) ml.innerHTML=APP_STATE.atoms.map(a=>`<li class="molecule-item" data-atom-id="${a.atomId}"><span class="status-dot" style="background:rgb(${a.dna.colorR},${a.dna.colorG},${a.dna.colorB})"></span><div class="molecule-info"><div class="name">${a.char} [${a.dna.type}]</div><div class="meta">W:${a.dna.v_width?.toFixed(1)} | ST:${a.dna.v_strokeW?.toFixed(1)}</div></div></li>`).join('');
    }

    initInteraction() {
        let dragged=null, panning=false, lx=0, ly=0;
        const world=(cx,cy)=>({wx:(cx-this.p.width/2-APP_STATE.view.x)/APP_STATE.view.zoom, wy:(cy-this.p.height/2-APP_STATE.view.y)/APP_STATE.view.zoom});
        window.addEventListener('mousedown',e=>{if(e.target.closest('.ui-overlay'))return; const{wx,wy}=world(e.clientX,e.clientY); dragged=APP_STATE.atoms.find(a=>Math.hypot(a.x-wx,a.y-wy)<120/APP_STATE.view.zoom); if(!dragged){panning=true;lx=e.clientX;ly=e.clientY;}});
        window.addEventListener('mousemove',e=>{if(dragged){dragged.x+=e.movementX/APP_STATE.view.zoom;dragged.y+=e.movementY/APP_STATE.view.zoom;}else if(panning){APP_STATE.view.x+=(e.clientX-lx);APP_STATE.view.y+=(e.clientY-ly);lx=e.clientX;ly=e.clientY;}});
        window.addEventListener('mouseup',()=>{if(dragged)this.checkFusion(dragged);dragged=null;panning=false;});
        window.addEventListener('wheel',e=>{if(e.target.closest('.ui-overlay'))return;e.preventDefault();APP_STATE.view.zoom=clamp(APP_STATE.view.zoom*(e.deltaY>0?.9:1.1),.05,5);},{passive:false});
    }
}

const sketch = (p) => {
    let TU;
    // No preload — no fonts needed!
    p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight);
        TU = new TypoUniverse(p);
        BioGenome.TYPES.sort(()=>0.5-Math.random()).slice(0,8).forEach((type,i) => {
            TU.addAtom(type, (i%4-1.5)*280, (Math.floor(i/4)-0.5)*320);
        });
        const loader=document.getElementById('loader'); if(loader) loader.style.display='none';
    };
    p.draw = () => {
        p.background(5, 5, 10);
        p.push();
        p.translate(p.width/2+APP_STATE.view.x, p.height/2+APP_STATE.view.y);
        p.scale(APP_STATE.view.zoom);
        TU.update(); TU.drawParticles();
        APP_STATE.atoms.forEach(a => { try { a.update(); a.draw(); } catch(e) { console.error("Atom error",a.atomId,e); } });
        p.pop();
        p.resetMatrix();
        p.fill(255,40); p.noStroke(); p.textSize(10);
        p.text(`ENGINE v54.0 | ALGORITHM-FIRST | ${BioGenome.TYPES.length} FAMILIES | ${APP_STATE.atoms.length} ATOMS`, 20, p.height-20);
        if(p.frameCount < 100) {
            p.push(); p.fill(255, 255-p.frameCount*2.5); p.textAlign(p.CENTER); p.textSize(36);
            p.text("SPORE v54.0 — ALGORITHM MODE", p.width/2, p.height/2); p.pop();
        }
    };
    p.windowResized = () => p.resizeCanvas(window.innerWidth, window.innerHeight);
};
new p5(sketch);

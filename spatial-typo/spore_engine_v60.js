// Typography Lab - Spore Engine v64.0
// THE HYBRID ENGINE: 60+ FAMILIES RESTORED WITH LINE/POINT DIVERSITY

console.log("TypoLab v64.0 — THE HYBRID ENGINE REVOLUTION");

let _uid = 0;
let GLOBAL_FONT = null;
const APP_STATE = { atoms: [], view: { x: 0, y: 0, zoom: 0.75 } };
const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (arr) => arr[arr.length * Math.random() | 0];

// ═══════════════════════════════════════════════════════════════
// VERTEX GEN: HIGH-RES SKELETON
// ═══════════════════════════════════════════════════════════════
function getVertices(p, char) {
    if(GLOBAL_FONT) {
        try {
            const pts = GLOBAL_FONT.textToPoints(char, -80, 80, 180, { sampleFactor: 0.35 });
            if(pts && pts.length > 20) return pts.map(pt => ({pos:p.createVector(pt.x,pt.y), base:p.createVector(pt.x,pt.y), vel:p.createVector(0,0), ordered: true}));
        } catch(e) {}
    }
    const sz = 150; const pg = p.createGraphics(sz, sz);
    pg.pixelDensity(1); pg.background(0); pg.fill(255);
    pg.textAlign(p.CENTER, p.CENTER); pg.textSize(sz*0.8);
    pg.textFont("Outfit, sans-serif"); pg.text(char, sz/2, sz/2);
    pg.loadPixels();
    const pts = [];
    for (let y=1; y<sz-1; y+=2) {
        for (let x=1; x<sz-1; x+=2) {
            let i = (x+y*sz)*4;
            if (pg.pixels[i]>127) {
                if(pg.pixels[i-4]<127 || pg.pixels[i+4]<127 || pg.pixels[i-sz*4]<127 || pg.pixels[i+sz*4]<127) 
                    pts.push({x:x-sz/2, y:y-sz/2});
            }
        }
    }
    return pts.map(pt => ({pos:p.createVector(pt.x*1.4,pt.y*1.4), base:p.createVector(pt.x*1.4,pt.y*1.4), vel:p.createVector(0,0), ordered: false}));
}

// ═══════════════════════════════════════════════════════════════
// GENOME: FULL TAXONOMY RESTORED
// ═══════════════════════════════════════════════════════════════
class BioGenome {
    static PILLARS = {
        'PHYSIQUE': ['CRYSTAL', 'MECHANIC', 'VOXEL', 'ORIGAMI', 'CARBON', 'METEOR', 'VOLCANIC', 'CHROME', 'GLITCH', 'GRAVITY', 'LORENZ', 'PYRAMID', 'VELVET', 'MANTU', 'SPIKE'],
        'BIOLOGIQUE': ['DNA_HELIX', 'FLUID', 'JELLY', 'GASEOUS', 'AURA', 'PLASMA', 'BUBBLE', 'CORAL', 'MOSS', 'MYCELIUM', 'BOIDS', 'L-SYSTEM', 'REACTION_DIFFUSION', 'ORGANIC', 'AMOEBA', 'SPORE'],
        'MATHEMATIQUE': ['NEURAL', 'TURING', 'FRACTAL', 'QUANTUM', 'VECTOR', 'PULSE', 'TESSERACT', 'VORONOI', 'MANDELBROT', 'GRID', 'BINARY', 'FIBONACCI', 'NODAL', 'GEOMETRIC'],
        'OPTIQUE': ['NEON', 'OP_ART', 'OPTICS', 'PHASE', 'GHOST', 'SHADOW', 'CELESTIAL', 'PRISM', 'SCANLINE', 'DITHERING', 'INK', 'BRUSH', 'HOLOGRAPH', 'REFRACTION', 'SPECTRUM']
    };

    static createRandom() {
        const pillar = pick(Object.keys(this.PILLARS));
        const type = pick(this.PILLARS[pillar]);
        return {
            pillar, type,
            colorR: rand(110, 255), colorG: rand(110, 255), colorB: rand(110, 255),
            v_strokeW: rand(1, 4), v_width: rand(0.9, 1.1),
            g_amp: rand(0.1, 0.4), alpha: 245
        };
    }
    static cross(d1, d2) {
        const c = this.createRandom();
        c.pillar = Math.random() < 0.5 ? d1.pillar : d2.pillar;
        c.type = Math.random() < 0.5 ? d1.type : d2.type;
        c.colorR = (d1.colorR + d2.colorR)/2; c.colorG = (d1.colorG + d2.colorG)/2; c.colorB = (d1.colorB + d2.colorB)/2;
        return c;
    }
}

// ═══════════════════════════════════════════════════════════════
// LIVING TYPO
// ═══════════════════════════════════════════════════════════════
class LivingTypo {
    constructor(p, cfg={}) {
        this.p=p; this.atomId=_uid++;
        this.x = cfg.x||0; this.y = cfg.y||0;
        this.char = cfg.char||pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        this.dna = cfg.dna||BioGenome.createRandom();
        this.vertices = []; this.rebuild();
    }
    rebuild() { this.vertices = getVertices(this.p, this.char); }
    update() {
        const p=this.p; const t = p.frameCount*0.015;
        this.vertices.forEach(v => {
            const f = p5.Vector.fromAngle(p.noise(v.pos.x*0.01, v.pos.y*0.01, t)*p.TWO_PI*2).mult(this.dna.g_amp);
            f.add(p5.Vector.sub(v.base, v.pos).mult(0.08));
            v.vel.add(f); v.vel.mult(0.9); v.pos.add(v.vel);
        });
    }
    draw() {
        if(!this.vertices.length) return;
        const p=this.p; const d=this.dna;
        p.push(); p.translate(this.x, this.y); p.scale(d.v_width, 1.0);
        this.renderHybrid(p, d);
        p.pop();
    }

    renderHybrid(p, d) {
        const v = this.vertices;
        const isOrd = v[0]?.ordered;
        const col = p.color(d.colorR, d.colorG, d.colorB, d.alpha);
        p.stroke(col); p.noFill();
        const sw = d.v_strokeW;

        // HIGH-END HYBRID RENDERING ENGINE
        switch(d.type) {
            // PHYSIQUE: HARD EDGES, LINES, FACETS
            case 'CRYSTAL':
                p.strokeWeight(0.5); for(let i=0; i<v.length-5; i+=8) { p.fill(d.colorR,d.colorG,d.colorB,30); p.triangle(v[i].pos.x, v[i].pos.y, v[i+3].pos.x, v[i+3].pos.y, 0,0); }
                break;
            case 'MECHANIC':
                v.forEach((vt,i)=>{ if(i%15===0) { p.strokeWeight(1); p.rect(vt.pos.x, vt.pos.y, 8,8); p.line(vt.pos.x, vt.pos.y, vt.base.x, vt.base.y); } });
                break;
            case 'CHROME':
                p.strokeWeight(sw*2); p.stroke(255); this.path(p,v,isOrd); p.strokeWeight(sw); p.stroke(col); this.path(p,v,isOrd);
                break;

            // BIOLOGIQUE: SOFT CURVES, BUBBLES, BOIDS
            case 'FLUID':
            case 'JELLY':
                p.strokeWeight(sw*1.5); p.beginShape(); v.forEach(vt=>p.curveVertex(vt.pos.x, vt.pos.y)); p.endShape();
                break;
            case 'BUBBLE':
                p.noStroke(); p.fill(d.colorR,d.colorG,d.colorB,160); v.forEach((vt,i)=>{ if(i%10===0) p.circle(vt.pos.x, vt.pos.y, sw*6); });
                break;
            case 'DNA_HELIX':
                for(let i=0; i<v.length-1; i+=12) { p.strokeWeight(1); p.line(v[i].pos.x-15,v[i].pos.y,v[i].pos.x+15,v[i].pos.y); p.fill(255); p.circle(v[i].pos.x-15,v[i].pos.y,5); }
                break;
            case 'BOIDS':
                p.noStroke(); p.fill(col); v.forEach((vt,i)=>{ if(i%6===0) { p.push(); p.translate(vt.pos.x, vt.pos.y); p.rotate(vt.vel.heading()); p.triangle(0, -3, 8, 0, 0, 3); p.pop(); } });
                break;

            // MATHEMATIQUE: CALCULATED, NETWORK, FRACTAL
            case 'NEURAL':
                p.strokeWeight(0.4); for(let i=0; i<v.length; i+=12) for(let j=i+12; j<v.length; j+=35) { if(p.dist(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y)<50) p.line(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y); }
                break;
            case 'QUANTUM':
                p.strokeWeight(0.5); v.forEach(vt => p.line(vt.pos.x, vt.pos.y, vt.pos.x + p.random(-25,25), vt.pos.y + p.random(-25,25)));
                break;
            case 'MANDELBROT':
                for(let k=1; k<5; k++) { p.push(); p.scale(1/k); p.strokeWeight(sw/k); this.path(p,v,isOrd); p.pop(); }
                break;

            // OPTIQUE: LIGHT, HALO, SCANLINE
            case 'NEON':
                p.strokeWeight(sw*4); p.stroke(d.colorR,d.colorG,d.colorB,30); this.path(p,v,isOrd);
                p.strokeWeight(sw); p.stroke(255); this.path(p,v,isOrd);
                break;
            case 'OP_ART':
                p.strokeWeight(0.5); for(let k=0; k<6; k++) { p.beginShape(); v.forEach(vt=>p.vertex(vt.pos.x*(1+k*0.08), vt.pos.y*(1+k*0.08))); p.endShape(p.CLOSE); }
                break;
            case 'INK':
                p.strokeWeight(sw*2); if(isOrd) { p.beginShape(); v.forEach(vt=>p.curveVertex(vt.pos.x + p.noise(vt.pos.y*0.05)*15, vt.pos.y)); p.endShape(); } else { v.forEach(vt=>p.point(vt.pos.x, vt.pos.y)); }
                break;
            case 'SCANLINE':
                p.strokeWeight(1.5); v.forEach(vt => { if(p.frameCount % 20 < 10) p.line(vt.pos.x - 60, vt.pos.y, vt.pos.x + 60, vt.pos.y); p.point(vt.pos.x, vt.pos.y); });
                break;

            // DEFAULT: HYBRID MIX (LINE + RANDOM POINTS)
            default:
                p.strokeWeight(sw); 
                if(isOrd && p.random()>0.5) { this.path(p,v,isOrd); } 
                else { v.forEach(vt => { if(p.random()>0.3) p.point(vt.pos.x, vt.pos.y); else if(isOrd) p.line(vt.pos.x, vt.pos.y, vt.base.x, vt.base.y); }); }
        }
    }

    path(p,v,isOrd) {
        if(isOrd) { p.beginShape(); v.forEach(vt=>p.vertex(vt.pos.x,vt.pos.y)); p.endShape(); }
        else { v.forEach(vt=>p.point(vt.pos.x,vt.pos.y)); }
    }
}

// ═══════════════════════════════════════════════════════════════
// UNIVERSE: STABILIZED UI & CORE
// ═══════════════════════════════════════════════════════════════
class TypoUniverse {
    constructor(p) { this.p=p; this.initUI(); this.initNav(); }
    addAtom(x=null,y=null,char=null,dna=null) {
        const a=new LivingTypo(this.p,{x,y,char,dna}); APP_STATE.atoms.push(a); this.updateList(); return a;
    }
    updateList() {
        const ml=document.getElementById('molecule-list'); if(!ml) return;
        ml.innerHTML=APP_STATE.atoms.map(a=>`<li class="molecule-item" onclick="window.focusOn(${a.atomId})">
            <span class="status-dot" style="background:rgb(${a.dna.colorR},${a.dna.colorG},${a.dna.colorB})"></span> 
            ${a.char} <small>[${a.dna.pillar} / ${a.dna.type}]</small>
        </li>`).join('');
    }
    initUI() { document.getElementById('add-atom').onclick=()=>this.addAtom(); }
    initNav() {
        let drag=null, pan=false;
        const w=(cx,cy)=>({wx:(cx-this.p.width/2-APP_STATE.view.x)/APP_STATE.view.zoom, wy:(cy-this.p.height/2-APP_STATE.view.y)/APP_STATE.view.zoom});
        window.addEventListener('mousedown',e=>{
            if(e.target.closest('.ui-overlay')) return;
            const{wx,wy}=w(e.clientX,e.clientY);
            drag=APP_STATE.atoms.find(a=>Math.hypot(a.x-wx,a.y-wy)<120/APP_STATE.view.zoom);
            if(!drag) pan=true;
        });
        window.addEventListener('mousemove',e=>{
            if(drag){ drag.x+=e.movementX/APP_STATE.view.zoom; drag.y+=e.movementY/APP_STATE.view.zoom; }
            else if(pan){ APP_STATE.view.x+=e.movementX; APP_STATE.view.y+=e.movementY; }
        });
        window.addEventListener('mouseup',()=>{ if(drag)this.checkFusion(drag); pan=false; drag=null; });
        window.addEventListener('wheel',e=>{ if(e.target.closest('.ui-overlay')) return; e.preventDefault(); APP_STATE.view.zoom=clamp(APP_STATE.view.zoom*(e.deltaY>0?0.95:1.05),0.05,5); },{passive:false});
        window.focusOn = (id) => {
            const a=APP_STATE.atoms.find(at=>at.atomId===id);
            if(a){ APP_STATE.view.x=-a.x*APP_STATE.view.zoom; APP_STATE.view.y=-a.y*APP_STATE.view.zoom; }
        };
    }
    checkFusion(m) {
        const o=APP_STATE.atoms.find(at=>at!==m && Math.hypot(at.x-m.x,at.y-m.y)<100);
        if(!o) return;
        this.addAtom((m.x+o.x)/2, (m.y+o.y)/2, pick([m.char,o.char]), BioGenome.cross(m.dna,o.dna));
        APP_STATE.atoms=APP_STATE.atoms.filter(a=>a!==m && a!==o); this.updateList();
    }
}

const sketch = (p) => {
    let TU;
    p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight).parent('stage');
        TU = new TypoUniverse(p);
        p.loadFont('https://fonts.gstatic.com/s/outfit/v11/QGYtz_MV_NIiAd7uPTufnjU.ttf', (f)=>{GLOBAL_FONT=f; APP_STATE.atoms.forEach(a=>a.rebuild());});
        for(let i=0; i<10; i++) TU.addAtom((i%5-2)*350, (Math.floor(i/5)-0.5)*350);
        document.getElementById('loader').style.display='none';
    };
    p.draw = () => {
        p.clear(); p.push();
        p.translate(p.width/2+APP_STATE.view.x, p.height/2+APP_STATE.view.y); p.scale(APP_STATE.view.zoom);
        APP_STATE.atoms.forEach(a=>{ a.update(); a.draw(); });
        p.pop();
        p.resetMatrix(); p.fill(255,40); p.textSize(10);
        p.text(`v64.0 | THE HYBRID ENGINE | LINE & POINT DIVERSITY`, 20, p.height-20);
    };
};
new p5(sketch);

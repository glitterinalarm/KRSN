// Typography Lab - Spore Engine v65.0
// RADICAL DIVERSITY: NO MORE DEFAULT RENDERING. EVERY FAMILY IS UNIQUE & BOLD.

console.log("TypoLab v65.0 — RADICAL IMPACT ENGINE");

let _uid = 0;
let GLOBAL_FONT = null;
const APP_STATE = { atoms: [], view: { x: 0, y: 0, zoom: 0.8 } };
const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (arr) => arr[arr.length * Math.random() | 0];

// ═══════════════════════════════════════════════════════════════
// VERTEX GEN
// ═══════════════════════════════════════════════════════════════
function getVertices(p, char) {
    if(GLOBAL_FONT) {
        try {
            const pts = GLOBAL_FONT.textToPoints(char, -80, 80, 180, { sampleFactor: 0.4 });
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
            if (pg.pixels[i]>127) pts.push({x:x-sz/2, y:y-sz/2});
        }
    }
    return pts.map(pt => ({pos:p.createVector(pt.x*1.4,pt.y*1.4), base:p.createVector(pt.x*1.4,pt.y*1.4), vel:p.createVector(0,0), ordered: false}));
}

// ═══════════════════════════════════════════════════════════════
// GENOME: THE 4 PILLARS (RE-IMPOSED)
// ═══════════════════════════════════════════════════════════════
class BioGenome {
    static PILLARS = {
        'PHYSIQUE': ['CRYSTAL', 'MECHANIC', 'CHROME', 'GLITCH', 'GRAVITY', 'ORIGAMI', 'CARBON'],
        'BIOLOGIQUE': ['DNA_HELIX', 'FLUID', 'BUBBLE', 'PLASMA', 'BOIDS', 'L-SYSTEM', 'MOSS'],
        'MATHEMATIQUE': ['NEURAL', 'TURING', 'QUANTUM', 'VORONOI', 'MANDELBROT', 'FIBONACCI'],
        'OPTIQUE': ['NEON', 'OP_ART', 'SCANLINE', 'DITHERING', 'INK', 'CELESTIAL', 'PRISM']
    };
    static createRandom() {
        const pillar = pick(Object.keys(this.PILLARS));
        const type = pick(this.PILLARS[pillar]);
        return {
            pillar, type,
            colorR: rand(150, 255), colorG: rand(150, 255), colorB: rand(150, 255),
            v_strokeW: rand(4, 12), // RADICAL WEIGHT
            v_width: rand(0.95, 1.1), g_amp: rand(0.2, 0.6), alpha: 255
        };
    }
    static cross(d1, d2) {
        let c = this.createRandom();
        c.pillar = Math.random() < 0.5 ? d1.pillar : d2.pillar;
        c.type = Math.random() < 0.5 ? d1.type : d2.type;
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
        this.renderRadical(p, d);
        p.pop();
    }

    renderRadical(p, d) {
        const v = this.vertices;
        const isOrd = v[0]?.ordered;
        const col = p.color(d.colorR, d.colorG, d.colorB);
        const sw = d.v_strokeW;
        p.noFill(); p.stroke(col);

        // 1. BASE VISIBILITY LAYER (Ensure the letter is ALWAYS THERE)
        p.strokeWeight(sw*0.5); p.stroke(d.colorR,d.colorG,d.colorB,80);
        this.path(p,v,isOrd);

        // 2. RADICAL FAMILY EFFECT
        p.stroke(col);
        switch(d.type) {
            case 'NEON':
                p.strokeWeight(sw*4); p.stroke(d.colorR,d.colorG,d.colorB,40); this.path(p,v,isOrd);
                p.strokeWeight(sw); p.stroke(255); this.path(p,v,isOrd);
                break;
            case 'CHROME':
                p.strokeWeight(sw*2); p.stroke(255); this.path(p,v,isOrd);
                p.strokeWeight(sw*0.5); p.stroke(0); this.path(p,v,isOrd);
                break;
            case 'CRYSTAL':
            case 'ORIGAMI':
                p.strokeWeight(1); p.fill(d.colorR,d.colorG,d.colorB,100); 
                for(let i=0; i<v.length-10; i+=12) { p.triangle(v[i].pos.x, v[i].pos.y, v[i+6].pos.x, v[i+6].pos.y, 0,0); }
                break;
            case 'BUBBLE':
                p.noStroke(); p.fill(col); v.forEach((vt,i)=>{ if(i%8===0) p.circle(vt.pos.x, vt.pos.y, sw*4); });
                break;
            case 'NEURAL':
                p.strokeWeight(0.8); for(let i=0; i<v.length; i+=15) for(let j=i+15; j<v.length; j+=40) { if(p.dist(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y)<60) p.line(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y); }
                break;
            case 'QUANTUM':
                p.strokeWeight(1.5); v.forEach(vt => { p.line(vt.pos.x, vt.pos.y, vt.pos.x + p.random(-40,40), vt.pos.y + p.random(-40,40)); });
                break;
            case 'GLITCH':
                p.strokeWeight(sw*2); v.forEach(vt => { if(p.random()>0.9) { p.stroke(255); p.line(vt.pos.x-60, vt.pos.y, vt.pos.x+60, vt.pos.y); } p.stroke(col); p.point(vt.pos.x, vt.pos.y); });
                break;
            case 'OP_ART':
                p.strokeWeight(1); for(let k=0; k<8; k++) { p.push(); p.translate(k*2, k*2); this.path(p,v,isOrd); p.pop(); }
                break;
            case 'DNA_HELIX':
                for(let i=0; i<v.length-1; i+=10) { p.strokeWeight(2); p.line(v[i].pos.x-20, v[i].pos.y, v[i].pos.x+20, v[i].pos.y); p.fill(255); p.circle(v[i].pos.x-20, v[i].pos.y, 6); }
                break;
            case 'PLASMA':
                p.noStroke(); p.fill(d.colorR,d.colorG,d.colorB,40); v.forEach((vt,i)=>{ p.circle(vt.pos.x + p.random(-15,15), vt.pos.y + p.random(-15,15), sw*3); });
                break;
            case 'SCANLINE':
                p.strokeWeight(3); v.forEach(vt => { if(Math.floor(vt.pos.y / 10) % 2 === 0) p.line(vt.pos.x - 50, vt.pos.y, vt.pos.x + 50, vt.pos.y); });
                break;
            case 'VORONOI':
                p.strokeWeight(1); p.fill(d.colorR,d.colorG,d.colorB,50); for(let i=0; i<v.length-5; i+=15) { p.beginShape(); p.vertex(v[i].pos.x,v[i].pos.y); p.vertex(v[i+5].pos.x,v[i+5].pos.y); p.vertex(0,0); p.endShape(p.CLOSE); }
                break;
            default:
                // FALLBACK: THICK CONTRASTED LINE
                p.strokeWeight(sw); this.path(p,v,isOrd);
        }
    }

    path(p,v,isOrd) {
        if(isOrd) { p.beginShape(); v.forEach(vt=>p.vertex(vt.pos.x,vt.pos.y)); p.endShape(); }
        else { v.forEach(vt=>p.point(vt.pos.x,vt.pos.y)); }
    }
}

// ═══════════════════════════════════════════════════════════════
// UNIVERSE
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
            drag=APP_STATE.atoms.find(a=>{ const{wx,wy}=w(e.clientX,e.clientY); return Math.hypot(a.x-wx,a.y-wy)<150/APP_STATE.view.zoom; });
            if(!drag) pan=true;
        });
        window.addEventListener('mousemove',e=>{
            if(drag){ drag.x+=e.movementX/APP_STATE.view.zoom; drag.y+=e.movementY/APP_STATE.view.zoom; }
            else if(pan){ APP_STATE.view.x+=e.movementX; APP_STATE.view.y+=e.movementY; }
        });
        window.addEventListener('mouseup',()=>{ if(drag)this.checkFusion(drag); pan=false; drag=null; });
        window.addEventListener('wheel',e=>{ if(e.target.closest('.ui-overlay')) return; e.preventDefault(); APP_STATE.view.zoom=clamp(APP_STATE.view.zoom*(e.deltaY>0?0.9:1.1),0.05,5); },{passive:false});
        window.focusOn = (id) => {
            const a=APP_STATE.atoms.find(at=>at.atomId===id);
            if(a){ APP_STATE.view.x=-a.x*APP_STATE.view.zoom; APP_STATE.view.y=-a.y*APP_STATE.view.zoom; }
        };
    }
    checkFusion(m) {
        const o=APP_STATE.atoms.find(at=>at!==m && Math.hypot(at.x-m.x,at.y-m.y)<80);
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
        for(let i=0; i<8; i++) TU.addAtom((i%4-1.5)*400, (Math.floor(i/4)-0.5)*350);
        document.getElementById('loader').style.display='none';
    };
    p.draw = () => {
        p.clear(); p.push();
        p.translate(p.width/2+APP_STATE.view.x, p.height/2+APP_STATE.view.y); p.scale(APP_STATE.view.zoom);
        APP_STATE.atoms.forEach(a=>{ a.update(); a.draw(); });
        p.pop();
        p.resetMatrix(); p.fill(255,40); p.textSize(10);
        p.text(`v65.0 | RADICAL IMPACT | NO MORE DEFAULTS`, 20, p.height-20);
    };
};
new p5(sketch);

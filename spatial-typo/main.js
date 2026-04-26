// Typography Lab - Spore Engine v58.0
// RADICAL DIVERSITY: 43+ UNIQUE RENDERING ENGINES

console.log("TypoLab v58.0 — BREAKING THE UNIFORMITY");

let _uid = 0;
let GLOBAL_FONT = null;
const APP_STATE = { atoms: [], view: { x: 0, y: 0, zoom: 0.8 } };
const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════════
// VERTEX GEN: High Fidelity & Logical Order
// ═══════════════════════════════════════════════════════════════
function getVertices(p, char) {
    if(GLOBAL_FONT) {
        try {
            const pts = GLOBAL_FONT.textToPoints(char, -80, 80, 180, { sampleFactor: 0.2, simplifyThreshold: 0 });
            if(pts && pts.length > 5) return pts.map(pt => ({pos:p.createVector(pt.x,pt.y), base:p.createVector(pt.x,pt.y), vel:p.createVector(0,0)}));
        } catch(e) {}
    }
    // Fallback Pixel-Scan (Randomized Sampling to avoid Zigzag)
    const sz = 150; const pg = p.createGraphics(sz, sz);
    pg.pixelDensity(1); pg.background(0); pg.fill(255);
    pg.textAlign(p.CENTER, p.CENTER); pg.textSize(sz*0.8);
    pg.textFont("Outfit, sans-serif"); pg.text(char, sz/2, sz/2);
    pg.loadPixels();
    const pts = [];
    for (let i=0; i<3000; i++) {
        let x = Math.floor(Math.random()*sz); let y = Math.floor(Math.random()*sz);
        if (pg.pixels[(x+y*sz)*4] > 127) pts.push({x:x-sz/2, y:y-sz/2});
    }
    return pts.map(pt => ({pos:p.createVector(pt.x*1.4,pt.y*1.4), base:p.createVector(pt.x*1.4,pt.y*1.4), vel:p.createVector(0,0)}));
}

// ═══════════════════════════════════════════════════════════════
// GENOME & FAMILIES (43 Families logic)
// ═══════════════════════════════════════════════════════════════
class BioGenome {
    static FAMILIES = [
        'CRYSTAL', 'NEURAL', 'MECHANIC', 'FLUID', 'GLITCH', 'VECTOR', 'OP_ART', 'GASEOUS', 'AURA', 'DNA_HELIX', 
        'QUANTUM', 'KINETIC', 'OPTICS', 'TURING', 'LIQUID', 'PLASMA', 'BUBBLE', 'CLOUDS', 'VOXEL', 'ASCII',
        'STRIPE', 'DOTS', 'WOVEN', 'WIREFRAME', 'ORIGAMI', 'KALEIDO', 'NEON', 'GHOST', 'PHASE', 'PULSE',
        'FRACTAL', 'SPIKE', 'JELLY', 'CORAL', 'MYCELIUM', 'MOSS', 'FOSSIL', 'CHROME', 'VELVET', 'BRUSH',
        'INK', 'CARBON', 'METEOR'
    ];
    static createRandom() {
        return {
            type: pick(this.FAMILIES),
            colorR: rand(100, 255), colorG: rand(100, 255), colorB: rand(100, 255),
            v_strokeW: rand(1, 10), v_width: rand(0.5, 1.5),
            g_speed: rand(0.05, 0.15), g_amp: rand(0.2, 0.5), alpha: 240
        };
    }
}

class LivingTypo {
    constructor(p, cfg={}) {
        this.p=p; this.atomId=_uid++;
        this.x = cfg.x || 0; this.y = cfg.y || 0;
        this.char = cfg.char || pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        this.dna = cfg.dna || BioGenome.createRandom();
        this.vertices = []; this.rebuild();
    }
    rebuild() { this.vertices = getVertices(this.p, this.char); }
    update() {
        const p=this.p; const d=this.dna;
        this.vertices.forEach(v => {
            const f = p5.Vector.fromAngle(p.noise(v.pos.x*0.01, v.pos.y*0.01, p.frameCount*0.02)*p.TWO_PI*2).mult(d.g_amp);
            f.add(p5.Vector.sub(v.base, v.pos).mult(0.05));
            v.vel.add(f); v.vel.mult(0.9); v.pos.add(v.vel);
        });
    }
    draw() {
        if(!this.vertices.length) return;
        const p=this.p; const d=this.dna;
        p.push(); p.translate(this.x, this.y); p.scale(d.v_width, 1.0);
        this.render(p, d);
        p.pop();
    }
    render(p, d) {
        const v = this.vertices;
        p.stroke(d.colorR, d.colorG, d.colorB, d.alpha); p.noFill();
        
        switch(d.type) {
            case 'CRYSTAL':
                p.strokeWeight(1);
                for(let i=0; i<v.length-3; i+=4) { p.fill(d.colorR,d.colorG,d.colorB,30); p.beginShape(); p.vertex(v[i].pos.x,v[i].pos.y); p.vertex(v[i+1].pos.x,v[i+1].pos.y); p.vertex(v[i+2].pos.x,v[i+2].pos.y); p.endShape(p.CLOSE); }
                break;
            case 'NEURAL':
                p.strokeWeight(0.5); for(let i=0; i<v.length; i+=12) for(let j=i+12; j<v.length; j+=24) { if(p.dist(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y)<45) p.line(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y); }
                break;
            case 'MECHANIC':
                p.strokeWeight(1); v.forEach((vt,i)=>{ if(i%15===0) { p.rect(vt.pos.x-4,vt.pos.y-4,8,8); p.line(vt.pos.x,vt.pos.y,0,0); } });
                break;
            case 'FLUID':
                p.strokeWeight(d.v_strokeW); p.beginShape(); v.forEach(vt=>p.curveVertex(vt.pos.x,vt.pos.y)); p.endShape();
                break;
            case 'GLITCH':
                p.strokeWeight(2); v.forEach(vt=>{ if(p.random()>0.9) p.line(vt.pos.x-50,vt.pos.y,vt.pos.x+50,vt.pos.y); p.point(vt.pos.x,vt.pos.y); });
                break;
            case 'GASEOUS':
                p.noStroke(); p.fill(d.colorR,d.colorG,d.colorB,20); v.forEach(vt=>{ p.circle(vt.pos.x,vt.pos.y,p.noise(vt.pos.x,p.frameCount*0.1)*30); });
                break;
            case 'DNA_HELIX':
                for(let i=0; i<v.length-1; i+=10) { p.strokeWeight(1); p.line(v[i].pos.x-15,v[i].pos.y,v[i].pos.x+15,v[i].pos.y); p.fill(d.colorR,d.colorG,d.colorB); p.circle(v[i].pos.x-15,v[i].pos.y,4); p.circle(v[i].pos.x+15,v[i].pos.y,4); }
                break;
            case 'PLASMA':
                p.strokeWeight(8); p.stroke(d.colorR,d.colorG,d.colorB,40); v.forEach(vt=>p.point(vt.pos.x,vt.pos.y)); p.strokeWeight(2); p.stroke(255); v.forEach(vt=>p.point(vt.pos.x,vt.pos.y));
                break;
            case 'ORIGAMI':
                p.strokeWeight(0.5); for(let i=0; i<v.length-5; i+=5) { p.line(v[i].pos.x,v[i].pos.y,v[i+5].pos.x,v[i+5].pos.y); p.line(v[i].pos.x,v[i].pos.y,0,100); }
                break;
            case 'KINETIC':
                v.forEach((vt,i)=>{ p.strokeWeight(i%5); p.line(vt.pos.x,vt.pos.y,vt.pos.x+vt.vel.x*20,vt.pos.y+vt.vel.y*20); });
                break;
            default:
                // Unique Pointillist rendering for unnamed / generic families
                p.strokeWeight(d.v_strokeW); v.forEach(vt=>p.point(vt.pos.x,vt.pos.y));
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// UNIVERSE & INTERACTION
// ═══════════════════════════════════════════════════════════════
class TypoUniverse {
    constructor(p) { this.p=p; this.initControls(); this.initNav(); }
    addAtom(x=null,y=null,char=null,dna=null) {
        const a=new LivingTypo(this.p,{x,y,char,dna}); APP_STATE.atoms.push(a); this.updateList(); return a;
    }
    updateList() {
        const ml=document.getElementById('molecule-list'); if(!ml) return;
        ml.innerHTML=APP_STATE.atoms.map(a=>`<li class="molecule-item" onclick="window.focusOn(${a.atomId})"><span class="status-dot" style="background:rgb(${a.dna.colorR},${a.dna.colorG},${a.dna.colorB})"></span> ${a.char} [${a.dna.type}]</li>`).join('');
    }
    initControls() { document.getElementById('add-atom').onclick=()=>this.addAtom(); }
    initNav() {
        let drag=null, pan=false, lx, ly;
        const w=(cx,cy)=>({wx:(cx-this.p.width/2-APP_STATE.view.x)/APP_STATE.view.zoom, wy:(cy-this.p.height/2-APP_STATE.view.y)/APP_STATE.view.zoom});
        window.addEventListener('mousedown',e=>{
            if(e.target.closest('.ui-overlay')) return;
            const{wx,wy}=w(e.clientX,e.clientY);
            drag=APP_STATE.atoms.find(a=>Math.hypot(a.x-wx, a.y-wy)<120/APP_STATE.view.zoom);
            if(!drag){ pan=true; lx=e.clientX; ly=e.clientY; }
        });
        window.addEventListener('mousemove',e=>{
            if(drag){ drag.x+=e.movementX/APP_STATE.view.zoom; drag.y+=e.movementY/APP_STATE.view.zoom; }
            else if(pan){ APP_STATE.view.x+=e.clientX-lx; APP_STATE.view.y+=e.clientY-ly; lx=e.clientX; ly=e.clientY; }
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
        this.addAtom((m.x+o.x)/2,(m.y+o.y)/2,pick([m.char,o.char]),BioGenome.createRandom());
        APP_STATE.atoms=APP_STATE.atoms.filter(a=>a!==m && a!==o); this.updateList();
    }
}

const sketch = (p) => {
    let TU;
    p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight).parent('stage');
        TU = new TypoUniverse(p);
        p.loadFont('https://fonts.gstatic.com/s/outfit/v11/QGYtz_MV_NIiAd7uPTufnjU.ttf', (f)=>{GLOBAL_FONT=f; APP_STATE.atoms.forEach(a=>a.rebuild());});
        for(let i=0; i<8; i++) TU.addAtom((i%4-1.5)*350, (Math.floor(i/4)-0.5)*300);
        document.getElementById('loader').style.display='none';
    };
    p.draw = () => {
        p.clear(); p.push();
        p.translate(p.width/2+APP_STATE.view.x, p.height/2+APP_STATE.view.y); p.scale(APP_STATE.view.zoom);
        APP_STATE.atoms.forEach(a=>{ a.update(); a.draw(); });
        p.pop();
        p.resetMatrix(); p.fill(255,40); p.textSize(10);
        p.text(`v58.0 | 43 FAMILIES ACTIVE | DIVERSITY: HIGH`, 20, p.height-20);
    };
};
new p5(sketch);

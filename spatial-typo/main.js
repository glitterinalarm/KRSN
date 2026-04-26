// Typography Lab - Spore Engine v57.2
// BULLETPROOF TYPOGRAPHY: NO WAIT, NO BLACK SCREEN

console.log("TypoLab v57.2 — INSTANT VISIBILITY ENGINE");

let _uid = 0;
let GLOBAL_FONT = null;
const APP_STATE = { atoms: [], view: { x: 0, y: 0, zoom: 0.8 } };
const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════════
// ROBUST VERTEX GENERATOR (Pixel-Sampling Fallback)
// ═══════════════════════════════════════════════════════════════
function getVertices(p, char) {
    // 1. Try Font if available
    if(GLOBAL_FONT) {
        try {
            const pts = GLOBAL_FONT.textToPoints(char, -80, 80, 180, { sampleFactor: 0.18 });
            if(pts && pts.length > 0) return pts.map(pt => ({pos:p.createVector(pt.x,pt.y), base:p.createVector(pt.x,pt.y), vel:p.createVector(0,0)}));
        } catch(e) {}
    }
    
    // 2. Fallback to Pixel-Sampling (Instant & High Fidelity)
    const sz = 150; const pg = p.createGraphics(sz, sz);
    pg.pixelDensity(1); pg.background(0); pg.fill(255);
    pg.textAlign(p.CENTER, p.CENTER); pg.textSize(sz*0.8);
    pg.textFont("Outfit, sans-serif"); pg.text(char, sz/2, sz/2);
    pg.loadPixels();
    const pts = []; const step = 4;
    for (let y=0; y<sz; y+=step) {
        for (let x=0; x<sz; x+=step) {
            if (pg.pixels[(x+y*sz)*4]>127) pts.push({x:x-sz/2, y:y-sz/2});
        }
    }
    return pts.map(pt => ({pos:p.createVector(pt.x*1.4,pt.y*1.4), base:p.createVector(pt.x*1.4,pt.y*1.4), vel:p.createVector(0,0)}));
}

// ═══════════════════════════════════════════════════════════════
// ECOSYSTEM CLASSES
// ═══════════════════════════════════════════════════════════════
class BioGenome {
    static TYPES = ['CRYSTAL', 'NEURAL', 'MECHANIC', 'FLUID', 'GLITCH', 'VECTOR', 'OP_ART', 'GASEOUS', 'AURA', 'DNA_HELIX', 'FLUX', 'QUANTUM'];
    static createRandom() {
        return {
            type: pick(this.TYPES),
            colorR: rand(110, 255), colorG: rand(110, 255), colorB: rand(110, 255),
            v_strokeW: rand(1.5, 9), v_width: rand(0.7, 1.3),
            g_speed: 0.1, g_amp: 0.3, alpha: 240
        };
    }
    static cross(d1, d2) {
        const c = this.createRandom();
        c.type = Math.random() < 0.5 ? d1.type : d2.type;
        c.colorR = (d1.colorR+d2.colorR)/2; c.colorG = (d1.colorG+d2.colorG)/2; c.colorB = (d1.colorB+d2.colorB)/2;
        return c;
    }
}

class LivingTypo {
    constructor(p, cfg={}) {
        this.p=p; this.atomId=_uid++;
        this.x = cfg.x || 0; this.y = cfg.y || 0;
        this.char = cfg.char || pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        this.dna = cfg.dna || BioGenome.createRandom();
        this.rebuild();
    }
    rebuild() { this.vertices = getVertices(this.p, this.char); }
    update() {
        const p=this.p;
        this.vertices.forEach(v => {
            const f = p5.Vector.fromAngle(p.noise(v.pos.x*0.01, v.pos.y*0.01, p.frameCount*0.02)*p.TWO_PI*2).mult(this.dna.g_amp);
            f.add(p5.Vector.sub(v.base, v.pos).mult(0.04));
            v.vel.add(f); v.vel.mult(0.9); v.pos.add(v.vel);
        });
    }
    draw() {
        if(!this.vertices.length) return;
        const p=this.p; const d=this.dna;
        p.push(); p.translate(this.x, this.y); p.scale(d.v_width, 1.0);
        p.stroke(d.colorR, d.colorG, d.colorB, d.alpha); p.noFill();
        
        if (d.type === 'CRYSTAL') {
            for(let i=0; i<this.vertices.length-2; i+=4) { p.fill(d.colorR,d.colorG,d.colorB,40); p.triangle(this.vertices[i].pos.x, this.vertices[i].pos.y, this.vertices[i+1].pos.x, this.vertices[i+1].pos.y, this.vertices[i+2].pos.x, this.vertices[i+2].pos.y); }
        } else if (d.type === 'NEURAL') {
            p.strokeWeight(0.5); for(let i=0; i<this.vertices.length; i+=15) for(let j=i+15; j<this.vertices.length; j+=30) { if(p.dist(this.vertices[i].pos.x,this.vertices[i].pos.y,this.vertices[j].pos.x,this.vertices[j].pos.y)<40) p.line(this.vertices[i].pos.x,this.vertices[i].pos.y,this.vertices[j].pos.x,this.vertices[j].pos.y); }
        } else {
            for(let i=0; i<this.vertices.length-1; i++) {
                p.strokeWeight(d.v_strokeW * (0.6 + p.noise(i*0.1, p.frameCount*0.05)*2));
                p.line(this.vertices[i].pos.x, this.vertices[i].pos.y, this.vertices[i+1].pos.x, this.vertices[i+1].pos.y);
            }
        }
        p.pop();
    }
}

// ═══════════════════════════════════════════════════════════════
// UNIVERSE
// ═══════════════════════════════════════════════════════════════
class TypoUniverse {
    constructor(p) { this.p=p; this.initNav(); document.getElementById('add-atom').onclick=()=>this.addAtom(); }
    addAtom(x=null,y=null,char=null,dna=null) {
        const a = new LivingTypo(this.p, {x,y,char,dna});
        APP_STATE.atoms.push(a); this.updateList(); return a;
    }
    removeAtom(id) { APP_STATE.atoms=APP_STATE.atoms.filter(a=>a.atomId!==id); this.updateList(); }
    updateList() {
        const ml=document.getElementById('molecule-list'); if(!ml) return;
        ml.innerHTML=APP_STATE.atoms.map(a=>`<li class="molecule-item" onclick="window.focusOn(${a.atomId})"><span class="status-dot" style="background:rgb(${a.dna.colorR},${a.dna.colorG},${a.dna.colorB})"></span> ${a.char} [${a.dna.type}]</li>`).join('');
    }
    checkFusion(m) {
        const o = APP_STATE.atoms.find(at=>at!==m && Math.hypot(at.x-m.x, at.y-m.y)<80);
        if(!o) return;
        const offspring = BioGenome.cross(m.dna, o.dna);
        this.addAtom((m.x+o.x)/2, (m.y+o.y)/2, pick([m.char, o.char]), offspring);
        this.removeAtom(m.atomId); this.removeAtom(o.atomId);
        // Visual effect
        this.p.background(255, 100);
    }
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
        window.addEventListener('wheel',e=>{ if(e.target.closest('.ui-overlay')) return; e.preventDefault(); APP_STATE.view.zoom=clamp(APP_STATE.view.zoom*(e.deltaY>0?0.92:1.08),0.05,5); },{passive:false});
        window.focusOn = (id) => {
            const a=APP_STATE.atoms.find(at=>at.atomId===id);
            if(a){ APP_STATE.view.x=-a.x*APP_STATE.view.zoom; APP_STATE.view.y=-a.y*APP_STATE.view.zoom; }
        };
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
        p.text(`v57.2 | INSTANT VISIBILITY ACTIVE | FUSION: READY`, 20, p.height-20);
    };
};
new p5(sketch);

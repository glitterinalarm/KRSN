// Typography Lab - Spore Engine v58.1
// DIFFERENTIATED PHYSICS: NO MORE UNIVERSAL UNDERWATER EFFECT

console.log("TypoLab v58.1 — MATERIAL PHYSICS ACTIVE");

let _uid = 0;
let GLOBAL_FONT = null;
const APP_STATE = { atoms: [], view: { x: 0, y: 0, zoom: 0.7 } };
const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════════
// VERTEX GEN
// ═══════════════════════════════════════════════════════════════
function getVertices(p, char) {
    if(GLOBAL_FONT) {
        try {
            const pts = GLOBAL_FONT.textToPoints(char, -80, 80, 180, { sampleFactor: 0.22 });
            if(pts && pts.length > 5) return pts.map(pt => ({pos:p.createVector(pt.x,pt.y), base:p.createVector(pt.x,pt.y), vel:p.createVector(0,0)}));
        } catch(e) {}
    }
    const sz = 150; const pg = p.createGraphics(sz, sz);
    pg.pixelDensity(1); pg.background(0); pg.fill(255);
    pg.textAlign(p.CENTER, p.CENTER); pg.textSize(sz*0.8);
    pg.textFont("Outfit"); pg.text(char, sz/2, sz/2);
    pg.loadPixels();
    const pts = [];
    for (let i=0; i<2500; i++) {
        let x = Math.floor(p.random(sz)); let y = Math.floor(p.random(sz));
        if (pg.pixels[(x+y*sz)*4] > 127) pts.push({x:x-sz/2, y:y-sz/2});
    }
    return pts.map(pt => ({pos:p.createVector(pt.x*1.3,pt.y*1.3), base:p.createVector(pt.x*1.3,pt.y*1.3), vel:p.createVector(0,0)}));
}

// ═══════════════════════════════════════════════════════════════
// GENOME
// ═══════════════════════════════════════════════════════════════
class BioGenome {
    static FAMILIES = ['CRYSTAL', 'NEURAL', 'MECHANIC', 'FLUID', 'GLITCH', 'VECTOR', 'OP_ART', 'GASEOUS', 'AURA', 'DNA_HELIX', 'PLASMA', 'ORIGAMI', 'KINETIC', 'LIQUID', 'BUBBLE', 'NEON', 'JELLY'];
    static createRandom() {
        const type = pick(this.FAMILIES);
        return {
            type: type,
            colorR: rand(100, 255), colorG: rand(100, 255), colorB: rand(100, 255),
            v_strokeW: rand(1, 10), v_width: rand(0.6, 1.4),
            // Physics Traits
            p_viscosity: type==='FLUID'||type==='JELLY'||type==='LIQUID' ? 0.95 : 0.8,
            p_stiffness: type==='CRYSTAL'||type==='ORIGAMI'||type==='MECHANIC' ? 0.2 : 0.04,
            p_agitation: type==='GLITCH'||type==='PLASMA' ? 2.5 : 0.4,
            alpha: 240
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// LIVING ORGANISM
// ═══════════════════════════════════════════════════════════════
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
        const t = p.frameCount * 0.01;
        this.vertices.forEach(v => {
            let f = p.createVector(0,0);
            if(d.type==='GLITCH' && p.random()>0.98) f.add(p.random(-20,20), p.random(-20,20));
            
            // Unique Physics Waves
            if(d.type==='CRYSTAL' || d.type==='MECHANIC') {
                // Stiff movement
                f.add(p5.Vector.sub(v.base, v.pos).mult(d.p_stiffness));
            } else {
                // Organic/Agitated movement
                const n = p.noise(v.pos.x*0.01, v.pos.y*0.01, t);
                f.add(p5.Vector.fromAngle(n*p.TWO_PI*4).mult(d.p_agitation));
                f.add(p5.Vector.sub(v.base, v.pos).mult(d.p_stiffness));
            }
            
            v.vel.add(f); v.vel.mult(d.p_viscosity); v.pos.add(v.vel);
        });
    }
    draw() {
        if(!this.vertices.length) return;
        const p=this.p; const d=this.dna;
        p.push(); p.translate(this.x, this.y); p.scale(d.v_width, 1.0);
        p.stroke(d.colorR, d.colorG, d.colorB, d.alpha); p.noFill();
        this.render(p, d);
        p.pop();
    }
    render(p, d) {
        const v = this.vertices;
        switch(d.type) {
            case 'CRYSTAL':
                p.strokeWeight(1); for(let i=0; i<v.length-3; i+=4) { p.fill(d.colorR,d.colorG,d.colorB,40); p.triangle(v[i].pos.x,v[i].pos.y,v[i+1].pos.x,v[i+1].pos.y,v[i+2].pos.x,v[i+2].pos.y); }
                break;
            case 'NEURAL':
                p.strokeWeight(0.5); for(let i=0; i<v.length; i+=15) for(let j=i+15; j<v.length; j+=30) { if(p.dist(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y)<40) p.line(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y); }
                break;
            case 'MECHANIC':
                p.rectMode(p.CENTER); p.strokeWeight(1.5); v.forEach((vt,i)=>{ if(i%12===0) { p.rect(vt.pos.x,vt.pos.y,10,10); p.line(vt.pos.x,vt.pos.y,vt.base.x,vt.base.y); } });
                break;
            case 'GLITCH':
                p.strokeWeight(2); v.forEach(vt=>{ if(p.random()>0.95) p.line(vt.pos.x-40,vt.pos.y,vt.pos.x+40,vt.pos.y); p.point(vt.pos.x,vt.pos.y); });
                break;
            case 'DNA_HELIX':
                for(let i=0; i<v.length-1; i+=12) { p.line(v[i].pos.x-10,v[i].pos.y,v[i].pos.x+10,v[i].pos.y); p.fill(255); p.circle(v[i].pos.x-10,v[i].pos.y,3); }
                break;
            case 'FLUID':
            case 'LIQUID':
            case 'JELLY':
                p.strokeWeight(d.v_strokeW); p.beginShape(); v.forEach(vt=>p.curveVertex(vt.pos.x,vt.pos.y)); p.endShape();
                break;
            default:
                p.strokeWeight(d.v_strokeW); v.forEach(vt=>p.point(vt.pos.x,vt.pos.y));
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// UNIVERSE
// ═══════════════════════════════════════════════════════════════
class TypoUniverse {
    constructor(p) { this.p=p; this.initNav(); document.getElementById('add-atom').onclick=()=>this.addAtom(); }
    addAtom(x=null,y=null,char=null,dna=null) {
        const a=new LivingTypo(this.p,{x,y,char,dna}); APP_STATE.atoms.push(a); this.updateList(); return a;
    }
    updateList() {
        const ml=document.getElementById('molecule-list'); if(!ml) return;
        ml.innerHTML=APP_STATE.atoms.map(a=>`<li class="molecule-item" onclick="window.focusOn(${a.atomId})"><span class="status-dot" style="background:rgb(${a.dna.colorR},${a.dna.colorG},${a.dna.colorB})"></span> ${a.char} [${a.dna.type}]</li>`).join('');
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
    checkFusion(m) {
        const o=APP_STATE.atoms.find(at=>at!==m && Math.hypot(at.x-m.x,at.y-m.y)<80);
        if(!o) return;
        this.addAtom((m.x+o.x)/2,(m.y+o.y)/2,pick([m.char,o.char]),BioGenome.createRandom());
        APP_STATE.atoms=APP_STATE.atoms.filter(a=>a!==m && a!==o); this.updateList();
        this.p.background(255,100);
    }
}

const sketch = (p) => {
    let TU;
    p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight).parent('stage');
        TU = new TypoUniverse(p);
        p.loadFont('https://fonts.gstatic.com/s/outfit/v11/QGYtz_MV_NIiAd7uPTufnjU.ttf', (f)=>{GLOBAL_FONT=f; APP_STATE.atoms.forEach(a=>a.rebuild());});
        for(let i=0; i<8; i++) TU.addAtom((i%4-1.5)*350, (Math.floor(i/4)-0.5)*350);
        document.getElementById('loader').style.display='none';
    };
    p.draw = () => {
        p.clear(); p.push();
        p.translate(p.width/2+APP_STATE.view.x, p.height/2+APP_STATE.view.y); p.scale(APP_STATE.view.zoom);
        APP_STATE.atoms.forEach(a=>{ a.update(); a.draw(); });
        p.pop();
        p.resetMatrix(); p.fill(255,40); p.textSize(10);
        p.text(`v58.1 | PHYSICS DIFFERENTIATED | MATERIAL ENGINE`, 20, p.height-20);
    };
};
new p5(sketch);

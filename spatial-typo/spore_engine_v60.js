// Typography Lab - Spore Engine v66.0
// STABILITY & CHARACTER UPDATE: FIXED FUSIONS & RADICAL DIVERSITY

console.log("TypoLab v66.0 — THE GREAT RESET");

let _uid = 0;
let GLOBAL_FONT = null;
const APP_STATE = { atoms: [], view: { x: 0, y: 0, zoom: 0.8 } };
const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════════
// VERTEX GEN: BOLDEST SKELETON
// ═══════════════════════════════════════════════════════════════
function getVertices(p, char) {
    if(GLOBAL_FONT) {
        try {
            const pts = GLOBAL_FONT.textToPoints(char, -80, 80, 200, { sampleFactor: 0.35 });
            if(pts && pts.length > 20) return pts.map(pt => ({pos:p.createVector(pt.x,pt.y), base:p.createVector(pt.x,pt.y), vel:p.createVector(0,0), ordered: true}));
        } catch(e) {}
    }
    const sz=150; const pg=p.createGraphics(sz,sz);
    pg.background(0); pg.fill(255); pg.textAlign(p.CENTER, p.CENTER); pg.textSize(sz*0.8); pg.text(char,sz/2,sz/2);
    pg.loadPixels(); const pts=[];
    for(let y=0; y<sz; y+=3) for(let x=0; x<sz; x+=3) if(pg.pixels[(x+y*sz)*4]>127) pts.push({x:x-sz/2, y:y-sz/2});
    return pts.map(pt => ({pos:p.createVector(pt.x*1.5,pt.y*1.5), base:p.createVector(pt.x*1.5,pt.y*1.5), vel:p.createVector(0,0), ordered: false}));
}

// ═══════════════════════════════════════════════════════════════
// GENOME: PILLAR-BASED
// ═══════════════════════════════════════════════════════════════
class BioGenome {
    static PILLARS = ['PHYSIQUE', 'BIOLOGIQUE', 'MATHEMATIQUE', 'OPTIQUE'];
    static createRandom() {
        const p = pick(this.PILLARS);
        return {
            pillar: p, seed: Math.random()*1000,
            color: [rand(150,255), rand(150,255), rand(150,255)],
            sw: rand(4,10), amp: rand(0.1, 0.8), stiffness: rand(0.05, 0.15)
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// LIVING ORGANISM
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
        const p=this.p; const d=this.dna;
        const t = p.frameCount * 0.015;
        this.vertices.forEach((v,i) => {
            const n = p.noise(v.pos.x*0.01 + d.seed, v.pos.y*0.01, t)*p.TWO_PI*2;
            const f = p5.Vector.fromAngle(n).mult(d.amp);
            f.add(p5.Vector.sub(v.base, v.pos).mult(d.stiffness));
            v.vel.add(f); v.vel.mult(0.85); v.pos.add(v.vel);
        });
    }
    draw() {
        const p=this.p; const d=this.dna;
        p.push(); p.translate(this.x, this.y);
        p.stroke(d.color[0], d.color[1], d.color[2]); p.strokeWeight(d.sw); p.noFill();
        
        switch(d.pillar) {
            case 'PHYSIQUE': this.drawPhys(p,d); break;
            case 'BIOLOGIQUE': this.drawBio(p,d); break;
            case 'MATHEMATIQUE': this.drawMath(p,d); break;
            case 'OPTIQUE': this.drawOptic(p,d); break;
        }
        p.pop();
    }
    drawPhys(p,d) {
        this.vertices.forEach((v,i)=>{ if(i%10===0){ p.rectMode(p.CENTER); p.rect(v.pos.x, v.pos.y, d.sw*3, d.sw*3); p.line(v.pos.x, v.pos.y, 0, 0); } });
    }
    drawBio(p,d) {
        p.beginShape(); this.vertices.forEach(v=>p.curveVertex(v.pos.x, v.pos.y)); p.endShape();
        this.vertices.forEach((v,i)=>{ if(i%20===0) p.circle(v.pos.x, v.pos.y, d.sw*4); });
    }
    drawMath(p,d) {
        for(let i=0; i<this.vertices.length; i+=15) for(let j=i+15; j<this.vertices.length; j+=40) {
            if(p.dist(this.vertices[i].pos.x, this.vertices[i].pos.y, this.vertices[j].pos.x, this.vertices[j].pos.y)<60)
                p.line(this.vertices[i].pos.x, this.vertices[i].pos.y, this.vertices[j].pos.x, this.vertices[j].pos.y);
        }
    }
    drawOptic(p,d) {
        p.strokeWeight(d.sw*3); p.stroke(d.color[0], d.color[1], d.color[2], 40); this.path(p);
        p.strokeWeight(d.sw); p.stroke(255); this.path(p);
    }
    path(p) { p.beginShape(); this.vertices.forEach(v=>p.vertex(v.pos.x, v.pos.y)); p.endShape(); }
}

// ═══════════════════════════════════════════════════════════════
// UNIVERSE: STABILIZED FUSION & DRAG
// ═══════════════════════════════════════════════════════════════
class TypoUniverse {
    constructor(p) { this.p=p; this.initUI(); this.initNav(); }
    addAtom(x=null,y=null,char=null,dna=null) {
        const a=new LivingTypo(this.p,{x,y,char,dna}); APP_STATE.atoms.push(a); this.updateList(); return a;
    }
    updateList() {
        const ml=document.getElementById('molecule-list'); if(!ml) return;
        ml.innerHTML=APP_STATE.atoms.map(a=>`<li class="molecule-item" onclick="window.focusOn(${a.atomId})">
            <span class="status-dot" style="background:rgb(${a.dna.color[0]},${a.dna.color[1]},${a.dna.color[2]})"></span> 
            ${a.char} <small>[${a.dna.pillar}]</small>
        </li>`).join('');
    }
    initUI() { document.getElementById('add-atom').onclick=()=>this.addAtom(); }
    initNav() {
        let drag=null, pan=false;
        const w=(cx,cy)=>({wx:(cx-this.p.width/2-APP_STATE.view.x)/APP_STATE.view.zoom, wy:(cy-this.p.height/2-APP_STATE.view.y)/APP_STATE.view.zoom});
        window.addEventListener('mousedown',e=>{
            if(e.target.closest('.ui-overlay')) return;
            const{wx,wy}=w(e.clientX,e.clientY);
            drag=APP_STATE.atoms.find(a=>Math.hypot(a.x-wx,a.y-wy)<150/APP_STATE.view.zoom);
            if(!drag) pan=true; else { APP_STATE.atoms=APP_STATE.atoms.filter(a=>a!==drag); APP_STATE.atoms.push(drag); } // Move to front
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
        // RADICAL FUSION DETECTION: WE CHECK ALL NEIGHBORS
        const o=APP_STATE.atoms.find(at=>at!==m && Math.hypot(at.x-m.x,at.y-m.y)<120);
        if(!o) return;
        // FLASH EFFECT
        this.p.background(255);
        this.addAtom((m.x+o.x)/2, (m.y+o.y)/2, pick([m.char,o.char]), BioGenome.createRandom());
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
        p.text(`v66.0 | STABILITY RESET | FUSION FIXED | UNIQUE SEEDS`, 20, p.height-20);
    };
};
new p5(sketch);

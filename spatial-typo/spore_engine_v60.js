// Typography Lab - Spore Engine v62.0
// THE 4 TAXONOMIC PILLARS: PHYSICAL, BIOLOGICAL, MATHEMATICAL, OPTICAL

console.log("TypoLab v62.0 — TAXONOMIC RESTRUCTURING ACTIVE");

let _uid = 0;
let GLOBAL_FONT = null;
const APP_STATE = { atoms: [], view: { x: 0, y: 0, zoom: 0.75 } };
const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════════
// VERTEX GEN
// ═══════════════════════════════════════════════════════════════
function getVertices(p, char) {
    if(GLOBAL_FONT) {
        try {
            const pts = GLOBAL_FONT.textToPoints(char, -80, 80, 180, { sampleFactor: 0.35 });
            if(pts && pts.length > 10) return pts.map(pt => ({pos:p.createVector(pt.x,pt.y), base:p.createVector(pt.x,pt.y), vel:p.createVector(0,0), ordered: true, seed: Math.random()}));
        } catch(e) {}
    }
    const sz = 150; const pg = p.createGraphics(sz, sz);
    pg.pixelDensity(1); pg.background(0); pg.fill(255);
    pg.textAlign(p.CENTER, p.CENTER); pg.textSize(sz*0.8);
    pg.textFont("Outfit, sans-serif"); pg.text(char, sz/2, sz/2);
    pg.loadPixels();
    const pts = [];
    for (let y=1; y<sz-1; y++) {
        for (let x=1; x<sz-1; x++) {
            let i = (x+y*sz)*4;
            if (pg.pixels[i]>127 && (pg.pixels[i-4]<127 || pg.pixels[i+4]<127 || pg.pixels[i-sz*4]<127 || pg.pixels[i+sz*4]<127)) {
                if(p.random()>0.3) pts.push({x:x-sz/2, y:y-sz/2});
            }
        }
    }
    return pts.map(pt => ({pos:p.createVector(pt.x*1.4,pt.y*1.4), base:p.createVector(pt.x*1.4,pt.y*1.4), vel:p.createVector(0,0), ordered: false, seed: Math.random()}));
}

// ═══════════════════════════════════════════════════════════════
// GENOME: PILLAR SYSTEM
// ═══════════════════════════════════════════════════════════════
class BioGenome {
    static PILLARS = {
        'PHYSIQUE': ['CRYSTAL', 'MECHANIC', 'VOXEL', 'ORIGAMI', 'CARBON', 'METEOR', 'VOLCANIC', 'CHROME'],
        'BIOLOGIQUE': ['DNA_HELIX', 'FLUID', 'JELLY', 'GASEOUS', 'AURA', 'PLASMA', 'BUBBLE', 'CORAL', 'MOSS', 'MYCELIUM'],
        'MATHEMATIQUE': ['NEURAL', 'TURING', 'FRACTAL', 'QUANTUM', 'VECTOR', 'SPIKE', 'PULSE', 'TESSERACT'],
        'OPTIQUE': ['NEON', 'OP_ART', 'KINETIC', 'OPTICS', 'PHASE', 'GHOST', 'SHADOW', 'CELESTIAL', 'PRISM']
    };

    static createRandom() {
        const pillarNames = Object.keys(this.PILLARS);
        const pillar = pick(pillarNames);
        const type = pick(this.PILLARS[pillar]);
        
        return {
            pillar: pillar,
            type: type,
            colorR: rand(100, 255), colorG: rand(100, 255), colorB: rand(100, 255),
            v_strokeW: rand(1.5, 6), v_width: rand(0.9, 1.1),
            g_amp: pillar === 'BIOLOGIQUE' ? rand(0.4, 0.8) : rand(0.05, 0.3),
            p_stiffness: pillar === 'PHYSIQUE' ? 0.2 : 0.05,
            alpha: 245
        };
    }

    static cross(d1, d2) {
        const c = this.createRandom();
        c.pillar = Math.random() < 0.5 ? d1.pillar : d2.pillar;
        c.type = Math.random() < 0.5 ? d1.type : d2.type;
        c.colorR = (d1.colorR + d2.colorR) / 2;
        c.colorG = (d1.colorG + d2.colorG) / 2;
        c.colorB = (d1.colorB + d2.colorB) / 2;
        return c;
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
        const t = p.frameCount * 0.012;
        this.vertices.forEach(v => {
            const n = p.noise(v.pos.x*0.01, v.pos.y*0.01, t)*p.TWO_PI*2;
            const f = p5.Vector.fromAngle(n).mult(d.g_amp);
            f.add(p5.Vector.sub(v.base, v.pos).mult(d.p_stiffness));
            v.vel.add(f); v.vel.mult(0.9); v.pos.add(v.vel);
        });
    }
    draw() {
        if(!this.vertices.length) return;
        const p=this.p; const d=this.dna;
        p.push(); p.translate(this.x, this.y); p.scale(d.v_width, 1.0);
        this.renderPillar(p, d);
        p.pop();
    }
    renderPillar(p, d) {
        const v = this.vertices;
        const isOrd = v[0]?.ordered;
        const col = p.color(d.colorR, d.colorG, d.colorB, d.alpha);
        p.stroke(col); p.noFill();

        switch(d.pillar) {
            case 'PHYSIQUE':
                this.drawPhysique(p,v,d,isOrd); break;
            case 'BIOLOGIQUE':
                this.drawBiologique(p,v,d,isOrd); break;
            case 'MATHEMATIQUE':
                this.drawMath(p,v,d,isOrd); break;
            case 'OPTIQUE':
                this.drawOptique(p,v,d,isOrd); break;
        }
    }

    drawPhysique(p, v, d, isOrd) {
        p.strokeWeight(d.v_strokeW);
        if(d.type === 'CRYSTAL') {
            for(let i=0; i<v.length-5; i+=10) { p.fill(d.colorR,d.colorG,d.colorB,40); p.triangle(v[i].pos.x,v[i].pos.y,v[i+5].pos.x,v[i+5].pos.y, 0,0); }
        } else if(d.type === 'MECHANIC') {
            v.forEach((vt,i)=>{ if(i%15===0) { p.rect(vt.pos.x,vt.pos.y,10,10); p.line(vt.pos.x,vt.pos.y,vt.base.x,vt.base.y); } });
        } else {
            this.path(p,v,isOrd);
        }
    }

    drawBiologique(p, v, d, isOrd) {
        if(d.type === 'BUBBLE') {
            p.noStroke(); p.fill(d.colorR,d.colorG,d.colorB,150); v.forEach((vt,i)=>{ if(i%8===0) p.circle(vt.pos.x,vt.pos.y,p.noise(i,p.frameCount*0.1)*25); });
        } else if(d.type === 'DNA_HELIX') {
            for(let i=0; i<v.length-1; i+=12) { p.strokeWeight(1); p.line(v[i].pos.x-12,v[i].pos.y,v[i].pos.x+12,v[i].pos.y); p.fill(255); p.circle(v[i].pos.x-12,v[i].pos.y,4); }
        } else {
            p.strokeWeight(d.v_strokeW*1.5); p.beginShape(); v.forEach(vt=>p.curveVertex(vt.pos.x,vt.pos.y)); p.endShape();
        }
    }

    drawMath(p, v, d, isOrd) {
        if(d.type === 'NEURAL') {
            p.strokeWeight(0.5); for(let i=0; i<v.length; i+=15) for(let j=i+15; j<v.length; j+=35) { if(p.dist(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y)<45) p.line(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y); }
        } else if(d.type === 'QUANTUM') {
            p.strokeWeight(0.4); v.forEach(vt=>{ p.line(vt.pos.x,vt.pos.y,vt.pos.x+p.random(-30,30),vt.pos.y+p.random(-30,30)); });
        } else {
            p.strokeWeight(1); this.path(p,v,isOrd);
        }
    }

    drawOptique(p, v, d, isOrd) {
        if(d.type === 'NEON') {
            p.strokeWeight(d.v_strokeW*3); p.stroke(d.colorR,d.colorG,d.colorB,30); this.path(p,v,isOrd);
            p.strokeWeight(d.v_strokeW); p.stroke(255); this.path(p,v,isOrd);
        } else if(d.type === 'OP_ART') {
            p.strokeWeight(0.5); for(let k=0; k<5; k++){ p.beginShape(); v.forEach(vt=>p.vertex(vt.pos.x*(1+k*0.1),vt.pos.y*(1+k*0.1))); p.endShape(p.CLOSE); }
        } else {
            p.strokeWeight(d.v_strokeW); this.path(p,v,isOrd);
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
        this.addAtom((m.x+o.x)/2, (m.y+o.y)/2, pick([m.char, o.char]), BioGenome.cross(m.dna, o.dna));
        APP_STATE.atoms=APP_STATE.atoms.filter(a=>a!==m && a!==o); this.updateList();
    }
}

const sketch = (p) => {
    let TU;
    p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight).parent('stage');
        TU = new TypoUniverse(p);
        p.loadFont('https://fonts.gstatic.com/s/outfit/v11/QGYtz_MV_NIiAd7uPTufnjU.ttf', (f)=>{GLOBAL_FONT=f; APP_STATE.atoms.forEach(a=>a.rebuild());});
        for(let i=0; i<8; i++) TU.addAtom((i%4-1.5)*380, (Math.floor(i/4)-0.5)*350);
        document.getElementById('loader').style.display='none';
    };
    p.draw = () => {
        p.clear(); p.push();
        p.translate(p.width/2+APP_STATE.view.x, p.height/2+APP_STATE.view.y); p.scale(APP_STATE.view.zoom);
        APP_STATE.atoms.forEach(a=>{ a.update(); a.draw(); });
        p.pop();
        p.resetMatrix(); p.fill(255,40); p.textSize(10);
        p.text(`v62.0 | THE 4 PILLARS: PHY, BIO, MAT, OPT | GENOME ALPHA`, 20, p.height-20);
    };
};
new p5(sketch);

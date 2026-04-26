// Typography Lab - Spore Engine v71.0
// THE RESURRECTION: RESTORING TYPOGRAPHIC SOUL, THE 5 PILLARS, AND FLUID NAVIGATION.

console.log("TypoLab v71.0 — THE MASTERPIECE RESTORATION");

let _uid = 0;
let GLOBAL_FONT = null;
const APP_STATE = { atoms: [], view: { x: 0, y: 0, zoom: 0.8 } };
const rand = (a, b) => Math.random() * (b - a) + a;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════════
// TAXONOMY: THE 5 SACRED PILLARS & 50 SPECIES
// ═══════════════════════════════════════════════════════════════
const GENOME_DATA = {
    'PHYSIQUE': ['CRYSTAL', 'CHROME', 'MECHANIC', 'GLITCH', 'VOXEL', 'ORIGAMI', 'CARBON', 'METEOR', 'SPIKE', 'PYRAMID'],
    'BIOLOGIQUE': ['DNA_HELIX', 'FLUID', 'JELLY', 'BUBBLE', 'PLASMA', 'CORAL', 'MOSS', 'AMOEBA', 'SPORE', 'MYCELIUM'],
    'MATHEMATIQUE': ['NEURAL', 'TURING', 'FRACTAL', 'QUANTUM', 'VECTOR', 'VORONOI', 'MANDELBROT', 'FIBONACCI', 'BINARY', 'TESSERACT'],
    'OPTIQUE': ['NEON', 'OPTICS', 'PHASE', 'GHOST', 'SHADOW', 'CELESTIAL', 'PRISM', 'SCANLINE', 'DITHERING', 'HOLOGRAPH'],
    'ARTISTIQUE': ['INK', 'BRUSH', 'OP_ART', 'KINETIC', 'SPECTRUM', 'CANVAS', 'ETCHING', 'DADA', 'FUTURISM', 'BAUHAUS']
};

class BioGenome {
    static createRandom(forcedType = null) {
        const pillar = pick(Object.keys(GENOME_DATA));
        const type = forcedType || pick(GENOME_DATA[pillar]);
        return {
            pillar, type,
            color: [rand(140,255), rand(140,255), rand(140,255)],
            sw: rand(3, 10), // Base weight
            widthScale: rand(0.9, 1.2),
            seed: Math.random() * 1000
        };
    }
    static cross(d1, d2) {
        let c = this.createRandom();
        c.pillar = Math.random() < 0.5 ? d1.pillar : d2.pillar;
        c.type = Math.random() < 0.5 ? d1.type : d2.type;
        c.color = [(d1.color[0]+d2.color[0])/2, (d1.color[1]+d2.color[1])/2, (d1.color[2]+d2.color[2])/2];
        return c;
    }
}

// ═══════════════════════════════════════════════════════════════
// LIVING TYPO: HYBRID RENDERING (SOLID CORE + GENERATIVE AURA)
// ═══════════════════════════════════════════════════════════════
class LivingTypo {
    constructor(p, cfg={}) {
        this.p=p; this.atomId=_uid++;
        this.x = cfg.x||0; this.y = cfg.y||0;
        this.char = cfg.char||pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        this.dna = cfg.dna||BioGenome.createRandom();
        this.vertices = []; // Kept only for generative effects
        this.rebuild();
    }
    rebuild() {
        if(GLOBAL_FONT) {
            this.vertices = GLOBAL_FONT.textToPoints(this.char, -90, 80, 220, { sampleFactor: 0.3 });
        }
    }
    draw() {
        const p=this.p; const d=this.dna; const v=this.vertices;
        p.push(); p.translate(this.x, this.y); p.scale(d.widthScale, 1.0);
        
        // 1. SOLID TYPOGRAPHIC CORE (High Fidelity)
        p.fill(255, 30); p.noStroke();
        p.textAlign(p.CENTER, p.CENTER); p.textFont(GLOBAL_FONT || "Outfit"); p.textSize(220);
        p.text(this.char, 0, 0);

        // 2. GENERATIVE LAYERING
        p.stroke(d.color[0], d.color[1], d.color[2]); p.strokeWeight(d.sw); p.noFill();
        
        switch(d.pillar) {
            case 'PHYSIQUE': this.renderPhys(p,d,v); break;
            case 'BIOLOGIQUE': this.renderBio(p,d,v); break;
            case 'MATHEMATIQUE': this.renderMath(p,d,v); break;
            case 'OPTIQUE': this.renderOptic(p,d,v); break;
            case 'ARTISTIQUE': this.renderArt(p,d,v); break;
        }
        p.pop();
    }

    renderPhys(p,d,v) {
        if(d.type === 'CHROME') {
            p.strokeWeight(d.sw*2); p.stroke(255); this.contour(p,v);
            p.strokeWeight(d.sw); p.stroke(d.color[0],d.color[1],d.color[2]); this.contour(p,v);
        } else if(d.type === 'CRYSTAL') {
            p.strokeWeight(1); p.fill(d.color[0],d.color[1],d.color[2],40);
            for(let i=0; i<v.length-5; i+=10) p.triangle(v[i].x, v[i].y, v[i+3].x, v[i+3].y, 0, 0);
        } else {
            p.strokeWeight(d.sw); this.contour(p,v);
        }
    }

    renderBio(p,d,v) {
        if(d.type === 'BUBBLE') {
            p.noStroke(); p.fill(d.color[0],d.color[1],d.color[2],180);
            v.forEach((vt,i)=>{ if(i%8===0) p.circle(vt.x, vt.y, d.sw*4); });
        } else if(d.type === 'PLASMA') {
            p.noStroke(); p.fill(d.color[0],d.color[1],d.color[2],50);
            v.forEach(vt=>p.circle(vt.x+p.noise(vt.y*0.1)*20, vt.y, d.sw*3));
        } else {
            p.strokeWeight(d.sw*1.5); p.beginShape(); v.forEach(vt=>p.curveVertex(vt.x, vt.y)); p.endShape();
        }
    }

    renderMath(p,d,v) {
        if(d.type === 'NEURAL') {
            p.strokeWeight(0.5); for(let i=0; i<v.length; i+=15) for(let j=i+15; j<v.length; j+=40) if(p.dist(v[i].x,v[i].y,v[j].x,v[j].y)<50) p.line(v[i].x,v[i].y,v[j].x,v[j].y);
        } else if(d.type === 'QUANTUM') {
            v.forEach(vt=>p.line(vt.x, vt.y, vt.x+p.random(-40,40), vt.y+p.random(-40,40)));
        } else {
            this.contour(p,v);
        }
    }

    renderOptic(p,d,v) {
        if(d.type === 'NEON') {
            p.strokeWeight(d.sw*3); p.stroke(d.color[0],d.color[1],d.color[2],30); this.contour(p,v);
            p.strokeWeight(d.sw); p.stroke(255); this.contour(p,v);
        } else if(d.type === 'SCANLINE') {
            v.forEach(vt=>{ if(Math.floor(vt.y/10)%2==0) p.line(vt.x-60, vt.y, vt.x+60, vt.y); });
        } else {
            p.strokeWeight(d.sw); this.contour(p,v);
        }
    }

    renderArt(p,d,v) {
        if(d.type === 'OP_ART') {
            for(let k=0; k<6; k++) { p.push(); p.translate(k*5, k*3); this.contour(p,v); p.pop(); }
        } else if(d.type === 'INK') {
            p.strokeWeight(d.sw*2); p.beginShape(); v.forEach(vt=>p.curveVertex(vt.x+p.random(-5,5), vt.y)); p.endShape();
        } else {
            this.contour(p,v);
        }
    }

    contour(p,v) {
        v.forEach(vt=>p.point(vt.x, vt.y));
    }
}

// ═══════════════════════════════════════════════════════════════
// UNIVERSE: STABILIZED NAVIGATION & FUSION
// ═══════════════════════════════════════════════════════════════
class TypoUniverse {
    constructor(p) { this.p=p; this.initUI(); this.initNav(); }
    addAtom(x=0,y=0,char=null,dna=null) {
        const a=new LivingTypo(this.p,{x,y,char,dna}); APP_STATE.atoms.push(a); this.updateList(); return a;
    }
    updateList() {
        const ml=document.getElementById('molecule-list'); if(!ml) return;
        ml.innerHTML=APP_STATE.atoms.map(a=>`<li class="molecule-item" onclick="window.focusOn(${a.atomId})">
            <span class="status-dot" style="background:rgb(${a.dna.color[0]},${a.dna.color[1]},${a.dna.color[2]})"></span> 
            ${a.char} <small>[${a.dna.pillar} / ${a.dna.type}]</small>
        </li>`).join('');
    }
    initUI() { document.getElementById('add-atom').onclick=()=>this.addAtom(rand(-500,500), rand(-500,500)); }
    initNav() {
        let drag=null, pan=false;
        const w=(cx,cy)=>({wx:(cx-this.p.width/2-APP_STATE.view.x)/APP_STATE.view.zoom, wy:(cy-this.p.height/2-APP_STATE.view.y)/APP_STATE.view.zoom});
        window.addEventListener('mousedown',e=>{
            if(e.target.closest('.ui-overlay')) return;
            const{wx,wy}=w(e.clientX,e.clientY);
            drag=APP_STATE.atoms.find(a=>Math.hypot(a.x-wx,a.y-wy)<140/APP_STATE.view.zoom);
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
        const o=APP_STATE.atoms.find(at=>at!==m && Math.hypot(at.x-m.x,at.y-m.y)<120);
        if(!o) return;
        this.p.background(255);
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
        for(let i=0; i<8; i++) TU.addAtom((i%4-1.5)*350, (Math.floor(i/4)-0.5)*400);
        document.getElementById('loader').style.display='none';
    };
    p.draw = () => {
        p.clear(); p.push();
        p.translate(p.width/2+APP_STATE.view.x, p.height/2+APP_STATE.view.y); p.scale(APP_STATE.view.zoom);
        APP_STATE.atoms.forEach(a=>{ a.draw(); });
        p.pop();
        p.resetMatrix(); p.fill(255,40); p.textSize(10);
        p.text(`v71.0 | THE RESURRECTION | RESTORED 5 PILLARS | PERF NAVIGATION`, 20, p.height-20);
    };
};
new p5(sketch);

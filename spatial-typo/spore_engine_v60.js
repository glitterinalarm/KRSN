// Typography Lab - Spore Engine v72.0
// VIBRANT LAYERING: 50+ FAMILIES WITH VISIBLE, MASSIVE GENERATIVE EFFECTS

console.log("TypoLab v72.0 — VIBRANT LAYERING ACTIVE");

let _uid = 0;
let GLOBAL_FONT = null;
const APP_STATE = { atoms: [], view: { x: 0, y: 0, zoom: 0.8 } };
const rand = (a, b) => Math.random() * (b - a) + a;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════════
// TAXONOMY
// ═══════════════════════════════════════════════════════════════
const GENOME_DATA = {
    'PHYSIQUE': ['CRYSTAL', 'CHROME', 'MECHANIC', 'GLITCH', 'VOXEL', 'ORIGAMI', 'CARBON', 'METEOR', 'SPIKE', 'VOLCANIC'],
    'BIOLOGIQUE': ['DNA_HELIX', 'FLUID', 'JELLY', 'BUBBLE', 'PLASMA', 'CORAL', 'MOSS', 'AMOEBA', 'SPORE', 'MYCELIUM'],
    'MATHEMATIQUE': ['NEURAL', 'TURING', 'FRACTAL', 'QUANTUM', 'VECTOR', 'VORONOI', 'MANDELBROT', 'FIBONACCI', 'BINARY', 'NODAL'],
    'OPTIQUE': ['NEON', 'OPTICS', 'PHASE', 'GHOST', 'SHADOW', 'CELESTIAL', 'PRISM', 'SCANLINE', 'DITHERING', 'HOLOGRAPH'],
    'ARTISTIQUE': ['INK', 'BRUSH', 'OP_ART', 'KINETIC', 'SPECTRUM', 'CANVAS', 'ETCHING', 'DADA', 'FUTURISM', 'BAUHAUS']
};

class BioGenome {
    static createRandom(forcedType = null) {
        const pillar = pick(Object.keys(GENOME_DATA));
        const type = forcedType || pick(GENOME_DATA[pillar]);
        return {
            pillar, type,
            color: [rand(150,255), rand(150,255), rand(150,255)],
            sw: rand(4, 12),
            width: rand(0.9, 1.2),
            seed: Math.random() * 1000
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// RENDERING
// ═══════════════════════════════════════════════════════════════
class LivingTypo {
    constructor(p, cfg={}) {
        this.p=p; this.atomId=_uid++;
        this.x = cfg.x||0; this.y = cfg.y||0;
        this.char = cfg.char||pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        this.dna = cfg.dna||BioGenome.createRandom();
        this.vertices = []; this.rebuild();
    }
    rebuild() {
        const p=this.p;
        if(GLOBAL_FONT) {
            this.vertices = GLOBAL_FONT.textToPoints(this.char, -90, 75, 220, { sampleFactor: 0.35 });
        } else {
            // Fallback points to avoid empty rendering
            for(let i=0; i<50; i++) this.vertices.push({x:p.random(-80,80), y:p.random(-80,80)});
        }
    }
    draw() {
        const p=this.p; const d=this.dna; const v=this.vertices;
        p.push(); p.translate(this.x, this.y); p.scale(d.width, 1.0);
        
        // 1. SOLID CORE LAYER
        p.fill(255, 40); p.noStroke();
        p.textAlign(p.CENTER, p.CENTER); p.textFont(GLOBAL_FONT || "Outfit"); p.textSize(220);
        p.text(this.char, 0, 0);

        // 2. VIBRANT GENERATIVE LAYER
        p.stroke(d.color[0], d.color[1], d.color[2]); p.strokeWeight(d.sw); p.noFill();
        
        if (d.pillar === 'PHYSIQUE') {
            if(d.type==='CRYSTAL') { p.fill(d.color[0],d.color[1],d.color[2],80); for(let i=0; i<v.length-5; i+=10) p.triangle(v[i].x,v[i].y, v[i+3].x, v[i+3].y, 0,0); }
            else if(d.type==='CHROME') { p.strokeWeight(d.sw*2); p.stroke(255); this.path(p,v); p.strokeWeight(d.sw/2); p.stroke(0); this.path(p,v); }
            else { p.strokeWeight(d.sw); v.forEach(vt=>p.point(vt.x, vt.y)); }
        } else if (d.pillar === 'BIOLOGIQUE') {
            if(d.type==='BUBBLE') { p.noStroke(); p.fill(d.color[0],d.color[1],d.color[2],200); v.forEach((vt,i)=>{if(i%8===0) p.circle(vt.x,vt.y,d.sw*4);}); }
            else if(d.type==='PLASMA') { p.noStroke(); p.fill(d.color[0],d.color[1],d.color[2],100); v.forEach(vt=>{ p.circle(vt.x+p.random(-15,15), vt.y+p.random(-15,15), d.sw*2); }); }
            else { p.strokeWeight(d.sw); p.beginShape(); v.forEach(vt=>p.curveVertex(vt.x,vt.y)); p.endShape(); }
        } else if (d.pillar === 'MATHEMATIQUE') {
            if(d.type==='NEURAL') { p.strokeWeight(0.5); for(let i=0; i<v.length; i+=12) for(let j=i+12; j<v.length; j+=35) if(p.dist(v[i].x,v[i].y,v[j].x,v[j].y)<60) p.line(v[i].x,v[i].y,v[j].x,v[j].y); }
            else if(d.type==='QUANTUM') { v.forEach(vt=>p.line(vt.x,vt.y, vt.x+p.random(-50,50), vt.y+p.random(-50,50))); }
            else { v.forEach(vt=>p.point(vt.x, vt.y)); }
        } else if (d.pillar === 'OPTIQUE') {
            if(d.type==='NEON') { p.strokeWeight(d.sw*4); p.stroke(d.color[0],d.color[1],d.color[2],40); this.path(p,v); p.strokeWeight(d.sw); p.stroke(255); this.path(p,v); }
            else if(d.type==='SCANLINE') { v.forEach(vt=>{ if(Math.floor(vt.y/10)%2==0) p.line(vt.x-80, vt.y, vt.x+80, vt.y); }); }
            else { this.path(p,v); }
        } else if (d.pillar === 'ARTISTIQUE') {
            if(d.type==='OP_ART') { for(let k=0;k<8;k++){ p.push(); p.scale(1+k*0.08); p.strokeWeight(1); this.path(p,v); p.pop(); } }
            else if(d.type==='INK') { p.strokeWeight(d.sw*3); p.beginShape(); v.forEach(vt=>p.curveVertex(vt.x+p.random(-10,10),vt.y+p.random(-10,10))); p.endShape(); }
            else { this.path(p,v); }
        }
        p.pop();
    }
    path(p,v) { v.forEach(vt=>p.point(vt.x, vt.y)); }
}

// ═══════════════════════════════════════════════════════════════
// UNIVERSE
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
    initUI() { document.getElementById('add-atom').onclick=()=>this.addAtom(rand(-800,800), rand(-800,800)); }
    initNav() {
        let drag=null, pan=false;
        const w=(cx,cy)=>({wx:(cx-this.p.width/2-APP_STATE.view.x)/APP_STATE.view.zoom, wy:(cy-this.p.height/2-APP_STATE.view.y)/APP_STATE.view.zoom});
        window.addEventListener('mousedown',e=>{
            if(e.target.closest('.ui-overlay')) return;
            const{wx,wy}=w(e.clientX,e.clientY);
            drag=APP_STATE.atoms.find(a=>Math.hypot(a.x-wx,a.y-wy)<150/APP_STATE.view.zoom);
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
        const o=APP_STATE.atoms.find(at=>at!==m && Math.hypot(at.x-m.x,at.y-m.y)<130);
        if(!o) return;
        this.p.background(255);
        this.addAtom((m.x+o.x)/2, (m.y+o.y)/2, pick([m.char,o.char]), {pillar:m.dna.pillar, type:o.dna.type, color:[255,100,100], sw:10, width:1.1});
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
        p.text(`v72.0 | VIBRANT LAYERING | EFFECTS POWER BOOST`, 20, p.height-20);
    };
};
new p5(sketch);

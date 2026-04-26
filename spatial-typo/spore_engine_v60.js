// Typography Lab - Spore Engine v67.0
// THE ENCYCLOPEDIA OF SPECIES: STATIC, DIVERSE & RADICAL. NO MORE WATER EFFECT.

console.log("TypoLab v67.0 — THE ENCYCLOPEDIA UPDATE");

let _uid = 0;
let GLOBAL_FONT = null;
const APP_STATE = { atoms: [], view: { x: 0, y: 0, zoom: 0.6 } };
const pick = (arr) => arr[arr.length * Math.random() | 0];

// ═══════════════════════════════════════════════════════════════
// VERTEX GEN
// ═══════════════════════════════════════════════════════════════
function getVertices(p, char) {
    if(GLOBAL_FONT) {
        try {
            const pts = GLOBAL_FONT.textToPoints(char, -80, 80, 180, { sampleFactor: 0.35 });
            if(pts && pts.length > 20) return pts.map(pt => ({pos:p.createVector(pt.x,pt.y), base:p.createVector(pt.x,pt.y)}));
        } catch(e) {}
    }
    const sz=120; const pg=p.createGraphics(sz,sz);
    pg.background(0); pg.fill(255); pg.textAlign(p.CENTER, p.CENTER); pg.textSize(sz*0.8); pg.text(char,sz/2,sz/2);
    pg.loadPixels(); const pts=[];
    for(let y=0;y<sz;y+=2)for(let x=0;x<sz;x+=2)if(pg.pixels[(x+y*sz)*4]>127)pts.push({x:x-sz/2,y:y-sz/2});
    return pts.map(pt=>({pos:p.createVector(pt.x*1.5,pt.y*1.5), base:p.createVector(pt.x*1.5,pt.y*1.5)}));
}

// ═══════════════════════════════════════════════════════════════
// GENOME: ALL FAMILIES DEFINED
// ═══════════════════════════════════════════════════════════════
class BioGenome {
    static FAMILIES = [
        'NEON', 'CRYSTAL', 'VORONOI', 'MECHANIC', 'VOXEL', 'CARBON', 'GLITCH', 'DNA_HELIX',
        'BUBBLE', 'PLASMA', 'NEURAL', 'QUANTUM', 'SCANLINE', 'OP_ART', 'MANDELBROT', 'INK',
        'BRUSH', 'CHROME', 'VECTOR', 'SPIRAL', 'GRID', 'BINARY', 'FIBONACCI', 'HOLOGRAPH'
    ];
    static createRandom(forcedType = null) {
        const type = forcedType || pick(this.FAMILIES);
        return {
            type,
            color: [Math.random()*155+100, Math.random()*155+100, Math.random()*155+100],
            sw: Math.random()*8+2,
            seed: Math.random()*1000
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
        // NO MOVEMENT BY DEFAULT IN v67.0 - ELEGANT STATIC SCULPTURE
    }
    draw() {
        const p=this.p; const d=this.dna; const v=this.vertices;
        p.push(); p.translate(this.x, this.y);
        p.stroke(d.color[0], d.color[1], d.color[2]); p.strokeWeight(d.sw); p.noFill();
        
        switch(d.type) {
            case 'NEON':
                p.strokeWeight(d.sw*3); p.stroke(d.color[0],d.color[1],d.color[2],40); this.path(p,v);
                p.strokeWeight(d.sw); p.stroke(255); this.path(p,v);
                break;
            case 'CRYSTAL':
                p.strokeWeight(1); p.fill(d.color[0],d.color[1],d.color[2],60);
                for(let i=0; i<v.length-5; i+=10) p.triangle(v[i].pos.x, v[i].pos.y, v[i+5].pos.x, v[i+5].pos.y, 0,0);
                break;
            case 'VORONOI':
                p.strokeWeight(1.5); for(let i=0; i<v.length-2; i+=6) { p.fill(d.color[0],d.color[1],d.color[2],30); p.triangle(v[i].pos.x, v[i].pos.y, v[i+1].pos.x, v[i+1].pos.y, v[i+2].pos.x, v[i+2].pos.y); }
                break;
            case 'BUBBLE':
                p.noStroke(); p.fill(d.color[0],d.color[1],d.color[2],180);
                v.forEach((vt,i)=>{ if(i%8===0) p.circle(vt.pos.x, vt.pos.y, d.sw*4); });
                break;
            case 'MECHANIC':
                p.strokeWeight(2); v.forEach((vt,i)=>{ if(i%15===0) { p.rect(vt.pos.x, vt.pos.y, 10, 10); p.line(vt.pos.x, vt.pos.y, 0, 0); } });
                break;
            case 'GLITCH':
                p.strokeWeight(d.sw); v.forEach((vt,i)=>{ if(p.random(100)>95) { p.stroke(255); p.line(vt.pos.x-50, vt.pos.y, vt.pos.x+50, vt.pos.y); } p.stroke(d.color[0],d.color[1],d.color[2]); p.point(vt.pos.x, vt.pos.y); });
                break;
            case 'DNA_HELIX':
                for(let i=0; i<v.length-1; i+=12) { p.strokeWeight(1); p.line(v[i].pos.x-20, v[i].pos.y, v[i].pos.x+20, v[i].pos.y); p.fill(255); p.circle(v[i].pos.x-20, v[i].pos.y, 6); p.circle(v[i].pos.x+20, v[i].pos.y, 6); }
                break;
            case 'NEURAL':
                p.strokeWeight(0.5); for(let i=0; i<v.length; i+=15) for(let j=i+15; j<v.length; j+=40) if(p.dist(v[i].pos.x, v[i].pos.y, v[j].pos.x, v[j].pos.y)<50) p.line(v[i].pos.x, v[i].pos.y, v[j].pos.x, v[j].pos.y);
                break;
            case 'QUANTUM':
                p.strokeWeight(1); v.forEach(vt=>p.line(vt.pos.x, vt.pos.y, vt.pos.x+p.random(-30,30), vt.pos.y+p.random(-30,30)));
                break;
            case 'OP_ART':
                p.strokeWeight(1); for(let k=0; k<6; k++) { p.push(); p.scale(1+k*0.1); this.path(p,v); p.pop(); }
                break;
            case 'SCANLINE':
                p.strokeWeight(3); v.forEach(vt=>{ if(Math.floor(vt.pos.y/10)%2==0) p.line(vt.pos.x-60, vt.pos.y, vt.pos.x+60, vt.pos.y); });
                break;
            case 'MANDELBROT':
                for(let k=1; k<5; k++){ p.push(); p.translate(k*10, k*5); p.strokeWeight(d.sw/k); this.path(p,v); p.pop(); }
                break;
            case 'INK':
                p.strokeWeight(d.sw*2); p.beginShape(); v.forEach(vt=>p.curveVertex(vt.pos.x+p.noise(vt.pos.y*0.1)*20, vt.pos.y)); p.endShape();
                break;
            default:
                // UNIQUE DEFAULT: MULTI-STROKE BOLD
                p.strokeWeight(d.sw); this.path(p,v);
                p.strokeWeight(1); p.stroke(255,100); this.path(p,v);
        }
        p.pop();
    }
    path(p,v) { p.beginShape(); v.forEach(vt=>p.vertex(vt.pos.x, vt.pos.y)); p.endShape(); }
}

// ═══════════════════════════════════════════════════════════════
// UNIVERSE: THE ENCYCLOPEDIA GRID
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
            ${a.char} <small>[${a.dna.type}]</small>
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
        window.addEventListener('wheel',e=>{ if(e.target.closest('.ui-overlay')) return; e.preventDefault(); APP_STATE.view.zoom=clamp(APP_STATE.view.zoom*(e.deltaY>0?0.9:1.1),0.05,5); },{passive:false});
        window.focusOn = (id) => {
            const a=APP_STATE.atoms.find(at=>at.atomId===id);
            if(a){ APP_STATE.view.x=-a.x*APP_STATE.view.zoom; APP_STATE.view.y=-a.y*APP_STATE.view.zoom; }
        };
    }
    checkFusion(m) {
        const o=APP_STATE.atoms.find(at=>at!==m && Math.hypot(at.x-m.x,at.y-m.y)<100);
        if(!o) return;
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
        
        // v67.0: THE ENCYCLOPEDIA GRID (24 Species at once)
        const fams = BioGenome.FAMILIES;
        for(let i=0; i<24; i++) {
            let row = Math.floor(i/6); let col = i%6;
            TU.addAtom((col-2.5)*300, (row-1.5)*350, pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ"), BioGenome.createRandom(fams[i%fams.length]));
        }
        document.getElementById('loader').style.display='none';
    };
    p.draw = () => {
        p.clear(); p.push();
        p.translate(p.width/2+APP_STATE.view.x, p.height/2+APP_STATE.view.y); p.scale(APP_STATE.view.zoom);
        APP_STATE.atoms.forEach(a=>{ a.update(); a.draw(); });
        p.pop();
        p.resetMatrix(); p.fill(255,60); p.textSize(10);
        p.text(`v67.0 | SPECIES ENCYCLOPEDIA | STATIC SCULPTURE MODE`, 20, p.height-20);
    };
};
new p5(sketch);

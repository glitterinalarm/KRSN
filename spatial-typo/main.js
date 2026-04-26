// Typography Lab - Spore Engine v54.1
// Z-INDEX & CANVAS PARENTING FIX

console.log("TypoLab v54.1 — CANVAS PARENTING READY");

let _uid = 0;
const APP_STATE = { atoms: [], view: { x: 0, y: 0, zoom: 1 } };
const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function generateCluster(p, shape, count = 200) {
    const pts = [];
    const R = 130;
    switch(shape) {
        case 'CIRCLE': for(let i=0; i<count; i++) { const a=(i/count)*p.TWO_PI; pts.push({x:p.cos(a)*R, y:p.sin(a)*R}); } break;
        case 'STAR': for(let i=0; i<count; i++) { const a=(i/count)*p.TWO_PI; const r=i%2===0?R:R*0.5; pts.push({x:p.cos(a)*r, y:p.sin(a)*r}); } break;
        case 'SPIRAL': for(let i=0; i<count; i++) { const a=(i/count)*p.TWO_PI*4; const r=(i/count)*R; pts.push({x:p.cos(a)*r, y:p.sin(a)*r}); } break;
        case 'INFINITY': for(let i=0; i<count; i++) { const t=(i/count)*p.TWO_PI; pts.push({x:R*p.cos(t)/(1+p.sin(t)**2), y:R*p.sin(t)*p.cos(t)/(1+p.sin(t)**2)}); } break;
        default: for(let i=0; i<count; i++) { const a=(i/count)*p.TWO_PI; pts.push({x:p.cos(a)*R, y:p.sin(a)*R}); } break;
    }
    return pts.map(pt => ({
        pos: p.createVector(pt.x, pt.y),
        basePos: p.createVector(pt.x, pt.y),
        vel: p.createVector(0,0),
        seed: Math.random()
    }));
}

const SHAPES = ['CIRCLE', 'STAR', 'SPIRAL', 'INFINITY'];

class BioGenome {
    static TYPES = ['CRYSTAL', 'FLUID', 'NEURAL', 'MECHANIC', 'GASEOUS', 'FRAGMENTED', 'LIGHT', 'QUANTUM', 'DNA_HELIX', 'AURA', 'FLUX', 'OP_ART', 'VORONOI', 'PIXEL_SORT', 'GLITCH'];
    static createRandom() {
        return {
            type: pick(this.TYPES), shape: pick(SHAPES),
            colorR: rand(50, 255), colorG: rand(50, 255), colorB: rand(50, 255),
            v_strokeW: rand(1, 8), v_width: rand(0.5, 1.5),
            g_speed: rand(0.05, 0.15), g_amplitude: rand(0.2, 0.5), g_viscosity: 0.9,
            cohesion: 0.2, breathing: 0.02, alpha: 200
        };
    }
}

class LivingTypo {
    constructor(p, cfg = {}) {
        this.p = p; this.atomId = _uid++;
        this.x = cfg.x !== null ? cfg.x : (Math.random()-0.5)*p.width;
        this.y = cfg.y !== null ? cfg.y : (Math.random()-0.5)*p.height;
        this.char = cfg.char || pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        this.dna = cfg.dna || BioGenome.createRandom();
        this.vertices = generateCluster(p, this.dna.shape, 150);
    }
    update() {
        const d=this.dna, p=this.p, t=p.frameCount*0.02;
        this.vertices.forEach(v => {
            const f = p5.Vector.fromAngle(p.noise(v.pos.x*0.005, v.pos.y*0.005, t)*p.TWO_PI*2).mult(d.g_amplitude);
            f.add(p5.Vector.sub(v.basePos, v.pos).mult(d.cohesion*0.1));
            v.vel.add(f); v.vel.mult(d.g_viscosity); v.pos.add(v.vel);
        });
    }
    draw() {
        const p=this.p, d=this.dna;
        p.push(); p.translate(this.x, this.y); p.scale(d.v_width, 1.0);
        this.render(p, [d.colorR, d.colorG, d.colorB], d);
        p.pop();
    }
    render(p, col, d) {
        p.noFill(); p.stroke(col[0], col[1], col[2], d.alpha);
        if (d.type === 'CRYSTAL') {
            for(let i=0; i<this.vertices.length-2; i+=3) { p.fill(col[0],col[1],col[2],50); p.triangle(this.vertices[i].pos.x,this.vertices[i].pos.y, this.vertices[i+1].pos.x,this.vertices[i+1].pos.y, this.vertices[i+2].pos.x,this.vertices[i+2].pos.y); }
        } else if (d.type === 'FLUID') {
            p.fill(col[0],col[1],col[2],60); p.beginShape(); this.vertices.forEach(v=>p.curveVertex(v.pos.x,v.pos.y)); p.endShape(p.CLOSE);
        } else if (d.type === 'GASEOUS') {
            p.noStroke(); this.vertices.forEach(v=>{ p.fill(col[0],col[1],col[2],30); p.circle(v.pos.x,v.pos.y,12); });
        } else {
            for(let i=0; i<this.vertices.length-1; i++) {
                p.strokeWeight(d.v_strokeW * (0.5+p.noise(i*0.1,p.frameCount*0.05)*2));
                p.line(this.vertices[i].pos.x, this.vertices[i].pos.y, this.vertices[i+1].pos.x, this.vertices[i+1].pos.y);
            }
        }
    }
}

class TypoUniverse {
    constructor(p) { this.p=p; this.particles=[]; document.getElementById('add-atom').onclick=()=>this.addAtom(); this.initInt(); }
    addAtom(type=null,x=null,y=null,dna=null) {
        const a = new LivingTypo(this.p,{x,y,dna}); if(type) a.dna.type=type;
        APP_STATE.atoms.push(a); this.upd(); return a;
    }
    upd() { const ml=document.getElementById('molecule-list'); if(ml) ml.innerHTML=APP_STATE.atoms.map(a=>`<li class="molecule-item"><span class="status-dot" style="background:rgb(${a.dna.colorR},${a.dna.colorG},${a.dna.colorB})"></span> ${a.char} [${a.dna.type}]</li>`).join(''); }
    initInt() {
        let drag=null; const world=(cx,cy)=>({wx:(cx-this.p.width/2-APP_STATE.view.x)/APP_STATE.view.zoom, wy:(cy-this.p.height/2-APP_STATE.view.y)/APP_STATE.view.zoom});
        window.addEventListener('mousedown',e=>{ const{wx,wy}=world(e.clientX,e.clientY); drag=APP_STATE.atoms.find(a=>Math.hypot(a.x-wx,a.y-wy)<100); });
        window.addEventListener('mousemove',e=>{ if(drag){ drag.x+=e.movementX; drag.y+=e.movementY; } });
        window.addEventListener('mouseup',()=>{drag=null;});
    }
}

const sketch = (p) => {
    let TU;
    p.setup = () => {
        const cnv = p.createCanvas(window.innerWidth, window.innerHeight);
        cnv.parent('stage'); // ATTACH TO STAGE
        TU = new TypoUniverse(p);
        for(let i=0; i<8; i++) TU.addAtom();
        const l=document.getElementById('loader'); if(l) l.style.display='none';
    };
    p.draw = () => {
        p.clear(); // Transparent background to see the CSS grid
        p.push(); p.translate(p.width/2+APP_STATE.view.x, p.height/2+APP_STATE.view.y); p.scale(APP_STATE.view.zoom);
        APP_STATE.atoms.forEach(a=>{ a.update(); a.draw(); });
        p.pop();
    };
};
new p5(sketch);

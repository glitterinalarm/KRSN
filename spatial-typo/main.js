// Typography Lab - Spore Engine v54.2
// NAVIGATION RESTORED & VISUAL DEPTH

console.log("TypoLab v54.2 — NAVIGATION & VARIABLE TRAITS RESTORED");

let _uid = 0;
const APP_STATE = { atoms: [], view: { x: 0, y: 0, zoom: 1 } };
const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════════
// ALGORITHMIC SHAPES (NO FONTS)
// ═══════════════════════════════════════════════════════════════
function generateCluster(p, shape, count = 180) {
    const pts = []; const R = 130;
    switch(shape) {
        case 'CIRCLE': for(let i=0; i<count; i++) { const a=(i/count)*p.TWO_PI; pts.push({x:p.cos(a)*R, y:p.sin(a)*R}); } break;
        case 'STAR': for(let i=0; i<count; i++) { const a=(i/count)*p.TWO_PI; const r=i%2===0?R:R*0.4; pts.push({x:p.cos(a)*r, y:p.sin(a)*r}); } break;
        case 'SPIRAL': for(let i=0; i<count; i++) { const a=(i/count)*p.TWO_PI*3; const r=(i/count)*R; pts.push({x:p.cos(a)*r, y:p.sin(a)*r}); } break;
        case 'INFINITY': for(let i=0; i<count; i++) { const t=(i/count)*p.TWO_PI; pts.push({x:R*p.cos(t)/(1+p.sin(t)**2), y:R*p.sin(t)*p.cos(t)/(1+p.sin(t)**2)}); } break;
        case 'LISSAJOUS': for(let i=0; i<count; i++) { const t=(i/count)*p.TWO_PI; pts.push({x:R*p.cos(3*t), y:R*p.sin(2*t)}); } break;
        case 'PHI': for(let i=0; i<count; i++) { const a=i*2.399, r=Math.sqrt(i)*13; pts.push({x:p.cos(a)*r, y:p.sin(a)*r}); } break;
        default: for(let i=0; i<count; i++) { const t=(i/count)*2-1; if(i%2===0) pts.push({x:t*R, y:0}); else pts.push({x:0, y:t*R}); } break;
    }
    return pts.map(pt => ({
        pos: p.createVector(pt.x, pt.y), basePos: p.createVector(pt.x, pt.y),
        vel: p.createVector(0,0), seed: Math.random()
    }));
}

const SHAPES = ['CIRCLE', 'STAR', 'SPIRAL', 'INFINITY', 'LISSAJOUS', 'PHI', 'CROSS'];

// ═══════════════════════════════════════════════════════════════
// GENOME
// ═══════════════════════════════════════════════════════════════
class BioGenome {
    static TYPES = ['CRYSTAL', 'FLUID', 'NEURAL', 'MECHANIC', 'GASEOUS', 'FRAGMENTED', 'LIGHT', 'QUANTUM', 'DNA_HELIX', 'AURA', 'FLUX', 'OP_ART', 'VORONOI', 'PIXEL_SORT', 'GLITCH'];
    static createRandom() {
        return {
            type: pick(this.TYPES), secondaryType: null, shape: pick(SHAPES),
            colorR: rand(100, 255), colorG: rand(100, 255), colorB: rand(100, 255),
            v_strokeW: rand(0.5, 10), v_width: rand(0.4, 1.6),
            g_speed: rand(0.05, 0.15), g_amplitude: rand(0.2, 0.6), g_viscosity: 0.9,
            cohesion: 0.22, breathing: 0.02, alpha: 220
        };
    }
    static cross(d1, d2) {
        if(Math.random()>0.97) return null;
        const r=Math.random(), c=this.createRandom();
        c.type=r<0.4?d1.type:(r<0.8?d2.type:pick(this.TYPES));
        c.secondaryType=r<0.3?d2.type:null;
        c.shape=r<0.5?d1.shape:d2.shape;
        c.colorR=(d1.colorR+d2.colorR)/2; c.colorG=(d1.colorG+d2.colorG)/2; c.colorB=(d1.colorB+d2.colorB)/2;
        return c;
    }
}

// ═══════════════════════════════════════════════════════════════
// LIVING ORGANISM
// ═══════════════════════════════════════════════════════════════
class LivingTypo {
    constructor(p, cfg = {}) {
        this.p = p; this.atomId = _uid++;
        this.x = cfg.x !== null ? cfg.x : (Math.random()-0.5)*1200;
        this.y = cfg.y !== null ? cfg.y : (Math.random()-0.5)*1000;
        this.char = cfg.char || pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        this.dna = cfg.dna || BioGenome.createRandom();
        this.vertices = generateCluster(p, this.dna.shape, 180);
    }
    update() {
        const d=this.dna, p=this.p, t=p.frameCount*0.02*d.g_speed;
        this.vertices.forEach(v => {
            const f = p5.Vector.fromAngle(p.noise(v.pos.x*0.006, v.pos.y*0.006, t)*p.TWO_PI*4).mult(d.g_amplitude);
            f.add(p5.Vector.sub(v.basePos, v.pos).mult(d.cohesion*0.1));
            v.vel.add(f); v.vel.mult(d.g_viscosity); v.pos.add(v.vel);
        });
    }
    draw() {
        const p=this.p, d=this.dna;
        p.push(); p.translate(this.x, this.y); p.scale(d.v_width, 1.0);
        const col = [d.colorR, d.colorG, d.colorB];
        if (d.secondaryType) {
            const mid = Math.floor(this.vertices.length/2);
            this.render(p, col, d, d.type, 0, mid);
            this.render(p, [255,255,255,100], d, d.secondaryType, mid, this.vertices.length);
        } else {
            this.render(p, col, d, d.type);
        }
        p.pop();
    }
    render(p, col, d, type, s=0, e=null) {
        const v = e ? this.vertices.slice(s,e) : this.vertices;
        if(!v.length) return;
        p.noFill(); p.stroke(col[0], col[1], col[2], d.alpha);
        
        switch(type) {
            case 'CRYSTAL': 
                for(let i=0; i<v.length-2; i+=3) { p.fill(col[0],col[1],col[2],60); p.triangle(v[i].pos.x,v[i].pos.y, v[i+1].pos.x,v[i+1].pos.y, v[i+2].pos.x,v[i+2].pos.y); }
                break;
            case 'FLUID':
                p.fill(col[0],col[1],col[2],70); p.beginShape(); v.forEach(vt=>p.curveVertex(vt.pos.x,vt.pos.y)); p.endShape(p.CLOSE);
                break;
            case 'NEURAL':
                p.strokeWeight(0.5); for(let i=0; i<v.length; i+=12) for(let j=i+12; j<v.length; j+=24) { if(p.dist(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y)<100) p.line(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y); }
                break;
            case 'GLITCH':
                if(p.random()>0.9) { p.strokeWeight(10); p.line(-200,0,200,0); }
                break;
            default:
                for(let i=0; i<v.length-1; i++) {
                    const sw = clamp(d.v_strokeW * (0.4+p.noise(i*0.1, p.frameCount*0.04)*3), 0.1, 40);
                    p.strokeWeight(sw); p.line(v[i].pos.x, v[i].pos.y, v[i+1].pos.x, v[i+1].pos.y);
                }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// ECOSYSTEM MANAGER
// ═══════════════════════════════════════════════════════════════
class TypoUniverse {
    constructor(p) { this.p=p; this.particles=[]; document.getElementById('add-atom').onclick=()=>this.addAtom(); this.initInteraction(); }
    addAtom(x=null,y=null,dna=null) {
        const a=new LivingTypo(this.p,{x,y,dna}); APP_STATE.atoms.push(a); this.updateList(); return a;
    }
    removeAtom(id) { APP_STATE.atoms=APP_STATE.atoms.filter(a=>a.atomId!==id); this.updateList(); }
    updateList() {
        const ml=document.getElementById('molecule-list'); if(ml) ml.innerHTML=APP_STATE.atoms.map(a=>`<li class="molecule-item"><span class="status-dot" style="background:rgb(${a.dna.colorR},${a.dna.colorG},${a.dna.colorB})"></span> ${a.char} [${a.dna.type}]</li>`).join('');
    }
    checkFusion(m) {
        const o=APP_STATE.atoms.find(at=>at!==m && Math.hypot(at.x-m.x,at.y-m.y)<120);
        if(!o) return;
        const cdna=BioGenome.cross(m.dna,o.dna);
        if(!cdna) { this.removeAtom(m.atomId); this.removeAtom(o.atomId); return; }
        this.addAtom((m.x+o.x)/2,(m.y+o.y)/2,cdna);
        this.removeAtom(m.atomId); this.removeAtom(o.atomId);
    }
    initInteraction() {
        let drag=null, pan=false, lx=0, ly=0;
        const w=(cx,cy)=>({wx:(cx-this.p.width/2-APP_STATE.view.x)/APP_STATE.view.zoom, wy:(cy-this.p.height/2-APP_STATE.view.y)/APP_STATE.view.zoom});
        window.addEventListener('mousedown',e=>{
            if(e.target.closest('.ui-overlay')) return;
            const{wx,wy}=w(e.clientX,e.clientY);
            drag=APP_STATE.atoms.find(at=>Math.hypot(at.x-wx,at.y-wy)<150/APP_STATE.view.zoom);
            if(!drag){ pan=true; lx=e.clientX; ly=e.clientY; }
        });
        window.addEventListener('mousemove',e=>{
            if(drag){ drag.x+=e.movementX/APP_STATE.view.zoom; drag.y+=e.movementY/APP_STATE.view.zoom; }
            else if(pan){ APP_STATE.view.x+=e.clientX-lx; APP_STATE.view.y+=e.clientY-ly; lx=e.clientX; ly=e.clientY; }
        });
        window.addEventListener('mouseup',()=>{ if(drag) this.checkFusion(drag); drag=null; pan=false; });
        window.addEventListener('wheel',e=>{ if(e.target.closest('.ui-overlay')) return; e.preventDefault(); APP_STATE.view.zoom=clamp(APP_STATE.view.zoom*(e.deltaY>0?0.9:1.1),0.05,5); }, {passive:false});
    }
}

const sketch = (p) => {
    let TU;
    p.setup = () => {
        const cnv = p.createCanvas(window.innerWidth, window.innerHeight);
        cnv.parent('stage'); TU = new TypoUniverse(p);
        for(let i=0; i<8; i++) TU.addAtom();
        const l=document.getElementById('loader'); if(l) l.style.display='none';
    };
    p.draw = () => {
        p.clear();
        p.push(); p.translate(p.width/2+APP_STATE.view.x, p.height/2+APP_STATE.view.y); p.scale(APP_STATE.view.zoom);
        APP_STATE.atoms.forEach(a=>{ a.update(); a.draw(); });
        p.pop();
        p.resetMatrix(); p.fill(255,40); p.noStroke(); p.textSize(10);
        p.text(`v54.2 | NAV: OK | GENETICS: ACTIVE`, 20, p.height-20);
    };
    p.windowResized = () => p.resizeCanvas(window.innerWidth, window.innerHeight);
};
new p5(sketch);

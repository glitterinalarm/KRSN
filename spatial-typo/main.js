// Typography Lab - Spore Engine v56.0
// BASE-READABILITY RESTORED: Solid Letters + Generative Overlays

console.log("TypoLab v56.0 — SOLID TYPOGRAPHY CORE");

let _uid = 0;
const APP_STATE = { atoms: [], view: { x: 0, y: 0, zoom: 1 } };
const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════════
// VERTEX GENERATOR (For generative effects only)
// ═══════════════════════════════════════════════════════════════
function getVertices(p, char) {
    const size = 120;
    const pg = p.createGraphics(size, size);
    pg.pixelDensity(1); pg.background(0); pg.fill(255);
    pg.textAlign(p.CENTER, p.CENTER); pg.textSize(size*0.85);
    pg.textFont("Outfit, sans-serif"); pg.text(char, size/2, size/2);
    pg.loadPixels();
    const pts = []; const step = 4;
    for (let y=0; y<size; y+=step) {
        for (let x=0; x<size; x+=step) {
            if (pg.pixels[(x+y*size)*4]>127) pts.push({x:x-size/2, y:y-size/2});
        }
    }
    return pts.map(pt => ({
        pos: p.createVector(pt.x, pt.y), basePos: p.createVector(pt.x, pt.y),
        vel: p.createVector(0,0), seed: Math.random()
    }));
}

// ═══════════════════════════════════════════════════════════════
// GENOME
// ═══════════════════════════════════════════════════════════════
class BioGenome {
    static TYPES = ['CRYSTAL', 'NEURAL', 'FRAGMENTED', 'AURA', 'FLUX', 'GLITCH', 'VECTOR', 'OP_ART', 'GASEOUS', 'MECHANIC', 'DNA_HELIX', 'QUANTUM'];
    static createRandom() {
        return {
            type: pick(this.TYPES),
            colorR: rand(100, 255), colorG: rand(100, 255), colorB: rand(100, 255),
            v_strokeW: rand(1, 10), v_width: rand(0.5, 1.5),
            g_speed: rand(0.04, 0.12), g_amplitude: rand(0.1, 0.4), g_viscosity: 0.92,
            cohesion: 0.25, alpha: 240
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// LIVING ORGANISM
// ═══════════════════════════════════════════════════════════════
class LivingTypo {
    constructor(p, cfg = {}) {
        this.p = p; this.atomId = _uid++;
        this.x = cfg.x !== undefined ? cfg.x : (Math.random()-0.5)*p.width;
        this.y = cfg.y !== undefined ? cfg.y : (Math.random()-0.5)*p.height;
        this.char = cfg.char || pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
        this.dna = cfg.dna || BioGenome.createRandom();
        this.vSet = getVertices(p, this.char);
        this.noiseOffset = Math.random() * 1000;
    }
    update() {
        const d=this.dna, p=this.p, t=p.frameCount*0.02*d.g_speed;
        this.vSet.forEach(v => {
            const f = p5.Vector.fromAngle(p.noise(v.pos.x*0.01, v.pos.y*0.01, t+this.noiseOffset)*p.TWO_PI*4).mult(d.g_amplitude);
            f.add(p5.Vector.sub(v.basePos, v.pos).mult(d.cohesion*0.1));
            v.vel.add(f); v.vel.mult(d.g_viscosity); v.pos.add(v.vel);
        });
    }
    draw() {
        const p=this.p, d=this.dna;
        p.push();
        p.translate(this.x, this.y);
        p.scale(d.v_width, 1.0);
        
        // --- BASE LAYER: READABLE LETTER ---
        p.textAlign(p.CENTER, p.CENTER);
        p.textFont("Outfit, sans-serif");
        p.textSize(100);
        p.noStroke();
        p.fill(d.colorR, d.colorG, d.colorB, 50); // Subtle core
        p.text(this.char, 0, 0);
        
        // --- OVERLAY LAYER: GENERATIVE EFFECT ---
        this.renderEffect(p, [d.colorR, d.colorG, d.colorB], d);
        
        p.pop();
    }
    renderEffect(p, col, d) {
        const v = this.vSet;
        p.noFill(); p.stroke(col[0], col[1], col[2], d.alpha);
        
        if (d.type === 'CRYSTAL') {
            v.forEach((vt,i) => { if(i%8===0) { p.fill(col[0],col[1],col[2],40); p.circle(vt.pos.x,vt.pos.y, 8); } });
        } else if (d.type === 'NEURAL') {
            p.strokeWeight(0.5); 
            for(let i=0; i<v.length; i+=12) for(let j=i+12; j<v.length; j+=24) { 
                if(p.dist(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y)<35) p.line(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y); 
            }
        } else if (d.type === 'FRAGMENTED') {
            p.noStroke(); p.fill(col[0],col[1],col[2],d.alpha);
            v.forEach((vt,i) => { if(i%6===0) p.rect(vt.pos.x-2,vt.pos.y-2,4,4); });
        } else {
            // Default: Variable trait weight
            for(let i=0; i<v.length-1; i++) {
                const sw = d.v_strokeW * (0.5+p.noise(i*0.1, p.frameCount*0.05)*2);
                p.strokeWeight(clamp(sw, 0.5, 25));
                p.point(v[i].pos.x, v[i].pos.y);
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// UNIVERSE & NAV
// ═══════════════════════════════════════════════════════════════
class TypoUniverse {
    constructor(p) { this.p=p; this.initUI(); this.initNav(); }
    addAtom(x=null,y=null,dna=null) {
        const a=new LivingTypo(this.p,{x,y,dna}); APP_STATE.atoms.push(a); this.updateSidebar(); return a;
    }
    updateSidebar() {
        const ml=document.getElementById('molecule-list');
        if(ml) ml.innerHTML=APP_STATE.atoms.map(a=>`<li class="molecule-item" onclick="window.focusOn(${a.atomId})">
            <span class="status-dot" style="background:rgb(${a.dna.colorR},${a.dna.colorG},${a.dna.colorB})"></span> 
            ${a.char} [${a.dna.type}]</li>`).join('');
    }
    initUI() { document.getElementById('add-atom').onclick=()=>this.addAtom(); }
    initNav() {
        let drag=null, pan=false, lx, ly;
        const w=(cx,cy)=>({wx:(cx-this.p.width/2-APP_STATE.view.x)/APP_STATE.view.zoom, wy:(cy-this.p.height/2-APP_STATE.view.y)/APP_STATE.view.zoom});
        
        window.addEventListener('mousedown',e=>{
            if(e.target.closest('.ui-overlay')) return;
            const{wx,wy}=w(e.clientX,e.clientY);
            drag=APP_STATE.atoms.find(a=>Math.hypot(a.x-wx, a.y-wy)<100/APP_STATE.view.zoom);
            if(!drag){ pan=true; lx=e.clientX; ly=e.clientY; }
        });
        window.addEventListener('mousemove',e=>{
            if(drag){ drag.x+=e.movementX/APP_STATE.view.zoom; drag.y+=e.movementY/APP_STATE.view.zoom; }
            else if(pan){ APP_STATE.view.x+=e.clientX-lx; APP_STATE.view.y+=e.clientY-ly; lx=e.clientX; ly=e.clientY; }
        });
        window.addEventListener('mouseup',()=>{pan=false; drag=null;});
        window.addEventListener('wheel',e=>{ 
            if(e.target.closest('.ui-overlay')) return; e.preventDefault();
            APP_STATE.view.zoom=clamp(APP_STATE.view.zoom*(e.deltaY>0?0.9:1.1), 0.05, 5); 
        }, {passive:false});
        
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
        for(let i=0; i<8; i++) TU.addAtom((i%4-1.5)*350, (Math.floor(i/4)-0.5)*300);
        const l=document.getElementById('loader'); if(l) l.style.display='none';
    };
    p.draw = () => {
        p.clear();
        p.push();
        p.translate(p.width/2+APP_STATE.view.x, p.height/2+APP_STATE.view.y);
        p.scale(APP_STATE.view.zoom);
        
        // Subtle Grid
        p.stroke(255, 8); p.strokeWeight(1/APP_STATE.view.zoom);
        for(let i=-2000; i<=2000; i+=250) { p.line(i,-2000,i,2000); p.line(-2000,i,2000,i); }
        
        APP_STATE.atoms.forEach(a=>{ a.update(); a.draw(); });
        p.pop();
        
        p.resetMatrix(); p.fill(255,40); p.textSize(10);
        p.text(`SPORE v56.0 | SOLID CORE ACTIVE | ZOOM: ${APP_STATE.view.zoom.toFixed(2)}`, 20, p.height-20);
    };
};
new p5(sketch);

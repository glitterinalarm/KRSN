// Typography Lab - Spore Engine v55.0
// RESTORING TYPOGRAPHY IDENTITY & NAVIGATION FOCUS

console.log("TypoLab v55.0 — THE RETURN OF LETTERS");

let _uid = 0;
let GLOBAL_FONT;
const APP_STATE = { atoms: [], view: { x: 0, y: 0, zoom: 1 } };
const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════════
// POINT GENERATOR (FONT + FALLBACK)
// ═══════════════════════════════════════════════════════════════
function getVertices(p, char, shapeType) {
    let pts = [];
    // Try Font first
    if(GLOBAL_FONT) {
        try {
            pts = GLOBAL_FONT.textToPoints(char, -80, 80, 200, { sampleFactor: 0.15 });
        } catch(e) { console.warn("font textToPoints failed", e); }
    }
    
    // Fallback to Algorithmic if no font pts
    if(!pts || pts.length === 0) {
        const R = 100;
        for(let i=0; i<150; i++) {
            const a = (i/150)*p.TWO_PI;
            if(shapeType === 'STAR') { const r=i%2===0?R:R*0.5; pts.push({x:p.cos(a)*r, y:p.sin(a)*r}); }
            else if(shapeType === 'INFINITY') { pts.push({x:R*p.cos(a)/(1+p.sin(a)**2), y:R*p.sin(a)*p.cos(a)/(1+p.sin(a)**2)}); }
            else { pts.push({x:p.cos(a)*R, y:p.sin(a)*R}); }
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
    static TYPES = ['CRYSTAL', 'FLUID', 'NEURAL', 'MECHANIC', 'GASEOUS', 'FRAGMENTED', 'LIGHT', 'QUANTUM', 'DNA_HELIX', 'AURA', 'FLUX', 'OP_ART', 'VORONOI', 'PIXEL_SORT', 'GLITCH', 'VECTOR', 'TURING', 'KINETIC', 'OPTICS'];
    static createRandom() {
        return {
            type: pick(this.TYPES), secondaryType: null,
            colorR: rand(80, 255), colorG: rand(80, 255), colorB: rand(80, 255),
            v_strokeW: rand(0.5, 8), v_width: rand(0.4, 1.8),
            g_speed: rand(0.05, 0.12), g_amplitude: rand(0.15, 0.4), g_viscosity: 0.92,
            cohesion: 0.25, breathing: 0.02, alpha: 220
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// LIVING ORGANISM
// ═══════════════════════════════════════════════════════════════
class LivingTypo {
    constructor(p, cfg = {}) {
        this.p = p; this.atomId = _uid++;
        this.x = cfg.x !== null && cfg.x !== undefined ? cfg.x : (Math.random()-0.5)*p.width;
        this.y = cfg.y !== null && cfg.y !== undefined ? cfg.y : (Math.random()-0.5)*p.height;
        this.char = cfg.char || pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
        this.dna = cfg.dna || BioGenome.createRandom();
        this.vertices = getVertices(p, this.char, this.dna.type === 'CRYSTAL' ? 'STAR' : 'CIRCLE');
    }
    update() {
        const d=this.dna, p=this.p, t=p.frameCount*0.015;
        this.vertices.forEach(v => {
            const f = p5.Vector.fromAngle(p.noise(v.pos.x*0.005, v.pos.y*0.005, t)*p.TWO_PI*4).mult(d.g_amplitude);
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
        
        if (type === 'CRYSTAL') {
            for(let i=0; i<v.length-2; i+=3) { p.fill(col[0],col[1],col[2],40); p.triangle(v[i].pos.x,v[i].pos.y, v[i+1].pos.x,v[i+1].pos.y, v[i+2].pos.x,v[i+2].pos.y); }
        } else if (type === 'NEURAL') {
            p.strokeWeight(0.5); for(let i=0; i<v.length; i+=15) for(let j=i+15; j<v.length; j+=30) { if(p.dist(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y)<80) p.line(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y); }
        } else if (type === 'OP_ART') {
            for(let k=0; k<3; k++) { p.stroke(255, 60-k*20); p.beginShape(); v.forEach(vt=>p.vertex(vt.pos.x*(1+k*0.1),vt.pos.y*(1+k*0.1))); p.endShape(p.CLOSE); }
        } else {
            for(let i=0; i<v.length-1; i++) {
                const sw = d.v_strokeW * (0.4 + p.noise(i*0.1, p.frameCount*0.03)*3);
                p.strokeWeight(clamp(sw, 0.5, 30));
                p.line(v[i].pos.x, v[i].pos.y, v[i+1].pos.x, v[i+1].pos.y);
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// ECOSYSTEM MANAGER
// ═══════════════════════════════════════════════════════════════
class TypoUniverse {
    constructor(p) { this.p=p; document.getElementById('add-atom').onclick=()=>this.addAtom(); this.initInteraction(); }
    addAtom(x=null,y=null,dna=null) {
        const a=new LivingTypo(this.p,{x,y,dna}); APP_STATE.atoms.push(a); this.updateList(); return a;
    }
    removeAtom(id) { APP_STATE.atoms=APP_STATE.atoms.filter(a=>a.atomId!==id); this.updateList(); }
    updateList() {
        const ml=document.getElementById('molecule-list');
        if(!ml) return;
        ml.innerHTML=APP_STATE.atoms.map(a=>`
            <li class="molecule-item" onclick="window.focusAtom(${a.atomId})">
                <span class="status-dot" style="background:rgb(${a.dna.colorR},${a.dna.colorG},${a.dna.colorB})"></span>
                <div class="molecule-info">
                    <div class="name">${a.char} [${a.dna.type}]</div>
                    <div class="meta">DNA #${a.atomId}</div>
                </div>
            </li>`).join('');
    }
    initInteraction() {
        let drag=null, pan=false, lx=0, ly=0;
        const w=(cx,cy)=>({wx:(cx-this.p.width/2-APP_STATE.view.x)/APP_STATE.view.zoom, wy:(cy-this.p.height/2-APP_STATE.view.y)/APP_STATE.view.zoom});
        
        window.addEventListener('mousedown',e=>{
            if(e.target.closest('.ui-overlay')) return;
            const{wx,wy}=w(e.clientX,e.clientY);
            drag=APP_STATE.atoms.find(at=>Math.hypot(at.x-wx,at.y-wy)<120/APP_STATE.view.zoom);
            if(!drag){ pan=true; lx=e.clientX; ly=e.clientY; }
        });
        window.addEventListener('mousemove',e=>{
            if(drag){ drag.x+=e.movementX/APP_STATE.view.zoom; drag.y+=e.movementY/APP_STATE.view.zoom; }
            else if(pan){ APP_STATE.view.x+=e.clientX-lx; APP_STATE.view.y+=e.clientY-ly; lx=e.clientX; ly=e.clientY; }
        });
        window.addEventListener('mouseup',()=>{pan=false;drag=null;});
        window.addEventListener('wheel',e=>{
            if(e.target.closest('.ui-overlay')) return;
            e.preventDefault();
            const factor = e.deltaY > 0 ? 0.9 : 1.1;
            APP_STATE.view.zoom = clamp(APP_STATE.view.zoom * factor, 0.05, 5);
        }, {passive:false});
        
        window.focusAtom = (id) => {
            const a = APP_STATE.atoms.find(at=>at.atomId===id);
            if(a) { APP_STATE.view.x = -a.x * APP_STATE.view.zoom; APP_STATE.view.y = -a.y * APP_STATE.view.zoom; }
        };
    }
}

const sketch = (p) => {
    let TU;
    p.preload = () => {
        GLOBAL_FONT = p.loadFont('https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto-Regular.ttf', 
            ()=>console.log("Font loaded"), 
            ()=>console.warn("Font load failed, using fallback"));
    };
    p.setup = () => {
        const cnv = p.createCanvas(window.innerWidth, window.innerHeight);
        cnv.parent('stage');
        TU = new TypoUniverse(p);
        for(let i=0; i<8; i++) {
            const x = (i%4-1.5)*300; const y = (Math.floor(i/4)-0.5)*300;
            TU.addAtom(x, y);
        }
        const l=document.getElementById('loader'); if(l) l.style.display='none';
    };
    p.draw = () => {
        p.clear();
        p.push();
        p.translate(p.width/2+APP_STATE.view.x, p.height/2+APP_STATE.view.y);
        p.scale(APP_STATE.view.zoom);
        // DRAW BG CROSS/GRID
        p.stroke(255, 15); p.strokeWeight(1/APP_STATE.view.zoom);
        p.line(-5000, 0, 5000, 0); p.line(0, -5000, 0, 5000);
        APP_STATE.atoms.forEach(a=>{ a.update(); a.draw(); });
        p.pop();
        
        // UI stats
        p.resetMatrix(); p.fill(255,50); p.textSize(10);
        p.text(`v55.0 | TYPO: ${GLOBAL_FONT?'READY':'FALLBACK'} | ZOOM: ${APP_STATE.view.zoom.toFixed(2)}`, 20, p.height-20);
    };
    p.windowResized = () => p.resizeCanvas(window.innerWidth, window.innerHeight);
};
new p5(sketch);

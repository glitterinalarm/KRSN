// Typography Lab - Spore Engine v55.2
// PIXEL-CLOUD TYPOGRAPHY - 100% RELIABLE SYSTEM FONTS

console.log("TypoLab v55.2 — PIXEL-SAMPLING ENGINE ACTIVE");

let _uid = 0;
const APP_STATE = { atoms: [], view: { x: 0, y: 0, zoom: 1 } };
const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════════
// PIXEL-TO-POINTS GEN (Using System Fonts)
// ═══════════════════════════════════════════════════════════════
function getVerticesFromPixels(p, char) {
    const size = 150;
    const pg = p.createGraphics(size, size);
    pg.pixelDensity(1);
    pg.background(0);
    pg.fill(255);
    pg.textAlign(p.CENTER, p.CENTER);
    pg.textSize(size * 0.8);
    // Use 'Outfit' or 'Inter' or sans-serif
    pg.textFont("Outfit, Inter, sans-serif"); 
    pg.text(char, size/2, size/2);
    pg.loadPixels();
    
    const pts = [];
    const step = 4; // Complexity control
    for (let y = 0; y < size; y += step) {
        for (let x = 0; x < size; x += step) {
            const idx = (x + y * size) * 4;
            if (pg.pixels[idx] > 128) { // If white enough
                pts.push({ x: x - size/2, y: y - size/2 });
            }
        }
    }
    
    // Fallback if empty (should not happen with system fonts)
    if(pts.length === 0) {
        for(let i=0; i<100; i++) {
            const a = (i/100)*p.TWO_PI;
            pts.push({ x: p.cos(a)*50, y: p.sin(a)*50 });
        }
    }

    return pts.map(pt => ({
        pos: p.createVector(pt.x, pt.y).mult(1.5), 
        basePos: p.createVector(pt.x, pt.y).mult(1.5),
        vel: p.createVector(0,0), seed: Math.random()
    }));
}

// ═══════════════════════════════════════════════════════════════
// GENOME & ORGANISM
// ═══════════════════════════════════════════════════════════════
class BioGenome {
    static TYPES = ['CRYSTAL', 'FLUID', 'NEURAL', 'FRAGMENTED', 'LIGHT', 'QUANTUM', 'DNA_HELIX', 'AURA', 'FLUX', 'OP_ART', 'VORONOI', 'GLITCH', 'VECTOR', 'KINETIC', 'OPTICS'];
    static createRandom() {
        return {
            type: pick(this.TYPES),
            colorR: rand(100, 255), colorG: rand(100, 255), colorB: rand(100, 255),
            v_strokeW: rand(1.5, 9), v_width: rand(0.6, 1.4),
            g_speed: rand(0.08, 0.18), g_amplitude: rand(0.25, 0.6), g_viscosity: 0.9,
            cohesion: 0.28, breathing: 0.02, alpha: 230
        };
    }
}

class LivingTypo {
    constructor(p, cfg = {}) {
        this.p = p; this.atomId = _uid++;
        this.x = cfg.x !== undefined ? cfg.x : (Math.random()-0.5)*p.width;
        this.y = cfg.y !== undefined ? cfg.y : (Math.random()-0.5)*p.height;
        this.char = cfg.char || pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
        this.dna = cfg.dna || BioGenome.createRandom();
        this.vertices = getVerticesFromPixels(p, this.char);
    }
    update() {
        const d=this.dna, p=this.p, t=p.frameCount*0.02*d.g_speed;
        this.vertices.forEach(v => {
            const n = p.noise(v.pos.x*0.008, v.pos.y*0.008, t);
            const f = p5.Vector.fromAngle(n * p.TWO_PI * 4).mult(d.g_amplitude);
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
        const v = this.vertices;
        p.noFill(); p.stroke(col[0], col[1], col[2], d.alpha);
        
        switch(d.type) {
            case 'CRYSTAL':
                for(let i=0; i<v.length-2; i+=3) { p.fill(col[0],col[1],col[2],40); p.triangle(v[i].pos.x,v[i].pos.y, v[i+1].pos.x,v[i+1].pos.y, v[i+2].pos.x,v[i+2].pos.y); }
                break;
            case 'NEURAL':
                p.strokeWeight(0.5); for(let i=0; i<v.length; i+=10) for(let j=i+10; j<v.length; j+=20) { if(p.dist(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y)<40) p.line(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y); }
                break;
            case 'OP_ART':
                p.strokeWeight(1.5); v.forEach(vt => p.line(vt.pos.x, vt.pos.y, vt.pos.x+10, vt.pos.y+10));
                break;
            default:
                for(let i=0; i<v.length-1; i++) {
                    const sw = d.v_strokeW * (0.6 + p.noise(i*0.05, p.frameCount*0.06)*2.5);
                    p.strokeWeight(clamp(sw, 0.5, 30));
                    p.point(v[i].pos.x, v[i].pos.y);
                }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// UNIVERSE
// ═══════════════════════════════════════════════════════════════
class TypoUniverse {
    constructor(p) { this.p=p; this.initControls(); this.initInteraction(); }
    addAtom(x=null,y=null,dna=null) {
        const a=new LivingTypo(this.p,{x,y,dna}); APP_STATE.atoms.push(a); this.updateList(); return a;
    }
    updateList() {
        const ml=document.getElementById('molecule-list');
        if(ml) ml.innerHTML=APP_STATE.atoms.map(a=>`<li class="molecule-item" onclick="window.focusAtom(${a.atomId})"><span class="status-dot" style="background:rgb(${a.dna.colorR},${a.dna.colorG},${a.dna.colorB})"></span> ${a.char} [${a.dna.type}]</li>`).join('');
    }
    initControls() {
        document.getElementById('add-atom').onclick=()=>this.addAtom();
    }
    initInteraction() {
        let dragging=null, panning=false, lx, ly;
        const toWorld=(cx,cy)=>({wx:(cx-this.p.width/2-APP_STATE.view.x)/APP_STATE.view.zoom, wy:(cy-this.p.height/2-APP_STATE.view.y)/APP_STATE.view.zoom});
        window.addEventListener('mousedown',e=>{
            if(e.target.closest('.ui-overlay')) return;
            const{wx,wy}=toWorld(e.clientX,e.clientY);
            dragging=APP_STATE.atoms.find(a=>Math.hypot(a.x-wx, a.y-wy)<120/APP_STATE.view.zoom);
            if(!dragging){ panning=true; lx=e.clientX; ly=e.clientY; }
        });
        window.addEventListener('mousemove',e=>{
            if(dragging){ dragging.x+=e.movementX/APP_STATE.view.zoom; dragging.y+=e.movementY/APP_STATE.view.zoom; }
            else if(panning){ APP_STATE.view.x+=e.clientX-lx; APP_STATE.view.y+=e.clientY-ly; lx=e.clientX; ly=e.clientY; }
        });
        window.addEventListener('mouseup',()=> {panning=false; dragging=null;});
        window.addEventListener('wheel',e=>{ 
            if(e.target.closest('.ui-overlay')) return;
            e.preventDefault(); APP_STATE.view.zoom=clamp(APP_STATE.view.zoom*(e.deltaY>0?0.9:1.1),0.05,5); 
        },{passive:false});
        window.focusAtom = (id) => {
            const a = APP_STATE.atoms.find(at => at.atomId === id);
            if(a) { APP_STATE.view.x = -a.x * APP_STATE.view.zoom; APP_STATE.view.y = -a.y * APP_STATE.view.zoom; }
        };
    }
}

const sketch = (p) => {
    let TU;
    p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight).parent('stage');
        TU = new TypoUniverse(p);
        for(let i=0; i<8; i++) TU.addAtom((i%4-1.5)*350, (Math.floor(i/4)-0.5)*350);
        document.getElementById('loader').style.display='none';
    };
    p.draw = () => {
        p.clear();
        p.push();
        p.translate(p.width/2+APP_STATE.view.x, p.height/2+APP_STATE.view.y);
        p.scale(APP_STATE.view.zoom);
        
        // Background Grid
        p.stroke(255, 12); p.strokeWeight(1/APP_STATE.view.zoom);
        for(let i=-2000; i<=2000; i+=200) { p.line(i,-2000,i,2000); p.line(-2000,i,2000,i); }
        
        APP_STATE.atoms.forEach(a => { a.update(); a.draw(); });
        p.pop();
        
        p.resetMatrix(); p.fill(255,60); p.textSize(10);
        p.text(`SPORE v55.2 | PIXEL-CLOUD ENGINE | ZOOM: ${APP_STATE.view.zoom.toFixed(2)}`, 20, p.height-20);
    };
};
new p5(sketch);

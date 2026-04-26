// Typography Lab - Spore Engine v55.1
// ASYNC FONT LOADING - ZERO BLOCKING

console.log("TypoLab v55.1 — NON-BLOCKING STARTUP");

let _uid = 0;
let GLOBAL_FONT = null;
const APP_STATE = { atoms: [], view: { x: 0, y: 0, zoom: 1 } };
const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════════
// ASYNC FONT SYSTEM
// ═══════════════════════════════════════════════════════════════
function loadFontAsync(p) {
    // We load it separately so we don't block setup
    p.loadFont('https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto-Regular.ttf', 
        (f) => {
            console.log("Font ready, upgrading atoms...");
            GLOBAL_FONT = f;
            // Upgrade existing atoms to real typography
            APP_STATE.atoms.forEach(a => a.rebuildVertices());
        }, 
        () => console.warn("Font failed, staying in algorithmic mode")
    );
}

function getVertices(p, char) {
    if(GLOBAL_FONT) {
        try {
            return GLOBAL_FONT.textToPoints(char, -80, 80, 200, { sampleFactor: 0.15 }).map(pt => ({
                pos: p.createVector(pt.x, pt.y), basePos: p.createVector(pt.x, pt.y),
                vel: p.createVector(0,0), seed: Math.random()
            }));
        } catch(e) { console.error("textToPoints error", e); }
    }
    
    // Algorithmic Fallback (Circles/Spirals)
    const pts = []; const R = 100;
    for(let i=0; i<150; i++) {
        const a = (i/150)*p.TWO_PI;
        pts.push({ x: p.cos(a)*R, y: p.sin(a)*R });
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
    static TYPES = ['CRYSTAL', 'FLUID', 'NEURAL', 'FRAGMENTED', 'LIGHT', 'QUANTUM', 'DNA_HELIX', 'AURA', 'FLUX', 'OP_ART', 'VORONOI', 'GLITCH', 'VECTOR', 'KINETIC', 'OPTICS'];
    static createRandom() {
        return {
            type: pick(this.TYPES), secondaryType: null,
            colorR: rand(100, 255), colorG: rand(100, 255), colorB: rand(100, 255),
            v_strokeW: rand(1, 8), v_width: rand(0.6, 1.4),
            g_speed: rand(0.06, 0.15), g_amplitude: rand(0.2, 0.5), g_viscosity: 0.9,
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
        this.x = cfg.x !== undefined ? cfg.x : (Math.random()-0.5)*p.width;
        this.y = cfg.y !== undefined ? cfg.y : (Math.random()-0.5)*p.height;
        this.char = cfg.char || pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        this.dna = cfg.dna || BioGenome.createRandom();
        this.rebuildVertices();
    }
    rebuildVertices() {
        this.vertices = getVertices(this.p, this.char);
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
        this.render(p, col, d, d.type);
        p.pop();
    }
    render(p, col, d, type) {
        const v = this.vertices;
        p.noFill(); p.stroke(col[0], col[1], col[2], d.alpha);
        if (type === 'CRYSTAL') {
            for(let i=0; i<v.length-2; i+=3) { p.fill(col[0],col[1],col[2],50); p.triangle(v[i].pos.x,v[i].pos.y, v[i+1].pos.x,v[i+1].pos.y, v[i+2].pos.x,v[i+2].pos.y); }
        } else if (type === 'NEURAL') {
            p.strokeWeight(0.5); for(let i=0; i<v.length; i+=15) for(let j=i+15; j<v.length; j+=30) { if(p.dist(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y)<80) p.line(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y); }
        } else {
            for(let i=0; i<v.length-1; i++) {
                const sw = d.v_strokeW * (0.5 + p.noise(i*0.1, p.frameCount*0.04)*2.5);
                p.strokeWeight(clamp(sw, 0.5, 35));
                p.line(v[i].pos.x, v[i].pos.y, v[i+1].pos.x, v[i+1].pos.y);
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// ECOSYSTEM MANAGER
// ═══════════════════════════════════════════════════════════════
class TypoUniverse {
    constructor(p) { 
        this.p=p; 
        document.getElementById('add-atom').onclick=()=>this.addAtom(); 
        this.initInteraction(); 
    }
    addAtom(x=null,y=null,dna=null) {
        const a=new LivingTypo(this.p,{x,y,dna}); 
        APP_STATE.atoms.push(a); 
        this.updateList(); 
        return a; 
    }
    updateList() {
        const ml=document.getElementById('molecule-list');
        if(ml) ml.innerHTML=APP_STATE.atoms.map(a=>`
            <li class="molecule-item" onclick="window.focusOnAtom(${a.atomId})">
                <span class="status-dot" style="background:rgb(${a.dna.colorR},${a.dna.colorG},${a.dna.colorB})"></span>
                ${a.char} [${a.dna.type}]
            </li>`).join('');
    }
    initInteraction() {
        let dragging=null, panning=false, lx=0, ly=0;
        const toWorld=(cx,cy)=>({wx:(cx-this.p.width/2-APP_STATE.view.x)/APP_STATE.view.zoom, wy:(cy-this.p.height/2-APP_STATE.view.y)/APP_STATE.view.zoom});
        
        window.addEventListener('mousedown', e => {
            if(e.target.closest('.ui-overlay')) return;
            const {wx, wy} = toWorld(e.clientX, e.clientY);
            dragging = APP_STATE.atoms.find(a => Math.hypot(a.x-wx, a.y-wy) < 100/APP_STATE.view.zoom);
            if(!dragging) { panning=true; lx=e.clientX; ly=e.clientY; }
        });
        window.addEventListener('mousemove', e => {
            if(dragging) { 
                dragging.x += e.movementX/APP_STATE.view.zoom; 
                dragging.y += e.movementY/APP_STATE.view.zoom; 
            } else if(panning) {
                APP_STATE.view.x += e.clientX - lx; APP_STATE.view.y += e.clientY - ly;
                lx = e.clientX; ly = e.clientY;
            }
        });
        window.addEventListener('mouseup', () => { panning=false; dragging=null; });
        window.addEventListener('wheel', e => {
            if(e.target.closest('.ui-overlay')) return;
            e.preventDefault();
            const factor = e.deltaY > 0 ? 0.92 : 1.08;
            APP_STATE.view.zoom = clamp(APP_STATE.view.zoom * factor, 0.1, 5);
        }, {passive:false});

        window.focusOnAtom = (id) => {
            const a = APP_STATE.atoms.find(at => at.atomId === id);
            if(a) { 
                APP_STATE.view.x = -a.x * APP_STATE.view.zoom; 
                APP_STATE.view.y = -a.y * APP_STATE.view.zoom; 
                console.log("Focusing on atom", id, a.x, a.y);
            }
        };
    }
}

const sketch = (p) => {
    let TU;
    // NO PRELOAD - SETUP RUNS IMMEDIATELY
    p.setup = () => {
        const cnv = p.createCanvas(window.innerWidth, window.innerHeight);
        cnv.parent('stage');
        TU = new TypoUniverse(p);
        // Create initial batch
        for(let i=0; i<8; i++) TU.addAtom((i%4-1.5)*350, (Math.floor(i/4)-0.5)*350);
        
        // Start font load in background
        loadFontAsync(p);
        
        const loader=document.getElementById('loader'); if(loader) loader.style.display='none';
    };
    p.draw = () => {
        p.clear();
        p.push();
        p.translate(p.width/2+APP_STATE.view.x, p.height/2+APP_STATE.view.y);
        p.scale(APP_STATE.view.zoom);
        
        // Background Grid
        p.stroke(255, 10); p.strokeWeight(1/APP_STATE.view.zoom);
        for(let i=-2000; i<=2000; i+=200) { p.line(i, -2000, i, 2000); p.line(-2000, i, 2000, i); }
        
        APP_STATE.atoms.forEach(a => { a.update(); a.draw(); });
        p.pop();
        
        p.resetMatrix(); p.fill(255,60); p.textSize(10);
        p.text(`SPORE v55.1 | FONT: ${GLOBAL_FONT?'OK':'LOADING...'} | ATOMS: ${APP_STATE.atoms.length}`, 20, p.height-20);
    };
};
new p5(sketch);

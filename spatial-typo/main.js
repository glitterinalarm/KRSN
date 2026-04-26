// Typography Lab - Spore Engine v57.0
// KINETIC STRUCTURES & RESTORED FUSION

console.log("TypoLab v57.0 — KINETIC TYPO & BREEDING ACTIVE");

let _uid = 0;
let GLOBAL_FONT = null;
const APP_STATE = { atoms: [], view: { x: 0, y: 0, zoom: 0.8 } };
const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════════
// FONT LOADING (NON-BLOCKING)
// ═══════════════════════════════════════════════════════════════
function initFont(p) {
    p.loadFont('https://fonts.gstatic.com/s/outfit/v11/QGYtz_MV_NIiAd7uPTufnjU.ttf', (f) => {
        GLOBAL_FONT = f;
        APP_STATE.atoms.forEach(a => a.rebuild());
    });
}

function getLetterData(p, char) {
    if(!GLOBAL_FONT) return [];
    try {
        const pts = GLOBAL_FONT.textToPoints(char, -80, 80, 200, { sampleFactor: 0.18, simplifyThreshold: 0 });
        return pts.map(pt => ({
            pos: p.createVector(pt.x, pt.y),
            base: p.createVector(pt.x, pt.y),
            vel: p.createVector(0,0),
            seed: Math.random()
        }));
    } catch(e) { return []; }
}

// ═══════════════════════════════════════════════════════════════
// GENOME
// ═══════════════════════════════════════════════════════════════
class BioGenome {
    static TYPES = ['CRYSTAL', 'NEURAL', 'MECHANIC', 'FLUID', 'GLITCH', 'VECTOR', 'OP_ART', 'GASEOUS', 'AURA', 'DNA_HELIX', 'QUANTUM'];
    static createRandom() {
        return {
            type: pick(this.TYPES), secondaryType: null,
            colorR: rand(120, 255), colorG: rand(120, 255), colorB: rand(120, 255),
            v_strokeW: rand(1, 10), v_width: rand(0.6, 1.4),
            g_speed: 0.1, g_amp: 0.35, alpha: 240
        };
    }
    static cross(d1, d2) {
        if(Math.random() > 0.98) return null; // Lethal
        const r = Math.random();
        const c = this.createRandom();
        c.type = r < 0.45 ? d1.type : (r < 0.9 ? d2.type : pick(this.TYPES));
        c.secondaryType = r < 0.25 ? d2.type : null;
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
    constructor(p, cfg = {}) {
        this.p = p; this.atomId = _uid++;
        this.x = cfg.x || (Math.random()-0.5)*800;
        this.y = cfg.y || (Math.random()-0.5)*600;
        this.char = cfg.char || pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        this.dna = cfg.dna || BioGenome.createRandom();
        this.vertices = [];
        this.rebuild();
    }
    rebuild() {
        this.vertices = getLetterData(this.p, this.char);
    }
    update() {
        if(!this.vertices.length) return;
        const p = this.p; const t = p.frameCount * 0.02;
        this.vertices.forEach(v => {
            const n = p.noise(v.pos.x * 0.005, v.pos.y * 0.005, t) * p.TWO_PI * 4;
            const f = p5.Vector.fromAngle(n).mult(this.dna.g_amp);
            f.add(p5.Vector.sub(v.base, v.pos).mult(0.04));
            v.vel.add(f); v.vel.mult(0.92); v.pos.add(v.vel);
        });
    }
    draw() {
        if(!this.vertices.length) return;
        const p = this.p; const d = this.dna;
        p.push();
        p.translate(this.x, this.y);
        p.scale(d.v_width, 1.0);
        
        const col = [d.colorR, d.colorG, d.colorB];
        if(d.secondaryType) {
            const mid = Math.floor(this.vertices.length/2);
            this.render(p, d.type, col, d, 0, mid);
            this.render(p, d.secondaryType, [255,255,255,80], d, mid, this.vertices.length);
        } else {
            this.render(p, d.type, col, d);
        }
        p.pop();
    }
    render(p, type, col, d, s=0, e=null) {
        const v = e !== null ? this.vertices.slice(s, e) : this.vertices;
        p.stroke(col[0], col[1], col[2], d.alpha);
        p.noFill();

        switch(type) {
            case 'CRYSTAL':
                p.strokeWeight(1);
                for(let i=0; i<v.length-2; i+=3) { p.fill(col[0],col[1],col[2],40); p.triangle(v[i].pos.x, v[i].pos.y, v[i+1].pos.x, v[i+1].pos.y, v[i+2].pos.x, v[i+2].pos.y); }
                break;
            case 'NEURAL':
                p.strokeWeight(0.4);
                for(let i=0; i<v.length; i+=15) for(let j=i+15; j<v.length; j+=30) {
                    if(p.dist(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y) < 40) p.line(v[i].pos.x,v[i].pos.y,v[j].pos.x,v[j].pos.y);
                }
                break;
            case 'MECHANIC':
                p.strokeWeight(1.5);
                v.forEach((vt, i) => { if(i%12===0) { p.rect(vt.pos.x-5, vt.pos.y-5, 10, 10); p.line(vt.pos.x, vt.pos.y, vt.pos.x+15, vt.pos.y+15); } });
                break;
            case 'FLUID':
                p.strokeWeight(d.v_strokeW); p.beginShape(); v.forEach(vt => p.curveVertex(vt.pos.x, vt.pos.y)); p.endShape();
                break;
            case 'OP_ART':
                for(let k=0; k<3; k++) { p.strokeWeight(1); p.beginShape(); v.forEach(vt => p.vertex(vt.pos.x*(1+k*0.06), vt.pos.y*(1+k*0.06))); p.endShape(p.CLOSE); }
                break;
            case 'DNA_HELIX':
                for(let i=0; i<v.length-1; i+=8) { p.strokeWeight(2); p.line(v[i].pos.x-10, v[i].pos.y, v[i].pos.x+10, v[i].pos.y); p.circle(v[i].pos.x-10, v[i].pos.y, 4); }
                break;
            default:
                for(let i=0; i<v.length-1; i++) {
                    p.strokeWeight(d.v_strokeW * (0.6 + p.noise(i*0.1, p.frameCount*0.06)*2.5));
                    p.line(v[i].pos.x, v[i].pos.y, v[i+1].pos.x, v[i+1].pos.y);
                }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// UNIVERSE & FUSION
// ═══════════════════════════════════════════════════════════════
class TypoUniverse {
    constructor(p) { this.p=p; this.initUI(); this.initInteraction(); }
    addAtom(x=null,y=null,char='',dna=null) {
        const a=new LivingTypo(this.p,{x,y,char,dna}); 
        APP_STATE.atoms.push(a); this.updateUI(); return a;
    }
    removeAtom(id) { APP_STATE.atoms=APP_STATE.atoms.filter(a=>a.atomId!==id); this.updateUI(); }
    updateUI() {
        const ml=document.getElementById('molecule-list'); if(!ml) return;
        ml.innerHTML=APP_STATE.atoms.map(a=>`<li class="molecule-item" onclick="window.focusOn(${a.atomId})"><span class="status-dot" style="background:rgb(${a.dna.colorR},${a.dna.colorG},${a.dna.colorB})"></span> ${a.char} [${a.dna.type}]</li>`).join('');
    }
    checkFusion(m) {
        const o=APP_STATE.atoms.find(at=>at!==m && Math.hypot(at.x-m.x,at.y-m.y)<100);
        if(!o) return;
        const offspring = BioGenome.cross(m.dna, o.dna);
        if(!offspring) { this.removeAtom(m.atomId); this.removeAtom(o.atomId); return; }
        this.addAtom((m.x+o.x)/2, (m.y+o.y)/2, pick([m.char, o.char]), offspring);
        this.removeAtom(m.atomId); this.removeAtom(o.atomId);
    }
    initUI() { document.getElementById('add-atom').onclick=()=>this.addAtom(); }
    initInteraction() {
        let drag=null, pan=false, lx, ly;
        const w=(cx,cy)=>({wx:(cx-this.p.width/2-APP_STATE.view.x)/APP_STATE.view.zoom, wy:(cy-this.p.height/2-APP_STATE.view.y)/APP_STATE.view.zoom});
        window.addEventListener('mousedown',e=>{
            if(e.target.closest('.ui-overlay')) return;
            const{wx,wy}=w(e.clientX,e.clientY);
            drag=APP_STATE.atoms.find(a=>Math.hypot(a.x-wx, a.y-wy)<120/APP_STATE.view.zoom);
            if(!drag){ pan=true; lx=e.clientX; ly=e.clientY; }
        });
        window.addEventListener('mousemove',e=>{
            if(drag){ drag.x+=e.movementX/APP_STATE.view.zoom; drag.y+=e.movementY/APP_STATE.view.zoom; }
            else if(pan){ APP_STATE.view.x+=e.clientX-lx; APP_STATE.view.y+=e.clientY-ly; lx=e.clientX; ly=e.clientY; }
        });
        window.addEventListener('mouseup',()=>{ if(drag)this.checkFusion(drag); pan=false; drag=null; });
        window.addEventListener('wheel',e=>{ 
            if(e.target.closest('.ui-overlay')) return; e.preventDefault();
            APP_STATE.view.zoom=clamp(APP_STATE.view.zoom*(e.deltaY>0?0.9:1.1),0.05,5); 
        },{passive:false});
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
        initFont(p);
        for(let i=0; i<8; i++) TU.addAtom((i%4-1.5)*350, (Math.floor(i/4)-0.5)*300);
        document.getElementById('loader').style.display='none';
    };
    p.draw = () => {
        p.clear();
        p.push();
        p.translate(p.width/2+APP_STATE.view.x, p.height/2+APP_STATE.view.y);
        p.scale(APP_STATE.view.zoom);
        APP_STATE.atoms.forEach(a=>{ a.update(); a.draw(); });
        p.pop();
        p.resetMatrix(); p.fill(255,40); p.textSize(10);
        p.text(`v57.0 | KINETIC STRUCTURES | FUSION: ACTIVE`, 20, p.height-20);
    };
};
new p5(sketch);

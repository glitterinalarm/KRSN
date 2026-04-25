// Typography Lab - Omniverse Engine v25.1 (Restored)
console.log("TypoLab Engine v25.1 - UNLIMITED BIOLOGICAL DIVERSITY (Restored)");

const APP_STATE = { atoms: [], view: { x: 0, y: 0, zoom: 1 }, isRecording: false };

const FONT_SOURCES = [
    { name: 'Roboto', url: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-black-webfont.ttf' },
    { name: 'Source Sans', url: 'https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceSansPro-Black.otf' },
    { name: 'Source Code', url: 'https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf' },
    { name: 'Roboto Mono', url: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-mediumitalic-webfont.ttf' }
];
const FONTS = [];

// Helper to bias extreme biological outcomes
function powerRand(power = 3) { return Math.pow(Math.random(), power); }

class Genome {
    static createRandom() {
        return {
            // BEHAVIOR / PHYSICS
            g_fluid: powerRand(3),
            g_mycelium: powerRand(4),
            g_swarm: powerRand(3),
            g_orbit: powerRand(2),
            g_pulse: powerRand(3),
            
            g_speed: Math.random() * 3 + 0.2, // Time multiplier
            g_amplitude: Math.random() * 2 + 0.5, // Force multiplier
            cohesion: Math.random() * 0.4 + 0.6, // Gravity to original shape

            // TOPOLOGY (BIRTH STATS)
            v_resolution: Math.random() * 0.18 + 0.02, // Vertices density (20 vs 400 pts)
            v_roughness: powerRand(3) * 60, // Scramble letter edges

            // RENDER EXPRESSIONS
            v_neural: powerRand(2),
            v_membrane: powerRand(2),
            v_spine: powerRand(2),
            v_spores: powerRand(2),
            v_sharp: powerRand(2),

            // STROKE & FORM DYNAMICS (The non-academic variables)
            v_strokeW: Math.random() * 6 + 0.1,
            v_dashA: powerRand(2) * 50,
            v_dashB: powerRand(1.5) * 50,
            v_alphaF: Math.random() * 150,
            v_alphaS: Math.random() * 155 + 100,
            
            blend_additive: Math.random() > 0.7, // Rare glowing entities
            
            colorR: Math.random()*255, colorG: Math.random()*255, colorB: Math.random()*255
        };
    }

    static merge(A, B) {
        let child = {};
        for(let k in A) {
            if (k === 'blend_additive') child[k] = Math.random() > 0.5 ? A[k] : B[k];
            else {
                child[k] = (A[k] + B[k]) / 2;
                child[k] += (Math.random()-0.5) * child[k] * 0.6; // Heavy unpredictable mutation
                if(k.startsWith('v_alpha') || k.startsWith('color')) child[k] = Math.max(0, Math.min(255, child[k]));
                if(k.startsWith('g_') || k.startsWith('v_')) child[k] = Math.max(0, child[k]); 
            }
        }
        child.cohesion = (A.cohesion + B.cohesion) / 2 * 0.5; // Destroy form over generations
        return child;
    }
}

const sketch = (p) => {
    p.preload = () => { FONT_SOURCES.forEach(f => FONTS.push({ name: f.name, obj: p.loadFont(f.url) })); };

    p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight).parent('stage');
        p.frameRate(60);
        document.getElementById('loader').classList.add('hidden');
        window.typoUniverse = new TypoUniverse(p);
        injectExportUI(p);
    };

    p.draw = () => {
        p.background(10, 10, 12);
        p.push(); p.translate(p.width/2 + APP_STATE.view.x, p.height/2 + APP_STATE.view.y); p.scale(APP_STATE.view.zoom);
        
        APP_STATE.atoms.forEach(atom => { atom.update(); atom.draw(); });
        
        p.pop();
        if (APP_STATE.isRecording) {
            p.push(); p.fill(255,0,0); p.circle(50, 50, 20); p.fill(255); p.textSize(16); p.textAlign(p.LEFT, p.CENTER); p.text("REC", 70, 50); p.pop();
        }
    };
    p.windowResized = () => p.resizeCanvas(window.innerWidth, window.innerHeight);
};

// ============================================================================
// THE OMNIVERSE LIVING ENTITY
// ============================================================================
class LivingTypo {
    constructor(p, char, fontData, parentData = null) {
        this.p = p;
        this.id = Math.random();
        this.vertices = [];

        if (parentData) {
            // MERGE (Child Generation)
            this.x = parentData.x; this.y = parentData.y;
            this.char = parentData.char; this.fontName = parentData.fontName;
            this.dna = parentData.dna; this.gen = parentData.gen;
            
            parentData.vertices.forEach(v => this.vertices.push({ pos: v.pos.copy(), basePos: p.createVector(v.pos.x, v.pos.y), vel: p.createVector(0,0) }));
            // Hard limit to prevent browser frame rate tanking
            while(this.vertices.length > 400) this.vertices.splice(Math.floor(Math.random()*this.vertices.length), 1);
        } else {
            // PURE BLOOD (Gen 1)
            this.x = (Math.random()-0.5)*1000; this.y = (Math.random()-0.5)*1000;
            this.char = char; this.fontName = fontData.name;
            this.gen = 1;
            
            this.dna = Genome.createRandom();

            let b = fontData.obj.textBounds(char, 0, 0, 400);
            let rawPoints = fontData.obj.textToPoints(char, -b.x - b.w/2, -b.y - b.h/2, 400, { sampleFactor: Math.min(0.2, this.dna.v_resolution), simplifyThreshold: 0 });
            
            rawPoints.forEach(pt => {
                let nx = pt.x + (Math.random() - 0.5) * this.dna.v_roughness;
                let ny = pt.y + (Math.random() - 0.5) * this.dna.v_roughness;
                this.vertices.push({ pos: p.createVector(nx, ny), basePos: p.createVector(nx, ny), vel: p.createVector(0,0) });
            });
        }
    }

    update() {
        let t = this.p.frameCount * 0.01 * this.dna.g_speed;
        let d = this.dna;
        let amp = d.g_amplitude;
        
        let cmX=0, cmY=0;
        this.vertices.forEach(v => { cmX+=v.pos.x; cmY+=v.pos.y; });
        if(this.vertices.length>0) { cmX/=this.vertices.length; cmY/=this.vertices.length; }
        let center = this.p.createVector(cmX, cmY);

        for (let i = 0; i < this.vertices.length; i++) {
            let v = this.vertices[i];
            let force = this.p.createVector(0,0);
            
            if (d.g_fluid > 0.01) {
                let a = this.p.noise(v.pos.x*0.005 + t, v.pos.y*0.005) * this.p.TWO_PI * 4;
                force.add(p5.Vector.fromAngle(a).mult(d.g_fluid * amp));
            }
            if (d.g_orbit > 0.01) {
                let toCenter = p5.Vector.sub(center, v.pos);
                let perp = this.p.createVector(-toCenter.y, toCenter.x).normalize();
                force.add(perp.mult(d.g_orbit * amp));
            }
            if (d.g_pulse > 0.01) {
                let outward = p5.Vector.sub(v.pos, center).normalize();
                force.add(outward.mult(Math.sin(t * 8 - p5.Vector.dist(center, v.pos)*0.02) * d.g_pulse * amp));
            }
            if (d.g_swarm > 0.01) {
                let n = this.vertices[(i+1)%this.vertices.length];
                force.add(p5.Vector.sub(n.pos, v.pos).normalize().mult(d.g_swarm * amp));
            }
            
            v.vel.add(force);
            
            // Orthogonal restriction
            if (d.g_mycelium > 0.01) {
                let heading = v.vel.heading();
                let snap = Math.round(heading / this.p.HALF_PI) * this.p.HALF_PI;
                v.vel.rotate((snap - heading) * d.g_mycelium * 0.6);
            }

            // Entropy holding force
            let anchorPull = p5.Vector.sub(v.basePos, v.pos).mult(d.cohesion * 0.05);
            v.vel.add(anchorPull);

            v.vel.mult(0.85); // friction
            v.pos.add(v.vel);
            
            // Decaying anchor point (biological corruption over time)
            if (d.cohesion < 0.9) {
                 v.basePos.add(this.p.createVector(Math.random()-0.5, Math.random()-0.5).mult(0.5 * (1 - d.cohesion) * amp));
            }
        }
    }

    draw() {
        let p = this.p; let d = this.dna;
        
        p.push(); p.translate(this.x, this.y);
        
        if (d.blend_additive) p.blendMode(p.ADD);

        // MEMBRANE PHENOTYPE (Blobby cellular fill)
        if (d.v_membrane > 0.01) {
            p.noStroke(); p.fill(d.colorR, d.colorG, d.colorB, d.v_alphaF * d.v_membrane);
            p.beginShape();
            this.vertices.forEach(v => p.curveVertex(v.pos.x, v.pos.y));
            p.endShape();
        }

        // SPINE PHENOTYPE (Continuous jagged trace)
        if (d.v_spine > 0.01) {
            p.noFill(); 
            p.stroke(d.colorR, d.colorG, d.colorB, d.v_alphaS * d.v_spine);
            p.strokeWeight(d.v_strokeW * d.v_spine);
            if (d.v_dashA > 2) p.drawingContext.setLineDash([d.v_dashA, d.v_dashB]);
            
            p.beginShape();
            this.vertices.forEach(v => p.vertex(v.pos.x, v.pos.y));
            p.endShape();
            p.drawingContext.setLineDash([]);
        }

        // NEURAL PHENOTYPE (Proximity Mesh Web)
        if (d.v_neural > 0.01) {
            p.stroke(d.colorR, d.colorG, d.colorB, d.v_alphaS * d.v_neural * 0.6);
            p.strokeWeight(Math.max(0.2, d.v_strokeW * 0.5));
            let distLimit = d.v_neural * 120;
            if (d.v_dashA > 5) p.drawingContext.setLineDash([d.v_dashA/2, d.v_dashB]);
            
            for(let i=0; i<this.vertices.length; i+=2) {
                for(let j=i+1; j<this.vertices.length; j+=4) {
                    if (this.vertices[i].pos.dist(this.vertices[j].pos) < distLimit) {
                        p.line(this.vertices[i].pos.x, this.vertices[i].pos.y, this.vertices[j].pos.x, this.vertices[j].pos.y);
                    }
                }
            }
            p.drawingContext.setLineDash([]);
        }

        // SHARP PHENOTYPE (Crystal Shards)
        if (d.v_sharp > 0.01) {
            p.noStroke(); p.fill(d.colorR, d.colorG, d.colorB, d.v_alphaF * d.v_sharp);
            p.beginShape(p.TRIANGLES);
            for(let i=0; i<this.vertices.length-2; i+=3) {
                if (this.vertices[i].pos.dist(this.vertices[i+1].pos) < d.v_sharp * 150) {
                    p.vertex(this.vertices[i].pos.x, this.vertices[i].pos.y);
                    p.vertex(this.vertices[i+1].pos.x, this.vertices[i+1].pos.y);
                    p.vertex(this.vertices[i+2].pos.x, this.vertices[i+2].pos.y);
                }
            }
            p.endShape();
        }

        // SPORE PHENOTYPE (Floating nodes)
        if (d.v_spores > 0.01) {
            p.noStroke(); p.fill(d.colorR, d.colorG, d.colorB, d.v_alphaS * d.v_spores);
            for(let v of this.vertices) {
                let s = d.v_spores * 15;
                p.push(); p.translate(v.pos.x, v.pos.y); p.rotate(v.vel.heading());
                if(d.g_mycelium > 0.5) p.rect(0, 0, s, s); else p.circle(0, 0, s);
                p.pop();
            }
        }
        
        p.blendMode(p.BLEND);
        p.pop();
    }
}

// ============================================================================
// TYPO UNIVERSE
// ============================================================================
class TypoUniverse {
    constructor(pInstance) {
        this.p = pInstance;
        this.initInteraction();
        document.getElementById('add-atom').onclick = () => this.addAtom();
        for(let i=0; i<6; i++) this.addAtom();
    }

    addAtom() {
        const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
        const fontData = FONTS[Math.floor(Math.random() * FONTS.length)];
        APP_STATE.atoms.push(new LivingTypo(this.p, char, fontData));
        this.updateUI();
    }

    checkCollisions(a) {
        const other = APP_STATE.atoms.find(o => o !== a && Math.hypot(a.x - o.x, a.y - o.y) < 150);
        if (other) {
            let childData = {
                x: (a.x + other.x) / 2, y: (a.y + other.y) / 2,
                char: "?",
                fontName: `${a.fontName}/${other.fontName}`,
                gen: Math.max(a.gen, other.gen) + 1,
                dna: Genome.merge(a.dna, other.dna),
                vertices: [...a.vertices, ...other.vertices]
            };
            
            APP_STATE.atoms = APP_STATE.atoms.filter(at => at !== a && at !== other);
            APP_STATE.atoms.push(new LivingTypo(this.p, '', null, childData));
            this.updateUI();
        }
    }

    initInteraction() {
        // --- Mobile Menu Toggle ---
        const toggle = document.getElementById('menu-toggle');
        const overlay = document.querySelector('.ui-overlay');
        if (toggle) {
            toggle.onclick = () => {
                overlay.classList.toggle('active');
                toggle.innerText = overlay.classList.contains('active') ? '✕' : '☰';
            };
        }

        const handleInputStart = (clientX, clientY, target) => {
            if (target.tagName === 'BUTTON' || target.closest('#molecule-list')) return;
            const mx = (clientX - (window.innerWidth/2) - APP_STATE.view.x) / APP_STATE.view.zoom;
            const my = (clientY - (window.innerHeight/2) - APP_STATE.view.y) / APP_STATE.view.zoom;
            this.dragged = APP_STATE.atoms.find(a => Math.hypot(a.x - mx, a.y - my) < 200);
            if (!this.dragged) { 
                this.isPanning = true; 
                this.lx = clientX; this.ly = clientY; 
            }
        };

        const handleInputMove = (clientX, clientY, movementX, movementY) => {
            if (this.dragged) {
                this.dragged.x += movementX / APP_STATE.view.zoom;
                this.dragged.y += movementY / APP_STATE.view.zoom;
            } else if (this.isPanning) {
                APP_STATE.view.x += clientX - this.lx; APP_STATE.view.y += clientY - this.ly;
                this.lx = clientX; this.ly = clientY;
            }
        };

        const handleInputEnd = () => {
             if (this.dragged) this.checkCollisions(this.dragged);
             this.dragged = null; this.isPanning = false;
        };

        // Mouse Events
        window.addEventListener('mousedown', (e) => handleInputStart(e.clientX, e.clientY, e.target));
        window.addEventListener('mousemove', (e) => handleInputMove(e.clientX, e.clientY, e.movementX, e.movementY));
        window.addEventListener('mouseup', handleInputEnd);

        // Touch Events
        window.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            handleInputStart(touch.clientX, touch.clientY, e.target);
            // Prevent scrolling when interacting with atoms
            if(this.dragged) e.preventDefault();
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const moveX = touch.clientX - this.lx;
            const moveY = touch.clientY - this.ly;
            handleInputMove(touch.clientX, touch.clientY, moveX, moveY);
            if(this.dragged || this.isPanning) e.preventDefault();
        }, { passive: false });

        window.addEventListener('touchend', handleInputEnd);

        window.addEventListener('wheel', (e) => {

            e.preventDefault();
            APP_STATE.view.zoom = Math.max(0.1, Math.min(3, APP_STATE.view.zoom * (e.deltaY > 0 ? 0.9 : 1.1)));
        }, { passive: false });
    }

    updateUI() {
        const ml = document.getElementById('molecule-list');
        if (ml) ml.innerHTML = APP_STATE.atoms.map(a => `<li class="molecule-item" style="display:flex; flex-direction:column; gap:4px">
            <span style="font-weight:bold; color: rgb(${a.dna.colorR}, ${a.dna.colorG}, ${a.dna.colorB})">
                Gen ${a.gen} | DNA#${Math.floor(a.id*10000)} ${a.gen===1 ? '['+a.char+']' : ''}
            </span>
            <span style="font-size:0.75rem; opacity:0.8; font-family:'Inter'">Bases: ${a.fontName}</span>
        </li>`).join('');
    }
}

// --- EXPORT TOOLS ---
function injectExportUI(p) {
    const parent = document.querySelector('.side-panel');
    if(!parent) return;
    const wrapper = document.createElement('div');
    wrapper.style.marginTop = 'auto'; wrapper.style.borderTop = '1px solid rgba(255,255,255,0.1)'; wrapper.style.paddingTop = '1rem';
    wrapper.innerHTML = `
        <h4 style="margin-bottom:10px; opacity:0.8; font-family:'Outfit'">EXPORT LABORATOIRE</h4>
        <div style="display:flex; gap:10px;">
            <button id="btn-snap" class="btn-primary" style="flex:1; background:rgba(255,255,255,0.1)">📸 Image</button>
            <button id="btn-vid" class="btn-primary" style="flex:1; background:rgba(255,0,0,0.4)">🎥 Video (3s)</button>
        </div>
    `;
    parent.appendChild(wrapper);

    document.getElementById('btn-snap').onclick = () => p.saveCanvas('mutation_graphique', 'png');
    let mediaRecorder; let recordedChunks = [];
    document.getElementById('btn-vid').onclick = () => {
        if(APP_STATE.isRecording) return;
        APP_STATE.isRecording = true;
        const canvas = document.querySelector('canvas');
        try { mediaRecorder = new MediaRecorder(canvas.captureStream(60), { mimeType: 'video/webm' }); } catch (e) { APP_STATE.isRecording = false; return; }
        mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };
        mediaRecorder.onstop = () => {
            const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(recordedChunks, { type: 'video/webm' }));
            a.download = 'mutation_laboratoire.webm'; a.click();
            recordedChunks = []; APP_STATE.isRecording = false;
        };
        mediaRecorder.start(); setTimeout(() => mediaRecorder.stop(), 3000);
    };
}

new p5(sketch);

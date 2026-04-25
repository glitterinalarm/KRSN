// Typography Lab - Omniverse Engine v29.0 (ULTRA-DIVERSITY)
console.log("TypoLab Engine v29.0 - INFINITE BIOLOGICAL ENTROPY");

const APP_STATE = { atoms: [], view: { x: 0, y: 0, zoom: 1 }, isRecording: false };

const FONT_SOURCES = [
    { name: 'Roboto', url: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-black-webfont.ttf' },
    { name: 'Source Sans', url: 'https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceSansPro-Black.otf' },
    { name: 'Source Code', url: 'https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf' },
    { name: 'Roboto Mono', url: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-mediumitalic-webfont.ttf' },
    { name: 'Montserrat', url: 'https://fonts.gstatic.com/s/montserrat/v25/JTUSjIg1_i6t8kCHKm4df9GKYJ30.ttf' },
    { name: 'Playfair', url: 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvL-7_C_2_7604GcYxe_n9.ttf' },
    { name: 'Bebas', url: 'https://fonts.gstatic.com/s/bebasneue/v14/JTUSjIg1_i6t8kCHKm4df9GKYJ30.ttf' },
    { name: 'Baskerville', url: 'https://fonts.gstatic.com/s/librebaskerville/v14/kmKiZf83qh_9BRqeG1wYYxb6rpxS7_sy.ttf' },
    { name: 'Unbounded', url: 'https://fonts.gstatic.com/s/unbounded/v1/Y7bgR_S72VHeq_7-ALi1n0Xk.ttf' }
];
const FONTS = [];

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
            g_gravity: (Math.random()-0.5) * 2, // Drift up/down
            g_magnet: powerRand(2), // Attraction to center
            
            g_speed: Math.random() * 4 + 0.1, 
            g_amplitude: Math.random() * 3 + 0.5, 
            g_friction: 0.7 + Math.random() * 0.25,
            cohesion: Math.random() * 0.5 + 0.5, 

            // TOPOLOGY
            v_resolution: Math.random() * 0.18 + 0.015,
            v_roughness: powerRand(3) * 100,

            // RENDER PHENOTYPES (The Richness)
            v_neural: powerRand(2),
            v_membrane: powerRand(2),
            v_spine: powerRand(2),
            v_spores: powerRand(2),
            v_sharp: powerRand(2),
            v_echo: powerRand(3), // Ghostly duplicates
            v_glitch: powerRand(4), // Digital artifacts
            v_chromatic: powerRand(2), // Color aberrations
            v_stencil: Math.random() > 0.8, // Outline only mode

            // STROKE & COLOR
            v_strokeW: Math.random() * 10 + 0.1,
            v_dashA: powerRand(2) * 80,
            v_dashB: powerRand(1.5) * 80,
            v_alphaF: Math.random() * 180,
            v_alphaS: Math.random() * 200 + 55,
            
            blend_additive: Math.random() > 0.6,
            
            colorR: Math.random()*255, colorG: Math.random()*255, colorB: Math.random()*255
        };
    }

    static merge(A, B) {
        let child = {};
        for(let k in (Object.keys(A).length ? A : B)) {
            if (k === 'blend_additive' || k === 'v_stencil') child[k] = Math.random() > 0.5 ? A[k] : B[k];
            else {
                child[k] = ((A[k]||0) + (B[k]||0)) / 2;
                child[k] += (Math.random()-0.5) * (child[k]||1) * 0.8; // High mutation factor
                if(k.startsWith('v_alpha') || k.startsWith('color')) child[k] = Math.max(0, Math.min(255, child[k]));
                if(k.startsWith('g_friction')) child[k] = Math.max(0.5, Math.min(0.99, child[k]));
                if(k.startsWith('g_') || k.startsWith('v_')) child[k] = Math.max(0, child[k]); 
            }
        }
        child.cohesion = (A.cohesion + B.cohesion) / 2 * 0.45; // Degradation
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
        p.background(5, 5, 8); // Deeper black
        p.push(); p.translate(p.width/2 + APP_STATE.view.x, p.height/2 + APP_STATE.view.y); p.scale(APP_STATE.view.zoom);
        
        APP_STATE.atoms.forEach(atom => { atom.update(); atom.draw(); });
        
        p.pop();
        if (APP_STATE.isRecording) {
            p.push(); p.fill(255,0,0); p.circle(50, 50, 20); p.fill(255); p.textSize(16); p.textAlign(p.LEFT, p.CENTER); p.text("REC", 70, 50); p.pop();
        }
    };
    p.windowResized = () => p.resizeCanvas(window.innerWidth, window.innerHeight);
};

class LivingTypo {
    constructor(p, char, fontData, parentData = null) {
        this.p = p;
        this.id = Math.random();
        this.vertices = [];

        if (parentData) {
            this.x = parentData.x; this.y = parentData.y;
            this.char = parentData.char; this.fontName = parentData.fontName;
            this.dna = parentData.dna; this.gen = parentData.gen;
            parentData.vertices.forEach(v => this.vertices.push({ pos: v.pos.copy(), basePos: p.createVector(v.pos.x, v.pos.y), vel: p.createVector(0,0) }));
            while(this.vertices.length > 400) this.vertices.splice(Math.floor(Math.random()*this.vertices.length), 1);
        } else {
            this.x = (Math.random()-0.5)*1200; this.y = (Math.random()-0.5)*1200;
            const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?#@&";
            this.char = alphabet[Math.floor(Math.random() * alphabet.length)];
            this.fontName = fontData.name;
            this.gen = 1;
            this.dna = Genome.createRandom();

            let b = fontData.obj.textBounds(this.char, 0, 0, 500);
            let rawPoints = fontData.obj.textToPoints(this.char, -b.x - b.w/2, -b.y - b.h/2, 500, { sampleFactor: Math.min(0.2, this.dna.v_resolution), simplifyThreshold: 0 });
            rawPoints.forEach(pt => {
                let nx = pt.x + (Math.random() - 0.5) * this.dna.v_roughness;
                let ny = pt.y + (Math.random() - 0.5) * this.dna.v_roughness;
                this.vertices.push({ pos: p.createVector(nx, ny), basePos: p.createVector(nx, ny), vel: p.createVector(0,0) });
            });
        }
    }

    update() {
        let t = this.p.frameCount * 0.01 * this.dna.g_speed;
        let d = this.dna; let amp = d.g_amplitude;
        
        let cmX=0, cmY=0;
        this.vertices.forEach(v => { cmX+=v.pos.x; cmY+=v.pos.y; });
        if(this.vertices.length>0) { cmX/=this.vertices.length; cmY/=this.vertices.length; }
        let center = this.p.createVector(cmX, cmY);

        for (let i = 0; i < this.vertices.length; i++) {
            let v = this.vertices[i];
            let force = this.p.createVector(0, d.g_gravity * amp); // Gravity
            
            if (d.g_fluid > 0.01) {
                let a = this.p.noise(v.pos.x*0.005 + t, v.pos.y*0.005) * this.p.TWO_PI * 4;
                force.add(p5.Vector.fromAngle(a).mult(d.g_fluid * amp));
            }
            if (d.g_orbit > 0.01) {
                let toCenter = p5.Vector.sub(center, v.pos);
                force.add(this.p.createVector(-toCenter.y, toCenter.x).normalize().mult(d.g_orbit * amp));
            }
            if (d.g_pulse > 0.01) {
                let outward = p5.Vector.sub(v.pos, center).normalize();
                force.add(outward.mult(Math.sin(t * 8 - p5.Vector.dist(center, v.pos)*0.03) * d.g_pulse * amp));
            }
            if (d.g_swarm > 0.01) {
                let n = this.vertices[(i+1)%this.vertices.length];
                force.add(p5.Vector.sub(n.pos, v.pos).normalize().mult(d.g_swarm * amp));
            }
            if (d.g_magnet > 0.01) {
                force.add(p5.Vector.sub(center, v.pos).normalize().mult(d.g_magnet * amp));
            }
            
            v.vel.add(force);
            if (d.g_mycelium > 0.01) {
                let snap = Math.round(v.vel.heading() / this.p.HALF_PI) * this.p.HALF_PI;
                v.vel.rotate((snap - v.vel.heading()) * d.g_mycelium * 0.6);
            }

            v.vel.add(p5.Vector.sub(v.basePos, v.pos).mult(d.cohesion * 0.05));
            v.vel.mult(d.g_friction);
            v.pos.add(v.vel);
            
            if (d.cohesion < 1) {
                 v.basePos.add(this.p.createVector(Math.random()-0.5, Math.random()-0.5).mult((1 - d.cohesion) * amp));
            }
        }
    }

    draw() {
        let p = this.p; let d = this.dna;
        p.push(); p.translate(this.x, this.y);
        if (d.blend_additive) p.blendMode(p.ADD);

        const renderBatch = (offX=0, offY=0, scl=1, alphaMult=1) => {
            p.push(); p.translate(offX, offY); p.scale(scl);
            
            let glitchX = (Math.random() < d.v_glitch*0.1) ? (Math.random()-0.5)*100 : 0;
            p.translate(glitchX, 0);

            // MEMBRANE
            if (d.v_membrane > 0.01 && !d.v_stencil) {
                p.noStroke(); p.fill(d.colorR, d.colorG, d.colorB, d.v_alphaF * d.v_membrane * alphaMult);
                p.beginShape(); this.vertices.forEach(v => p.curveVertex(v.pos.x, v.pos.y)); p.endShape();
            }

            // SPINE
            if (d.v_spine > 0.01) {
                p.noFill(); p.stroke(d.colorR, d.colorG, d.colorB, d.v_alphaS * d.v_spine * alphaMult);
                p.strokeWeight(d.v_strokeW * d.v_spine);
                if (d.v_dashA > 2) p.drawingContext.setLineDash([d.v_dashA, d.v_dashB]);
                p.beginShape(); this.vertices.forEach(v => p.vertex(v.pos.x, v.pos.y)); p.endShape();
                p.drawingContext.setLineDash([]);
            }

            // NEURAL
            if (d.v_neural > 0.01) {
                p.stroke(d.colorR, d.colorG, d.colorB, d.v_alphaS * d.v_neural * 0.4 * alphaMult);
                p.strokeWeight(Math.max(0.1, d.v_strokeW * 0.3));
                let distLimit = d.v_neural * 150;
                for(let i=0; i<this.vertices.length; i+=3) {
                    for(let j=i+1; j<this.vertices.length; j+=8) {
                        if (this.vertices[i].pos.dist(this.vertices[j].pos) < distLimit) {
                            p.line(this.vertices[i].pos.x, this.vertices[i].pos.y, this.vertices[j].pos.x, this.vertices[j].pos.y);
                        }
                    }
                }
            }

            // SHARP
            if (d.v_sharp > 0.01) {
                p.noStroke(); p.fill(d.colorR, d.colorG, d.colorB, d.v_alphaF * d.v_sharp * alphaMult);
                p.beginShape(p.TRIANGLES);
                for(let i=0; i<this.vertices.length-2; i+=4) {
                    if (this.vertices[i].pos.dist(this.vertices[i+1].pos) < d.v_sharp * 200) {
                        p.vertex(this.vertices[i].pos.x, this.vertices[i].pos.y);
                        p.vertex(this.vertices[i+1].pos.x, this.vertices[i+1].pos.y);
                        p.vertex(this.vertices[i+2].pos.x, this.vertices[i+2].pos.y);
                    }
                }
                p.endShape();
            }

            // SPORES
            if (d.v_spores > 0.01) {
                p.noStroke(); p.fill(d.colorR, d.colorG, d.colorB, d.v_alphaS * d.v_spores * alphaMult);
                for(let v of this.vertices) {
                    let s = d.v_spores * 20;
                    p.push(); p.translate(v.pos.x, v.pos.y); p.rotate(v.vel.heading());
                    if(d.v_chromatic > 0.5) p.rect(0, 0, s, s); else p.circle(0, 0, s);
                    p.pop();
                }
            }
            p.pop();
        };

        // Main Draw + ECHOES
        renderBatch();
        if (d.v_echo > 0.1) {
            for(let k=1; k<3; k++) {
                let off = k * d.v_echo * 20;
                renderBatch(off, off, 1 - k*0.05, 0.4);
            }
        }
        
        p.blendMode(p.BLEND);
        p.pop();
    }
}

class TypoUniverse {
    constructor(pInstance) {
        this.p = pInstance;
        this.initInteraction();
        document.getElementById('add-atom').onclick = () => this.addAtom();
        for(let i=0; i<8; i++) this.addAtom();
    }

    addAtom() {
        const fontData = FONTS[Math.floor(Math.random() * FONTS.length)];
        APP_STATE.atoms.push(new LivingTypo(this.p, '', fontData));
        this.updateUI();
    }

    checkCollisions(a) {
        const other = APP_STATE.atoms.find(o => o !== a && Math.hypot(a.x - o.x, a.y - o.y) < 180);
        if (other) {
            let childData = {
                x: (a.x + other.x) / 2, y: (a.y + other.y) / 2,
                char: "?", fontName: `${a.fontName}/${other.fontName}`,
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
            this.dragged = APP_STATE.atoms.find(a => Math.hypot(a.x - mx, a.y - my) < 250);
            if (!this.dragged) { this.isPanning = true; this.lx = clientX; this.ly = clientY; }
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

        window.addEventListener('mousedown', (e) => handleInputStart(e.clientX, e.clientY, e.target));
        window.addEventListener('mousemove', (e) => handleInputMove(e.clientX, e.clientY, e.movementX, e.movementY));
        window.addEventListener('mouseup', () => { if (this.dragged) this.checkCollisions(this.dragged); this.dragged = null; this.isPanning = false; });

        window.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            handleInputStart(touch.clientX, touch.clientY, e.target);
            if(this.dragged) e.preventDefault();
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            handleInputMove(touch.clientX, touch.clientY, touch.clientX - this.lx, touch.clientY - this.ly);
            if(this.dragged || this.isPanning) e.preventDefault();
        }, { passive: false });

        window.addEventListener('touchend', () => { if (this.dragged) this.checkCollisions(this.dragged); this.dragged = null; this.isPanning = false; });

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

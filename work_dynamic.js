/**
 * Dynamic Horizontal Gallery Logic
 * Paraffine Studio
 */

class HorizontalGallery {
    constructor() {
        this.container = document.querySelector('.work-gallery-container');
        this.wrapper = document.querySelector('.work-gallery-wrapper');
        this.items = document.querySelectorAll('.work-gallery-item');
        
        this.targetX = 0;
        this.currentX = 0;
        this.targetY = 0;
        this.currentY = 0;
        this.lerpAmount = 0.08;
        
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.lastX = 0;
        this.lastY = 0;

        this.init();
    }

    init() {
        if (!this.container || !this.wrapper) return;

        // Force wrapper to be correct width
        this.updateBounds();
        window.addEventListener('resize', () => this.updateBounds());

        // Mouse/Touch Drag
        this.container.addEventListener('mousedown', (e) => this.startDragging(e));
        window.addEventListener('mousemove', (e) => this.drag(e));
        window.addEventListener('mouseup', () => this.stopDragging());

        this.container.addEventListener('touchstart', (e) => this.startDragging(e.touches[0]));
        window.addEventListener('touchmove', (e) => this.drag(e.touches[0]));
        window.addEventListener('touchend', () => this.stopDragging());

        // Wheel Scroll (Both X and Y contribute to horizontal travel)
        window.addEventListener('wheel', (e) => {
            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            this.targetX -= delta * 1.5;
            this.clampTarget();
        }, { passive: true });

        // Parallax Effect via Intersection Observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const ratio = entry.intersectionRatio;
                const img = entry.target.querySelector('img');
                const caption = entry.target.querySelector('.work-caption');
                if (img) {
                    // Detroit-style parallax: slow scale and vertical shift
                    const yOffset = (1 - ratio) * 50;
                    img.style.transform = `scale(${1.1 - (ratio * 0.1)}) translateY(${yOffset}px)`;
                }
                if (caption) {
                    caption.style.transform = `translateX(${(ratio - 0.5) * -30}px)`;
                }
            });
        }, { threshold: Array.from({ length: 40 }, (_, i) => i / 40) });

        this.items.forEach((item, index) => {
            item.style.setProperty('--index', index);
            // Alternate vertical positioning for "mixed" look
            if (index % 2 === 1) item.classList.add('stagger-down');
            else if (index % 3 === 0) item.classList.add('stagger-center');
            else item.classList.add('stagger-up');
            
            observer.observe(item);
        });

        this.animate();
    }

    updateBounds() {
        this.maxScroll = this.wrapper.offsetWidth - window.innerWidth + (window.innerWidth * 0.2);
    }

    clampTarget() {
        this.targetX = Math.max(-this.maxScroll, Math.min(0, this.targetX));
    }

    startDragging(e) {
        this.isDragging = true;
        this.startX = e.pageX;
        this.startY = e.pageY;
        this.lastX = this.targetX;
        this.lastY = this.targetY;
        this.container.style.cursor = 'grabbing';
    }

    drag(e) {
        if (!this.isDragging) return;
        const deltaX = e.pageX - this.startX;
        const deltaY = e.pageY - this.startY;
        
        this.targetX = this.lastX + deltaX * 1.5;
        // Add subtle vertical shift for "fluidity"
        this.targetY = deltaY * 0.1; 
        
        this.clampTarget();
    }

    stopDragging() {
        this.isDragging = false;
        this.targetY = 0; // Return to center
        this.container.style.cursor = 'crosshair';
    }

    animate() {
        this.currentX += (this.targetX - this.currentX) * this.lerpAmount;
        this.currentY += (this.targetY - this.currentY) * this.lerpAmount;
        
        // Combine X travel with subtle Y bounce
        this.wrapper.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0)`;
        
        requestAnimationFrame(() => this.animate());
    }
}

// Hover cursor effect
function initCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    const interactiveElements = document.querySelectorAll('.work-gallery-item, a, button');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    new HorizontalGallery();
    // initCustomCursor(); // Optional: add if we want a custom cursor
});

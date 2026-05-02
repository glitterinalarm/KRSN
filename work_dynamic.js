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
        this.lerpAmount = 0.08;
        
        this.isDragging = false;
        this.startX = 0;
        this.lastX = 0;

        this.init();
    }

    init() {
        if (!this.container || !this.wrapper) return;

        // Mouse/Touch Drag
        this.container.addEventListener('mousedown', (e) => this.startDragging(e));
        window.addEventListener('mousemove', (e) => this.drag(e));
        window.addEventListener('mouseup', () => this.stopDragging());

        this.container.addEventListener('touchstart', (e) => this.startDragging(e.touches[0]));
        window.addEventListener('touchmove', (e) => this.drag(e.touches[0]));
        window.addEventListener('touchend', () => this.stopDragging());

        // Wheel Scroll
        window.addEventListener('wheel', (e) => {
            this.targetX -= e.deltaY + e.deltaX;
            this.clampTarget();
        }, { passive: true });

        // Intersection Observer for items
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const ratio = entry.intersectionRatio;
                const img = entry.target.querySelector('img');
                if (img) {
                    img.style.transform = `scale(${1.1 - (ratio * 0.1)}) translateY(${(1 - ratio) * 20}px)`;
                }
            });
        }, { threshold: Array.from({ length: 20 }, (_, i) => i / 20) });

        this.items.forEach((item, index) => {
            item.style.setProperty('--index', index);
            observer.observe(item);
        });

        this.animate();
    }

    clampTarget() {
        const maxScroll = this.wrapper.offsetWidth - window.innerWidth + (window.innerWidth * 0.3);
        this.targetX = Math.max(-maxScroll, Math.min(0, this.targetX));
    }

    startDragging(e) {
        this.isDragging = true;
        this.startX = e.pageX;
        this.lastX = this.targetX;
        this.container.style.cursor = 'grabbing';
    }

    drag(e) {
        if (!this.isDragging) return;
        const delta = e.pageX - this.startX;
        this.targetX = this.lastX + delta * 1.5;
        this.clampTarget();
    }

    stopDragging() {
        this.isDragging = false;
        this.container.style.cursor = 'crosshair';
    }

    animate() {
        this.currentX += (this.targetX - this.currentX) * this.lerpAmount;
        this.wrapper.style.transform = `translateX(${this.currentX}px)`;
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

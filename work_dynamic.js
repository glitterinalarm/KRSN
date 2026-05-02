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
        this.velocity = 0;
        this.lerpAmount = 0.06; // Slightly slower for more "weight"
        
        this.isDragging = false;
        this.startX = 0;
        this.lastX = 0;

        this.init();
    }

    init() {
        if (!this.container || !this.wrapper) return;

        this.updateBounds();
        window.addEventListener('resize', () => this.updateBounds());

        // Interaction Listeners
        this.container.addEventListener('mousedown', (e) => this.startDragging(e));
        window.addEventListener('mousemove', (e) => this.drag(e));
        window.addEventListener('mouseup', () => this.stopDragging());

        this.container.addEventListener('touchstart', (e) => this.startDragging(e.touches[0]));
        window.addEventListener('touchmove', (e) => this.drag(e.touches[0]));
        window.addEventListener('touchend', () => this.stopDragging());

        window.addEventListener('wheel', (e) => {
            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            this.targetX -= delta * 1.5;
            this.clampTarget();
        }, { passive: true });

        // DESYNCHRONIZED STAGGER & PARALLAX
        this.items.forEach((item, index) => {
            // Add varied delays and durations for non-uniform reveal
            const randomDelay = (index * 0.15) + (Math.random() * 0.3);
            const randomDuration = 1 + (Math.random() * 0.5);
            item.style.animationDelay = `${randomDelay}s`;
            item.style.animationDuration = `${randomDuration}s`;
            
            item.style.setProperty('--index', index);
            
            // Varied speeds for horizontal parallax (Detroit style)
            item.setAttribute('data-speed', 0.8 + (Math.random() * 0.4));

            if (index % 2 === 1) item.classList.add('stagger-down');
            else if (index % 3 === 0) item.classList.add('stagger-center');
            else item.classList.add('stagger-up');
        });

        this.animate();
        this.fixVideos();
    }

    // Fix YouTube embeds to avoid Error 153 and domain restrictions
    fixVideos() {
        document.querySelectorAll('img[data-video]').forEach(img => {
            let url = img.getAttribute('data-video');
            if (url.includes('youtube.com')) {
                // Ensure origin is set and playsinline is active
                if (!url.includes('origin=')) {
                    url += `&origin=${window.location.origin}&playsinline=1`;
                    img.setAttribute('data-video', url);
                }
            }
        });
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
        const lastX = this.currentX;
        this.currentX += (this.targetX - this.currentX) * this.lerpAmount;
        this.velocity = this.currentX - lastX;

        this.wrapper.style.transform = `translate3d(${this.currentX}px, 0, 0)`;

        const skew = this.velocity * 0.08;
        const scale = 1 - Math.abs(this.velocity) * 0.0005;

        this.items.forEach((item, i) => {
            const img = item.querySelector('img');
            const caption = item.querySelector('.work-caption');
            const speed = parseFloat(item.getAttribute('data-speed') || 1);
            
            const rect = item.getBoundingClientRect();
            const centerDist = (rect.left + rect.width / 2) / window.innerWidth - 0.5;
            
            if (img) {
                const imgShift = centerDist * -80 * speed; 
                img.style.transform = `scale(${scale}) skewX(${skew}deg) translateY(${imgShift}px)`;
            }
            if (caption) {
                caption.style.transform = `translateX(${centerDist * 50 * (2 - speed)}px)`;
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new HorizontalGallery());
} else {
    new HorizontalGallery();
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

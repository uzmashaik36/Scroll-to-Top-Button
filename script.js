(function () {
    const btn = document.getElementById('scrollTopBtn');
    const showOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--show-offset')) || 300;
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ringPath = document.getElementById('ringPath');
    const doc = document.documentElement;
    const body = document.body;

    // Helper: get scroll progress 0..1
    function scrollProgress() {
        const scrollTop = window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
        const height = Math.max(doc.scrollHeight, body.scrollHeight) - window.innerHeight;
        return height > 0 ? Math.min(1, scrollTop / height) : 0;
    }

    // Update ring stroke-dasharray to show progress
    function updateRing() {
        if (!ringPath) return;
        const circumference = 100; // arbitrary stroke-dasharray scale for this path
        // We'll compute percentage and map to dasharray
        const progress = scrollProgress();
        // Set stroke-dasharray and stroke-dashoffset
        // Use CSS currentColor for ring color; value between 0..100
        const dash = circumference * progress;
        ringPath.style.strokeDasharray = dash + ' ' + (circumference - dash);
    }

    // Show/hide button on scroll
    function onScroll() {
        const scrollTop = window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
        if (scrollTop >= showOffset) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
        updateRing();
    }

    // Smooth scroll to top with fallback if not supported
    function scrollToTop() {
        if ('scrollBehavior' in document.documentElement.style && !prefersReduced) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Smooth polyfill-like fallback (simple)
            const start = window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
            const duration = 420;
            const startTime = performance.now();

            function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

            function step(now) {
                const elapsed = Math.min(1, (now - startTime) / duration);
                const val = start * (1 - easeOutCubic(elapsed));
                window.scrollTo(0, val);
                if (elapsed < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        }
    }

    // Keyboard activation: Enter/Space
    btn.addEventListener('click', scrollToTop);
    btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            scrollToTop();
        }
    });

    // Throttle resize/scroll using requestAnimationFrame
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                onScroll();
                ticking = false;
            });
        }
        ticking = true;
    }, { passive: true });

    // Initial run
    onScroll();

    // Optional: expose API (global) for customization if needed
    window.__ScrollTopButton = {
        showOffsetPx: (px) => {
            document.documentElement.style.setProperty('--show-offset', px);
        },
        show: () => btn.classList.add('show'),
        hide: () => btn.classList.remove('show'),
        scrollToTop
    };
})();

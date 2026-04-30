// ── Critical path JS (tiny, ~0.8KB) ────────────────────────────────────────
// GSAP and Three.js are both lazy-loaded so they NEVER block initial paint.
// Hero animations are handled by CSS @keyframes in style.css.
import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  // ── Hamburger Menu ──────────────────────────────────────────────────────
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }

  // ── Mobile Dropdown ─────────────────────────────────────────────────────
  const dropdownToggle = document.querySelector('.dropdown > a');
  if (dropdownToggle && window.innerWidth <= 768) {
    dropdownToggle.addEventListener('click', (e) => {
      e.preventDefault();
      dropdownToggle.parentElement.classList.toggle('active');
    });
  }

  // ── FAQ Accordion ───────────────────────────────────────────────────────
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-question');
    if (q) q.addEventListener('click', () => item.classList.toggle('active'));
  });

  // ── Active Nav Link ─────────────────────────────────────────────────────
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links > li > a').forEach(link => {
    const href = link.getAttribute('href');
    if (path === href || (path === '/' && href === '/')) {
      link.classList.add('active');
    } else if (href !== '/' && path.startsWith(href)) {
      link.classList.add('active');
    }
  });
});

// ── Lazy-load GSAP + Three.js after first paint ─────────────────────────────
// requestIdleCallback fires when the browser is idle (after LCP has painted).
// This moves both heavy libraries completely off the critical rendering path.
const loadEnhancements = () => {
  // ── GSAP Scroll Animations ───────────────────────────────────────────────
  Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger')
  ]).then(([{ gsap }, { ScrollTrigger }]) => {
    gsap.registerPlugin(ScrollTrigger);

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isOldAndroid    = /Android [1-7]/.test(navigator.userAgent);

    if (!isReducedMotion && !isOldAndroid) {
      // Skills progress bars
      document.querySelectorAll('.skill-progress').forEach(bar => {
        const targetWidth = bar.getAttribute('data-width');
        if (targetWidth) {
          ScrollTrigger.create({
            trigger: bar,
            start: 'top 85%',
            onEnter: () => { bar.style.width = targetWidth; }
          });
        }
      });

      // Section titles
      gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
          scrollTrigger: { trigger: title, start: 'top 85%' },
          opacity: 0, y: 30, duration: 0.8
        });
      });

      // Grid cards with stagger
      [
        { selector: '.projects-grid',    children: '.glass-card, .project-card' },
        { selector: '.features-grid',    children: '.feature-card' },
        { selector: '.testimonials-grid',children: '.testimonial-card' },
        { selector: '.stats-grid',       children: '.stat-card' },
        { selector: '.social-grid',      children: '.social-item' }
      ].forEach(({ selector, children }) => {
        gsap.utils.toArray(selector).forEach(grid => {
          const items = grid.querySelectorAll(children);
          if (items.length > 0) {
            gsap.from(items, {
              scrollTrigger: { trigger: grid, start: 'top 85%' },
              opacity: 0, y: 40, duration: 0.8, stagger: 0.15, ease: 'power2.out'
            });
          }
        });
      });

      // Timeline items
      gsap.utils.toArray('.timeline-item').forEach(item => {
        gsap.from(item, {
          scrollTrigger: { trigger: item, start: 'top 85%' },
          opacity: 0, x: item.classList.contains('left') ? -50 : 50, duration: 0.8
        });
      });

      // Standalone cards
      gsap.utils.toArray('main > .glass-card').forEach(card => {
        gsap.from(card, {
          scrollTrigger: { trigger: card, start: 'top 85%' },
          opacity: 0, y: 40, duration: 0.8
        });
      });
    }
  });

  // ── Three.js 3D Background ───────────────────────────────────────────────
  const canvas = document.querySelector('#bg');
  if (canvas) {
    import('three').then((THREE) => {
      try {
        const isOldAndroid  = /Android [1-7]/.test(navigator.userAgent);
        const particleCount = isOldAndroid ? 300 : 1000;

        const scene    = new THREE.Scene();
        const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          powerPreference: 'low-power',
          antialias: !isOldAndroid
        });

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.position.setZ(30);

        const geometry = new THREE.BufferGeometry();
        const posArray = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i++) {
          posArray[i] = (Math.random() - 0.5) * 100;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const material = new THREE.PointsMaterial({
          size: 0.2, color: 0x3b82f6,
          transparent: true, opacity: 0.8,
          blending: THREE.AdditiveBlending
        });

        const particlesMesh = new THREE.Points(geometry, material);
        scene.add(particlesMesh);
        scene.add(new THREE.PointLight(0x8b5cf6, 2, 100));
        scene.add(new THREE.AmbientLight(0xffffff, 0.1));

        let mouseX = 0, mouseY = 0;
        document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

        (function animate() {
          requestAnimationFrame(animate);
          particlesMesh.rotation.y += 0.001;
          particlesMesh.rotation.x += 0.0005;
          particlesMesh.position.x += (mouseX * 0.005 - particlesMesh.position.x) * 0.05;
          particlesMesh.position.y += (-mouseY * 0.005 - particlesMesh.position.y) * 0.05;
          renderer.render(scene, camera);
        })();

        window.addEventListener('resize', () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        });
      } catch (e) {
        console.warn('WebGL not supported:', e);
        canvas.style.display = 'none';
      }
    });
  }
};

// Fire after the browser is idle — guaranteed to run within 3s on slow devices
if ('requestIdleCallback' in window) {
  requestIdleCallback(loadEnhancements, { timeout: 3000 });
} else {
  setTimeout(loadEnhancements, 200);
}

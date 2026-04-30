import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  // ── Hamburger Menu ──────────────────────────────────────────────────────────
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }

  // ── Mobile Dropdown ──────────────────────────────────────────────────────────
  const dropdownToggle = document.querySelector('.dropdown > a');
  if (dropdownToggle && window.innerWidth <= 768) {
    dropdownToggle.addEventListener('click', (e) => {
      e.preventDefault();
      dropdownToggle.parentElement.classList.toggle('active');
    });
  }

  // ── FAQ Accordion ────────────────────────────────────────────────────────────
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        item.classList.toggle('active');
      });
    }
  });

  // ── Skills Progress Bars ─────────────────────────────────────────────────────
  const skillBars = document.querySelectorAll('.skill-progress');
  skillBars.forEach(bar => {
    const targetWidth = bar.getAttribute('data-width');
    if (targetWidth) {
      ScrollTrigger.create({
        trigger: bar,
        start: 'top 85%',
        onEnter: () => { bar.style.width = targetWidth; }
      });
    }
  });

  // ── Active Nav Link ──────────────────────────────────────────────────────────
  const path = window.location.pathname;
  const links = document.querySelectorAll('.nav-links > li > a');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (path === href || (path === '/' && href === '/')) {
      link.classList.add('active');
    } else if (href !== '/' && path.startsWith(href)) {
      link.classList.add('active');
    }
  });

  // ── GSAP Animations ──────────────────────────────────────────────────────────
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isOldAndroid = /Android [1-7]/.test(navigator.userAgent);

  if (!isReducedMotion && !isOldAndroid) {
    // Hero: use fromTo with near-zero (not zero) opacity so the browser CAN
    // still paint the LCP element immediately — fixing the 2,500ms render delay.
    if (document.querySelector('.hero h1')) {
      gsap.fromTo('.hero h1',
        { opacity: 0.01, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.1, clearProps: 'all' }
      );
    }
    if (document.querySelector('.hero p')) {
      gsap.fromTo('.hero p',
        { opacity: 0.01, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.3, clearProps: 'all' }
      );
    }
    if (document.querySelector('.hero .btn')) {
      gsap.fromTo('.hero .btn',
        { opacity: 0.01, y: 10 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.5, clearProps: 'all' }
      );
    }

    // Section titles on scroll
    gsap.utils.toArray('.section-title').forEach(title => {
      gsap.from(title, {
        scrollTrigger: { trigger: title, start: 'top 85%' },
        opacity: 0, y: 30, duration: 0.8
      });
    });

    // Grid cards with stagger
    const grids = [
      { selector: '.projects-grid', children: '.glass-card, .project-card' },
      { selector: '.features-grid', children: '.feature-card' },
      { selector: '.testimonials-grid', children: '.testimonial-card' },
      { selector: '.stats-grid', children: '.stat-card' },
      { selector: '.social-grid', children: '.social-item' }
    ];
    grids.forEach(({ selector, children }) => {
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

    // Standalone cards outside grids
    gsap.utils.toArray('main > .glass-card').forEach(card => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 85%' },
        opacity: 0, y: 40, duration: 0.8
      });
    });
  }
});

// ── Three.js Background ───────────────────────────────────────────────────────
// Loaded lazily via requestIdleCallback so it NEVER blocks the critical path.
// Three.js (517KB) was previously loaded synchronously, causing the 2,500ms
// LCP "Element render delay". Now it only starts after the page is interactive.
const canvas = document.querySelector('#bg');
if (canvas) {
  const loadThree = () => {
    import('three').then((THREE) => {
      try {
        const isOldAndroid = /Android [1-7]/.test(navigator.userAgent);
        const particleCount = isOldAndroid ? 300 : 1000;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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
          size: 0.2,
          color: 0x3b82f6,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending
        });

        const particlesMesh = new THREE.Points(geometry, material);
        scene.add(particlesMesh);

        scene.add(new THREE.PointLight(0x8b5cf6, 2, 100));
        scene.add(new THREE.AmbientLight(0xffffff, 0.1));

        let mouseX = 0, mouseY = 0;
        document.addEventListener('mousemove', (e) => {
          mouseX = e.clientX;
          mouseY = e.clientY;
        });

        function animate() {
          requestAnimationFrame(animate);
          particlesMesh.rotation.y += 0.001;
          particlesMesh.rotation.x += 0.0005;
          particlesMesh.position.x += (mouseX * 0.005 - particlesMesh.position.x) * 0.05;
          particlesMesh.position.y += (-mouseY * 0.005 - particlesMesh.position.y) * 0.05;
          renderer.render(scene, camera);
        }
        animate();

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
  };

  // requestIdleCallback fires after the browser has finished painting the page,
  // timeout:3000 ensures it runs within 3s even on slow devices.
  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadThree, { timeout: 3000 });
  } else {
    setTimeout(loadThree, 500);
  }
}

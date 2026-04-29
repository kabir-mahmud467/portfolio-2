import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  // Hamburger Menu Logic
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }

  // Mobile Dropdown toggle
  const dropdownToggle = document.querySelector('.dropdown > a');
  if (dropdownToggle && window.innerWidth <= 768) {
    dropdownToggle.addEventListener('click', (e) => {
      e.preventDefault();
      dropdownToggle.parentElement.classList.toggle('active');
    });
  }

  // FAQ Accordion Logic
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if(question) {
      question.addEventListener('click', () => {
        item.classList.toggle('active');
        // Optional: Close others
        // faqItems.forEach(other => { if(other !== item) other.classList.remove('active'); });
      });
    }
  });

  // Skills Progress Logic
  const skillBars = document.querySelectorAll('.skill-progress');
  skillBars.forEach(bar => {
    const targetWidth = bar.getAttribute('data-width');
    if (targetWidth) {
      ScrollTrigger.create({
        trigger: bar,
        start: 'top 85%',
        onEnter: () => {
          bar.style.width = targetWidth;
        }
      });
    }
  });

  // Active link highlight based on pathname
  const path = window.location.pathname;
  const links = document.querySelectorAll('.nav-links > li > a');
  links.forEach(link => {
    if (path.includes(link.getAttribute('href')) && link.getAttribute('href') !== '/home/') {
      link.classList.add('active');
    } else if (path === '/' && link.getAttribute('href') === '/home/') {
      link.classList.add('active');
    } else if (path === '/home/' && link.getAttribute('href') === '/home/') {
      link.classList.add('active');
    }
  });

  // GSAP Animations - ScrollTrigger enabled for extraordinary effects
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isOldAndroid = /Android [1-7]/.test(navigator.userAgent);
  
  if (!isReducedMotion && !isOldAndroid) {
    // Hero Animations
    if(document.querySelector('.hero h1')) {
      gsap.from('.hero h1', { opacity: 0, y: 50, duration: 1, delay: 0.2 });
    }
    if(document.querySelector('.hero p')) {
      gsap.from('.hero p', { opacity: 0, y: 30, duration: 1, delay: 0.5 });
    }

    // Scroll Animations for Titles
    gsap.utils.toArray('.section-title').forEach(title => {
      gsap.from(title, {
        scrollTrigger: { trigger: title, start: 'top 85%' },
        opacity: 0, y: 30, duration: 0.8
      });
    });

    // Animate Grids with Stagger
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
            opacity: 0, 
            y: 40, 
            duration: 0.8, 
            stagger: 0.15,
            ease: "power2.out"
          });
        }
      });
    });

    // Timeline items
    gsap.utils.toArray('.timeline-item').forEach((item, index) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 85%' },
        opacity: 0, x: item.classList.contains('left') ? -50 : 50, duration: 0.8
      });
    });

    // Single standalone glass-cards (if any are not in a grid)
    gsap.utils.toArray('main > .glass-card').forEach(card => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 85%' },
        opacity: 0, y: 40, duration: 0.8
      });
    });
  } else {
    // Basic fade in for old devices
    gsap.to('main > *', { opacity: 1, duration: 0.5 });
  }
});

// Three.js Background Optimization
const canvas = document.querySelector('#bg');
if (canvas) {
  try {
    const isOldAndroid = /Android [1-7]/.test(navigator.userAgent);
    const particleCount = isOldAndroid ? 300 : 1000; // Reduce particles on old Android

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      alpha: true,
      powerPreference: "low-power", // Optimization for battery/heat
      antialias: !isOldAndroid      // Disable antialias on low-end
    });

    // Cap pixel ratio at 2.0 for performance
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.setZ(30);

    // Particles
    const geometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);

    for(let i = 0; i < particleCount * 3; i++) {
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

    // Lights
    const pointLight = new THREE.PointLight(0x8b5cf6, 2, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    // Mouse interactivity
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    });

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);

      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.0005;
      
      // Parallax effect - smoother interpolation
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
    console.warn('WebGL not supported or failed to initialize:', e);
    canvas.style.display = 'none';
  }
}

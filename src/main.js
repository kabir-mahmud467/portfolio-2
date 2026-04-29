import * as THREE from 'three';
import { gsap } from 'gsap';
import './style.css';

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

  // Active link highlight based on pathname
  const path = window.location.pathname;
  const links = document.querySelectorAll('.nav-links > li > a');
  links.forEach(link => {
    if (path.includes(link.getAttribute('href'))) {
      link.classList.add('active');
    }
  });

  // GSAP Animations - Reduced for performance on older devices
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isOldAndroid = /Android [1-7]/.test(navigator.userAgent);
  
  if (!isReducedMotion && !isOldAndroid) {
    if(document.querySelector('.hero h1')) {
      gsap.from('.hero h1', { opacity: 0, y: 50, duration: 1, delay: 0.2 });
    }
    if(document.querySelector('.hero p')) {
      gsap.from('.hero p', { opacity: 0, y: 30, duration: 1, delay: 0.5 });
    }
    if(document.querySelector('.glass-card')) {
      gsap.from('.glass-card', { opacity: 0, y: 50, duration: 0.8, stagger: 0.2, delay: 0.2 });
    }
    if(document.querySelector('.timeline-item')) {
      gsap.from('.timeline-item', { opacity: 0, x: (index) => index % 2 === 0 ? -50 : 50, duration: 0.8, stagger: 0.3, delay: 0.2 });
    }
    if(document.querySelector('.social-item')) {
      gsap.from('.social-item', { opacity: 0, scale: 0.8, duration: 0.5, stagger: 0.1, delay: 0.2 });
    }
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

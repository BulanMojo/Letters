const cards = document.querySelectorAll(".card, .card1, .card2, .card3, .card4, .card5");
let current = 0;
let animationStarted = false;
let lastFireworkTime = 0;
const FIREWORK_INTERVAL = 300; // Constant fireworks every 300ms

// Create canvas
const canvas = document.createElement("canvas");
canvas.id = "fireworks";
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

// Mobile performance optimization
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let particleLimit = isMobile ? 100 : 200; // Reduce particles on mobile
let fireworkLimit = isMobile ? 3 : 5; // Reduce fireworks on mobile

// Responsive canvas with mobile optimization
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 2 : 3); // Limit DPR on mobile
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

// Throttled resize for mobile performance
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(resizeCanvas, 250);
});
resizeCanvas();

// Arrays
const fireworks = [];
const particles = [];
const growingRoses = [];

// ================= GROWING ROSES WITH WIND (MOBILE OPTIMIZED) =================
class GrowingRose {
  constructor() {
    this.reset();
    // Wind properties
    this.windStrength = Math.random() * 2 - 1;
    this.windFrequency = 0.01 + Math.random() * 0.02;
    this.windTime = Math.random() * Math.PI * 2;
  }
  
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 20;
    this.size = 0;
    this.maxSize = isMobile ? 12 + Math.random() * 15 : 15 + Math.random() * 20;
    this.growthSpeed = 0.2 + Math.random() * 0.3;
    this.stemHeight = isMobile ? 30 + Math.random() * 40 : 40 + Math.random() * 60;
    this.leaves = [];
    this.phase = 0;
    this.color = `hsl(${330 + Math.random() * 30}, 70%, 50%)`;
    this.stemColor = `hsl(${120 + Math.random() * 30}, 60%, 30%)`;
    this.leafColor = `hsl(${120 + Math.random() * 30}, 60%, 35%)`;
    
    // Create leaves (fewer on mobile)
    const leafCount = isMobile ? 2 + Math.floor(Math.random() * 2) : 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < leafCount; i++) {
      this.leaves.push({
        position: 0.2 + Math.random() * 0.6,
        size: isMobile ? 6 + Math.random() * 4 : 8 + Math.random() * 6,
        angle: Math.random() * Math.PI - Math.PI / 2
      });
    }
  }
  
  update() {
    this.windTime += this.windFrequency;
    const windOffset = Math.sin(this.windTime) * this.windStrength * 3;
    
    if (this.phase === 0) {
      this.y -= 1.5;
      this.size += this.growthSpeed;
      
      if (this.y <= canvas.height - this.stemHeight) {
        this.phase = 1;
      }
    } else if (this.phase === 1) {
      this.size += this.growthSpeed * 0.5;
      this.x += windOffset * 0.1;
      
      if (this.size >= this.maxSize) {
        this.phase = 2;
      }
    } else {
      this.x += windOffset * 0.2;
    }
    
    if (this.x < -50 || this.x > canvas.width + 50 || this.size < 0) {
      this.reset();
    }
  }
  
  draw(ctx) {
    ctx.save();
    
    // Draw stem with wind effect
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    
    const stemCurve = Math.sin(this.windTime) * this.windStrength * 10;
    const cp1x = this.x + stemCurve * 0.3;
    const cp1y = this.y - this.stemHeight * 0.3;
    const cp2x = this.x + stemCurve * 0.7;
    const cp2y = this.y - this.stemHeight * 0.7;
    const endX = this.x + stemCurve;
    const endY = this.y - this.stemHeight;
    
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    ctx.strokeStyle = this.stemColor;
    ctx.lineWidth = isMobile ? 2 : 3;
    ctx.stroke();
    
    // Draw leaves (simplified on mobile)
    this.leaves.forEach(leaf => {
      const leafY = this.y - (this.stemHeight * leaf.position);
      const leafX = endX + (this.x - endX) * (1 - leaf.position);
      
      ctx.save();
      ctx.translate(leafX, leafY);
      ctx.rotate(leaf.angle + stemCurve * 0.01);
      
      ctx.beginPath();
      ctx.ellipse(0, 0, leaf.size, leaf.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = this.leafColor;
      ctx.fill();
      
      ctx.restore();
    });
    
    const roseX = endX;
    const roseY = endY;
    
    // Rose petals (fewer layers on mobile)
    const petalLayers = this.phase === 1 ? 
      Math.floor((this.size / this.maxSize) * (isMobile ? 2 : 3)) + 1 : 
      (isMobile ? 2 : 3);
    
    for (let layer = petalLayers; layer > 0; layer--) {
      const layerSize = this.size * (0.6 + layer * 0.15);
      const layerAlpha = 0.3 + (layer / petalLayers) * 0.7;
      
      ctx.save();
      ctx.translate(roseX, roseY);
      ctx.rotate(stemCurve * 0.005);
      
      // Outer petals (fewer on mobile)
      const outerPetals = isMobile ? 6 : 8;
      for (let i = 0; i < outerPetals; i++) {
        const angle = (i / outerPetals) * Math.PI * 2;
        const petalLength = layerSize * (0.8 + Math.random() * 0.4);
        const petalWidth = layerSize * 0.7;
        
        ctx.save();
        ctx.rotate(angle);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(petalWidth * 0.5, -petalLength * 0.3, petalWidth, -petalLength * 0.1);
        ctx.quadraticCurveTo(petalWidth * 0.3, -petalLength, -petalWidth * 0.3, -petalLength);
        ctx.quadraticCurveTo(-petalWidth, -petalLength * 0.1, -petalWidth * 0.5, -petalLength * 0.3);
        ctx.closePath();
        
        // Skip gradient on mobile for performance
        if (isMobile) {
          ctx.fillStyle = this.color;
        } else {
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, -petalLength * 0.5, petalLength);
          gradient.addColorStop(0, this.color);
          gradient.addColorStop(1, `hsl(${330 + Math.random() * 20}, 60%, 40%)`);
          ctx.fillStyle = gradient;
        }
        
        ctx.globalAlpha = layerAlpha * (0.7 + Math.random() * 0.3);
        ctx.fill();
        ctx.restore();
      }
      
      // Inner petals (fewer on mobile)
      const innerPetals = isMobile ? 3 : 5;
      for (let i = 0; i < innerPetals; i++) {
        const angle = (i / innerPetals) * Math.PI * 2;
        const petalLength = layerSize * 0.6;
        const petalWidth = layerSize * 0.4;
        
        ctx.save();
        ctx.rotate(angle);
        
        ctx.beginPath();
        ctx.ellipse(0, -petalLength * 0.3, petalWidth, petalLength, 0, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${350 + Math.random() * 10}, 80%, 60%)`;
        ctx.globalAlpha = layerAlpha;
        ctx.fill();
        ctx.restore();
      }
      
      ctx.restore();
    }
    
    // Rose center
    ctx.beginPath();
    ctx.arc(roseX, roseY, this.size * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${40 + Math.random() * 20}, 80%, 50%)`;
    ctx.fill();
    
    ctx.restore();
  }
}

// Generate roses (fewer on mobile)
const roseCount = isMobile ? 4 + Math.floor(Math.random() * 3) : 8 + Math.floor(Math.random() * 5);
for (let i = 0; i < roseCount; i++) {
  setTimeout(() => {
    growingRoses.push(new GrowingRose());
  }, i * 500);
}

// ================= CONSTANT FIREWORKS =================
class Firework {
  constructor(x, y, targetY, color) {
    this.x = x; this.y = y; this.targetY = targetY;
    this.color = color; this.trail = []; 
    this.speed = 5 + Math.random() * 2;
  }
  
  update() {
    this.trail.push({x: this.x, y: this.y});
    if (this.trail.length > 8) this.trail.shift(); // Shorter trail on mobile
    this.y -= this.speed;
    if (this.y <= this.targetY) { 
      this.explode(); 
      fireworks.splice(fireworks.indexOf(this), 1);
    }
  }
  
  explode() {
    // Fewer particles on mobile
    const count = isMobile ? 20 + Math.floor(Math.random() * 15) : 30 + Math.floor(Math.random() * 20);
    const shape = Math.random() < 0.4 ? "flower" : "circle";
    
    for (let i = 0; i < count; i++) {
      // Limit total particles for mobile performance
      if (particles.length >= particleLimit) break;
      
      const angle = (i / count) * (shape === "flower" ? Math.PI * 6 : Math.PI * 2);
      const speed = 2 + Math.random() * 3;
      particles.push(new Particle(this.x, this.y, angle, speed, this.color, shape));
    }
  }
  
  draw(ctx) {
    // Draw trail
    if (this.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      ctx.strokeStyle = this.color;
      ctx.lineWidth = isMobile ? 1.5 : 2;
      ctx.stroke();
    }
    
    // Draw firework head
    ctx.beginPath();
    ctx.arc(this.x, this.y, isMobile ? 2 : 3, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

class Particle {
  constructor(x, y, angle, speed, color, shape) {
    this.x = x; this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.color = color; 
    this.alpha = 1; 
    this.shape = shape;
    this.size = isMobile ? 1.5 : 2;
  }
  
  update() {
    this.x += this.vx; 
    this.y += this.vy; 
    this.vy += 0.04; 
    this.alpha -= 0.01;
  }
  
  draw(ctx) {
    if (this.alpha <= 0) return;
    
    ctx.save(); 
    ctx.globalAlpha = this.alpha; 
    ctx.fillStyle = this.color;
    
    if (this.shape === "flower") {
      ctx.beginPath();
      const petals = isMobile ? 4 : 5; // Fewer petals on mobile
      for (let i = 0; i < petals; i++) {
        const angle = (i / petals) * Math.PI * 2;
        ctx.lineTo(this.x + Math.cos(angle) * this.size * 2, this.y + Math.sin(angle) * this.size * 2);
      }
      ctx.closePath(); 
      ctx.fill();
    } else { 
      ctx.beginPath(); 
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); 
      ctx.fill(); 
    }
    ctx.restore();
  }
}

// ================= TOUCH EVENT HANDLERS FOR MOBILE =================
function handleCardInteraction(card) {
  if (card.classList.contains('roll-out-left')) return;
  
  card.classList.add("roll-out-left");
  setTimeout(() => {
    card.style.display = "none";
    card.style.pointerEvents = "none";
  }, 1000);
  
  current++;
  if (current === cards.length && !animationStarted) {
    animationStarted = true;
    startAnimations();
  }
}

// Add both click and touch events for mobile
cards.forEach(card => {
  // Click for desktop
  card.addEventListener("click", () => handleCardInteraction(card));
  
  // Touch for mobile
  card.addEventListener("touchstart", (e) => {
    e.preventDefault();
    handleCardInteraction(card);
  }, { passive: false });
});

// ================= OPTIMIZED ANIMATION LOOP =================
function startAnimations() {
  // Start constant fireworks
  setInterval(launchFirework, FIREWORK_INTERVAL);
  
  // Start animation loop
  requestAnimationFrame(animate);
}

function launchFirework() {
  if (fireworks.length >= fireworkLimit) return;
  
  const x = Math.random() * canvas.width;
  const y = canvas.height - 10;
  const targetY = 100 + Math.random() * (canvas.height / 2);
  const color = `hsl(${Math.random() * 360}, 100%, 60%)`;
  fireworks.push(new Firework(x, y, targetY, color));
}

function animate() {
  // Clear canvas with optimized background
  ctx.fillStyle = "rgba(0,0,10,0.15)"; // Lighter clear for better performance
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Update and draw fireworks
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].draw(ctx);
  }

  // Update and draw particles with performance limit
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    if (particles[i].alpha <= 0) {
      particles.splice(i, 1);
    } else {
      particles[i].draw(ctx);
    }
    
    // Emergency particle limit
    if (particles.length > particleLimit * 1.5) {
      particles.splice(0, particles.length - particleLimit);
    }
  }

  // Update and draw growing roses
  growingRoses.forEach(rose => { 
    rose.update(); 
    rose.draw(ctx); 
  });

  // Continue animation only if needed
  if (animationStarted || fireworks.length > 0 || particles.length > 0) {
    requestAnimationFrame(animate);
  }
}

// ================= MOBILE PERFORMANCE CONTROLS =================
// Reduce frame rate on mobile for better battery life
let lastTime = 0;
const mobileFPS = isMobile ? 30 : 60;
const frameInterval = 1000 / mobileFPS;

function optimizedAnimate(timestamp) {
  if (timestamp - lastTime >= frameInterval) {
    lastTime = timestamp;
    animate();
  }
  requestAnimationFrame(optimizedAnimate);
}

// Pause animations when page is not visible
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    animationStarted = false;
  }
});

// Prevent rubber-band scrolling on iOS
document.addEventListener('touchmove', function(e) {
  if (e.scale !== 1) { e.preventDefault(); }
}, { passive: false });
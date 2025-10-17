const cards = document.querySelectorAll(".card, .card1, .card2, .card3, .card4, .card5");
let current = 0;

// Create canvas
const canvas = document.createElement("canvas");
canvas.id = "fireworks";
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

// Responsive canvas
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Arrays
const fireworks = [];
const particles = [];
const growingRoses = [];

// ================= GROWING ROSES WITH WIND =================
class GrowingRose {
  constructor() {
    this.reset();
    // Wind properties
    this.windStrength = Math.random() * 2 - 1; // -1 to 1
    this.windFrequency = 0.01 + Math.random() * 0.02;
    this.windTime = Math.random() * Math.PI * 2;
  }
  
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 20; // Start below canvas
    this.size = 0; // Start small
    this.maxSize = 15 + Math.random() * 20;
    this.growthSpeed = 0.2 + Math.random() * 0.3;
    this.stemHeight = 40 + Math.random() * 60;
    this.leaves = [];
    this.phase = 0; // Growth phase
    this.color = `hsl(${330 + Math.random() * 30}, 70%, 50%)`; // Red-pink colors
    this.stemColor = `hsl(${120 + Math.random() * 30}, 60%, 30%)`;
    this.leafColor = `hsl(${120 + Math.random() * 30}, 60%, 35%)`;
    
    // Create leaves
    const leafCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < leafCount; i++) {
      this.leaves.push({
        position: 0.2 + Math.random() * 0.6, // Position along stem (0-1)
        size: 8 + Math.random() * 6,
        angle: Math.random() * Math.PI - Math.PI / 2
      });
    }
  }
  
  update() {
    this.windTime += this.windFrequency;
    const windOffset = Math.sin(this.windTime) * this.windStrength * 3;
    
    if (this.phase === 0) {
      // Growing upward phase
      this.y -= 1.5;
      this.size += this.growthSpeed;
      
      if (this.y <= canvas.height - this.stemHeight) {
        this.phase = 1; // Switch to blooming phase
      }
    } else if (this.phase === 1) {
      // Blooming phase - rose opens up
      this.size += this.growthSpeed * 0.5;
      
      // Apply wind effect to mature roses
      this.x += windOffset * 0.1;
      
      if (this.size >= this.maxSize) {
        this.phase = 2; // Fully grown
      }
    } else {
      // Mature phase - sway in wind
      this.x += windOffset * 0.2;
    }
    
    // Reset if rose goes too far or gets too small
    if (this.x < -50 || this.x > canvas.width + 50 || this.size < 0) {
      this.reset();
    }
  }
  
  draw(ctx) {
    ctx.save();
    
    // Draw stem with wind effect
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    
    // Create curved stem based on wind
    const stemCurve = Math.sin(this.windTime) * this.windStrength * 10;
    const cp1x = this.x + stemCurve * 0.3;
    const cp1y = this.y - this.stemHeight * 0.3;
    const cp2x = this.x + stemCurve * 0.7;
    const cp2y = this.y - this.stemHeight * 0.7;
    const endX = this.x + stemCurve;
    const endY = this.y - this.stemHeight;
    
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    ctx.strokeStyle = this.stemColor;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw leaves
    this.leaves.forEach(leaf => {
      const leafY = this.y - (this.stemHeight * leaf.position);
      const leafX = endX + (this.x - endX) * (1 - leaf.position);
      
      ctx.save();
      ctx.translate(leafX, leafY);
      ctx.rotate(leaf.angle + stemCurve * 0.01);
      
      // Leaf shape
      ctx.beginPath();
      ctx.ellipse(0, 0, leaf.size, leaf.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = this.leafColor;
      ctx.fill();
      
      ctx.restore();
    });
    
    // Draw rose at stem top with wind offset
    const roseX = endX;
    const roseY = endY;
    
    // Rose petals (multiple layers)
    const petalLayers = this.phase === 1 ? 
      Math.floor((this.size / this.maxSize) * 3) + 1 : 3;
    
    for (let layer = petalLayers; layer > 0; layer--) {
      const layerSize = this.size * (0.6 + layer * 0.15);
      const layerAlpha = 0.3 + (layer / petalLayers) * 0.7;
      
      ctx.save();
      ctx.translate(roseX, roseY);
      
      // Slight rotation from wind
      ctx.rotate(stemCurve * 0.005);
      
      // Outer petals (more open)
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const petalLength = layerSize * (0.8 + Math.random() * 0.4);
        const petalWidth = layerSize * 0.7;
        
        ctx.save();
        ctx.rotate(angle);
        
        // Petal shape (teardrop)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(
          petalWidth * 0.5, -petalLength * 0.3,
          petalWidth, -petalLength * 0.1
        );
        ctx.quadraticCurveTo(
          petalWidth * 0.3, -petalLength,
          -petalWidth * 0.3, -petalLength
        );
        ctx.quadraticCurveTo(
          -petalWidth, -petalLength * 0.1,
          -petalWidth * 0.5, -petalLength * 0.3
        );
        ctx.closePath();
        
        // Gradient fill for petals
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, -petalLength * 0.5, petalLength);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, `hsl(${330 + Math.random() * 20}, 60%, 40%)`);
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = layerAlpha * (0.7 + Math.random() * 0.3);
        ctx.fill();
        
        ctx.restore();
      }
      
      // Inner petals (tighter)
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
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

// Generate 8-12 roses
const roseCount = 8 + Math.floor(Math.random() * 5);
for (let i = 0; i < roseCount; i++) {
  setTimeout(() => {
    growingRoses.push(new GrowingRose());
  }, i * 500); // Stagger the growth
}

// ================= FIREWORKS =================
class Firework {
  constructor(x, y, targetY, color) {
    this.x = x; this.y = y; this.targetY = targetY;
    this.color = color; this.trail = []; 
    this.speed = 5 + Math.random()*2;
  }
  update() {
    this.trail.push({x:this.x, y:this.y});
    if(this.trail.length>10) this.trail.shift();
    this.y -= this.speed;
    if(this.y <= this.targetY) { this.explode(); fireworks.splice(fireworks.indexOf(this),1);}
  }
  explode() {
    const count = 30 + Math.floor(Math.random()*20);
    const shape = Math.random()<0.4?"flower":"circle";
    for(let i=0;i<count;i++){
      const angle = (i/count)*(shape==="flower"?Math.PI*6:Math.PI*2);
      const speed = 2 + Math.random()*3;
      particles.push(new Particle(this.x,this.y,angle,speed,this.color,shape));
    }
  }
  draw(ctx){
    ctx.beginPath();
    ctx.moveTo(this.x,this.y);
    for(let i=this.trail.length-1;i>=0;i--){
      const t=this.trail[i];
      ctx.lineTo(t.x,t.y);
    }
    ctx.strokeStyle=this.color;
    ctx.lineWidth=2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.x,this.y,3,0,Math.PI*2);
    ctx.fillStyle=this.color;
    ctx.fill();
  }
}

class Particle {
  constructor(x,y,angle,speed,color,shape){
    this.x=x; this.y=y;
    this.vx=Math.cos(angle)*speed;
    this.vy=Math.sin(angle)*speed;
    this.color=color; this.alpha=1; this.shape=shape;
  }
  update(){
    this.x+=this.vx; this.y+=this.vy; this.vy+=0.04; this.alpha-=0.01;
  }
  draw(ctx){
    ctx.save(); ctx.globalAlpha=this.alpha; ctx.fillStyle=this.color;
    if(this.shape==="flower"){
      ctx.beginPath();
      for(let i=0;i<5;i++){
        const angle=(i/5)*Math.PI*2;
        ctx.lineTo(this.x+Math.cos(angle)*6, this.y+Math.sin(angle)*6);
      }
      ctx.closePath(); ctx.fill();
    } else { ctx.beginPath(); ctx.arc(this.x,this.y,2,0,Math.PI*2); ctx.fill(); }
    ctx.restore();
  }
}

// ================= HANDLE CARD CLICKS =================
cards.forEach(card=>{
  card.addEventListener("click",()=>{
    card.classList.add("roll-out-left");
    setTimeout(()=>card.style.display="none",1000);
    current++;
    if(current===cards.length){
      requestAnimationFrame(animate); // start fireworks + roses
    }
  });
});

// ================= ANIMATION LOOP =================
function animate(){
  ctx.fillStyle="rgba(0,0,10,0.2)";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // Launch fireworks randomly (limit to 5 at a time)
  if(Math.random()<0.03 && fireworks.length<5){
    const x=Math.random()*canvas.width;
    const y=canvas.height-10;
    const targetY=200 + Math.random()*(canvas.height/2);
    const color=`hsl(${Math.random()*360},100%,60%)`;
    fireworks.push(new Firework(x,y,targetY,color));
  }

  fireworks.forEach(f=>{ f.update(); f.draw(ctx); });
  particles.forEach((p,i)=>{ p.update(); if(p.alpha<=0) particles.splice(i,1); else p.draw(ctx); });

  // Update and draw growing roses
  growingRoses.forEach(rose=>{ 
    rose.update(); 
    rose.draw(ctx); 
  });

  requestAnimationFrame(animate);
}
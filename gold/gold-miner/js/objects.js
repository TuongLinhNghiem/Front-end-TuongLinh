/* ============================================================
   objects.js - GameObject types, drawing, properties
   Rarity: COMMON (gold, rock, worm), RARE (diamond, mystery, moving diamond),
   EPIC (golden treasure).
   ============================================================ */

const RARITY = { COMMON: "common", RARE: "rare", EPIC: "epic" };

// Object type definitions. weights used for layout randomization.
const OBJECT_DEFS = {
  smallGold:      { type: "smallGold",      rarity: RARITY.COMMON, value: 100,  size: 18, pullSpeed: 5.5, name: "Small Gold",    color: "#ffce3a" },
  mediumGold:     { type: "mediumGold",     rarity: RARITY.COMMON, value: 250,  size: 28, pullSpeed: 4.0, name: "Medium Gold",   color: "#ffce3a" },
  largeGold:      { type: "largeGold",      rarity: RARITY.COMMON, value: 500,  size: 40, pullSpeed: 1.8, name: "Large Gold",    color: "#ffce3a" },
  rock:           { type: "rock",           rarity: RARITY.COMMON, value: 50,   size: 38, pullSpeed: 0.9, name: "Rock",         color: "#888888" },
  worm:           { type: "worm",           rarity: RARITY.COMMON, value: 0,    size: 22, pullSpeed: 2.5, name: "Worm",         color: "#c0706b", move: true, moveSpeed: 80 },
  diamond:        { type: "diamond",        rarity: RARITY.RARE,   value: 750,  size: 22, pullSpeed: 5.5, name: "Diamond",      color: "#5ee0ff" },
  mysteryBag:     { type: "mysteryBag",     rarity: RARITY.RARE,   value: "random", size: 26, pullSpeed: 3.5, name: "Mystery Bag", color: "#b35ec2", move: true, moveSpeed: 60 },
  movingDiamond:  { type: "movingDiamond",  rarity: RARITY.RARE,   value: 1000, size: 22, pullSpeed: 4.0, name: "Moving Diamond", color: "#5ee0ff", move: true, moveSpeed: 120 },
  goldenTreasure: { type: "goldenTreasure", rarity: RARITY.EPIC,   value: 1500, size: 50, pullSpeed: 0.7, name: "Golden Treasure", color: "#ffd700" },
  tnt:            { type: "tnt",            rarity: RARITY.COMMON, value: 0,    size: 30, pullSpeed: 4.0, name: "TNT",          color: "#e06464" }
};

class GameObject {
  constructor(type, x, y, opts) {
    const def = OBJECT_DEFS[type];
    this.type = type;
    this.def = def;
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.size = def.size;
    this.value = def.value;
    this.pullSpeed = def.pullSpeed;
    this.rarity = def.rarity;
    this.name = def.name;
    this.color = def.color;
    this.removed = false;
    this.collected = false;
    this.spinPhase = Math.random() * Math.PI * 2;

    // movement options
    this.move = opts && opts.move ? true : !!def.move;
    this.moveSpeed = (opts && opts.moveSpeed) ? opts.moveSpeed : (def.moveSpeed || 0);
    this.moveDir = (opts && opts.moveDir) ? opts.moveDir : (Math.random() < 0.5 ? -1 : 1);
    this.minX = (opts && opts.minX !== undefined) ? opts.minX : (x - 100);
    this.maxX = (opts && opts.maxX !== undefined) ? opts.maxX : (x + 100);
    // ensure move bounds are within canvas
    this.minX = Math.max(40, this.minX);
    this.maxX = Math.min(920, this.maxX);
    if (this.minX >= this.maxX) { this.move = false; }
  }

  update(dt) {
    if (this.removed || this.collected) return;
    this.spinPhase += dt * 2;
    if (this.move && !this.collected) {
      this.x += this.moveSpeed * this.moveDir * dt;
      if (this.x <= this.minX) { this.x = this.minX; this.moveDir = 1; }
      else if (this.x >= this.maxX) { this.x = this.maxX; this.moveDir = -1; }
    }
  }

  // hit-test: returns true if point is within the object's bounding circle
  contains(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return (dx * dx + dy * dy) <= (this.size * this.size);
  }

  draw(ctx) {
    if (this.removed) return;
    const x = this.x, y = this.y, s = this.size;

    // rarity glow
    if (this.rarity === RARITY.RARE) {
      const pulse = 0.5 + 0.5 * Math.sin(this.spinPhase);
      ctx.save();
      ctx.globalAlpha = 0.25 + 0.15 * pulse;
      const grad = ctx.createRadialGradient(x, y, s * 0.3, x, y, s * 1.8);
      grad.addColorStop(0, this.color);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, s * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (this.rarity === RARITY.EPIC) {
      const pulse = 0.5 + 0.5 * Math.sin(this.spinPhase * 1.5);
      ctx.save();
      ctx.globalAlpha = 0.4 + 0.2 * pulse;
      const grad = ctx.createRadialGradient(x, y, s * 0.4, x, y, s * 2.2);
      grad.addColorStop(0, "#fff3a0");
      grad.addColorStop(0.5, this.color);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, s * 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    switch (this.type) {
      case "smallGold":
      case "mediumGold":
      case "largeGold":       drawGold(ctx, x, y, s); break;
      case "rock":            drawRock(ctx, x, y, s); break;
      case "worm":            drawWorm(ctx, x, y, s, this.spinPhase); break;
      case "diamond":
      case "movingDiamond":   drawDiamond(ctx, x, y, s, this.spinPhase, this.type === "movingDiamond"); break;
      case "mysteryBag":      drawMysteryBag(ctx, x, y, s); break;
      case "goldenTreasure":  drawGoldenTreasure(ctx, x, y, s, this.spinPhase); break;
      case "tnt":             drawTNT(ctx, x, y, s); break;
    }
  }
}

/* ---------- Object drawing functions ---------- */

function drawGold(ctx, x, y, s) {
  // gold nugget
  ctx.save();
  ctx.translate(x, y);
  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(2, s * 0.7, s * 0.8, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  // body
  const grad = ctx.createLinearGradient(0, -s, 0, s);
  grad.addColorStop(0, "#ffe98a");
  grad.addColorStop(0.5, "#ffce3a");
  grad.addColorStop(1, "#c79818");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-s * 0.7, -s * 0.2);
  ctx.lineTo(-s * 0.4, -s * 0.7);
  ctx.lineTo(s * 0.3, -s * 0.6);
  ctx.lineTo(s * 0.7, -s * 0.1);
  ctx.lineTo(s * 0.5, s * 0.6);
  ctx.lineTo(-s * 0.5, s * 0.5);
  ctx.closePath();
  ctx.fill();
  // outline
  ctx.strokeStyle = "#8a6510";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // shine
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath();
  ctx.ellipse(-s * 0.2, -s * 0.3, s * 0.18, s * 0.1, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawRock(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(2, s * 0.7, s * 0.9, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  const grad = ctx.createRadialGradient(-s * 0.3, -s * 0.3, s * 0.2, 0, 0, s);
  grad.addColorStop(0, "#aaaaaa");
  grad.addColorStop(1, "#555555");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-s * 0.8, -s * 0.1);
  ctx.lineTo(-s * 0.5, -s * 0.7);
  ctx.lineTo(s * 0.4, -s * 0.6);
  ctx.lineTo(s * 0.8, -s * 0.1);
  ctx.lineTo(s * 0.6, s * 0.5);
  ctx.lineTo(-s * 0.6, s * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // cracks
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-s * 0.2, -s * 0.4); ctx.lineTo(s * 0.1, 0); ctx.lineTo(-s * 0.1, s * 0.3);
  ctx.stroke();
  ctx.restore();
}

function drawWorm(ctx, x, y, s, phase) {
  ctx.save();
  ctx.translate(x, y);
  // segmented body wiggling
  const segs = 5;
  ctx.strokeStyle = "#c0706b";
  ctx.lineWidth = s * 0.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let i = 0; i < segs; i++) {
    const sx = -s + i * (s * 2 / (segs - 1));
    const sy = Math.sin(phase + i * 0.6) * s * 0.15;
    if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
  }
  ctx.stroke();
  // highlight
  ctx.strokeStyle = "#d98884";
  ctx.lineWidth = s * 0.2;
  ctx.beginPath();
  for (let i = 0; i < segs; i++) {
    const sx = -s + i * (s * 2 / (segs - 1));
    const sy = Math.sin(phase + i * 0.6) * s * 0.15 - s * 0.12;
    if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
  }
  ctx.stroke();
  ctx.restore();
}

function drawDiamond(ctx, x, y, s, phase, isMoving) {
  ctx.save();
  ctx.translate(x, y);
  const r = s;
  // gem shape (diamond cut)
  const grad = ctx.createLinearGradient(-r, -r, r, r);
  grad.addColorStop(0, "#bdf6ff");
  grad.addColorStop(0.5, "#5ee0ff");
  grad.addColorStop(1, "#2a90c2");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(r * 0.8, -r * 0.3);
  ctx.lineTo(r * 0.6, r * 0.8);
  ctx.lineTo(-r * 0.6, r * 0.8);
  ctx.lineTo(-r * 0.8, -r * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1a5a7a";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // inner facets
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -r); ctx.lineTo(0, r * 0.8);
  ctx.moveTo(-r * 0.8, -r * 0.3); ctx.lineTo(r * 0.8, -r * 0.3);
  ctx.stroke();
  // sparkle
  const sp = (0.5 + 0.5 * Math.sin(phase * 2));
  ctx.fillStyle = `rgba(255,255,255,${0.7 * sp})`;
  ctx.beginPath();
  ctx.arc(-r * 0.3, -r * 0.4, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  if (isMoving) {
    // motion arrows
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 1.3, 0); ctx.lineTo(-r * 1.6, 0);
    ctx.moveTo(r * 1.3, 0); ctx.lineTo(r * 1.6, 0);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMysteryBag(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(2, s * 0.7, s * 0.8, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  // bag body
  const grad = ctx.createLinearGradient(0, -s, 0, s);
  grad.addColorStop(0, "#b35ec2");
  grad.addColorStop(1, "#6a2a78");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-s * 0.6, -s * 0.5);
  ctx.lineTo(s * 0.6, -s * 0.5);
  ctx.lineTo(s * 0.75, s * 0.6);
  ctx.lineTo(-s * 0.75, s * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#3a1a48";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // tie
  ctx.fillStyle = "#3a1a48";
  ctx.fillRect(-s * 0.5, -s * 0.6, s, s * 0.25);
  // question mark
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${s * 0.9}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("?", 0, s * 0.05);
  ctx.restore();
}

function drawGoldenTreasure(ctx, x, y, s, phase) {
  ctx.save();
  ctx.translate(x, y);
  // chest base
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(3, s * 0.8, s * 0.9, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  // body
  const grad = ctx.createLinearGradient(0, -s, 0, s);
  grad.addColorStop(0, "#fff3a0");
  grad.addColorStop(0.5, "#ffce3a");
  grad.addColorStop(1, "#a87018");
  ctx.fillStyle = grad;
  ctx.fillRect(-s * 0.8, -s * 0.3, s * 1.6, s * 0.9);
  // lid
  ctx.beginPath();
  ctx.arc(0, -s * 0.3, s * 0.8, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#5a3a10";
  ctx.lineWidth = 2;
  ctx.strokeRect(-s * 0.8, -s * 0.3, s * 1.6, s * 0.9);
  // lock
  ctx.fillStyle = "#5a3a10";
  ctx.fillRect(-s * 0.12, -s * 0.1, s * 0.24, s * 0.3);
  // sparkles
  const sp = 0.5 + 0.5 * Math.sin(phase * 2);
  ctx.fillStyle = `rgba(255,255,255,${0.8 * sp})`;
  ctx.beginPath();
  ctx.arc(s * 0.3, -s * 0.5, s * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawTNT(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(2, s * 0.7, s * 0.7, s * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  // body
  ctx.fillStyle = "#e06464";
  ctx.fillRect(-s * 0.5, -s * 0.6, s, s * 1.2);
  ctx.strokeStyle = "#7a2828";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-s * 0.5, -s * 0.6, s, s * 1.2);
  // label
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${s * 0.7}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("TNT", 0, 0);
  // fuse
  ctx.strokeStyle = "#5a3a10";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.6);
  ctx.quadraticCurveTo(s * 0.2, -s * 0.9, s * 0.3, -s * 0.85);
  ctx.stroke();
  // spark
  ctx.fillStyle = "#ffce3a";
  ctx.beginPath();
  ctx.arc(s * 0.3, -s * 0.85, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

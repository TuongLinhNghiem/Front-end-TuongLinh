/* ============================================================
   player.js - The miner character at the top of the scene
   Handles drawing of the miner, the cart, and the support beam.
   ============================================================ */

class Player {
  constructor(x, y) {
    this.x = x;          // anchor point for the claw rope
    this.y = y;
    this.bouncePhase = 0;
  }

  update(dt) {
    this.bouncePhase += dt * 3;
  }

  draw(ctx) {
    const x = this.x, y = this.y;
    // support beam at top
    ctx.fillStyle = "#5c4429";
    ctx.fillRect(0, 0, 960, 16);
    ctx.fillStyle = "#3d2e1f";
    ctx.fillRect(0, 12, 960, 4);

    // miner's cart/platform
    ctx.fillStyle = "#7a5a3a";
    ctx.fillRect(x - 50, y - 20, 100, 28);
    ctx.strokeStyle = "#3d2e1f";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 50, y - 20, 100, 28);
    // wheels
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(x - 35, y + 10, 7, 0, Math.PI * 2);
    ctx.arc(x + 35, y + 10, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#555";
    ctx.beginPath();
    ctx.arc(x - 35, y + 10, 3, 0, Math.PI * 2);
    ctx.arc(x + 35, y + 10, 3, 0, Math.PI * 2);
    ctx.fill();

    // miner body (sitting slightly bouncing)
    const bounce = Math.sin(this.bouncePhase) * 1.5;
    ctx.save();
    ctx.translate(x, y - 18 + bounce);

    // legs
    ctx.fillStyle = "#3a5a8a";
    ctx.fillRect(-10, -2, 8, 16);
    ctx.fillRect(2, -2, 8, 16);
    // body
    ctx.fillStyle = "#4a8a3a";
    ctx.fillRect(-14, -22, 28, 24);
    // head
    ctx.fillStyle = "#e0b890";
    ctx.beginPath();
    ctx.arc(0, -30, 10, 0, Math.PI * 2);
    ctx.fill();
    // helmet
    ctx.fillStyle = "#ffce3a";
    ctx.beginPath();
    ctx.arc(0, -32, 11, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(-11, -33, 22, 4);
    // helmet light
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(0, -40, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // small dust clouds near the wheels
    ctx.fillStyle = "rgba(200,180,140,0.4)";
    ctx.beginPath();
    ctx.arc(x - 50, y + 12, 5, 0, Math.PI * 2);
    ctx.arc(x + 50, y + 12, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

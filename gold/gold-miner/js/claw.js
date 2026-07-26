/* ============================================================
   claw.js - The swinging claw and rope
   States: SWINGING, EXTENDING, RETRACTING
   ============================================================ */

const ClawState = {
  SWINGING: "swinging",
  EXTENDING: "extending",
  RETRACTING: "retracting"
};

class Claw {
  constructor(anchorX, anchorY) {
    this.anchorX = anchorX;
    this.anchorY = anchorY;
    // angle measured from straight-down. Positive = to the right.
    this.minAngle = -1.2;   // ~ -69°
    this.maxAngle = 1.2;
    this.angle = 0;
    this.swingSpeed = 1.6;  // radians per second
    this.swingDir = 1;
    this.state = ClawState.SWINGING;

    this.maxRope = 460;
    this.ropeLength = 0;
    this.extendSpeed = 480; // px per second (down)
    this.basePullSpeed = 260; // base pull speed px/s
    this.pullSpeed = this.basePullSpeed; // current pull speed (set when grabbing object)

    this.heldObject = null;
    // claw head position cache
    this.headX = this.anchorX;
    this.headY = this.anchorY;
    this.grabRadius = 18;
  }

  reset() {
    this.angle = 0;
    this.swingDir = 1;
    this.state = ClawState.SWINGING;
    this.ropeLength = 0;
    this.heldObject = null;
    this.pullSpeed = this.basePullSpeed;
  }

  get headPosition() {
    return {
      x: this.anchorX + Math.sin(this.angle) * this.ropeLength,
      y: this.anchorY + Math.cos(this.angle) * this.ropeLength
    };
  }

  // Retrival speed multiplier from upgrade level (1..5)
  setRetrievalLevel(level) {
    const mult = [1.0, 1.1, 1.2, 1.35, 1.5][Math.min(Math.max(level - 1, 0), 4)];
    this.basePullSpeed = 260 * mult;
  }

  canLaunch() { return this.state === ClawState.SWINGING; }

  launch() {
    if (this.state !== ClawState.SWINGING) return false;
    this.state = ClawState.EXTENDING;
    this.ropeLength = 0;
    AudioManager.sfx.launch();
    return true;
  }

  update(dt, objects, callbacks) {
    if (this.state === ClawState.SWINGING) {
      this.angle += this.swingDir * this.swingSpeed * dt;
      if (this.angle >= this.maxAngle) { this.angle = this.maxAngle; this.swingDir = -1; }
      else if (this.angle <= this.minAngle) { this.angle = this.minAngle; this.swingDir = 1; }
      this.ropeLength = 0;
    } else if (this.state === ClawState.EXTENDING) {
      this.ropeLength += this.extendSpeed * dt;
      const head = this.headPosition;
      // collision check
      let hit = null;
      for (const obj of objects) {
        if (obj.removed || obj.collected) continue;
        if (obj.contains(head.x, head.y)) { hit = obj; break; }
      }
      if (hit) {
        this.heldObject = hit;
        hit.collected = true;
        this.state = ClawState.RETRACTING;
        // pull speed depends on the object's weight (smaller value = faster)
        this.pullSpeed = this.basePullSpeed * hit.pullSpeed;
        AudioManager.sfx.collect();
        if (callbacks.onGrab) callbacks.onGrab(hit);
      } else if (this.ropeLength >= this.maxRope) {
        this.state = ClawState.RETRACTING;
        this.pullSpeed = this.basePullSpeed * 2.0; // empty claw pulls fast
      }
    } else if (this.state === ClawState.RETRACTING) {
      this.ropeLength -= this.pullSpeed * dt;
      if (this.heldObject) {
        const head = this.headPosition;
        this.heldObject.x = head.x;
        this.heldObject.y = head.y;
      }
      if (this.ropeLength <= 0) {
        this.ropeLength = 0;
        const obj = this.heldObject;
        this.heldObject = null;
        this.state = ClawState.SWINGING;
        if (callbacks.onRetrieve) callbacks.onRetrieve(obj);
      }
    }
  }

  draw(ctx) {
    const head = this.headPosition;
    // rope
    ctx.strokeStyle = "#d4b890";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(this.anchorX, this.anchorY);
    ctx.lineTo(head.x, head.y);
    ctx.stroke();

    // claw head
    ctx.save();
    ctx.translate(head.x, head.y);
    const rot = this.angle;
    ctx.rotate(rot);
    // claw housing
    ctx.fillStyle = "#888";
    ctx.fillRect(-10, -4, 20, 10);
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-10, -4, 20, 10);
    // pincers
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    const open = this.state === ClawState.SWINGING ? 14 : (this.heldObject ? 4 : 10);
    ctx.beginPath();
    ctx.moveTo(-8, 6); ctx.lineTo(-open, 18);
    ctx.moveTo(8, 6); ctx.lineTo(open, 18);
    ctx.stroke();
    ctx.restore();
  }
}

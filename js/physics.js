// Fisika sederhana di bidang datar (x, z): robot, kardus, huruf, bola, kerucut.
import { colliders, LIMIT } from './world.js';

export const bodies = [];  // {mesh, x, z, vx, vz, r, mass, bounce, drag, spin, rot, y, vy, onHit}

export function addBody(mesh, opts) {
  const b = { mesh, x: mesh.position.x, z: mesh.position.z, vx: 0, vz: 0, r: 0.8, mass: 1, bounce: 0.3,
    drag: 3, spin: 0, rot: mesh.rotation.y, y: mesh.position.y, vy: 0, ground: opts?.ground ?? mesh.position.y,
    roll: false, ...opts };
  bodies.push(b);
  return b;
}

/** dorong lingkaran keluar dari benda diam; kembalikan normal tabrakan (atau null) */
function resolveStatic(p, r) {
  let hit = null;
  for (const c of colliders) {
    if (c.type === 'circle') {
      const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), m = r + c.r;
      if (d < m && d > 1e-6) {
        p.x = c.x + (dx / d) * m; p.z = c.z + (dz / d) * m;
        hit = { nx: dx / d, nz: dz / d };
      }
    } else {
      const cx = Math.max(c.x0, Math.min(p.x, c.x1)), cz = Math.max(c.z0, Math.min(p.z, c.z1));
      let dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz);
      if (d < r) {
        if (d < 1e-6) { // titik di dalam kotak: dorong ke sisi terdekat
          const opts = [[p.x - c.x0, -1, 0], [c.x1 - p.x, 1, 0], [p.z - c.z0, 0, -1], [c.z1 - p.z, 0, 1]];
          opts.sort((a, b) => a[0] - b[0]);
          dx = opts[0][1]; dz = opts[0][2]; d = 1;
          p.x = dx ? (dx < 0 ? c.x0 - r : c.x1 + r) : p.x;
          p.z = dz ? (dz < 0 ? c.z0 - r : c.z1 + r) : p.z;
        } else {
          p.x = cx + (dx / d) * r; p.z = cz + (dz / d) * r;
        }
        hit = { nx: dx / d, nz: dz / d };
      }
    }
  }
  // tepi pulau
  const L = LIMIT - r;
  if (p.x < -L) { p.x = -L; hit = { nx: 1, nz: 0 }; }
  if (p.x > L) { p.x = L; hit = { nx: -1, nz: 0 }; }
  if (p.z < -L) { p.z = -L; hit = { nx: 0, nz: 1 }; }
  if (p.z > L) { p.z = L; hit = { nx: 0, nz: -1 }; }
  return hit;
}

export const pushOut = resolveStatic;

export function stepRobot(robot) {
  const p = { x: robot.pos.x, z: robot.pos.y };
  const hit = resolveStatic(p, robot.radius);
  if (hit) { // geser sepanjang dinding
    const vn = robot.vel.x * hit.nx + robot.vel.y * hit.nz;
    if (vn < 0) { robot.vel.x -= vn * hit.nx; robot.vel.y -= vn * hit.nz; }
  }
  // dorong benda yang bisa bergerak
  let bump = 0;
  for (const b of bodies) {
    const dx = b.x - p.x, dz = b.z - p.z, d = Math.hypot(dx, dz), m = b.r + robot.radius;
    if (d < m && d > 1e-6) {
      const nx = dx / d, nz = dz / d, over = m - d;
      const share = 1 / (1 + b.mass);
      b.x += nx * over * (1 - share * 0.3); b.z += nz * over * (1 - share * 0.3);
      p.x -= nx * over * share * 0.3; p.z -= nz * over * share * 0.3;
      const vn = robot.vel.x * nx + robot.vel.y * nz;
      if (vn > 0) {
        const k = (b.kick ?? 1.15) / Math.sqrt(b.mass);
        b.vx += nx * vn * k * 0.6; b.vz += nz * vn * k * 0.6;
        b.spin += (nx * robot.vel.y - nz * robot.vel.x) * 0.15 / b.mass;
        bump = Math.max(bump, vn);
        if (b.pop && vn > 4) b.vy = Math.max(b.vy, vn * 0.35);
      }
    }
  }
  robot.pos.set(p.x, p.z);
  return { hitWall: !!hit, bump };
}

export function stepBodies(dt, onHit) {
  for (const b of bodies) {
    b.x += b.vx * dt; b.z += b.vz * dt;
    const damp = Math.exp(-b.drag * dt);
    b.vx *= damp; b.vz *= damp;
    b.spin *= Math.exp(-2.5 * dt);
    b.rot += b.spin * dt;
    // loncatan kecil
    b.vy -= 30 * dt; b.y += b.vy * dt;
    if (b.y < b.ground) { b.y = b.ground; b.vy = Math.abs(b.vy) > 2 ? -b.vy * 0.35 : 0; }
    const p = { x: b.x, z: b.z };
    const hit = resolveStatic(p, b.r);
    b.x = p.x; b.z = p.z;
    if (hit) {
      const vn = b.vx * hit.nx + b.vz * hit.nz;
      if (vn < 0) {
        b.vx -= (1 + b.bounce) * vn * hit.nx; b.vz -= (1 + b.bounce) * vn * hit.nz;
        if (-vn > 2 && onHit) onHit(b, -vn);
      }
    }
  }
  // benda saling dorong
  for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
    const a = bodies[i], c = bodies[j];
    const dx = c.x - a.x, dz = c.z - a.z, d = Math.hypot(dx, dz), m = a.r + c.r;
    if (d < m && d > 1e-6) {
      const nx = dx / d, nz = dz / d, over = (m - d) / 2;
      a.x -= nx * over; a.z -= nz * over; c.x += nx * over; c.z += nz * over;
      const rv = (c.vx - a.vx) * nx + (c.vz - a.vz) * nz;
      if (rv < 0) {
        const imp = -(1 + 0.3) * rv / (1 / a.mass + 1 / c.mass);
        a.vx -= (imp / a.mass) * nx; a.vz -= (imp / a.mass) * nz;
        c.vx += (imp / c.mass) * nx; c.vz += (imp / c.mass) * nz;
      }
    }
  }
  for (const b of bodies) {
    b.mesh.position.set(b.x, b.y, b.z);
    if (b.roll) { // bola menggelinding
      const sp = Math.hypot(b.vx, b.vz);
      if (sp > 0.01) {
        b.mesh.rotateOnWorldAxis({ x: b.vz / sp, y: 0, z: -b.vx / sp, isVector3: true }, (sp * dt) / b.r);
      }
    } else {
      b.mesh.rotation.y = b.rot;
    }
  }
}

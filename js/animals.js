// Hewan-hewan kampus: kucing, burung (terbang & di tanah), kupu-kupu, kunang-kunang (malam).
import * as THREE from 'three';
import { mat, patch } from './reveal.js';
import { pushOut } from './physics.js';

const rand = (a, b) => a + Math.random() * (b - a);

// ------------------------------------------------------------------ kucing
function makeCat(color) {
  const g = new THREE.Group();
  const c = mat(color), w = mat('#fff5ec'), dark = mat('#2b2230');
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.42, 0.95), c); body.position.y = 0.5; g.add(body);
  const head = new THREE.Group(); head.position.set(0, 0.82, 0.55); g.add(head);
  head.add(new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.4, 0.4), c));
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.2, 4), c); ear.position.set(s * 0.14, 0.27, 0); head.add(ear);
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.02), dark); eye.position.set(s * 0.11, 0.04, 0.21); head.add(eye);
  }
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.06), w); snout.position.set(0, -0.08, 0.21); head.add(snout);
  const legs = [];
  for (const [x, z] of [[-0.16, 0.32], [0.16, 0.32], [-0.16, -0.32], [0.16, -0.32]]) {
    const l = new THREE.Group(); l.position.set(x, 0.32, z); g.add(l);
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.32, 0.12), c); m.position.y = -0.16; l.add(m);
    legs.push(l);
  }
  const tail = new THREE.Group(); tail.position.set(0, 0.62, -0.47); g.add(tail);
  const tm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.6), c); tm.position.z = -0.3; tail.add(tm);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { g, head, legs, tail };
}

// ------------------------------------------------------------------ burung
function makeBird(color) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), mat(color)); body.scale.set(1, 0.9, 1.4); g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), mat(color)); head.position.set(0, 0.14, 0.26); g.add(head);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 6), mat('#ffb703')); beak.rotation.x = Math.PI / 2; beak.position.set(0, 0.13, 0.4); g.add(beak);
  const wings = [];
  for (const s of [-1, 1]) {
    const pv = new THREE.Group(); pv.position.set(s * 0.15, 0.06, 0); g.add(pv);
    const wgeo = new THREE.BoxGeometry(0.5, 0.04, 0.28); wgeo.translate(s * 0.25, 0, 0);
    pv.add(new THREE.Mesh(wgeo, mat(color))); wings.push(pv);
  }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { g, wings };
}

// ------------------------------------------------------------------ kupu-kupu
function makeButterfly(color) {
  const g = new THREE.Group();
  const m = patch(new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }));
  const wings = [];
  for (const s of [-1, 1]) {
    const pv = new THREE.Group(); g.add(pv);
    const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(s * 0.35, 0.3, s * 0.3, 0.05); sh.quadraticCurveTo(s * 0.32, -0.2, 0, 0);
    const geo = new THREE.ShapeGeometry(sh); geo.rotateX(-Math.PI / 2);
    pv.add(new THREE.Mesh(geo, m)); wings.push(pv);
  }
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.22), mat('#2b2230')); g.add(body);
  return { g, wings };
}

export class Animals {
  constructor(scene, robot) {
    this.robot = robot;
    this.cats = [];
    this.birds = [];
    this.ground = [];
    this.flies = [];
    const catSpots = [[-24, -4], [12, 30], [-10, 40], [30, -30], [6, 58]];
    ['#f4a259', '#3b3b3b', '#f2f2f2', '#c98b5a', '#8a8a8a'].forEach((col, i) => {
      const c = makeCat(col);
      const [x, z] = catSpots[i];
      c.g.position.set(x, 0, z);
      scene.add(c.g);
      this.cats.push({ ...c, x, z, tx: x, tz: z, wait: rand(0, 3), heading: rand(0, 6), phase: 0, sitting: false });
    });
    // burung terbang berputar-putar
    for (let i = 0; i < 9; i++) {
      const b = makeBird(['#4a6fa5', '#e9e3d8', '#3b3b3b'][i % 3]);
      scene.add(b.g);
      this.birds.push({ ...b, cx: rand(-40, 40), cz: rand(-40, 40), r: rand(6, 14), h: rand(9, 15), sp: rand(0.35, 0.6) * (i % 2 ? 1 : -1), a: rand(0, 6) });
    }
    // burung di tanah (terbang menjauh kalau robot mendekat)
    for (let i = 0; i < 8; i++) {
      const b = makeBird(['#8b5e3c', '#c0573e', '#4a6fa5'][i % 3]);
      b.g.scale.setScalar(0.8);
      scene.add(b.g);
      const x = rand(-45, 45), z = rand(-45, 45);
      this.ground.push({ ...b, x, z, y: 0.2, vy: 0, state: 'peck', t: rand(0, 2), heading: rand(0, 6), fx: 0, fz: 0 });
    }
    // kupu-kupu (banyak di taman & dekat pohon)
    const spots = [[4, 60], [-24, -12], [20, -20], [-40, -30], [34, 34], [-8, 30], [-30, 10], [45, -45]];
    for (let i = 0; i < 16; i++) {
      const f = makeButterfly(['#ffd166', '#ff6fb5', '#9ff3ff', '#ffffff', '#ff8a3d', '#c77dff'][i % 6]);
      const [x, z] = spots[i % spots.length];
      f.g.position.set(x, 1, z);
      scene.add(f.g);
      this.flies.push({ ...f, hx: x, hz: z, x, z, y: 1, a: rand(0, 6), sp: rand(0.6, 1.1), ph: rand(0, 6) });
    }
    // kunang-kunang (malam)
    const n = 140;
    const pos = new Float32Array(n * 3);
    this.ffBase = [];
    for (let i = 0; i < n; i++) {
      const base = [[4, 57], [-24.5, -15], [43, 55], [-53, -46], [0, 0]][i % 5];
      const p = [base[0] + rand(-12, 12), rand(0.5, 3), base[1] + rand(-9, 9)];
      this.ffBase.push(p);
      pos.set(p, i * 3);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.fireflies = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#fff3a0', size: 0.35, transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending }));
    scene.add(this.fireflies);
  }

  update(dt, t, night) {
    const rx = this.robot.pos.x, rz = this.robot.pos.y;
    // kucing: berjalan santai, duduk, menghindari robot
    for (const c of this.cats) {
      const dr = Math.hypot(c.x - rx, c.z - rz);
      if (dr < 3) { // menjauh dari robot
        c.tx = c.x + (c.x - rx) / dr * 6; c.tz = c.z + (c.z - rz) / dr * 6; c.wait = 0; c.sitting = false;
      }
      const dx = c.tx - c.x, dz = c.tz - c.z, d = Math.hypot(dx, dz);
      let speed = 0;
      if (d > 0.3 && c.wait <= 0) {
        speed = dr < 3 ? 4.5 : 1.4;
        c.x += (dx / d) * speed * dt; c.z += (dz / d) * speed * dt;
        const target = Math.atan2(dx, dz);
        let a = target - c.heading; a = Math.atan2(Math.sin(a), Math.cos(a));
        c.heading += a * Math.min(1, dt * 6);
        const p = { x: c.x, z: c.z }; pushOut(p, 0.5); c.x = p.x; c.z = p.z;
      } else {
        c.wait -= dt;
        if (c.wait <= 0 && d <= 0.3) { c.wait = rand(2, 6); c.sitting = Math.random() < 0.5; const a = rand(0, 6); c.tx = c.x + Math.cos(a) * rand(3, 8); c.tz = c.z + Math.sin(a) * rand(3, 8); }
      }
      c.phase += dt * speed * 4;
      c.legs.forEach((l, i) => (l.rotation.x = Math.sin(c.phase + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * 0.6 * Math.min(1, speed)));
      c.tail.rotation.y = Math.sin(t * 2 + c.x) * 0.5;
      c.tail.rotation.x = -0.6;
      c.head.rotation.y = speed ? 0 : Math.sin(t * 0.7 + c.z) * 0.5;
      c.g.position.set(c.x, c.sitting && !speed ? -0.12 : 0, c.z);
      c.g.rotation.set(c.sitting && !speed ? -0.25 : 0, c.heading, 0);
    }
    // burung terbang
    for (const b of this.birds) {
      b.a += b.sp * dt;
      const x = b.cx + Math.cos(b.a) * b.r, z = b.cz + Math.sin(b.a) * b.r;
      b.g.position.set(x, b.h + Math.sin(t * 1.3 + b.r) * 0.6, z);
      b.g.rotation.y = Math.atan2(-Math.sin(b.a) * Math.sign(b.sp), Math.cos(b.a) * Math.sign(b.sp));
      const f = Math.sin(t * 12 + b.r) * 0.8;
      b.wings[0].rotation.z = f; b.wings[1].rotation.z = -f;
    }
    // burung di tanah
    for (const b of this.ground) {
      const dr = Math.hypot(b.x - rx, b.z - rz);
      if (b.state === 'peck') {
        b.t -= dt;
        b.g.rotation.x = Math.max(0, Math.sin(t * 6 + b.x)) * 0.5;
        if (b.t < 0) { b.t = rand(0.5, 2); b.heading += rand(-1, 1); b.x += Math.sin(b.heading) * 0.3; b.z += Math.cos(b.heading) * 0.3; b.vy = 2; }
        b.vy -= 12 * dt; b.y = Math.max(0.2, b.y + b.vy * dt);
        b.wings[0].rotation.z = -0.2; b.wings[1].rotation.z = 0.2;
        if (dr < 4.5) { b.state = 'fly'; b.fx = (b.x - rx) / dr; b.fz = (b.z - rz) / dr; b.t = 4; }
      } else {
        b.t -= dt;
        b.x += b.fx * 8 * dt; b.z += b.fz * 8 * dt;
        b.y += (b.t > 1.5 ? 4 : -4) * dt;
        b.heading = Math.atan2(b.fx, b.fz);
        const f = Math.sin(t * 16) * 0.9;
        b.wings[0].rotation.z = f; b.wings[1].rotation.z = -f;
        b.g.rotation.x = 0;
        if (b.t < 0 || b.y <= 0.2) {
          b.y = 0.2; b.state = 'peck';
          if (Math.abs(b.x) > 60 || Math.abs(b.z) > 60) { b.x = rand(-40, 40); b.z = rand(-40, 40); }
        }
      }
      b.g.position.set(b.x, b.y, b.z);
      b.g.rotation.y = b.heading;
    }
    // kupu-kupu
    for (const f of this.flies) {
      f.a += (Math.sin(t * 0.7 + f.ph) * 1.5) * dt;
      f.x += Math.cos(f.a) * f.sp * dt * 1.5; f.z += Math.sin(f.a) * f.sp * dt * 1.5;
      const dx = f.hx - f.x, dz = f.hz - f.z;
      if (Math.hypot(dx, dz) > 5) f.a = Math.atan2(dz, dx);
      f.y = 1.1 + Math.sin(t * 2 + f.ph) * 0.5;
      f.g.position.set(f.x, f.y, f.z);
      f.g.rotation.y = -f.a + Math.PI / 2;
      const flap = Math.sin(t * 18 + f.ph) * 1.1;
      f.wings[0].rotation.z = flap; f.wings[1].rotation.z = -flap;
    }
    // kunang-kunang
    this.fireflies.material.opacity = night * 0.95;
    if (night > 0.02) {
      const arr = this.fireflies.geometry.attributes.position.array;
      this.ffBase.forEach((p, i) => {
        arr[i * 3] = p[0] + Math.sin(t * 0.6 + i) * 1.2;
        arr[i * 3 + 1] = p[1] + Math.sin(t * 1.3 + i * 1.7) * 0.5;
        arr[i * 3 + 2] = p[2] + Math.cos(t * 0.5 + i * 0.9) * 1.2;
      });
      this.fireflies.geometry.attributes.position.needsUpdate = true;
    }
  }
}

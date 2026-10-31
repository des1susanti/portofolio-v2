// Air mancur di bundaran tengah: semburan air, tetesan jatuh ke kolam, dan riak.
import * as THREE from 'three';
import { patch } from './reveal.js';

export class Fountain {
  constructor(scene, x = 0, z = 0) {
    this.x = x; this.z = z;
    this.n = 520;
    this.d = [];
    const pos = new Float32Array(this.n * 3);
    for (let i = 0; i < this.n; i++) this.d.push(this.spawn(Math.random() * 1.6));
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.points = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#d9f4ff', size: 0.16, transparent: true, opacity: 0.9, depthWrite: false }));
    this.points.frustumCulled = false;
    scene.add(this.points);
    // riak di kolam bawah & mangkuk tengah
    this.ripples = [];
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 40),
        patch(new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.5, depthWrite: false })));
      m.rotation.x = -Math.PI / 2;
      const top = i >= 4;
      m.position.set(x, top ? 2.68 : 0.68, z);
      m.userData = { t: i / (top ? 2 : 4), top };
      scene.add(m);
      this.ripples.push(m);
    }
    // tirai air dari mangkuk tengah ke kolam bawah
    const curtain = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 2.6, 2.0, 32, 1, true),
      patch(new THREE.MeshBasicMaterial({ color: '#bfe9ff', transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false })));
    curtain.position.set(x, 1.65, z);
    scene.add(curtain);
    this.curtain = curtain;
  }

  spawn(age = 0) {
    // jenis 0: semburan tegak dari puncak; jenis 1: pancuran melingkar dari mangkuk atas
    const kind = Math.random() < 0.55 ? 0 : 1;
    const a = Math.random() * Math.PI * 2;
    if (kind === 0) {
      const sp = 0.25 + Math.random() * 0.35;
      return { x: 0, y: 3.8, z: 0, vx: Math.cos(a) * sp, vy: 5.2 + Math.random() * 0.9, vz: Math.sin(a) * sp, age, floor: 2.7 };
    }
    const sp = 1.0 + Math.random() * 0.4;
    return { x: Math.cos(a) * 0.75, y: 3.7, z: Math.sin(a) * 0.75, vx: Math.cos(a) * sp, vy: 1.2 + Math.random() * 0.6, vz: Math.sin(a) * sp, age, floor: 2.7 };
  }

  update(dt, t) {
    const arr = this.points.geometry.attributes.position.array;
    for (let i = 0; i < this.n; i++) {
      let p = this.d[i];
      p.age -= dt;
      if (p.age > 0) { arr[i * 3 + 1] = -50; continue; }
      p.vy -= 9.8 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      const r = Math.hypot(p.x, p.z);
      if (p.y < p.floor && p.vy < 0) {
        if (r < 1.5 && p.floor > 1) { // jatuh ke mangkuk tengah, lalu meluap ke kolam
          p.floor = 0.7; p.vx = (p.x / (r || 1)) * 1.4; p.vz = (p.z / (r || 1)) * 1.4; p.vy = 0; p.y = 2.68;
          p.x = (p.x / (r || 1)) * 1.55; p.z = (p.z / (r || 1)) * 1.55;
        } else if (p.y < 0.7 || r > 3.2) { p = this.d[i] = this.spawn(0); }
      }
      arr[i * 3] = this.x + p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = this.z + p.z;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
    for (const m of this.ripples) {
      m.userData.t = (m.userData.t + dt * 0.45) % 1;
      const u = m.userData.t;
      const s = m.userData.top ? 0.3 + u * 1.15 : 1.6 + u * 1.35;
      m.scale.set(s, s, 1);
      m.material.opacity = 0.55 * (1 - u);
    }
    this.curtain.material.opacity = 0.22 + Math.sin(t * 6) * 0.04;
  }
}

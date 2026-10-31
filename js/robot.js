// Robot pengunjung: model low-poly, ganti warna, animasi jalan.
import * as THREE from 'three';
import { patch } from './reveal.js';

export class Robot {
  constructor(color = '#a259e0') {
    this.group = new THREE.Group();
    this.body = new THREE.Group();
    this.group.add(this.body);
    this.main = patch(new THREE.MeshLambertMaterial({ color }));
    this.light = patch(new THREE.MeshLambertMaterial({ color: '#ffffff' }));
    this.dark = patch(new THREE.MeshLambertMaterial({ color: '#3a2d44' }));
    this.glow = patch(new THREE.MeshLambertMaterial({ color: '#9ff3ff', emissive: '#5fe1ff', emissiveIntensity: 1 }));
    this.setColor(color);

    const part = (geo, m, x, y, z, parent = this.body) => {
      const mesh = new THREE.Mesh(geo, m);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      parent.add(mesh);
      return mesh;
    };
    // badan & kepala
    part(new THREE.BoxGeometry(1.3, 1.1, 0.9), this.main, 0, 1.55, 0);
    part(new THREE.BoxGeometry(1.0, 0.25, 0.7), this.dark, 0, 0.95, 0);
    part(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 16), this.glow, 0, 1.65, 0.46).rotation.x = Math.PI / 2;
    this.head = new THREE.Group();
    this.head.position.set(0, 2.45, 0);
    this.body.add(this.head);
    part(new THREE.BoxGeometry(1.0, 0.75, 0.85), this.light, 0, 0, 0, this.head);
    part(new THREE.BoxGeometry(0.8, 0.3, 0.1), this.glow, 0, 0.05, 0.43, this.head);
    part(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6), this.dark, 0, 0.6, 0, this.head);
    part(new THREE.SphereGeometry(0.12, 10, 8), this.glow, 0, 0.88, 0, this.head);
    for (const s of [-1, 1]) part(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 12), this.main, s * 0.55, 0, 0, this.head).rotation.z = Math.PI / 2;
    // lengan & kaki (berporos di sendi)
    const limb = (x, y, len, w, m) => {
      const pivot = new THREE.Group();
      pivot.position.set(x, y, 0);
      this.body.add(pivot);
      part(new THREE.BoxGeometry(w, len, w), m, 0, -len / 2, 0, pivot);
      part(new THREE.SphereGeometry(w * 0.75, 10, 8), this.light, 0, 0, 0, pivot);
      return pivot;
    };
    this.armL = limb(-0.82, 1.95, 0.95, 0.28, this.main);
    this.armR = limb(0.82, 1.95, 0.95, 0.28, this.main);
    this.legL = limb(-0.32, 0.85, 0.85, 0.34, this.main);
    this.legR = limb(0.32, 0.85, 0.85, 0.34, this.main);
    for (const leg of [this.legL, this.legR]) part(new THREE.BoxGeometry(0.42, 0.18, 0.6), this.dark, 0, -0.9, 0.08, leg);

    // bayangan bulat lembut di bawah robot
    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.9, 24),
      new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.18, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.12;
    this.group.add(sh);

    // joran pancing (di tangan kanan) dan buku (dipegang di depan dada)
    this.rod = new THREE.Group();
    this.rod.position.set(0, -0.95, 0.05);
    this.armR.add(this.rod);
    const rodMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 3.4, 6), this.dark);
    rodMesh.geometry.translate(0, 1.7, 0);
    rodMesh.rotation.x = 0.35;
    this.rod.add(rodMesh);
    this.rodTip = new THREE.Object3D();
    this.rodTip.position.set(0, 3.4, 0);
    rodMesh.add(this.rodTip);
    const reel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 10), this.light);
    reel.rotation.z = Math.PI / 2; reel.position.y = 0.4; rodMesh.add(reel);
    this.rod.visible = false;
    this.book = new THREE.Group();
    const page = patch(new THREE.MeshLambertMaterial({ color: '#fff6e6' }));
    const cover = patch(new THREE.MeshLambertMaterial({ color: '#e63946' }));
    for (const s of [-1, 1]) {
      const half = new THREE.Group(); half.rotation.y = s * 0.35; this.book.add(half);
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.56, 0.03), cover); c.position.x = s * 0.21; half.add(c);
      const pg = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.5, 0.03), page); pg.position.set(s * 0.2, 0, 0.03); half.add(pg);
    }
    this.book.position.set(0, 1.55, 0.75);
    this.book.rotation.x = -0.5;
    this.body.add(this.book);
    this.book.visible = false;

    this.pos = new THREE.Vector2();
    this.vel = new THREE.Vector2();
    this.heading = 0;        // 0 = menghadap kamera (+z)
    this.phase = 0;
    this.radius = 0.85;
  }

  setColor(hex) {
    this.main.color.set(hex);
    // warna terang -> kepala sedikit gelap supaya tetap kontras
    const l = new THREE.Color(hex).getHSL({}).l;
    this.light.color.set(l > 0.8 ? '#d9d4de' : '#ffffff');
  }

  place(x, z, heading = 0) {
    this.pos.set(x, z);
    this.vel.set(0, 0);
    this.heading = heading;
    this.sync();
  }

  sync() {
    this.group.position.set(this.pos.x, 0, this.pos.y);
    this.group.rotation.y = this.heading;
  }

  /** input: {x, z} arah -1..1, run: bool */
  update(dt, input, run) {
    const max = run ? 15 : 9;
    const acc = 40;
    const tx = input.x * max, tz = input.z * max;
    const k = 1 - Math.exp(-(input.x || input.z ? 8 : 10) * dt);
    this.vel.x += (tx - this.vel.x) * Math.min(1, k * acc / max);
    this.vel.y += (tz - this.vel.y) * Math.min(1, k * acc / max);
    this.pos.addScaledVector(this.vel, dt);
    const speed = this.vel.length();
    if (speed > 0.3) {
      const target = Math.atan2(this.vel.x, this.vel.y);
      let d = target - this.heading;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      this.heading += d * Math.min(1, dt * 12);
    }
    // animasi jalan
    const s = Math.min(1, speed / 9);
    this.phase += dt * (4 + speed * 0.9) * (s > 0.05 ? 1 : 0);
    const sw = Math.sin(this.phase) * 0.8 * s;
    this.legL.rotation.x = sw; this.legR.rotation.x = -sw;
    this.armL.rotation.x = -sw * 0.8; this.armR.rotation.x = sw * 0.8;
    this.armL.rotation.z = -0.12; this.armR.rotation.z = 0.12;
    this.body.position.y = Math.abs(Math.cos(this.phase)) * 0.12 * s;
    this.body.rotation.x = s * 0.12;
    this.head.rotation.y = Math.sin(this.phase * 0.5) * 0.08 * (1 - s);
    return speed;
  }

  idle(t) {
    this.armL.rotation.z = -0.12 - Math.sin(t * 2) * 0.05;
    this.armR.rotation.z = 0.12 + Math.sin(t * 2) * 0.05;
    this.head.rotation.y = Math.sin(t * 0.8) * 0.25;
    this.body.position.y = Math.sin(t * 2) * 0.03;
  }

  /** pose khusus: 'fish' memancing, 'read' duduk membaca, null = biasa */
  setMode(mode) {
    this.mode = mode;
    this.rod.visible = mode === 'fish';
    this.book.visible = mode === 'read';
    if (!mode) {
      this.body.position.y = 0; this.legL.rotation.x = this.legR.rotation.x = 0;
      this.head.rotation.set(0, 0, 0); this.armL.rotation.set(0, 0, -0.12); this.armR.rotation.set(0, 0, 0.12);
    }
  }

  posed(t, bite = 0) {
    if (this.mode === 'fish') {
      this.armR.rotation.set(-0.9 + Math.sin(t * 1.5) * 0.04 - bite * 0.5, 0, 0.1);
      this.armL.rotation.set(-0.6, 0, -0.3);
      this.legL.rotation.x = this.legR.rotation.x = 0;
      this.body.position.y = Math.sin(t * 2) * 0.02;
      this.head.rotation.y = Math.sin(t * 0.5) * 0.15;
    } else if (this.mode === 'read') {
      this.legL.rotation.x = this.legR.rotation.x = -1.45;
      this.body.position.y = -0.38;
      this.armL.rotation.set(-1.1, 0, 0.35); this.armR.rotation.set(-1.1, 0, -0.35);
      this.head.rotation.set(0.35, Math.sin(t * 0.6) * 0.12, 0);
      this.body.rotation.x = 0;
    }
  }

  wave(t) {   // melambai (di layar awal)
    this.armR.rotation.z = 2.6 + Math.sin(t * 8) * 0.35;
    this.armR.rotation.x = 0;
  }
}

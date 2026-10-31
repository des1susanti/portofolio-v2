// Siang & malam: cahaya, warna langit, lampu jalan, dan kunang-kunang.
import * as THREE from 'three';
import { lampSpots, nightMats } from './world.js';

const DAY = { hemiSky: '#ffe9d6', hemiGround: '#7a4f73', hemi: 1.15, sun: '#ffd7b0', sunI: 1.9, bg: '#170d12' };
const NIGHT = { hemiSky: '#5b6fb5', hemiGround: '#1c1430', hemi: 0.75, sun: '#9fb4ff', sunI: 0.6, bg: '#07060f' };
const CYCLE = 150; // detik sebelum berganti otomatis

export class DayNight {
  constructor(scene, hemi, sun, nLights = 6) {
    this.scene = scene; this.hemi = hemi; this.sun = sun;
    this.k = 0;            // 0 siang .. 1 malam
    this.target = 0;
    this.auto = true;
    this.timer = 0;
    this.c = { a: new THREE.Color(), b: new THREE.Color() };
    // beberapa lampu titik dipindah ke lampu jalan terdekat robot (hemat)
    this.points = [];
    for (let i = 0; i < nLights; i++) {
      const l = new THREE.PointLight('#ffb35c', 0, 11, 1.6);
      scene.add(l);
      this.points.push(l);
    }
    this.reassign = 0;
  }

  toggle() { this.target = this.target > 0.5 ? 0 : 1; this.timer = 0; }
  isNight() { return this.target > 0.5; }

  mix(key) { return this.c.a.set(DAY[key]).lerp(this.c.b.set(NIGHT[key]), this.k); }

  update(dt, focus) {
    if (this.auto) {
      this.timer += dt;
      if (this.timer > CYCLE) this.toggle();
    }
    this.k += (this.target - this.k) * (1 - Math.exp(-dt * 0.9));
    const k = this.k;
    this.hemi.color.copy(this.mix('hemiSky'));
    this.hemi.groundColor.copy(this.mix('hemiGround'));
    this.hemi.intensity = DAY.hemi + (NIGHT.hemi - DAY.hemi) * k;
    this.sun.color.copy(this.mix('sun'));
    this.sun.intensity = DAY.sunI + (NIGHT.sunI - DAY.sunI) * k;
    this.scene.background.copy(this.mix('bg'));
    for (const m of nightMats) m.emissiveIntensity = 0.9 + k * 1.8;
    this.reassign -= dt;
    if (this.reassign < 0) {
      this.reassign = 0.5;
      const near = [...lampSpots].sort((a, b) =>
        (a.x - focus.x) ** 2 + (a.z - focus.z) ** 2 - ((b.x - focus.x) ** 2 + (b.z - focus.z) ** 2));
      this.points.forEach((l, i) => near[i] && l.position.copy(near[i]).add({ x: 0, y: 0.3, z: 0 }));
    }
    for (const l of this.points) l.intensity = k * 40;
    return k;
  }
}

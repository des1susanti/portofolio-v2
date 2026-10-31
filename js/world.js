// =====================================================================
//  DUNIA KAMPUS MINI: daratan, jalan, danau, pohon, rumput, dan gedung.
//  Koordinat peta (px, py) 1500x1500  ->  dunia (x, z): 1 unit = 10 px.
// =====================================================================
import * as THREE from 'three';
import { mat, patch, windMat } from './reveal.js';
import { LOCATIONS } from './content.js';

export const S = 0.1;
export const toWorld = (px, py) => ({ x: (px - 750) * S, z: (py - 760) * S });
export const SPAWN = { x: -28, z: 9.5 };
export const LIMIT = 66;
export const lampSpots = [];   // posisi lampu (untuk cahaya malam)
export const nightMats = [];   // material yang menyala di malam hari
export const FISH_SPOT = { x: -5.4, z: 57, heading: Math.PI / 2 };
export const READ_SPOT = { x: 10, z: 61.7, heading: Math.PI };                     // batas daratan (robot tidak bisa lewat)

const rnd = mulberry(7);
function mulberry(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------------ penampung tabrakan
export const colliders = [];   // {type:'box', x0,z0,x1,z1} | {type:'circle', x,z,r}
const addBox = (x0, z0, x1, z1) => colliders.push({ type: 'box', x0, z0, x1, z1 });
const addCircle = (x, z, r) => colliders.push({ type: 'circle', x, z, r });

// zona yang tidak boleh diisi pohon/rumput (gedung, jalan, dll)
const keepOut = [];
const keep = (x0, z0, x1, z1) => keepOut.push([x0, z0, x1, z1]);
function free(x, z, pad = 0) {
  for (const [x0, z0, x1, z1] of keepOut) if (x > x0 - pad && x < x1 + pad && z > z0 - pad && z < z1 + pad) return false;
  for (const l of LAKES) if (((x - l.x) / (l.rx + 1.5)) ** 2 + ((z - l.z) / (l.rz + 1.5)) ** 2 < 1) return false;
  if (Math.hypot(x - SPAWN.x, z - SPAWN.z) < 7.5) return false;
  if (x > SPAWN.x - 13 && x < SPAWN.x + 13 && z > SPAWN.z + 3 && z < SPAWN.z + 10) return false; // huruf nama
  if (x > SPAWN.x + 7 && x < SPAWN.x + 15 && z > SPAWN.z - 3 && z < SPAWN.z + 4) return false; // kardus
  return Math.abs(x) < LIMIT - 1 && Math.abs(z) < LIMIT - 1;
}

// ------------------------------------------------------------------ bentuk dasar
function box(w, h, d, color, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y + h / 2, z);
  m.castShadow = m.receiveShadow = true;
  parent && parent.add(m);
  return m;
}
function cyl(rt, rb, h, color, x = 0, y = 0, z = 0, parent, seg = 16) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(color));
  m.position.set(x, y + h / 2, z);
  m.castShadow = m.receiveShadow = true;
  parent && parent.add(m);
  return m;
}
function gable(w, h, d, color, x, y, z, parent) {  // atap pelana (prisma segitiga)
  const sh = new THREE.Shape();
  sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(0, h); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false });
  g.translate(0, 0, -d / 2);
  const m = new THREE.Mesh(g, mat(color));
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  parent && parent.add(m);
  return m;
}
function flat(geo, color, y, parent) {               // bentuk datar di tanah
  const m = new THREE.Mesh(geo, mat(color));
  m.rotation.x = -Math.PI / 2;
  m.position.y = y;
  m.receiveShadow = true;
  parent && parent.add(m);
  return m;
}
function blobShape(cx, cz, rx, rz, amp = 0.12, seed = 0, n = 40) {
  const s = new THREE.Shape();
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    const r = 1 + amp * (Math.sin(3 * t + seed) * 0.6 + Math.sin(5 * t + seed * 2) * 0.4);
    const x = cx + Math.cos(t) * rx * r, y = -(cz + Math.sin(t) * rz * r);
    i === 0 ? s.moveTo(x, y) : s.lineTo(x, y);
  }
  return s;
}
function roundRect(x0, z0, x1, z1, r) {             // persegi bersudut bulat (koordinat dunia)
  const s = new THREE.Shape();
  const Y = (z) => -z;
  s.moveTo(x0 + r, Y(z0));
  s.lineTo(x1 - r, Y(z0)); s.quadraticCurveTo(x1, Y(z0), x1, Y(z0 + r));
  s.lineTo(x1, Y(z1 - r)); s.quadraticCurveTo(x1, Y(z1), x1 - r, Y(z1));
  s.lineTo(x0 + r, Y(z1)); s.quadraticCurveTo(x0, Y(z1), x0, Y(z1 - r));
  s.lineTo(x0, Y(z0 + r)); s.quadraticCurveTo(x0, Y(z0), x0 + r, Y(z0));
  return s;
}

// ------------------------------------------------------------------ data peta
const LAKES = [
  { ...toWorld(330, 610), rx: 9, rz: 6.5, seed: 0.4 },
  { ...toWorld(1180, 1310), rx: 11, rz: 5, seed: 2.0 },
  { ...toWorld(215, 300), rx: 5.5, rz: 4, seed: 3.1 },
  { ...toWorld(790, 1330), rx: 7, rz: 4, seed: 1.0 },
];
export const TRACK = { ...toWorld(490, 1100), rx: 19, rz: 11.5, w: 3.4 };

// ------------------------------------------------------------------ pembuat dunia
export function buildWorld(scene, font) {
  const world = new THREE.Group();
  scene.add(world);

  // laut
  const sea = flat(new THREE.PlaneGeometry(260, 260), '#2b6fc4', -0.45, world);
  sea.material = patch(new THREE.MeshLambertMaterial({ color: '#2a63b8' }));
  const shallow = flat(new THREE.ShapeGeometry(roundRect(-80, -80, 80, 80, 26)), '#45a8e0', -0.4, world);
  shallow.material = patch(new THREE.MeshLambertMaterial({ color: '#4aa9d8', transparent: true, opacity: 0.7 }));

  // daratan: pasir di tepi, rumput di dalam
  const landShape = roundRect(-71, -71, 71, 71, 22);
  const landGeo = new THREE.ExtrudeGeometry(landShape, { depth: 1.2, bevelEnabled: false });
  const land = new THREE.Mesh(landGeo, mat('#e2c08a'));
  land.rotation.x = -Math.PI / 2; land.position.y = -1.2; land.receiveShadow = true;
  world.add(land);
  flat(new THREE.ShapeGeometry(roundRect(-66, -66, 66, 66, 19)), '#8c9a46', 0.01, world);

  // danau
  for (const l of LAKES) {
    flat(new THREE.ShapeGeometry(blobShape(l.x, l.z, l.rx + 1.2, l.rz + 1.2, 0.12, l.seed)), '#e9cf98', 0.03, world);
    flat(new THREE.ShapeGeometry(blobShape(l.x, l.z, l.rx, l.rz, 0.12, l.seed)), '#3f9fd0', 0.05, world);
    flat(new THREE.ShapeGeometry(blobShape(l.x, l.z, l.rx * 0.6, l.rz * 0.55, 0.12, l.seed)), '#2f84c2', 0.06, world);
    // robot tidak bisa masuk danau
    const n = Math.max(2, Math.round(l.rx / l.rz * 2));
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : i / (n - 1) - 0.5;
      addCircle(l.x + t * l.rx * 1.2, l.z, l.rz * 0.95);
    }
  }

  // jalan lingkar + jalan silang + jalan ke bengkel
  const ROAD = '#9a6a4c', EDGE = '#f0b582';
  const ring = roundRect(-54.3, -54.3, 54.3, 53.3, 14.3);
  ring.holes.push(roundRect(-49.7, -49.7, 49.7, 48.7, 9.7));
  flat(new THREE.ShapeGeometry(ring, 24), ROAD, 0.04, world);
  flat(new THREE.PlaneGeometry(4.6, 103), ROAD, 0.041, world).position.set(0, 0.041, -0.5);
  flat(new THREE.PlaneGeometry(118, 4.6), ROAD, 0.042, world).position.set(-5.5, 0.042, 0);
  flat(new THREE.PlaneGeometry(14, 4.6), ROAD, 0.042, world).position.set(57, 0.042, -6);
  keep(-55, -55, 55, -49); keep(-55, 48, 55, 54); keep(-55, -55, -49, 54); keep(49, -55, 55, 54);
  keep(-2.6, -55, 2.6, 54); keep(-66, -2.6, 55, 2.6); keep(50, -8.5, 66, -3.5);
  // ubin tepi jalan (garis putus)
  const dashes = [];
  const dashAlong = (x0, z0, x1, z1) => {
    const L = Math.hypot(x1 - x0, z1 - z0), n = Math.floor(L / 3.4);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      dashes.push([x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, Math.atan2(x1 - x0, z1 - z0)]);
    }
  };
  dashAlong(0, -50, 0, 49); dashAlong(-64, 0, -3, 0); dashAlong(3, 0, 49, 0);
  dashAlong(-40, -52, 40, -52); dashAlong(-40, 51, 40, 51); dashAlong(-52, -40, -52, 40); dashAlong(52, -40, 52, 40);
  const dm = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.35, 1.6), mat(EDGE), dashes.length);
  const o = new THREE.Object3D();
  dashes.forEach(([x, z, a], i) => {
    o.position.set(x, 0.06, z); o.rotation.set(-Math.PI / 2, 0, a); o.updateMatrix(); dm.setMatrixAt(i, o.matrix);
  });
  dm.receiveShadow = true;
  world.add(dm);

  // bundaran tengah + air mancur
  flat(new THREE.CircleGeometry(9.5, 40), '#d9a273', 0.07, world);
  flat(new THREE.CircleGeometry(8, 40), '#8c9a46', 0.08, world);
  cyl(3.4, 3.6, 0.7, '#e8d3b8', 0, 0, 0, world, 32);            // kolam bawah
  flat(new THREE.CircleGeometry(3.0, 32), '#55b4e6', 0.66, world);
  cyl(0.5, 0.7, 1.8, '#e8d3b8', 0, 0.6, 0, world, 16);           // tiang
  cyl(1.7, 1.2, 0.35, '#e8d3b8', 0, 2.3, 0, world, 24);          // mangkuk tengah
  flat(new THREE.CircleGeometry(1.5, 24), '#55b4e6', 2.66, world);
  cyl(0.25, 0.35, 1.0, '#e8d3b8', 0, 2.6, 0, world, 12);         // tiang atas
  cyl(0.8, 0.55, 0.25, '#e8d3b8', 0, 3.5, 0, world, 20);         // mangkuk atas
  addCircle(0, 0, 3.7);
  keep(-9.5, -9.5, 9.5, 9.5);

  // area awal (tempat robot muncul): ubin, pohon, lampu, papan
  flat(new THREE.CircleGeometry(6.6, 48), '#e4a16b', 0.09, world).position.set(SPAWN.x, 0.09, SPAWN.z);
  const spawnDeco = new THREE.Group();
  spawnDeco.position.set(SPAWN.x, 0, SPAWN.z);
  world.add(spawnDeco);
  // papan kayu di antara dua tiang (seperti gambar contoh)
  box(0.35, 2.6, 0.35, '#5b4a6b', -1.6, 0, -3.2, spawnDeco);
  box(0.35, 2.6, 0.35, '#5b4a6b', 1.6, 0, -3.2, spawnDeco);
  box(3.2, 0.5, 0.15, '#e07a4c', 0, 1.9, -3.2, spawnDeco);
  box(3.2, 0.5, 0.15, '#e07a4c', 0, 1.2, -3.2, spawnDeco);
  // lampu taman
  const lamp = (x, z, parent) => {
    cyl(0.12, 0.16, 2.4, '#ef8a4f', x, 0, z, parent);
    box(0.55, 0.12, 0.55, '#5b4a6b', x, 2.4, z, parent);
    const glass = box(0.42, 0.55, 0.42, '#ffe08a', x, 2.52, z, parent);
    glass.material = mat('#ffe08a', { emissive: '#ffb347', emissiveIntensity: 0.9 });
    if (!nightMats.includes(glass.material)) nightMats.push(glass.material);
    const wp = new THREE.Vector3(); parent.updateMatrixWorld(true); glass.getWorldPosition(wp);
    lampSpots.push(wp);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.4, 4), mat('#5b4a6b'));
    cap.position.set(x, 3.27, z); cap.rotation.y = Math.PI / 4; cap.castShadow = true;
    parent.add(cap);
  };
  lamp(-3.2, -1.6, spawnDeco);
  lamp(3.6, 2.6, spawnDeco);
  // lampu di sepanjang jalan
  const roadLamps = new THREE.Group(); world.add(roadLamps);
  for (let t = -42; t <= 42; t += 14) {
    for (const [x, z] of [[t, -57], [t, 56], [-57, t], [57, t]]) { lamp(x, z, roadLamps); addCircle(x, z, 0.35); keep(x - 0.5, z - 0.5, x + 0.5, z + 0.5); }
  }
  for (const [x, z] of [[4, -20], [4, 20], [-20, 4], [20, 4], [-40, 4], [40, -4], [4, 38], [4, -38]]) { lamp(x, z, roadLamps); addCircle(x, z, 0.35); }
  addCircle(SPAWN.x - 3.2, SPAWN.z - 1.6, 0.4);
  addCircle(SPAWN.x + 3.6, SPAWN.z + 2.6, 0.4);
  addBox(SPAWN.x - 1.8, SPAWN.z - 3.4, SPAWN.x + 1.8, SPAWN.z - 3.0);

  // gedung-gedung
  const labelAnchors = {};
  for (const L of LOCATIONS) {
    const p = toWorld(L.px, L.py);
    const g = new THREE.Group();
    g.position.set(p.x, 0, p.z);
    g.userData.locKey = L.key;
    world.add(g);
    const fn = BUILDERS[L.key];
    const h = fn ? fn(g, p) : 3;
    labelAnchors[L.key] = new THREE.Vector3(p.x, h + 1.2, p.z);
  }

  // pohon (instanced: batang + 3 gumpal daun)
  const trees = [];
  let guard = 0;
  while (trees.length < 190 && guard++ < 20000) {
    const x = (rnd() * 2 - 1) * 64, z = (rnd() * 2 - 1) * 64;
    if (!free(x, z, 2.6)) continue;
    if (trees.some((t) => Math.hypot(t.x - x, t.z - z) < 2.6)) continue;
    trees.push({ x, z, s: 0.75 + rnd() * 0.45 });
  }
  // pohon dekat titik awal (seperti gambar contoh)
  trees.push({ x: SPAWN.x - 4.6, z: SPAWN.z - 3.8, s: 1.5 }, { x: SPAWN.x + 2.8, z: SPAWN.z - 5.4, s: 1.3 });
  const trunkM = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.28, 2, 6), mat('#7a4a3a'), trees.length);
  const leafGeo = new THREE.IcosahedronGeometry(1, 0);
  const leafM = new THREE.InstancedMesh(leafGeo, windMat('#ffffff', 0.08, true), trees.length * 3);
  const LEAF = ['#ef6f6c', '#f49a7a', '#e8566b', '#c9a227', '#9bb33b', '#d97a35', '#f2a6b8'];
  const c = new THREE.Color();
  trees.forEach((t, i) => {
    o.position.set(t.x, t.s, t.z); o.rotation.set(0, 0, 0); o.scale.setScalar(t.s); o.updateMatrix();
    trunkM.setMatrixAt(i, o.matrix);
    const col = LEAF[Math.floor(rnd() * LEAF.length)];
    for (let k = 0; k < 3; k++) {
      const a = k * 2.1 + rnd();
      o.position.set(t.x + Math.cos(a) * 0.6 * t.s, (2.2 + (k === 0 ? 0.6 : 0) + rnd() * 0.3) * t.s, t.z + Math.sin(a) * 0.6 * t.s);
      o.rotation.set(rnd() * 3, rnd() * 3, 0);
      o.scale.setScalar((1.05 + rnd() * 0.35) * t.s);
      o.updateMatrix();
      leafM.setMatrixAt(i * 3 + k, o.matrix);
      c.set(col).offsetHSL(0, 0, (rnd() - 0.5) * 0.08);
      leafM.setColorAt(i * 3 + k, c);
    }
    addCircle(t.x, t.z, 0.45 * t.s);
  });
  trunkM.castShadow = leafM.castShadow = true;
  leafM.receiveShadow = true;
  world.add(trunkM, leafM);

  // rumput (kerucut kecil)
  const grassPts = [];
  guard = 0;
  while (grassPts.length < 4500 && guard++ < 60000) {
    const x = (rnd() * 2 - 1) * 65, z = (rnd() * 2 - 1) * 65;
    if (!free(x, z, 0.6)) continue;
    // rumpun: berkumpul dekat pohon dan tepi
    grassPts.push([x, z]);
    for (let k = 0; k < 4 && grassPts.length < 4500; k++) {
      const gx = x + (rnd() - 0.5) * 1.6, gz = z + (rnd() - 0.5) * 1.6;
      if (free(gx, gz, 0.3)) grassPts.push([gx, gz]);
    }
  }
  // rumput di area awal
  for (let k = 0; k < 160; k++) {
    const a = Math.PI * (0.55 + rnd() * 0.9), r = 3.5 + rnd() * 2.8;
    grassPts.push([SPAWN.x + Math.cos(a) * r, SPAWN.z - Math.abs(Math.sin(a)) * r * 0.9]);
  }
  const grassGeo = new THREE.ConeGeometry(0.16, 0.9, 4); grassGeo.translate(0, 0.45, 0);
  const grassM = new THREE.InstancedMesh(grassGeo, windMat('#ffffff', 0.22), grassPts.length);
  const GR = ['#b5a33a', '#c9b14a', '#9a9a33', '#d6b84f', '#a8b046'];
  grassPts.forEach(([x, z], i) => {
    const s = 0.7 + rnd() * 0.7;
    o.position.set(x, 0.02, z); o.rotation.set((rnd() - 0.5) * 0.4, rnd() * 3, (rnd() - 0.5) * 0.4);
    o.scale.set(s, s, s); o.updateMatrix();
    grassM.setMatrixAt(i, o.matrix);
    grassM.setColorAt(i, c.set(GR[Math.floor(rnd() * GR.length)]));
  });
  grassM.receiveShadow = true;
  world.add(grassM);

  // daun gugur di jalan & ubin
  const leaves = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.28, 0.2), mat('#ffffff', { side: THREE.DoubleSide }), 700);
  for (let i = 0; i < 700; i++) {
    const x = (rnd() * 2 - 1) * 64, z = (rnd() * 2 - 1) * 64;
    o.position.set(x, 0.1, z); o.rotation.set(-Math.PI / 2, 0, rnd() * 6); o.scale.setScalar(1); o.updateMatrix();
    leaves.setMatrixAt(i, o.matrix);
    leaves.setColorAt(i, c.set(['#c4452e', '#e07a3c', '#a93a3a', '#f2a65a'][i % 4]));
  }
  world.add(leaves);

  // batu kecil
  const rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.4, 0), mat('#f1d1d6'), 60);
  for (let i = 0; i < 60; i++) {
    let x, z;
    do { x = (rnd() * 2 - 1) * 64; z = (rnd() * 2 - 1) * 64; } while (!free(x, z, 0.5));
    o.position.set(x, 0.12, z); o.rotation.set(rnd(), rnd(), rnd()); o.scale.set(1, 0.6, 0.8); o.updateMatrix();
    rocks.setMatrixAt(i, o.matrix);
  }
  rocks.castShadow = true;
  world.add(rocks);

  return { world, labelAnchors };
}

// ------------------------------------------------------------------ setiap gedung
// Fungsi mengembalikan tinggi bangunan (untuk letak label nama).
const solid = (p, w, d, ox = 0, oz = 0) => {
  addBox(p.x + ox - w / 2, p.z + oz - d / 2, p.x + ox + w / 2, p.z + oz + d / 2);
  keep(p.x + ox - w / 2 - 0.5, p.z + oz - d / 2 - 0.5, p.x + ox + w / 2 + 0.5, p.z + oz + d / 2 + 0.5);
};

function sign(text, parent, x, y, z, w = 4, bg = '#fff8ef', fg = '#241726') {
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 128;
  const g = cv.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, 512, 128);
  g.fillStyle = fg; g.font = '900 64px Nunito, Arial, sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, 256, 68);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), patch(new THREE.MeshLambertMaterial({ map: tex })));
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}

const BUILDERS = {
  gerbang(g, p) {
    box(1, 5, 1, '#f4efe6', 0, 0, -4.2, g); box(1, 5, 1, '#f4efe6', 0, 0, 4.2, g);
    box(1.4, 0.9, 10, '#e2574c', 0, 5, 0, g);
    const s = sign('KAMPUS MINI', g, 0.75, 5.45, 0, 7, '#e2574c', '#fff');
    s.rotation.y = Math.PI / 2;
    addCircle(p.x, p.z - 4.2, 0.7); addCircle(p.x, p.z + 4.2, 0.7);
    keep(p.x - 1, p.z - 5, p.x + 1, p.z + 5);
    return 6;
  },
  beranda(g, p) {
    box(24, 6, 14, '#f4ece0', 0, 0, 0, g);
    gable(25, 4, 15, '#d6453d', 0, 6, 0, g).rotation.y = 0;
    for (let i = 0; i < 6; i++) cyl(0.45, 0.45, 5.4, '#ffffff', -10 + i * 4, 0, 7.6, g);
    box(25, 0.6, 3, '#e8dccb', 0, 0, 8, g);
    box(25, 0.5, 2.4, '#f4ece0', 0, 5.4, 8, g);
    sign('BERANDA', g, 0, 4.75, 7.05, 6, '#d6453d', '#fff');
    solid(p, 24, 14); keep(p.x - 13, p.z - 8, p.x + 13, p.z + 10);
    addBox(p.x - 12.5, p.z + 7, p.x + 12.5, p.z + 9.4);
    return 10;
  },
  masjid(g, p) {
    box(12, 4.5, 12, '#f6f1e6', 0, 0, 0, g);
    box(12.8, 0.5, 12.8, '#2e8b57', 0, 4.5, 0, g);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(4.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat('#3fae6e'));
    dome.position.y = 5; dome.castShadow = true; g.add(dome);
    cyl(0.12, 0.12, 1.4, '#f1c40f', 0, 9.1, 0, g);
    const moon = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.12, 8, 20, Math.PI * 1.4), mat('#f1c40f'));
    moon.position.set(0, 10.9, 0); moon.rotation.z = 0.9; g.add(moon);
    for (const [x, z] of [[-6.6, -6.6], [6.6, -6.6], [-6.6, 6.6], [6.6, 6.6]]) {
      cyl(0.7, 0.8, 8.5, '#efe8d8', x, 0, z, g, 10);
      const top = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.6, 10), mat('#2e8b57'));
      top.position.set(x, 9.3, z); top.castShadow = true; g.add(top);
      addCircle(p.x + x, p.z + z, 1);
    }
    box(3, 3.4, 0.4, '#2e8b57', 0, 0, 6.1, g);
    solid(p, 12, 12); keep(p.x - 8, p.z - 8, p.x + 8, p.z + 8);
    return 11;
  },
  auditorium(g, p) {
    box(11, 5, 16, '#b4a7e3', 0, 0, 0, g);
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 5.6, 16.4, 20, 1, false, -Math.PI / 2, Math.PI), mat('#8e7cc3'));
    roof.rotation.x = Math.PI / 2; roof.rotation.y = Math.PI / 2; roof.position.y = 5; roof.castShadow = true;
    roof.scale.set(1, 1, 0.55);
    g.add(roof);
    sign('WISUDA', g, 0, 4.4, 8.05, 4.6, '#8e7cc3', '#fff');
    const cap = box(2.4, 0.25, 2.4, '#241726', 0, 8.3, 0, g); cap.rotation.y = Math.PI / 4;
    solid(p, 11, 16); keep(p.x - 6.5, p.z - 9, p.x + 6.5, p.z + 9);
    return 9;
  },
  lab(g, p) {
    box(20, 9, 14, '#4a5cf0', 0, 0, 0, g);
    for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) {
      const w = box(2.4, 2.6, 0.2, '#9ff3ff', -8 + i * 4, 1.6 + r * 3.6, 7.05, g);
      w.material = mat('#9ff3ff', { emissive: '#5fe1ff', emissiveIntensity: 0.6 });
    }
    sign('LAB AI', g, 0, 8.3, 7.15, 5, '#2d3aa8', '#9ff3ff');
    // jaringan saraf melayang di atap
    const net = new THREE.Group(); net.position.y = 12; g.add(net);
    const nodes = [];
    for (let l = 0; l < 3; l++) for (let k = 0; k < 3; k++) {
      const v = new THREE.Vector3((l - 1) * 4, (k - 1) * 1.6, (k - 1) * 1.2);
      nodes.push(v);
      const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 0), mat('#e8feff', { emissive: '#7fe9ff', emissiveIntensity: 1 }));
      s.position.copy(v); net.add(s);
    }
    const pts = [];
    for (let a = 0; a < 3; a++) for (let b = 3; b < 6; b++) pts.push(nodes[a], nodes[b]);
    for (let a = 3; a < 6; a++) for (let b = 6; b < 9; b++) pts.push(nodes[a], nodes[b]);
    net.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),
      patch(new THREE.LineBasicMaterial({ color: '#9ff3ff' }))));
    net.userData.spin = true;
    g.userData.net = net;
    solid(p, 20, 14); keep(p.x - 11, p.z - 8, p.x + 11, p.z + 8);
    return 15;
  },
  galeri(g, p) {
    flat(new THREE.PlaneGeometry(18, 16), '#e4a16b', 0.09, g);
    const items = [
      (q) => box(1.2, 1.2, 1.2, '#ffd166', 0, 0, 0, q),
      (q) => { cyl(0.12, 0.15, 0.8, '#7a4a3a', 0, 0, 0, q); const t = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 0), mat('#57c26b')); t.position.y = 1.1; q.add(t); },
      (q) => { box(1.6, 0.45, 0.8, '#ffffff', 0, 0.15, 0, q); box(0.8, 0.35, 0.7, '#9fe3ff', -0.1, 0.6, 0, q); },
      (q) => { box(0.7, 0.8, 0.5, '#c77dff', 0, 0, 0, q); box(0.55, 0.45, 0.45, '#d9a6ff', 0, 0.8, 0, q); },
      (q) => { box(1.4, 1, 0.15, '#2b3445', 0, 0.3, 0, q); },
    ];
    items.forEach((fn, i) => {
      const x = -6 + i * 3, z = i % 2 ? 2 : -2;
      cyl(0.9, 1, 1.1, '#eef2f7', x, 0, z, g, 18);
      const q = new THREE.Group(); q.position.set(x, 1.1, z); g.add(q); fn(q);
      q.userData.spin = true;
      addCircle(p.x + x, p.z + z, 1.1);
    });
    sign('GALERI PROYEK', g, 0, 2.8, -6, 7);
    box(7.4, 0.3, 0.3, '#5b4a6b', 0, 1.6, -6.1, g);
    keep(p.x - 9, p.z - 8, p.x + 9, p.z + 8);
    return 5;
  },
  kelas(g, p) {
    box(18, 5.5, 11, '#f5d6a0', 0, 0, 0, g);
    box(19, 0.6, 12, '#c0573e', 0, 5.5, 0, g);
    for (let i = 0; i < 4; i++) box(2.6, 1.5, 0.2, '#fff7e6', -6.6 + i * 4.4, 3.75, 5.55, g);
    box(8, 2.2, 0.2, '#2c3e50', 0, 0.7, 5.6, g);
    sign('a² + b² = c²', g, 0, 1.8, 5.75, 6.5, '#2c3e50', '#ffffff');
    solid(p, 18, 11); keep(p.x - 10, p.z - 6.5, p.x + 10, p.z + 6.5);
    return 8;
  },
  prestasi(g, p) {
    box(16, 6, 14, '#f7d774', 0, 0, 0, g);
    box(17, 0.7, 15, '#e0a800', 0, 6, 0, g);
    // piala besar
    const pts = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new THREE.Vector2(0.4 + Math.sin(t * Math.PI) * 1.3 + t * 0.6, t * 2.6)); }
    const cup = new THREE.Mesh(new THREE.LatheGeometry(pts, 20), mat('#ffd34d', { emissive: '#7a5200', emissiveIntensity: 0.3, side: THREE.DoubleSide }));
    cup.position.y = 8.2; cup.castShadow = true; g.add(cup);
    cyl(0.25, 0.35, 1.5, '#ffd34d', 0, 6.7, 0, g);
    box(2, 0.4, 2, '#7a5a00', 0, 6.7, 0, g);
    g.userData.trophy = cup;
    sign('PRESTASI', g, 0, 4.7, 7.05, 6, '#e0a800', '#fff');
    solid(p, 16, 14); keep(p.x - 9, p.z - 8, p.x + 9, p.z + 8);
    return 12;
  },
  lapangan(g, p) {
    const T = TRACK;
    const ringG = new THREE.RingGeometry(1, 1 + T.w / T.rx, 64);
    const ringM = flat(ringG, '#c0573e', 0.07, g);
    ringM.scale.set(T.rx, T.rz * (1 + T.w / T.rx) / (1 + T.w / T.rz), 1);
    ringM.scale.set(T.rx, T.rz, 1);
    flat(new THREE.CircleGeometry(1, 64), '#5dbb63', 0.075, g).scale.set(T.rx, T.rz, 1);
    // garis lapangan
    const line = (w, d, x, z) => flat(new THREE.PlaneGeometry(w, d), '#ffffff', 0.08, g).position.set(x, 0.08, z);
    line(26, 0.2, 0, -8); line(26, 0.2, 0, 8); line(0.2, 16, -13, 0); line(0.2, 16, 13, 0); line(0.2, 16, 0, 0);
    const cc = flat(new THREE.RingGeometry(2.3, 2.5, 32), '#ffffff', 0.08, g);
    // garis start di lintasan (sisi utara)
    for (let i = 0; i < 4; i++) flat(new THREE.PlaneGeometry(0.6, 0.6), i % 2 ? '#ffffff' : '#241726', 0.09, g)
      .position.set(0, 0.09, -T.rz - T.w / 2 + 0.3 + i * 0.85 - 0.6);
    // gawang
    for (const sx of [-1, 1]) {
      const gx = sx * 13.6;
      box(0.2, 2, 0.2, '#ffffff', gx, 0, -2.4, g); box(0.2, 2, 0.2, '#ffffff', gx, 0, 2.4, g);
      box(0.2, 0.2, 5, '#ffffff', gx, 2, 0, g);
      box(0.15, 1.8, 5, '#dfe6ee', gx + sx * 1.2, 0, 0, g).material = mat('#dfe6ee', { transparent: true, opacity: 0.5 });
      addCircle(p.x + gx, p.z - 2.4, 0.25); addCircle(p.x + gx, p.z + 2.4, 0.25);
      addBox(p.x + gx + sx * 1.1 - 0.1, p.z - 2.5, p.x + gx + sx * 1.1 + 0.1, p.z + 2.5);
    }
    keep(p.x - T.rx - 1, p.z - T.rz - 1, p.x + T.rx + 1, p.z + T.rz + 1);
    return 2;
  },
  perpus(g, p) {
    box(20, 7, 14, '#f2d6a2', 0, 0, 0, g);
    box(21, 0.8, 15, '#7b5ea7', 0, 7, 0, g);
    const C = ['#ff6b6b', '#ffd166', '#06d6a0', '#4cc9f0'];
    for (let i = 0; i < 6; i++) for (let r = 0; r < 4; r++)
      box(0.5, 1, 0.3, C[(i + r) % 4], -7 + i * 2.8 + (r % 2) * 0.6, 0.6 + r * 1.4, -7.1, g);
    sign('</> PERPUSTAKAAN', g, 0, 8.5, 7.6, 9, '#241726', '#7cf29b');
    sign('BLOG KODE', g, 0, 5.4, 7.05, 6, '#7b5ea7', '#fff');
    solid(p, 20, 14); keep(p.x - 11, p.z - 8, p.x + 11, p.z + 8);
    return 10;
  },
  kantin(g, p) {
    box(16, 4.5, 12, '#ffe7c2', 0, 0, 0, g);
    box(17, 0.5, 13, '#e2574c', 0, 4.5, 0, g);
    for (let i = 0; i < 8; i++) {
      const a = box(2, 0.15, 3, i % 2 ? '#ffffff' : '#e63946', -7 + i * 2, 3.6, -7.2, g);
      a.rotation.x = -0.45;
    }
    sign('KANTIN · BLOG KULINER', g, 0, 2.6, 6.05, 8, '#e63946', '#fff');
    for (const x of [-5, 0, 5]) {
      cyl(0.9, 0.9, 0.9, '#ffffff', x, 0, -11, g);
      cyl(0.06, 0.06, 2.6, '#666666', x, 0.9, -11, g);
      const u = new THREE.Mesh(new THREE.ConeGeometry(1.8, 0.8, 8), mat(x === 0 ? '#ffcf3f' : '#f49a7a'));
      u.position.set(x, 3.6, -11); u.castShadow = true; g.add(u);
      addCircle(p.x + x, p.z - 11, 1);
    }
    solid(p, 16, 12); keep(p.x - 9, p.z - 13, p.x + 9, p.z + 7);
    return 7;
  },
  terminal(g, p) {
    box(20, 0.4, 12, '#9aa3b5', 0, 0, 0, g);
    for (const x of [-9, 9]) for (const z of [-5, 5]) { cyl(0.25, 0.25, 4.5, '#5b4a6b', x, 0.4, z, g); addCircle(p.x + x, p.z + z, 0.4); }
    box(21, 0.4, 13, '#2a9d8f', 0, 4.9, 0, g);
    sign('TERMINAL · JALAN-JALAN', g, 0, 6, 6.6, 10, '#2a9d8f', '#fff');
    for (const z of [-2.6, 2.6]) {
      const bus = new THREE.Group(); bus.position.set(-1, 0.4, z); g.add(bus);
      box(12, 2.6, 3, '#ffb703', 0, 0.5, 0, bus);
      for (let k = 0; k < 6; k++) box(1.4, 1, 3.05, '#bfe6ff', -4.8 + k * 1.9, 1.7, 0, bus);
      for (const wx of [-4, 4]) { const w = cyl(0.55, 0.55, 3.1, '#2b2b2b', wx, 0, 0, bus); w.rotation.x = Math.PI / 2; w.position.y = 0.55; }
      addBox(p.x - 7, p.z + z - 1.5, p.x + 5, p.z + z + 1.5);
    }
    keep(p.x - 11, p.z - 7, p.x + 11, p.z + 7);
    return 7;
  },
  pos(g, p) {
    box(13, 5, 10, '#ff8f8f', 0, 0, 0, g);
    gable(14, 2.4, 11, '#d94449', 0, 5, 0, g);
    sign('KANTOR POS', g, 0, 3.6, 5.05, 6, '#ffffff', '#d94449');
    // kotak surat
    cyl(0.12, 0.12, 1.4, '#2f80ed', 0, 0, -8, g);
    box(1.4, 1, 1, '#e63946', 0, 1.4, -8, g);
    addCircle(p.x, p.z - 8, 0.8);
    solid(p, 13, 10); keep(p.x - 7.5, p.z - 9, p.x + 7.5, p.z + 6);
    return 8;
  },
  bengkel(g, p) {
    box(10, 5, 12, '#3d4a5c', 0, 0, 0, g);
    box(10.6, 0.4, 12.6, '#e63946', 0, 5, 0, g);
    sign('BENGKEL CAT', g, 0, 4, 6.05, 6, '#e63946', '#fff');
    const C = ['#a259e0', '#2f80ed', '#e63946', '#2ecc71', '#f1c40f', '#ff8a3d'];
    C.forEach((col, i) => cyl(0.45, 0.4, 0.9, col, -3.5 + i * 1.4, 0, -7.4, g));
    solid(p, 10, 12); keep(p.x - 6, p.z - 13, p.x + 6, p.z + 7);
    return 7;
  },
  siger(g, p) {
    cyl(4.5, 6.5, 1.6, '#6aa95f', 0, 0, 0, g, 20);
    const sh = new THREE.Shape();
    const pts = [[-3.2, 0], [-2.6, 4.2], [-1.4, 2.4], [0, 6], [1.4, 2.4], [2.6, 4.2], [3.2, 0]];
    sh.moveTo(...pts[0]); pts.slice(1).forEach((q) => sh.lineTo(...q)); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.8, bevelEnabled: false });
    geo.translate(0, 0, -0.4);
    const crown = new THREE.Mesh(geo, mat('#f1c40f', { emissive: '#7a5a00', emissiveIntensity: 0.25 }));
    crown.position.y = 2.2; crown.castShadow = true; g.add(crown);
    box(6.6, 0.7, 1, '#e74c3c', 0, 1.6, 0, g);
    addCircle(p.x, p.z, 5.2);
    keep(p.x - 6.5, p.z - 6.5, p.x + 6.5, p.z + 6.5);
    return 8.5;
  },
  taman(g, p) {
    // perahu bebek di danau
    const duck = new THREE.Group(); duck.position.set(1.5, 0.2, 0); g.add(duck);
    box(2.4, 0.8, 1.4, '#ffffff', 0, 0, 0, duck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 8), mat('#ffffff'));
    head.position.set(1.1, 1.5, 0); duck.add(head);
    cyl(0.18, 0.22, 0.8, '#ffffff', 1.1, 0.7, 0, duck);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.5, 8), mat('#ff8a3d'));
    beak.rotation.z = -Math.PI / 2; beak.position.set(1.7, 1.5, 0); duck.add(beak);
    g.userData.duck = duck;
    // dermaga kayu untuk memancing (sisi barat danau)
    const pier = new THREE.Group(); pier.position.set(FISH_SPOT.x - p.x, 0, FISH_SPOT.z - p.z); g.add(pier);
    for (let i = 0; i < 6; i++) box(0.55, 0.18, 2.4, '#b0703a', 0.6 + i * 0.62, 0.15, 0, pier);
    for (const [x, z] of [[0.6, -1.1], [0.6, 1.1], [3.7, -1.1], [3.7, 1.1]]) cyl(0.1, 0.1, 0.9, '#6b4430', x, -0.4, z, pier);
    // ember ikan
    cyl(0.32, 0.26, 0.5, '#2f80ed', -0.9, 0, 1.1, pier);
    // bangku taman (bangku kanan untuk membaca)
    for (const x of [-6, 6]) {
      box(2.6, 0.18, 0.9, '#b0703a', x, 0.55, 6, g); box(2.6, 0.8, 0.14, '#b0703a', x, 0.7, 6.45, g);
      box(0.2, 0.55, 0.8, '#5b4a6b', x - 1.1, 0, 6, g); box(0.2, 0.55, 0.8, '#5b4a6b', x + 1.1, 0, 6, g);
      addBox(p.x + x - 1.3, p.z + 5.6, p.x + x + 1.3, p.z + 6.6);
    }
    // tumpukan buku di bangku
    box(0.5, 0.12, 0.35, '#e63946', 7.6, 0.73, 6, g); box(0.5, 0.12, 0.35, '#2f80ed', 7.6, 0.85, 6, g);
    // bunga warna-warni
    const F = ['#ff6fb5', '#ffd166', '#ffffff', '#c77dff', '#ff8a3d'];
    for (let i = 0; i < 70; i++) {
      const a = rnd() * Math.PI * 2, r = 9 + rnd() * 4;
      const x = Math.cos(a) * r, z = Math.sin(a) * r * 0.7;
      if (Math.abs(p.z + z) > 64 || Math.abs(p.x + x) > 64) continue;
      cyl(0.03, 0.03, 0.5, '#4f8f3a', x, 0, z, g, 4);
      const fl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), mat(F[i % F.length]));
      fl.position.set(x, 0.55, z); g.add(fl);
    }
    return 3;
  },
};

// ------------------------------------------------------------------ latar gelap bertanda X (di luar pulau)
export function makeVoid(scene) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const g = cv.getContext('2d');
  g.fillStyle = '#170d12'; g.fillRect(0, 0, 128, 128);
  g.strokeStyle = '#7d3fa0'; g.lineWidth = 6; g.lineCap = 'round';
  g.beginPath(); g.moveTo(54, 54); g.lineTo(74, 74); g.moveTo(74, 54); g.lineTo(54, 74); g.stroke();
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(160, 160);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshBasicMaterial({ map: tex }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = -1.3;
  scene.add(m);
  return m;
}

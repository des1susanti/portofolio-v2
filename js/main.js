// =====================================================================
//  Kampus Mini — portofolio 3D Desi Susanti
//  Layar awal: robot di lingkaran bercahaya, "KLIK UNTUK MULAI".
//  Setelah diklik: musik pembuka, dunia muncul melingkar, huruf DESI SUSANTI berjatuhan.
// =====================================================================
import * as THREE from 'three';
import { FontLoader } from './../vendor/addons/FontLoader.js';
import { TextGeometry } from './../vendor/addons/TextGeometry.js';
import { reveal, patch, mat, wind } from './reveal.js';
import { buildWorld, makeVoid, SPAWN, TRACK, toWorld, FISH_SPOT, READ_SPOT } from './world.js';
import { Robot } from './robot.js';
import { addBody, stepBodies, stepRobot } from './physics.js';
import { LOCATIONS, PROFILE, UI, COLORS, FISH } from './content.js';
import { Animals } from './animals.js';
import { DayNight } from './daynight.js';
import * as ui from './ui.js';
import * as sfx from './audio.js';
import * as admin from './admin.js';
import { Fountain } from './fountain.js';

admin.injectOwnerCSS();
admin.applyOwnerClass();

const $ = (s) => document.querySelector(s);

// ------------------------------------------------------------------ renderer, scene, camera
const canvas = $('#scene');
// ?ringan di alamat = mode ringan untuk perangkat lemah (tanpa bayangan & lampu malam)
const LITE = new URLSearchParams(location.search).has('ringan');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = !LITE;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#170d12');
const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.5, 600);

const hemi = new THREE.HemisphereLight('#ffe9d6', '#7a4f73', 1.15);
scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffd7b0', 1.9);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -36, right: 36, top: 36, bottom: -36, near: 1, far: 120 });
sun.shadow.bias = -0.0006;
sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);

const voidPlane = makeVoid(scene);
reveal.uCenter.value.set(SPAWN.x, SPAWN.z);

// ------------------------------------------------------------------ dunia, robot, hewan, siang-malam
const { world, labelAnchors } = buildWorld(scene);
const spinners = [], buildings = [];
const extras = {};
world.traverse((o) => {
  if (o.userData.spin) spinners.push(o);
  if (o.userData.duck) extras.duck = o.userData.duck;
  if (o.userData.trophy) extras.trophy = o.userData.trophy;
  if (o.userData.locKey) buildings.push(o);
});

let robotColor = COLORS[0].hex;
try { robotColor = localStorage.getItem('kampus-robot') || robotColor; } catch (e) { /* abaikan */ }
const robot = new Robot(robotColor);
robot.place(SPAWN.x, SPAWN.z, 0);
scene.add(robot.group);
ui.setPaintHandler((hex) => {
  robot.setColor(hex);
  try { localStorage.setItem('kampus-robot', hex); } catch (e) { /* abaikan */ }
}, robotColor);

const animals = new Animals(scene, robot);
const fountain = new Fountain(scene, 0, 0);
const dn = new DayNight(scene, hemi, sun, LITE ? 0 : 6);

// lingkaran bercahaya di layar awal
const glowMat = new THREE.MeshBasicMaterial({ color: '#fff1ea', transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false });
const ringWall = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1.2, 96, 1, true), glowMat);
ringWall.position.set(SPAWN.x, -0.6, SPAWN.z);
glowMat.map = (() => {
  const c = document.createElement('canvas'); c.width = 4; c.height = 64;
  const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 64);
  gr.addColorStop(0, 'rgba(255,240,230,1)'); gr.addColorStop(1, 'rgba(255,120,90,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 4, 64);
  return new THREE.CanvasTexture(c);
})();
scene.add(ringWall);

// ------------------------------------------------------------------ pintu gedung
const doors = {};
for (const L of LOCATIONS) {
  if (!L.door) continue;
  const p = toWorld(L.px, L.py);
  const f = L.door.face, w = L.door.w, h = 3.2, dx = L.door.dx || 0;
  const fz = p.z + f * (L.door.d + 0.06);
  const frame = new THREE.Group();
  frame.position.set(p.x + dx, 0, fz);
  scene.add(frame);
  const fm = mat('#3d2b3f');
  for (const sx of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.25, h + 0.2, 0.3), fm); b.position.set(sx * (w / 2 + 0.12), (h + 0.2) / 2, 0); frame.add(b); }
  const top = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 0.25, 0.3), fm); top.position.y = h + 0.2; frame.add(top);
  const dark = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat('#1a1018')); dark.position.set(0, h / 2, -f * 0.05); dark.rotation.y = f > 0 ? 0 : Math.PI; frame.add(dark);
  const hinge = new THREE.Group(); hinge.position.set(-w / 2, 0, f * 0.05); frame.add(hinge);
  const panel = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), mat('#b0703a'));
  panel.geometry.translate(w / 2, h / 2, 0); panel.castShadow = true; hinge.add(panel);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), mat('#f1c40f')); knob.position.set(w - 0.3, h / 2, f * 0.1); hinge.add(knob);
  doors[L.key] = { hinge, open: 0, target: 0, f, front: new THREE.Vector2(p.x + dx, fz), inside: new THREE.Vector2(p.x + dx, fz - f * 1.6) };
}

// ------------------------------------------------------------------ benda yang bisa didorong
function crate(x, z, s = 1.4) {
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), mat('#d9573f'));
  core.castShadow = core.receiveShadow = true;
  g.add(core);
  const edge = mat('#6d5d74');
  const h = s / 2;
  for (const [w, hh, d, px, py, pz] of [
    [s + 0.08, 0.16, 0.16, 0, h, h], [s + 0.08, 0.16, 0.16, 0, -h, h], [s + 0.08, 0.16, 0.16, 0, h, -h], [s + 0.08, 0.16, 0.16, 0, -h, -h],
    [0.16, s, 0.16, h, 0, h], [0.16, s, 0.16, -h, 0, h], [0.16, s, 0.16, h, 0, -h], [0.16, s, 0.16, -h, 0, -h]]) {
    const e = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), edge); e.position.set(px, py, pz); e.castShadow = true; g.add(e);
  }
  g.position.set(x, h, z);
  g.rotation.y = Math.random() * 1.5;
  scene.add(g);
  return addBody(g, { r: s * 0.62, mass: 1.2, bounce: 0.2, drag: 3.5, ground: h, pop: true });
}
crate(SPAWN.x + 9.5, SPAWN.z - 0.5); crate(SPAWN.x + 11.1, SPAWN.z + 0.2); crate(SPAWN.x + 10.2, SPAWN.z + 1.9);
for (const [px, py] of [[1000, 1240], [560, 715], [1300, 820], [640, 330], [1240, 480], [330, 1260]]) {
  const p = toWorld(px, py); crate(p.x, p.z, 1.1 + Math.random() * 0.5);
}
const ballMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), mat('#ffffff', { flatShading: true }));
ballMesh.castShadow = true;
ballMesh.position.set(TRACK.x, 0.7, TRACK.z);
scene.add(ballMesh);
const ball = addBody(ballMesh, { r: 0.7, mass: 0.45, bounce: 0.75, drag: 0.9, ground: 0.7, roll: true, kick: 1.7, pop: true });
for (const [dx, dz] of [[-8, -6], [-5, -6], [6, 6], [9, 6], [-16, 3]]) {
  const c = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.1, 10), mat('#ff7a1a'));
  c.position.set(TRACK.x + dx, 0.55, TRACK.z + dz); c.castShadow = true; scene.add(c);
  addBody(c, { r: 0.42, mass: 0.3, bounce: 0.4, drag: 4, ground: 0.55, pop: true });
}

// permata tersembunyi
const gemPos = toWorld(905, 1395);
const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.6), mat('#7ff5ff', { emissive: '#36d6ff', emissiveIntensity: 1.2 }));
gem.position.set(gemPos.x, 1.2, gemPos.z);
scene.add(gem);
let gemFound = false;
try { gemFound = localStorage.getItem('kampus-gem') === '1'; } catch (e) { /* abaikan */ }

// ------------------------------------------------------------------ penanda ◆
function makeMarker(x, z, color = '#ffffff', icon = null) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.9, 2.2, 40), mat(color, { transparent: true, opacity: 0.55 }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.12;
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.9, 40), mat(color, { transparent: true, opacity: 0.12 }));
  disc.rotation.x = -Math.PI / 2; disc.position.y = 0.11;
  const dia = new THREE.Group();
  const out = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), patch(new THREE.MeshBasicMaterial({ color: '#1b1b2b' })));
  const inn = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.82), patch(new THREE.MeshBasicMaterial({ color })));
  out.rotation.z = inn.rotation.z = Math.PI / 4;
  inn.position.z = 0.01;
  dia.add(out, inn);
  if (icon) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g2 = c.getContext('2d'); g2.font = '80px serif'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.fillText(icon, 64, 70);
    const tex = new THREE.CanvasTexture(c);
    const ic = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), patch(new THREE.MeshBasicMaterial({ map: tex, transparent: true })));
    ic.position.z = 0.02; dia.add(ic);
  }
  dia.position.y = 2.6;
  g.add(ring, disc, dia);
  scene.add(g);
  return { g, dia, ring, disc, x, z, inside: false, t: 0 };
}
const markers = LOCATIONS.map((L) => {
  const p = toWorld(L.mx, L.my);
  return { ...makeMarker(p.x, p.z), L };
});
const fishMarker = { ...makeMarker(FISH_SPOT.x, FISH_SPOT.z, '#ffd166', '🎣'), act: 'fish' };
const readMarker = { ...makeMarker(READ_SPOT.x, READ_SPOT.z, '#ffd166', '📚'), act: 'read' };
fishMarker.ring.scale.setScalar(0.6); fishMarker.disc.scale.setScalar(0.6);
readMarker.ring.scale.setScalar(0.6); readMarker.disc.scale.setScalar(0.6);
const allMarkers = [...markers, fishMarker, readMarker];

// ------------------------------------------------------------------ huruf DESI SUSANTI
const letters = [];
new FontLoader().load('fonts/helvetiker_bold.typeface.json', (font) => {
  const size = 1.7, depth = 0.7, gap = 0.3, space = 1.0;
  const lmat = mat('#f6d6e8');
  const items = [];
  for (const ch of PROFILE.name) {
    if (ch === ' ') { items.push(null); continue; }
    const geo = new TextGeometry(ch, { font, size, height: depth, curveSegments: 5, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 2 });
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    const w = bb.max.x - bb.min.x, h = bb.max.y - bb.min.y;
    geo.translate(-(bb.min.x + w / 2), -(bb.min.y + h / 2), -depth / 2);
    items.push({ geo, w, h });
  }
  const total = items.reduce((s, it) => s + (it ? it.w + gap : space), -gap);
  let x = SPAWN.x - total / 2;
  const z0 = SPAWN.z + 6.2;
  items.forEach((it, i) => {
    if (!it) { x += space; return; }
    const m = new THREE.Mesh(it.geo, lmat);
    m.castShadow = m.receiveShadow = true;
    const z = z0 + (x - SPAWN.x) * 0.06;              // sedikit melengkung
    m.position.set(x + it.w / 2, it.h / 2, z);
    scene.add(m);
    const b = addBody(m, { r: Math.max(0.55, it.w * 0.5), mass: 1.6, bounce: 0.25, drag: 4, ground: it.h / 2, pop: true });
    b.rot = -0.06;
    b.y = 30 + i * 2.2; m.position.y = b.y;
    letters.push(b);
    x += it.w + gap;
  });
  $('#loading').textContent = '';
});

// ------------------------------------------------------------------ keadaan robot
// walk: bebas | enter/exit: animasi masuk-keluar gedung | inside: papan terbuka | fish | read
const S = { mode: 'walk', t: 0, door: null, loc: null, from: new THREE.Vector2(), to: new THREE.Vector2(), marker: null };

function enterLocation(m) {
  const L = m.L;
  ui.notify && document.querySelector('#notifs') && (document.querySelector('#notifs').innerHTML = '');
  const d = doors[L.key];
  S.loc = L; S.marker = m;
  if (!d) {
    S.mode = 'inside';
    ui.openBoard(L, () => { S.mode = 'walk'; m.inside = true; });
    return;
  }
  S.mode = 'enter'; S.t = 0; S.door = d;
  S.from.copy(robot.pos); S.to.copy(d.inside);
  d.target = 1;
  sfx.door();
}
function exitLocation() {
  const d = S.door;
  S.mode = 'exit'; S.t = 0;
  S.from.copy(d.inside);
  S.to.set(S.marker.x, S.marker.z + d.f * 1.4);
  robot.group.visible = true;
  sfx.door();
}

let fish = null;
function startFishing() {
  S.mode = 'fish';
  robot.place(FISH_SPOT.x, FISH_SPOT.z, FISH_SPOT.heading);
  robot.setMode('fish');
  fish = { phase: 'cast', t: 0, wait: 0, count: +(localStorage.getItem('kampus-fish') || 0) };
  bobber.visible = line.visible = true;
  updateFishBar();
}
function updateFishBar(msg) {
  ui.activityBar(`🎣 ${ui.t(UI.fishing)} · ${ui.t(UI.fishCount)}: <b>${fish.count}</b>${msg ? ' · ' + msg : ''}`);
}
function stopActivity() {
  if (S.mode === 'fish') { bobber.visible = line.visible = false; fish = null; robot.place(FISH_SPOT.x - 1.6, FISH_SPOT.z, -Math.PI / 2); }
  if (S.mode === 'read') { ui.closeBoard(); robot.place(READ_SPOT.x, READ_SPOT.z - 1.6, Math.PI); }
  robot.setMode(null);
  robot.group.position.y = 0;
  ui.activityBar(null);
  S.mode = 'walk';
  fishMarker.inside = readMarker.inside = true;
}
function startReading() {
  S.mode = 'read';
  robot.place(READ_SPOT.x, READ_SPOT.z + 1.15, READ_SPOT.heading);
  robot.setMode('read');
  ui.openBooks(() => { S.mode = 'read'; stopActivity(); });
}

// pelampung & senar pancing
const bobber = new THREE.Group();
const bTop = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat('#e63946'));
const bBot = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat('#ffffff'));
bobber.add(bTop, bBot);
bobber.visible = false;
scene.add(bobber);
const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.8 }));
line.visible = false;
line.frustumCulled = false;
scene.add(line);
const tipPos = new THREE.Vector3();
const bobberHome = new THREE.Vector3(FISH_SPOT.x + 5.2, 0.1, FISH_SPOT.z + 0.4);

function fishAction() {
  if (!fish) return;
  if (fish.phase === 'bite') {
    const total = FISH.reduce((s, f) => s + f.w, 0);
    let r = Math.random() * total, got = FISH[0];
    for (const f of FISH) { r -= f.w; if (r <= 0) { got = f; break; } }
    fish.count++;
    try { localStorage.setItem('kampus-fish', fish.count); } catch (e) { /* abaikan */ }
    ui.toast(`${got.e} ${ui.t(UI.fishGot)} ${ui.getLang() === 'id' ? got.id : got.en}!`, 2200);
    sfx.goal(); sfx.splash();
    fish.phase = 'reel'; fish.t = 0;
    updateFishBar();
  } else if (fish.phase === 'wait') {
    fish.phase = 'reel'; fish.t = 0;
  }
}

// ------------------------------------------------------------------ input
const keys = new Set();
addEventListener('keydown', (e) => {
  if (!started) { if (e.key === 'Enter' || e.key === ' ') start(); return; }
  if (ui.isEditing()) return;
  const k = e.key.toLowerCase();
  if (ui.boardOpen()) {
    if (k === 'arrowright') ui.boardStep(1);
    else if (k === 'arrowleft') ui.boardStep(-1);
    else if (k === 'enter') ui.boardOpenLink();
    else if (k === 'escape') ui.exitBoard();
    return;
  }
  if (S.mode === 'fish') {
    if (k === ' ' || k === 'enter') { e.preventDefault(); fishAction(); }
    if (k === 'escape') stopActivity();
    return;
  }
  keys.add(k);
  if (k === 'escape') ui.closeMap();
  if (k === 'm') toggleMap();
  if (k === 'n') toggleNight();
});
// kamera: putar (yaw), zoom, geser (pan, dalam arah layar)
let camYaw = 0, camYawT = 0;
const rotXZ = (x, z, a) => [x * Math.cos(a) + z * Math.sin(a), -x * Math.sin(a) + z * Math.cos(a)];
const BASE_YAW = Math.atan2(7, 24);
function cameraBehindRobot() { camYawT = robot.heading + Math.PI - BASE_YAW; pan.set(0, 0); }
addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
addEventListener('blur', () => keys.clear());
function readInput() {
  let x = 0, z = 0;
  if (keys.has('a') || keys.has('arrowleft')) x -= 1;
  if (keys.has('d') || keys.has('arrowright')) x += 1;
  if (keys.has('w') || keys.has('arrowup')) z -= 1;
  if (keys.has('s') || keys.has('arrowdown')) z += 1;
  if (ui.joy.active) { x = ui.joy.x; z = ui.joy.z; }
  const l = Math.hypot(x, z);
  if (l > 1) { x /= l; z /= l; }
  [x, z] = rotXZ(x, z, camYaw);   // arah jalan mengikuti arah kamera
  return { x, z, run: keys.has('shift') || (ui.joy.active && l > 0.95) };
}

// geser pandangan (seret) & zoom (gulir); klik gedung = notifikasi
const pan = new THREE.Vector2();
let zoom = 1, drag = null;
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('pointerdown', (e) => {
  if (!started) return;
  // klik kanan / Ctrl / Alt + seret = putar kamera; seret biasa = geser
  const rotate = e.button === 2 || e.ctrlKey || e.altKey;
  drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: false, id: e.pointerId, rotate };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) { drag.moved = true; canvas.classList.add('grab'); }
  if (drag.moved && drag.rotate) {
    camYawT -= dx * 0.006;
  } else if (drag.moved) {
    const k = (32 * zoom) / innerHeight;
    pan.x = THREE.MathUtils.clamp(pan.x - dx * k, -40, 40);
    pan.y = THREE.MathUtils.clamp(pan.y - dy * k * 1.3, -40, 40);
  }
  drag.x = e.clientX; drag.y = e.clientY;
});
canvas.addEventListener('pointerup', (e) => {
  canvas.classList.remove('grab');
  if (drag && !drag.moved && !drag.rotate) clickWorld(e);
  drag = null;
});
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  zoom = THREE.MathUtils.clamp(zoom * Math.exp(e.deltaY * (e.ctrlKey ? 0.01 : 0.0012)), 0.35, 2.2);
}, { passive: false });

const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function clickWorld(e) {
  if (S.mode === 'fish') { fishAction(); return; }
  if (S.mode !== 'walk') return;
  ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(buildings, true)[0];
  if (!hit) return;
  let o = hit.object;
  while (o && !o.userData.locKey) o = o.parent;
  const L = o && LOCATIONS.find((x) => x.key === o.userData.locKey);
  if (L) ui.notify(L);
}

// ------------------------------------------------------------------ tombol
ui.buildLabels();
ui.setupBoard();
ui.setupJoystick();
ui.loadEdits();
const soundIcon = () => document.body.classList.toggle('muted-sound', sfx.isMuted());
soundIcon();
function toggleNight() { dn.toggle(); document.body.classList.toggle('night', dn.isNight()); }
$('#sound-btn').addEventListener('click', (e) => { e.stopPropagation(); sfx.setMuted(!sfx.isMuted()); soundIcon(); });
$('#btn-sound').addEventListener('click', () => { sfx.startAudio(); sfx.setMuted(!sfx.isMuted()); soundIcon(); });
$('#btn-lang').addEventListener('click', () => ui.toggleLang());
$('#btn-paint').addEventListener('click', () => { if (S.mode === 'walk') { S.mode = 'inside'; ui.openPaint(() => { S.mode = 'walk'; }); } });
$('#btn-map').addEventListener('click', () => toggleMap());
$('#btn-daynight').addEventListener('click', () => toggleNight());
$('#btn-menu').addEventListener('click', () => $('#menu').classList.toggle('hidden'));
// pintu masuk pemilik: roda gigi samar di pojok kiri atas (pengunjung cukup klik MULAI)
admin.mountGear(() => { admin.applyOwnerClass(); ui.loadEdits(); });
// tombol kamera
$('#cam-l').addEventListener('click', () => (camYawT += Math.PI / 4));
$('#cam-r').addEventListener('click', () => (camYawT -= Math.PI / 4));
$('#cam-in').addEventListener('click', () => (zoom = Math.max(0.35, zoom / 1.25)));
$('#cam-out').addEventListener('click', () => (zoom = Math.min(2.2, zoom * 1.25)));
$('#cam-reset').addEventListener('click', () => cameraBehindRobot());
document.querySelectorAll('#camctl [data-t]').forEach((b) => (b.title = ui.t(UI[b.dataset.t])));
$('#map .panel-close').addEventListener('click', () => ui.closeMap());
$('#map').addEventListener('click', (e) => { if (e.target.id === 'map') ui.closeMap(); });
$('#activity .act-exit').addEventListener('click', () => stopActivity());

// ------------------------------------------------------------------ peta (gambar img/peta.svg + daftar lokasi)
function toggleMap() {
  if (ui.mapOpen()) { ui.closeMap(); return; }
  if (S.mode !== 'walk') return;
  ui.openMap(robot.pos, (L, x, z) => {
    const d = doors[L.key];
    robot.place(x, z + (d ? d.f * 1.0 : 0), d ? (d.f > 0 ? Math.PI : 0) : 0);
    pan.set(0, 0);
    allMarkers.forEach((m) => { m.inside = false; m.t = 0; });
  });
}

// ------------------------------------------------------------------ mulai
let started = false;
let startT = 0;
const camOffIntro = new THREE.Vector3(10, 9, 15.5);
const camOffPlay = new THREE.Vector3(7, 22, 24);
const camOffIn = new THREE.Vector3(3, 9, 13);
const camOff = camOffIntro.clone();
const camLook = new THREE.Vector3(SPAWN.x, 1.4, SPAWN.z);

function start() {
  if (started || !letters.length) return;
  started = true;
  startT = clock.elapsedTime;
  sfx.startAudio();
  sfx.introMusic();
  $('#intro').classList.add('gone');
  setTimeout(() => $('#intro').classList.add('hidden'), 900);
  $('#hud').classList.remove('hidden');
  $('#camctl').classList.remove('hidden');
  letters.forEach((b, i) => { b.y = 18 + i * 1.3; b.vy = 0; });
  setTimeout(() => ui.toast(ui.t(UI.hintWalk), 3200, true), 2800);
}
$('#intro').addEventListener('click', start);

// ------------------------------------------------------------------ permainan kecil
let goalLock = 0;
function checkGoal(now) {
  if (now < goalLock) return;
  const dx = ball.x - TRACK.x, dz = ball.z - TRACK.z;
  if (Math.abs(dz) < 2.3 && Math.abs(dx) > 13.6 && Math.abs(dx) < 15.2) {
    goalLock = now + 2.5;
    ui.toast(ui.t(UI.goal));
    sfx.goal();
    setTimeout(() => { ball.x = TRACK.x; ball.z = TRACK.z; ball.vx = ball.vz = 0; ball.y = 6; ball.vy = 0; }, 1300);
  }
}
const lap = { running: false, t0: 0, seen: new Set(), off: 0, best: null };
try { lap.best = parseFloat(localStorage.getItem('kampus-lap')) || null; } catch (e) { /* abaikan */ }
function checkLap(now, dt) {
  const dx = (robot.pos.x - TRACK.x) / TRACK.rx, dz = (robot.pos.y - TRACK.z) / TRACK.rz;
  const e = Math.hypot(dx, dz);
  const on = e > 0.9 && e < 1 + TRACK.w / TRACK.rz + 0.15;
  const a = Math.atan2(dz, dx);
  const q = Math.floor((((a + Math.PI / 2 + Math.PI / 4) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / (Math.PI / 2));
  if (lap.running) {
    lap.off = on ? 0 : lap.off + dt;
    if (lap.off > 3) { lap.running = false; ui.lapTimer(null); return; }
    ui.lapTimer(`${ui.t(UI.lap)} ${(now - lap.t0).toFixed(2)} s` + (lap.best ? ` · ${ui.t(UI.best)} ${lap.best.toFixed(2)} s` : ''));
  }
  if (!on) return;
  if (q === 0) {
    if (lap.running && lap.seen.size >= 3) {
      const tm = now - lap.t0;
      if (!lap.best || tm < lap.best) { lap.best = tm; try { localStorage.setItem('kampus-lap', String(tm)); } catch (e) { /* abaikan */ } }
      ui.toast(`${tm.toFixed(2)} s!`);
      sfx.goal();
    }
    if (!lap.running || lap.seen.size >= 3) { lap.running = true; lap.t0 = now; lap.seen.clear(); }
  } else if (lap.running) lap.seen.add(q);
}

// ------------------------------------------------------------------ putaran utama
const clock = new THREE.Clock();
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const camTarget = new THREE.Vector3();
const offNow = new THREE.Vector3();
let meowCD = 0;

function tick() {
  const dt = Math.min(0.05, clock.getDelta());
  const now = clock.elapsedTime;
  wind.uTime.value = now;

  if (!started) {
    robot.idle(now);
    robot.wave(now);
    reveal.uReveal.value = 6.5;
    camTarget.set(SPAWN.x, 1.4, SPAWN.z);
    offNow.copy(camOffIntro);
  } else {
    const k = Math.min(1, (now - startT) / 3.2);
    reveal.uReveal.value = 6.5 + ease(k) * 190;
    ringWall.visible = k < 1;
    glowMat.opacity = 0.9 * (1 - k);
    const kc = ease(Math.min(1, (now - startT) / 2.4));

    if (S.mode === 'walk') {
      const frozen = ui.mapOpen() || ui.boardOpen();
      const inp = frozen ? { x: 0, z: 0, run: false } : readInput();
      if (inp.x || inp.z) pan.multiplyScalar(Math.exp(-dt * 3));
      const speed = robot.update(dt, inp, inp.run);
      const { bump } = stepRobot(robot);
      robot.sync();
      if (speed > 1) sfx.step(speed, dt);
      if (bump > 3) sfx.bump(bump);
      checkLap(now, dt);
      // masuk penanda
      for (const m of allMarkers) {
        const inside = Math.hypot(robot.pos.x - m.x, robot.pos.y - m.z) < (m.act ? 1.3 : 2.0);
        m.ring.material.opacity = inside ? 1 : 0.55;
        if (inside && !m.inside) {
          m.t += dt;
          if (m.t > 0.2 && !frozen) {
            m.inside = true;
            if (m.act === 'fish') startFishing();
            else if (m.act === 'read') startReading();
            else enterLocation(m);
            break;
          }
        }
        if (!inside) { m.inside = false; m.t = 0; }
      }
      if (!gemFound && Math.hypot(robot.pos.x - gem.position.x, robot.pos.y - gem.position.z) < 1.6) {
        gemFound = true;
        try { localStorage.setItem('kampus-gem', '1'); } catch (e) { /* abaikan */ }
        ui.toast(ui.t(UI.gem), 2600);
        sfx.sparkle();
      }
    } else if (S.mode === 'enter' || S.mode === 'exit') {
      S.t += dt;
      const dur = 1.1;
      const u = Math.min(1, S.t / dur);
      const e2 = ease(u);
      robot.pos.lerpVectors(S.from, S.to, e2);
      const dir = new THREE.Vector2().subVectors(S.to, S.from);
      robot.heading = Math.atan2(dir.x, dir.y);
      robot.update(0, { x: 0, z: 0 }, false);
      robot.phase += dt * 9;
      const sw = Math.sin(robot.phase) * 0.7;
      robot.legL.rotation.x = sw; robot.legR.rotation.x = -sw;
      robot.sync();
      const sc = S.mode === 'enter' ? 1 - 0.35 * e2 : 0.65 + 0.35 * e2;
      robot.group.scale.setScalar(sc);
      if (S.mode === 'enter' && u >= 1) {
        robot.group.visible = false;
        S.mode = 'inside';
        ui.openBoard(S.loc, () => exitLocation());
      }
      if (S.mode === 'exit' && u >= 1) {
        robot.group.scale.setScalar(1);
        S.door.target = 0;
        S.mode = 'walk';
        S.marker.inside = true;
      }
    } else if (S.mode === 'fish') {
      robot.posed(now, fish && fish.phase === 'reel' ? Math.max(0, 1 - fish.t * 2) : 0);
      fish.t += dt;
      robot.rodTip.getWorldPosition(tipPos);
      if (fish.phase === 'cast') {
        const u = Math.min(1, fish.t / 0.7);
        bobber.position.lerpVectors(tipPos, bobberHome, u);
        bobber.position.y += Math.sin(u * Math.PI) * 2;
        if (u >= 1) { fish.phase = 'wait'; fish.t = 0; fish.wait = 2 + Math.random() * 4; sfx.splash(); updateFishBar(ui.t(UI.fishWait)); }
      } else if (fish.phase === 'wait') {
        bobber.position.copy(bobberHome); bobber.position.y = 0.1 + Math.sin(now * 2) * 0.04;
        if (fish.t > fish.wait) { fish.phase = 'bite'; fish.t = 0; updateFishBar(`<span class="bite">${ui.t(UI.fishBite)}</span>`); sfx.notif(); }
      } else if (fish.phase === 'bite') {
        bobber.position.copy(bobberHome); bobber.position.y = -0.05 + Math.sin(now * 25) * 0.12;
        if (fish.t > 1.3) { ui.toast(ui.t(UI.fishMiss), 1400, true); fish.phase = 'reel'; fish.t = 0; updateFishBar(); }
      } else if (fish.phase === 'reel') {
        const u = Math.min(1, fish.t / 0.6);
        bobber.position.lerpVectors(bobberHome, tipPos, u);
        if (u >= 1) { fish.phase = 'cast'; fish.t = 0; }
      }
      const pts = lineGeo.attributes.position.array;
      pts[0] = tipPos.x; pts[1] = tipPos.y; pts[2] = tipPos.z;
      pts[3] = bobber.position.x; pts[4] = bobber.position.y + 0.15; pts[5] = bobber.position.z;
      lineGeo.attributes.position.needsUpdate = true;
    } else if (S.mode === 'read') {
      robot.posed(now);
      robot.group.position.y = 0.32;
    } else {
      robot.idle(now);
    }
    stepBodies(dt, (b, v) => sfx.bump(v * 0.5));
    checkGoal(now);

    // kamera: ikuti robot, atau mendekat ke pintu saat masuk gedung
    const inBuilding = (S.mode === 'enter' || S.mode === 'inside' || S.mode === 'exit') && S.door;
    if (inBuilding) {
      camTarget.set(S.door.front.x, 2, S.door.front.y);
      const inOff = camOffIn.clone();
      if (S.door.f < 0) { inOff.z = -inOff.z; inOff.x = -inOff.x; }   // pintu di sisi belakang: kamera pindah ke belakang gedung
      offNow.lerp(inOff, 1 - Math.exp(-dt * 3));
    } else {
      if (keys.has('q')) camYawT += dt * 1.6;
      if (keys.has('e')) camYawT -= dt * 1.6;
      camYaw += (camYawT - camYaw) * (1 - Math.exp(-dt * 8));
      const [px, pz] = rotXZ(pan.x, pan.y + 1.5, camYaw);
      camTarget.set(robot.pos.x + px, 1.4, robot.pos.y + pz);
      const want = new THREE.Vector3().lerpVectors(camOffIntro, camOffPlay, kc).multiplyScalar(zoom);
      const [ox, oz] = rotXZ(want.x, want.z, camYaw);
      want.x = ox; want.z = oz;
      offNow.lerp(want, 1 - Math.exp(-dt * (kc < 1 ? 20 : 4)));
    }
  }
  ringWall.scale.set(reveal.uReveal.value, 1, reveal.uReveal.value);

  // pintu
  for (const d of Object.values(doors)) {
    d.open += (d.target - d.open) * (1 - Math.exp(-dt * 6));
    d.hinge.rotation.y = -d.f * d.open * 1.75;
  }
  // animasi kecil
  for (const m of allMarkers) {
    m.dia.position.y = 2.6 + Math.sin(now * 2 + m.x) * 0.2;
    m.dia.quaternion.copy(camera.quaternion);
    m.g.visible = !(S.mode === 'fish' && m === fishMarker) && !(S.mode === 'read' && m === readMarker);
  }
  for (const s of spinners) s.rotation.y += dt * 0.6;
  if (extras.trophy) extras.trophy.rotation.y += dt * 0.8;
  if (extras.duck) { extras.duck.position.y = 0.2 + Math.sin(now * 1.5) * 0.08; extras.duck.rotation.z = Math.sin(now * 1.2) * 0.05; }
  fountain.update(dt, now);
  gem.rotation.y += dt * 2;
  gem.position.y = 1.2 + Math.sin(now * 3) * 0.15;
  gem.visible = !gemFound;

  // hewan & siang-malam
  const night = dn.update(dt, camLook);
  voidPlane.material.color.setScalar(1 - night * 0.6);
  animals.update(dt, now, night);
  meowCD -= dt;
  if (started && meowCD < 0) {
    for (const c of animals.cats) if (Math.hypot(c.x - robot.pos.x, c.z - robot.pos.y) < 3.2) { sfx.meow(); meowCD = 6; break; }
  }

  camLook.lerp(camTarget, 1 - Math.exp(-6 * dt));
  camera.position.copy(camLook).add(offNow);
  camera.lookAt(camLook);
  sun.position.set(camLook.x - 16, 30, camLook.z + 10);
  sun.target.position.copy(camLook);

  ui.updateLabels(camera, labelAnchors, robot.pos, !started || ui.mapOpen() || S.mode !== 'walk');
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// untuk uji otomatis
window.__kampus = { cameraBehindRobot, get camYaw() { return camYaw; }, start, robot, markers, allMarkers, toggleMap, toggleNight, ui, S, dn, startFishing, startReading, fishAction, get started() { return started; } };

// Suara dibuat langsung dengan Web Audio (tanpa file): angin, burung, langkah, benturan.
let ctx = null, master = null, muted = false, windGain = null;
try { muted = localStorage.getItem('kampus-muted') === '1'; } catch (e) { /* abaikan */ }

export function isMuted() { return muted; }

export function startAudio() {
  if (ctx) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) { return; }
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 0.6;
  master.connect(ctx.destination);
  // angin: derau putih yang disaring
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
  windGain = ctx.createGain(); windGain.gain.value = 0.03;
  src.connect(lp); lp.connect(windGain); windGain.connect(master);
  src.start();
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08;
  const lfoG = ctx.createGain(); lfoG.gain.value = 180;
  lfo.connect(lfoG); lfoG.connect(lp.frequency); lfo.start();
  // kicau burung sesekali
  const bird = () => {
    if (!ctx) return;
    if (!muted) chirp();
    setTimeout(bird, 3000 + Math.random() * 6000);
  };
  setTimeout(bird, 2500);
}

export function setMuted(m) {
  muted = m;
  try { localStorage.setItem('kampus-muted', m ? '1' : '0'); } catch (e) { /* abaikan */ }
  if (master) master.gain.setTargetAtTime(m ? 0 : 0.6, ctx.currentTime, 0.1);
  if (intro) { if (m) intro.pause(); else if (musicOn) playMusic(false); }
}

function tone(freq, dur, type = 'sine', vol = 0.2, slide = 0) {
  if (!ctx || muted) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
  const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
}

function chirp() {
  const base = 2200 + Math.random() * 1500;
  for (let i = 0; i < 3; i++) setTimeout(() => tone(base, 0.09, 'sine', 0.05, 900), i * 120);
}

let stepT = 0;
export function step(speed, dt) {
  stepT += dt * speed * 0.35;
  if (stepT > 1) { stepT = 0; tone(140 + Math.random() * 40, 0.06, 'triangle', 0.05, -60); }
}
export const bump = (v) => tone(110, 0.15, 'square', Math.min(0.12, v * 0.015), -50);
export const pop = () => tone(660, 0.12, 'sine', 0.12, 300);
export const goal = () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.25, 'triangle', 0.15), i * 110));
export const sparkle = () => [1200, 1600, 2000, 2400].forEach((f, i) => setTimeout(() => tone(f, 0.2, 'sine', 0.1), i * 70));

// ------------------------------------------------------------------ musik latar ceria
// File audio/pembuka.mp3 dimuat sejak awal dan diputar LANGSUNG di dalam klik "mulai"
// (Safari/Chrome hanya mengizinkan suara yang dimulai oleh klik), lalu berulang terus sebagai musik latar.
// Tombol suara 🔊 mematikan / menyalakan lagi.
const intro = typeof Audio !== 'undefined' ? new Audio('audio/pembuka.mp3') : null;
let musicOn = false;
if (intro) { intro.preload = 'auto'; intro.loop = true; intro.volume = 0.6; }
function playMusic(fromStart) {
  if (!intro || muted) return;
  if (fromStart) { try { intro.currentTime = 0; } catch (e) { /* abaikan */ } }
  const p = intro.play();
  if (p && p.catch) p.catch((e) => console.warn('Musik tidak bisa diputar:', e));
}
export function introMusic() {
  if (ctx && ctx.state === 'suspended') ctx.resume();
  musicOn = true;
  playMusic(true);
}
export function musicPlaying() { return !!intro && !intro.paused; }
export function stopIntro() { musicOn = false; if (intro) intro.pause(); }
export const door = () => { tone(300, 0.25, 'triangle', 0.08, -120); setTimeout(() => tone(200, 0.2, 'triangle', 0.06, -60), 120); };
export const splash = () => tone(500, 0.25, 'sine', 0.12, -380);
export const notif = () => tone(880, 0.08, 'sine', 0.08, 220);
export const meow = () => tone(700, 0.35, 'sawtooth', 0.025, -300);

// =====================================================================
//  MODE PEMILIK
//  Hanya pemilik yang bisa mengedit teks, menulis/menghapus blog, dan mengunggah foto.
//  Caranya: pemilik masuk lewat roda gigi samar di pojok kiri atas (email + kata sandi).
//  Di baliknya ada GitHub token (fine-grained) yang hanya berhak menulis ke repo situs ini. Perubahan langsung disimpan (commit) ke GitHub,
//  lalu GitHub Pages memperbarui situs dalam ±1 menit.
//  Pengunjung tidak punya token, jadi tombol edit tidak muncul dan mereka tidak
//  bisa mengubah apa pun (GitHub menolak penulisan tanpa token yang sah).
// =====================================================================
import { CONFIG } from './content.js';

const KEY = 'kampus-owner-token';
const API = 'https://api.github.com';
let token = null;
try { token = localStorage.getItem(KEY); } catch (e) { /* abaikan */ }

export const isOwner = () => !!token;

function headers() {
  return { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
}
const repoURL = (path) => `${API}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path.split('/').map(encodeURIComponent).join('/')}`;

/** Masuk: cek token benar & punya izin menulis ke repo situs. */
export async function login(tk) {
  const r = await fetch(`${API}/repos/${CONFIG.owner}/${CONFIG.repo}`, {
    headers: { Authorization: `Bearer ${tk}`, Accept: 'application/vnd.github+json' },
  });
  if (r.status === 401) throw new Error('Token tidak valid atau sudah kedaluwarsa.');
  if (r.status === 404) throw new Error(`Repo ${CONFIG.owner}/${CONFIG.repo} tidak ditemukan atau token tidak punya akses ke repo itu.`);
  if (!r.ok) throw new Error(`GitHub menolak (${r.status}).`);
  const info = await r.json();
  if (!info.permissions || !info.permissions.push) throw new Error('Token ini tidak punya izin menulis (Contents: Read and write).');
  token = tk;
  try { localStorage.setItem(KEY, tk); } catch (e) { /* abaikan */ }
  return true;
}
export function logout() {
  token = null;
  try { localStorage.removeItem(KEY); } catch (e) { /* abaikan */ }
}

// ------------------------------------------------------------------ baca & tulis file di repo
const enc = (str) => {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};
const dec = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\n/g, '')), (c) => c.charCodeAt(0)));

async function getMeta(path) {
  const r = await fetch(`${repoURL(path)}?ref=${CONFIG.branch}`, { headers: headers(), cache: 'no-store' });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Gagal membaca ${path} (${r.status})`);
  return r.json();
}

/** Baca file teks. Pemilik membaca langsung dari GitHub (selalu terbaru); pengunjung dari situs. */
export async function readText(path) {
  if (token) {
    try {
      const m = await getMeta(path);
      if (m) return dec(m.content);
      return null;
    } catch (e) { /* jatuh ke file situs */ }
  }
  const r = await fetch(path, { cache: 'no-store' });
  return r.ok ? r.text() : null;
}
export async function readJSON(path, fallback) {
  try { const t = await readText(path); return t ? JSON.parse(t) : fallback; } catch (e) { return fallback; }
}

async function put(path, b64, message) {
  if (!token) throw new Error('Hanya pemilik yang bisa menyimpan.');
  const m = await getMeta(path);
  const r = await fetch(repoURL(path), {
    method: 'PUT', headers: headers(),
    body: JSON.stringify({ message, content: b64, branch: CONFIG.branch, ...(m ? { sha: m.sha } : {}) }),
  });
  if (!r.ok) throw new Error(`Gagal menyimpan ${path} (${r.status})`);
  return r.json();
}
export const writeText = (path, text, message) => put(path, enc(text), message || `Ubah ${path}`);
export const writeJSON = (path, obj, message) => writeText(path, JSON.stringify(obj, null, 2) + '\n', message);

export async function deleteFile(path, message) {
  if (!token) throw new Error('Hanya pemilik yang bisa menghapus.');
  const m = await getMeta(path);
  if (!m) return;
  const r = await fetch(repoURL(path), {
    method: 'DELETE', headers: headers(),
    body: JSON.stringify({ message: message || `Hapus ${path}`, sha: m.sha, branch: CONFIG.branch }),
  });
  if (!r.ok) throw new Error(`Gagal menghapus ${path} (${r.status})`);
}

/** Unggah foto: diperkecil dulu (lebar maks 1600 px, JPEG) lalu disimpan di img/unggah/. Mengembalikan path-nya. */
export async function uploadImage(file, folder = 'img/unggah') {
  const url = URL.createObjectURL(file);
  const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('Berkas bukan gambar yang bisa dibaca.')); i.src = url; });
  const s = Math.min(1, 1600 / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  const b64 = c.toDataURL('image/jpeg', 0.85).split(',')[1];
  const base = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'foto';
  const path = `${folder}/${base}-${Date.now().toString(36)}.jpg`;
  await put(path, b64, `Unggah foto ${path}`);
  return { path, dataURL: c.toDataURL('image/jpeg', 0.85) };
}

// ------------------------------------------------------------------ data bersama
// data/edits.json berisi teks yang diubah pemilik:  { "beranda:0": { "id": {title, text}, "en": {...} }, "about-photos": [...], "books": [...] }
let editsCache = null;
export async function loadEdits(force) {
  if (!editsCache || force) editsCache = await readJSON('data/edits.json', {});
  return editsCache;
}
export async function saveEdit(key, value, message) {
  const all = await readJSON('data/edits.json', {});
  if (value === undefined) delete all[key]; else all[key] = value;
  await writeJSON('data/edits.json', all, message || `Edit ${key}`);
  editsCache = all;
  return all;
}

// tulisan blog
export async function loadPosts() {
  const list = await readJSON('posts/index.json', []);
  return token ? list : list.filter((p) => !p.draft);
}
export async function savePost(entry, body, oldFile) {
  const list = await readJSON('posts/index.json', []);
  await writeText(`posts/${entry.file}`, body, `Blog: ${entry.title.id}`);
  if (oldFile && oldFile !== entry.file) await deleteFile(`posts/${oldFile}`, `Pindah tulisan ${oldFile}`);
  const i = list.findIndex((p) => p.file === (oldFile || entry.file));
  if (i >= 0) list[i] = entry; else list.unshift(entry);
  await writeJSON('posts/index.json', list, `Daftar blog: ${entry.title.id}`);
}
export async function removePost(file) {
  const list = await readJSON('posts/index.json', []);
  await writeJSON('posts/index.json', list.filter((p) => p.file !== file), `Hapus tulisan ${file}`);
  await deleteFile(`posts/${file}`, `Hapus tulisan ${file}`);
}

// ------------------------------------------------------------------ akun login email + kata sandi
// data/akses.json TIDAK berisi email maupun kata sandi. Isinya hanya:
//   id  = sidik jari (SHA-256) email, supaya email tidak terbaca orang
//   ct  = GitHub token yang DIKUNCI (AES-GCM) dengan kunci turunan email+kata sandi (PBKDF2, 600.000 putaran)
// Tanpa email + kata sandi yang benar, isinya tidak bisa dibuka. Kata sandi tidak pernah disimpan di mana pun.
const ACCESS = 'data/akses.json';
const ITER = 600000;
const te = new TextEncoder();
const b64e = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const b64d = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const normEmail = (e) => String(e || '').trim().toLowerCase();
async function emailId(email) {
  return b64e(await crypto.subtle.digest('SHA-256', te.encode('kampus-mini|' + normEmail(email))));
}
async function deriveKey(email, password, salt) {
  const base = await crypto.subtle.importKey('raw', te.encode(normEmail(email) + '\n' + password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITER }, base,
    { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function readAccess() {
  // pemilik membaca langsung dari GitHub (terbaru); pengunjung dari file situs
  const list = await readJSON(ACCESS, []);
  return Array.isArray(list) ? list : [];
}
/** Daftar akun untuk login: file situs + salinan terbaru langsung dari repo GitHub
 *  (supaya akun yang baru disimpan langsung bisa dipakai, juga saat situs dibuka dari komputer sendiri). */
async function readAccessForLogin() {
  const all = [];
  const grab = async (url) => {
    try { const r = await fetch(url, { cache: 'no-store' }); if (r.ok) { const j = await r.json(); if (Array.isArray(j)) all.push(...j); } }
    catch (e) { /* abaikan */ }
  };
  await Promise.all([
    grab(ACCESS + '?t=' + Date.now()),
    grab(`https://raw.githubusercontent.com/${CONFIG.owner}/${CONFIG.repo}/${CONFIG.branch}/${ACCESS}?t=${Date.now()}`),
  ]);
  return all;
}
export async function accountCount() { return (await readAccess()).length; }

const WRONG = 'Email atau kata sandi salah.';
/** Masuk dengan email + kata sandi. */
export async function loginWithPassword(email, password) {
  if (!crypto || !crypto.subtle) throw new Error('Browser ini tidak mendukung login aman (buka lewat https).');
  if (!normEmail(email) || !password) throw new Error('Isi email dan kata sandi.');
  const id = await emailId(email);
  const list = await readAccessForLogin();
  if (!list.length) throw new Error('Belum ada akun login yang terdaftar. Lakukan pengaturan awal dulu: buka "Masuk dengan token GitHub" di bawah, lalu simpan akun email (lihat README "Mode pemilik").');
  const entries = list.filter((a) => a.id === id);
  const entry = entries[entries.length - 1];
  // tetap hitung kunci walau email tidak ada, supaya lamanya sama (tidak membocorkan email mana yang terdaftar)
  const salt = entry ? b64d(entry.salt) : crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(email, password, salt);
  if (!entry) throw new Error(WRONG);
  let tk = null;
  for (const en of entries.reverse()) {
    try {
      const k = en === entry ? key : await deriveKey(email, password, b64d(en.salt));
      tk = new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64d(en.iv) }, k, b64d(en.ct)));
      break;
    } catch (e) { /* coba salinan lain */ }
  }
  if (!tk) throw new Error(WRONG);
  try { await login(tk); }
  catch (e) { throw new Error('Kata sandi benar, tetapi kunci GitHub di dalamnya sudah tidak berlaku. Masuk dengan token GitHub baru, lalu simpan ulang akun login.'); }
  return true;
}
/** (Pemilik) buat atau ganti akun login email untuk token yang sedang dipakai. */
export async function saveAccount(email, password) {
  if (!token) throw new Error('Masuk sebagai pemilik dulu.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normEmail(email))) throw new Error('Format email tidak benar.');
  if (!password || password.length < 10) throw new Error('Kata sandi minimal 10 karakter.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(email, password, salt);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(token));
  const id = await emailId(email);
  const list = (await readAccess()).filter((a) => a.id !== id);
  list.push({ id, salt: b64e(salt), iv: b64e(iv), ct: b64e(ct), iter: ITER, dibuat: new Date().toISOString().slice(0, 10) });
  await writeJSON(ACCESS, list, 'Perbarui akun login pemilik');
  return list.length;
}
/** (Pemilik) hapus akun login email. */
export async function removeAccount(email) {
  if (!token) throw new Error('Masuk sebagai pemilik dulu.');
  const id = await emailId(email);
  const list = await readAccess();
  const left = list.filter((a) => a.id !== id);
  if (left.length === list.length) throw new Error('Email itu belum terdaftar.');
  await writeJSON(ACCESS, left, 'Hapus akun login pemilik');
  return left.length;
}

// ------------------------------------------------------------------ jendela masuk pemilik (dipakai semua halaman)
export function loginDialog(onDone) {
  const wrap = document.createElement('div');
  wrap.className = 'owner-dialog';
  wrap.innerHTML = token ? `
    <div class="od-box">
      <h3>⚙ Mode pemilik aktif</h3>
      <p>Tombol edit, tulis blog, dan unggah foto aktif di browser ini.</p>
      <details class="od-acc"><summary>Akun login (email &amp; kata sandi)</summary>
        <p class="od-small">Terdaftar: <b class="od-count">…</b> akun. Isi email + kata sandi lalu <b>Simpan akun</b> untuk menambah atau mengganti kata sandi.</p>
        <input type="email" class="od-in od-email" placeholder="email" autocomplete="username">
        <input type="password" class="od-in od-pass" placeholder="kata sandi baru (min. 10 karakter)" autocomplete="new-password">
        <p class="od-err"></p>
        <div class="od-act"><button class="od-del">Hapus akun ini</button><button class="od-save">Simpan akun</button></div>
      </details>
      <div class="od-act"><button class="od-out">Keluar</button><button class="od-close">Tutup</button></div>
    </div>` : `
    <div class="od-box">
      <h3>⚙ Masuk</h3>
      <form class="od-form">
        <input type="email" class="od-in od-email" placeholder="email" autocomplete="username" required>
        <input type="password" class="od-in od-pass" placeholder="kata sandi" autocomplete="current-password" required>
        <p class="od-err"></p>
        <div class="od-act"><button type="button" class="od-close">Batal</button><button type="submit" class="od-ok">Masuk</button></div>
      </form>
      <details class="od-acc"><summary>Masuk dengan token GitHub (pengaturan awal)</summary>
        <p class="od-small">Untuk pertama kali, atau bila token lama kedaluwarsa. Lihat README bagian "Mode pemilik".</p>
        <input type="password" class="od-in od-token" placeholder="github_pat_…" autocomplete="off">
        <p class="od-err2 od-err"></p>
        <div class="od-act"><button class="od-tok">Masuk dengan token</button></div>
      </details>
    </div>`;
  document.body.appendChild(wrap);
  const $ = (q) => wrap.querySelector(q);
  const close = () => wrap.remove();
  wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
  // jangan sampai ketikan menggerakkan robot / memulai permainan
  ['keydown', 'keyup'].forEach((t) => wrap.addEventListener(t, (e) => { e.stopPropagation(); if (t === 'keydown' && e.key === 'Escape') close(); }));
  $('.od-close').onclick = close;
  const busy = (btn, on, label) => { btn.disabled = on; btn.textContent = label; };

  if (token) {
    accountCount().then((n) => { $('.od-count').textContent = n; }).catch(() => { $('.od-count').textContent = '?'; });
    $('.od-out').onclick = () => { logout(); close(); onDone && onDone(false); };
    $('.od-save').onclick = async () => {
      const b = $('.od-save'); busy(b, true, 'Menyimpan…'); $('.od-err').textContent = '';
      try { const n = await saveAccount($('.od-email').value, $('.od-pass').value); $('.od-count').textContent = n;
        $('.od-pass').value = ''; $('.od-err').style.color = '#2e7d32'; $('.od-err').textContent = 'Akun tersimpan ✓ (aktif ±1 menit lagi)'; }
      catch (e) { $('.od-err').style.color = ''; $('.od-err').textContent = e.message; }
      busy(b, false, 'Simpan akun');
    };
    $('.od-del').onclick = async () => {
      const b = $('.od-del'); busy(b, true, 'Menghapus…'); $('.od-err').textContent = '';
      try { const n = await removeAccount($('.od-email').value); $('.od-count').textContent = n; $('.od-err').style.color = '#2e7d32'; $('.od-err').textContent = 'Akun dihapus ✓'; }
      catch (e) { $('.od-err').style.color = ''; $('.od-err').textContent = e.message; }
      busy(b, false, 'Hapus akun ini');
    };
    return;
  }
  $('.od-email').focus();
  $('.od-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const b = $('.od-ok'); busy(b, true, 'Memeriksa…'); $('.od-err').textContent = '';
    try { await loginWithPassword($('.od-email').value, $('.od-pass').value); close(); onDone && onDone(true); }
    catch (err) { $('.od-err').textContent = err.message; $('.od-pass').value = ''; busy(b, false, 'Masuk'); }
  });
  const goTok = async () => {
    const b = $('.od-tok'); busy(b, true, 'Memeriksa…');
    try { await login($('.od-token').value.trim()); close(); onDone && onDone(true); }
    catch (err) { $('.od-err2').textContent = err.message; busy(b, false, 'Masuk dengan token'); }
  };
  $('.od-tok').onclick = goTok;
  $('.od-token').addEventListener('keydown', (e) => { if (e.key === 'Enter') goTok(); });
}

/** Roda gigi kecil yang samar di pojok kiri atas: pintu masuk pemilik. Pengunjung cukup mengabaikannya. */
export function mountGear(onDone) {
  if (document.querySelector('.owner-gear')) return;
  const g = document.createElement('button');
  g.className = 'owner-gear'; g.type = 'button'; g.setAttribute('aria-label', 'pengaturan');
  g.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19.4 13a7.5 7.5 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-1.7-1l-.4-2.6h-4l-.4 2.6a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.5 7.5 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.4 7.4 0 0 0 1.7-1l2.4 1 2-3.4z"/><circle cx="12" cy="12" r="3"/></svg>';
  g.addEventListener('click', (e) => { e.stopPropagation(); loginDialog(onDone); });
  document.body.appendChild(g);
}

export const OWNER_CSS = `
.owner-dialog { position: fixed; inset: 0; z-index: 200; background: rgba(20,8,14,.6); display: grid; place-items: center; padding: 20px; font-family: Nunito, Arial, sans-serif; }
.od-box { background: #fff8ef; color: #241726; border-radius: 16px; padding: 24px 26px; width: min(460px, 100%); box-shadow: 0 20px 60px rgba(0,0,0,.4); }
.od-box h3 { margin: 0 0 10px; } .od-box p { line-height: 1.55; font-size: 14.5px; }
.od-box code { background: #f0dccb; padding: 1px 6px; border-radius: 5px; }
.od-in { display: block; width: 100%; box-sizing: border-box; padding: 10px 12px; margin: 0 0 8px; border: 2px solid #ecd8c6; border-radius: 10px; font: inherit; background: #fff; }
.od-in:focus { outline: none; border-color: #7a2232; }
.od-small { font-size: 13px !important; color: #6b5560; }
.od-acc { margin: 10px 0 14px; border-top: 1px dashed #e2cbb8; padding-top: 10px; }
.od-acc summary { cursor: pointer; font-size: 13px; font-weight: 700; color: #7a5a66; }
.od-acc[open] summary { margin-bottom: 8px; }
.od-act .od-save, .od-act .od-tok { background: #7a2232; color: #fff; } .od-act .od-del { background: #ffd6d0; color: #8a1f12; }
.od-act button:disabled { opacity: .6; cursor: wait; }
.owner-gear { position: fixed; left: 8px; top: 8px; z-index: 150; width: 26px; height: 26px; padding: 3px; border: 0; border-radius: 50%;
  background: transparent; cursor: pointer; opacity: .22; transition: opacity .25s, transform .6s; }
.owner-gear svg { width: 100%; height: 100%; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linejoin: round; }
.owner-gear:hover, .owner-gear:focus-visible { opacity: .75; transform: rotate(90deg); }
body.owner .owner-gear { opacity: .8; color: #f1b434; }
.od-err { color: #c0392b; min-height: 1.2em; font-weight: 700; }
.od-act { display: flex; gap: 8px; justify-content: flex-end; }
.od-act button { border: 0; padding: 10px 16px; border-radius: 10px; font-weight: 900; cursor: pointer; background: #f0dccb; }
.od-act .od-ok, .od-act .od-out { background: #7a2232; color: #fff; }
.owner-badge { position: fixed; left: 50%; top: 10px; transform: translateX(-50%); z-index: 30; background: #f1b434; color: #3b2400;
  font: 900 12px Nunito, Arial, sans-serif; letter-spacing: 1px; padding: 5px 12px; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,.25); pointer-events: none; }
body:not(.owner) .owner-only { display: none !important; }
`;
export function injectOwnerCSS() {
  const st = document.createElement('style'); st.textContent = OWNER_CSS; document.head.appendChild(st);
}
export function applyOwnerClass() {
  document.body.classList.toggle('owner', isOwner());
  let b = document.querySelector('.owner-badge');
  if (isOwner() && !b) { b = document.createElement('div'); b.className = 'owner-badge'; b.textContent = '✎ MODE PEMILIK'; document.body.appendChild(b); }
  if (!isOwner() && b) b.remove();
}

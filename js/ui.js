// Antarmuka HTML: bahasa, label gedung, papan isi (gaya papan kayu), blog, edit teks,
// notifikasi klik gedung, peta, warna robot, tuas sentuh.
import * as THREE from 'three';
import { LOCATIONS, PROFILE, UI, COLORS, BOOKS } from './content.js';
import { md } from './markdown.js';
import * as sfx from './audio.js';
import * as admin from './admin.js';

const $ = (s) => document.querySelector(s);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* abaikan */ } },
};
let lang = store.get('kampus-lang2', 'id');
export const t = (o) => (o == null ? '' : typeof o === 'string' ? o : o[lang] ?? o.id);
export const getLang = () => lang;

// ------------------------------------------------------------------ bahasa
export function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(UI[el.dataset.i18n]); });
  $('#btn-lang').textContent = lang.toUpperCase();
  for (const L of LOCATIONS) {
    const el = labelEls[L.key];
    if (el) el.innerHTML = `<b><span>${L.no}</span></b>${t(L.title)}`;
  }
}
export function toggleLang() {
  lang = lang === 'id' ? 'en' : 'id';
  store.set('kampus-lang2', lang);
  applyLang();
  if (board.loc) renderBoard();
}

// ------------------------------------------------------------------ label nama gedung
const labelEls = {};
export function buildLabels() {
  const box = $('#labels');
  for (const L of LOCATIONS) {
    const el = document.createElement('div');
    el.className = 'lbl';
    box.appendChild(el);
    labelEls[L.key] = el;
  }
  applyLang();
}
const v = new THREE.Vector3();
export function updateLabels(camera, anchors, robotPos, hide) {
  for (const L of LOCATIONS) {
    const el = labelEls[L.key];
    const a = anchors[L.key];
    const d = Math.hypot(a.x - robotPos.x, a.z - robotPos.y);
    v.copy(a).project(camera);
    const vis = !hide && d < 40 && v.z < 1 && Math.abs(v.x) < 1.05 && v.y < 1.05 && v.y > -1.05;
    el.style.opacity = vis ? Math.min(1, (40 - d) / 8) : 0;
    if (vis) el.style.transform = `translate(${(v.x * 0.5 + 0.5) * innerWidth}px, ${Math.max(40, (-v.y * 0.5 + 0.5) * innerHeight)}px) translate(-50%, -100%)`;
  }
}

// ------------------------------------------------------------------ edit teks (✎)
let edits = {};
export async function loadEdits() { edits = await admin.loadEdits(true); }
const editKey = (i) => `${board.key}:${(board.slides && board.slides[i] && board.slides[i]._i != null) ? board.slides[i]._i : i}`;
function edited(i, field, fallback) {
  const e = edits[editKey(i)] && edits[editKey(i)][lang];
  return e && e[field] != null ? e[field] : fallback;
}

// ------------------------------------------------------------------ papan isi (seperti papan kayu bruno-simon)
const board = { loc: null, key: '', slides: [], i: 0, mode: 'slides', posts: [], post: null, onExit: null, editing: false };
export const boardOpen = () => !!board.loc;
let paintNow = COLORS[0].hex, onPaint = null;
export function setPaintHandler(fn, hex) { onPaint = fn; paintNow = hex; }

async function loadPosts() { return admin.loadPosts(); }

// Papan yang tampil di tengah (gambar di atas, tulisan di bawah)
const CENTER = new Set(['galeri', 'lab', 'auditorium', 'masjid', 'kelas', 'prestasi', 'siger', 'taman']);
// Foto-foto berurutan digabung menjadi satu papan kolase:
//  - prestasi: foto ikut papan prestasinya (judul + tulisan + kolase)
//  - auditorium: semua foto wisuda jadi satu papan "Wisuda"
function groupPhotos(key, slides) {
  if (key !== 'prestasi' && key !== 'auditorium') return slides.map((s, i) => ({ ...s, _i: i }));
  const out = [];
  slides.forEach((s, i) => {
    if (!s.photo) { out.push({ ...s, _i: i, photos: key === 'prestasi' && s.img ? [s.img] : null }); return; }
    let last = out[out.length - 1];
    if (key === 'auditorium' && !(last && last._wisuda)) {
      last = { title: { id: 'Wisuda', en: 'Graduation' }, _i: i, _wisuda: true, photos: [], photo: false,
        text: { id: '<p>Wisuda Magister Teknik Informatika, IIB Darmajaya · Desember 2024.</p>', en: '<p>Master of Informatics Engineering graduation, IIB Darmajaya · December 2024.</p>' } };
      out.push(last);
    }
    (last.photos = last.photos || []).push(s.img);
  });
  return out;
}
const mosaic = (imgs) => `<div class="mosaic n${Math.min(imgs.length, 7)}">${imgs.map((src) => `<img src="${src}" alt="">`).join('')}</div>`;

/** buka papan untuk lokasi; onExit dipanggil saat tombol KELUAR / Esc */
export async function openBoard(loc, onExit) {
  board.loc = loc; board.key = loc.key; board.i = 0; board.onExit = onExit; board.editing = false; board.post = null;
  board.mode = loc.blog ? 'blog' : loc.contact ? 'contact' : loc.paint ? 'paint' : loc.books ? 'books' : 'slides';
  board.slides = groupPhotos(loc.key, loc.slides || []);
  if (loc.blog) {
    board.posts = (await loadPosts()).filter((p) => p.cat === loc.blog).sort((a, b) => (a.date < b.date ? 1 : -1));
  }
  $('#board').classList.remove('hidden');
  document.body.classList.add('in-board');
  renderBoard();
  sfx.pop();
}
export function closeBoard() {
  $('#board').classList.add('hidden');
  document.body.classList.remove('in-board');
  board.loc = null;
}
export function exitBoard() { const fn = board.onExit; closeBoard(); fn && fn(); }

function slideCount() {
  if (board.mode === 'slides') return board.slides.length;
  if (board.mode === 'blog') return board.post ? board.posts.length : 1;
  return 1;
}
export function boardStep(d) {
  if (!board.loc || board.editing) return;
  if (board.mode === 'blog' && board.post) {
    const i = board.posts.indexOf(board.post);
    const j = (i + d + board.posts.length) % board.posts.length;
    readPost(board.posts[j]);
    return;
  }
  const n = slideCount();
  if (n < 2) return;
  board.i = (board.i + d + n) % n;
  renderBoard();
  sfx.notif();
}
export function boardOpenLink() {
  const a = $('#board .bd-link');
  if (a && a.href && !a.classList.contains('hidden')) window.open(a.href, '_blank');
}

function renderBoard() {
  const L = board.loc;
  const title = $('#board .bd-title'), link = $('#board .bd-link'), media = $('#board .bd-media'),
    text = $('#board .bd-text'), meta = $('#board .bd-meta'), dots = $('#board .bd-dots'), badge = $('#board .bd-badge');
  $('#board .bd-place').textContent = t(L.title);
  media.innerHTML = ''; text.innerHTML = ''; meta.innerHTML = ''; badge.classList.add('hidden');
  link.classList.add('hidden');
  $('#board').classList.toggle('photo', false);
  $('#board').classList.toggle('editable', board.mode === 'slides' && admin.isOwner());
  $('#board').classList.toggle('center', board.mode === 'slides' && CENTER.has(board.key));
  $('#board').classList.toggle('reading', false);
  $('#board').classList.toggle('bloglist', board.mode === 'blog' && L.blog !== 'kode');
  $('#board').classList.toggle('paintbox', board.mode === 'paint');
  ['skills', 'quote', 'mosaicbox', 'iconic', 'side'].forEach((c) => $('#board').classList.remove('kind-' + c));
  const n = slideCount();
  dots.innerHTML = n > 1 ? Array.from({ length: Math.min(n, 12) }, (_, k) => `<i class="${k === board.i % 12 ? 'on' : ''}"></i>`).join('') : '';
  $('#board .bd-nav').classList.toggle('hidden', n < 2 && !(board.mode === 'blog' && board.post));

  if (board.mode === 'slides') {
    const s = board.slides[board.i];
    title.innerHTML = edited(board.i, 'title', t(s.title));
    if (s.link) { link.textContent = s.link.label; link.href = s.link.url; link.classList.remove('hidden'); }
    if (s.photos && s.photos.length) { media.innerHTML = mosaic(s.photos); $('#board').classList.add('kind-mosaicbox'); }
    else if (s.img) media.innerHTML = `<img src="${s.img}" alt="">`;
    else if (s.icon) { media.innerHTML = `<div class="bd-icon">${s.icon}</div>`; $('#board').classList.add('kind-iconic'); }
    text.innerHTML = edited(board.i, 'text', t(s.text));
    if (s.kind === 'skills' && s.skills && !(edits[editKey(board.i)] && edits[editKey(board.i)][lang])) {
      $('#board').classList.add('kind-skills');
      media.innerHTML = '';
      text.innerHTML = `<div class="skillgrid">${s.skills.map((g) => `<div class="sk"><b><i>${g.e}</i>${t(g.k)}</b><div class="chips">${g.items.map((x) => `<span>${x}</span>`).join('')}</div></div>`).join('')}</div>`;
    }
    if (s.layout === 'side') $('#board').classList.add('kind-side');
    if (/blockquote class="big"/.test(text.innerHTML)) $('#board').classList.add('kind-quote');
    if (s.links) text.innerHTML += `<div class="linkrow">${s.links.map((l) => `<a href="${l.url}" target="_blank" rel="noopener">${l.icon || '🔗'} ${l.label}</a>`).join('')}</div>`;
    $('#board').classList.toggle('photo', !!s.photo);
    if (s.meta) meta.innerHTML = s.meta.map((m) => `<div class="sign"><span class="sign-k">${t(m.k)}</span><span class="sign-v">${t(m.v)}</span></div>`).join('');
    if (s.badge) { badge.textContent = s.badge; badge.classList.remove('hidden'); }
  } else if (board.mode === 'contact') {
    title.textContent = t({ id: 'Kirim Pesan', en: 'Get in Touch' });
    media.innerHTML = '<div class="bd-icon">📮</div>';
    text.innerHTML = `<p>${t(UI.contactIntro)}</p><div class="cards">` + PROFILE.links.map((l) =>
      `<a class="card" href="${l.url}" target="_blank" rel="noopener"><b title="${l.label}">${l.icon}${l.iconOnly ? '' : ' ' + l.label}</b><small>${l.url.replace(/^https?:\/\//, '').replace(/\?.*/, '')}</small></a>`).join('') + '</div>';
  } else if (board.mode === 'paint') {
    title.textContent = t(UI.paint);
    media.innerHTML = '<div class="bd-icon">🎨</div>';
    const hsl = (hex) => { const c = new THREE.Color(hex), o = {}; c.getHSL(o); return o; };
    const sorted = [...COLORS].sort((a, b) => { const A = hsl(a.hex), B = hsl(b.hex), ga = A.s < 0.15, gb = B.s < 0.15;
      return ga !== gb ? (ga ? 1 : -1) : ga ? B.l - A.l : A.h - B.h || B.l - A.l; });
    const cur = hsl(paintNow);
    text.innerHTML = `<p>${t(UI.paintIntro)}</p>
      <div class="rainbow"><div class="rb-prev" style="background:${paintNow}"></div>
        <label><span>${t({ id: 'Warna', en: 'Hue' })}</span><input type="range" class="rb-h" min="0" max="360" value="${Math.round(cur.h * 360)}"></label>
        <label><span>${t({ id: 'Terang', en: 'Light' })}</span><input type="range" class="rb-l" min="15" max="85" value="${Math.round(Math.min(85, Math.max(15, cur.l * 100)))}"></label></div>
      <div class="swatches">` + sorted.map((c) =>
      `<button class="swatch ${c.hex === paintNow ? 'on' : ''}" data-hex="${c.hex}" title="${t(c.name)}"><i style="background:${c.hex}"></i>${t(c.name)}</button>`).join('') + '</div>';
    const setPaint = (hex) => { paintNow = hex; text.querySelector('.rb-prev').style.background = hex; onPaint && onPaint(paintNow); };
    text.querySelectorAll('.swatch').forEach((b) => b.addEventListener('click', () => {
      setPaint(b.dataset.hex);
      text.querySelectorAll('.swatch').forEach((x) => x.classList.toggle('on', x === b));
      sfx.pop();
    }));
    const h = text.querySelector('.rb-h'), l = text.querySelector('.rb-l');
    const fromSliders = () => {
      const hex = '#' + new THREE.Color().setHSL(h.value / 360, 0.75, l.value / 100).getHexString();
      l.style.background = `linear-gradient(90deg, hsl(${h.value} 75% 15%), hsl(${h.value} 75% 50%), hsl(${h.value} 75% 85%))`;
      text.querySelectorAll('.swatch').forEach((x) => x.classList.remove('on'));
      setPaint(hex);
    };
    l.style.background = `linear-gradient(90deg, hsl(${h.value} 75% 15%), hsl(${h.value} 75% 50%), hsl(${h.value} 75% 85%))`;
    [h, l].forEach((r) => { r.addEventListener('input', fromSliders); r.addEventListener('keydown', (e) => e.stopPropagation()); });
  } else if (board.mode === 'books') {
    renderBooks(title, media, text);
  } else if (board.mode === 'blog') {
    if (board.post) return; // sedang membaca, isi diatur readPost
    title.textContent = t(L.title);
    const emo = { kode: '💻', kuliner: '🍜', 'jalan-jalan': '🧳' }[L.blog] || '📝';
    const fancy = L.blog !== 'kode';
    media.innerHTML = L.blog === 'kode' ? '<img src="img/blog-kode.jpg" alt="">' : fancy ? '' : `<div class="bd-icon">${emo}</div>`;
    const list = board.posts;
    const own = admin.isOwner();
    const intro = fancy ? `<div class="bl-head"><i>${emo}</i><p>${t(L.blog === 'kuliner'
      ? { id: 'Cerita rasa dan tempat makan favorit, dari Lampung dan sekitarnya.', en: 'Stories of flavours and favourite places to eat, from Lampung and beyond.' }
      : { id: 'Catatan perjalanan dan tempat-tempat yang pernah saya kunjungi.', en: 'Travel notes and places I have visited.' })}</p></div>` : '';
    text.innerHTML = intro + (list.length ? `<div class="cards${fancy ? ' postgrid' : ''}">` + list.map((p, k) =>
      `<div class="card" data-k="${k}">${fancy ? `<span class="pc" style="${p.cover ? `background-image:url('${p.cover}')` : ''}">${p.cover ? '' : emo}</span>` : ''}<b>${t(p.title)}${p.draft ? ' <em class="draft">draf</em>' : ''}</b>${fancy ? `<span class="ps">${t(p.summary || '')}</span>` : t(p.summary || '')}<small>${p.date}</small>` +
      (own ? `<span class="own-tools"><a href="tulis.html?edit=${encodeURIComponent(p.file)}" target="_blank" data-stop>✎ Edit</a><a href="#" class="del" data-del="${k}">🗑 Hapus</a></span>` : '') +
      '</div>').join('') + '</div>' : `<p>${t(UI.noPosts)}</p>`) +
      (own ? `<p><a class="write-btn" href="tulis.html?cat=${L.blog}" target="_blank">✍️ ${t(UI.write)}</a></p>` : '');
    text.querySelectorAll('.card').forEach((c) => c.addEventListener('click', (e) => {
      if (e.target.closest('[data-stop]')) return;
      const del = e.target.closest('[data-del]');
      if (del) { e.preventDefault(); deletePost(list[+del.dataset.del]); return; }
      readPost(list[+c.dataset.k]);
    }));
  }
}

// ------------------------------------------------------------------ rak buku (Google Books)
const coverCache = {};
async function bookInfo(b) {
  const k = b.title + '|' + (b.author || '');
  if (!coverCache[k]) {
    coverCache[k] = (async () => {
      try {
        const q = encodeURIComponent(`intitle:${b.title}` + (b.author ? ` inauthor:${b.author.split(',')[0]}` : ''));
        const r = await (await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`)).json();
        const v = r.items && r.items[0];
        return v ? { cover: (v.volumeInfo.imageLinks?.thumbnail || '').replace('http:', 'https:'), link: (v.volumeInfo.infoLink || '').replace('http:', 'https:') } : {};
      } catch (e) { return {}; }
    })();
  }
  return coverCache[k];
}
const gbSearch = (b) => `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(b.title + ' ' + (b.author || ''))}`;
const escHTML = (x) => String(x).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function renderBooks(title, media, text) {
  title.textContent = t({ id: 'Rak Buku', en: 'Bookshelf' });
  media.innerHTML = '<div class="bd-icon">📚</div>';
  const books = edits.books || BOOKS;
  const own = admin.isOwner();
  text.innerHTML = `<p>${t({ id: 'Bacaan favorit. Klik buku untuk membukanya di Google Books.', en: 'Favourite reads. Click a book to open it on Google Books.' })}</p>
    <div class="books">${books.map((b, i) => `<a class="book" href="${gbSearch(b)}" target="_blank" rel="noopener" data-i="${i}">
      <span class="cov"><i>📖</i></span><span class="bt"><b>${escHTML(b.title)}</b><small>${escHTML(b.author || '')}</small></span>
      ${own ? `<button class="bk-del" data-del="${i}" title="Hapus">🗑</button>` : ''}</a>`).join('')}</div>
    ${own ? `<div class="bk-add"><input class="bk-t" placeholder="Judul buku"><input class="bk-a" placeholder="Penulis"><button class="bk-go">＋ Tambah</button></div>` : ''}`;
  text.querySelectorAll('.book').forEach(async (el) => {
    const info = await bookInfo(books[+el.dataset.i]);
    if (info.cover) el.querySelector('.cov').innerHTML = `<img src="${info.cover}" alt="">`;
    if (info.link) el.href = info.link;
  });
  if (!own) return;
  const save = async (list, msg) => {
    try { edits = await admin.saveEdit('books', list, msg); toast(t(UI.editSaved), 3000, true); renderBoard(); }
    catch (e) { toast(e.message, 4000, true); }
  };
  text.querySelectorAll('[data-del]').forEach((btn) => btn.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    save(books.filter((_, i) => i !== +btn.dataset.del), 'Hapus buku');
  }));
  text.querySelector('.bk-go').addEventListener('click', () => {
    const tt = text.querySelector('.bk-t').value.trim(), au = text.querySelector('.bk-a').value.trim();
    if (tt) save([...books, { title: tt, author: au }], `Tambah buku ${tt}`);
  });
  text.querySelectorAll('.bk-add input').forEach((i) => i.addEventListener('keydown', (e) => e.stopPropagation()));
}

async function deletePost(p) {
  if (!confirm(`Hapus tulisan "${t(p.title)}"?`)) return;
  try {
    toast('Menghapus…', 1500, true);
    await admin.removePost(p.file);
    board.posts = board.posts.filter((x) => x !== p);
    renderBoard();
    toast(t(UI.deleted), 3000, true);
  } catch (e) { toast(e.message, 4000, true); }
}

async function readPost(p) {
  board.post = p;
  const text = $('#board .bd-text');
  $('#board .bd-title').textContent = t(p.title);
  $('#board .bd-media').innerHTML = '';
  $('#board').classList.add('reading');
  $('#board').classList.remove('bloglist');
  $('#board .bd-nav').classList.toggle('hidden', board.posts.length < 2);
  text.innerHTML = '…';
  const file = typeof p.file === 'string' ? p.file : (p.file[lang] || p.file.id);
  const src = (await admin.readText(`posts/${file}`)) || '(gagal memuat tulisan)';
  const cover = p.cover && !src.includes(p.cover) ? `<p><img src="${p.cover}" alt=""></p>` : '';
  text.innerHTML = `<p><a href="#" class="back">${t(UI.back)}</a> <span class="muted">· ${p.date}</span></p>` + cover + md(src);
  text.querySelector('.back').addEventListener('click', (e) => { e.preventDefault(); board.post = null; renderBoard(); });
  text.scrollTop = 0;
}

function startEdit() {
  if (board.mode !== 'slides' || board.editing) return;
  board.editing = true;
  $('#board').classList.add('editing');
  for (const el of [$('#board .bd-title'), $('#board .bd-text')]) el.contentEditable = 'true';
  $('#board .bd-text').focus();
}
async function endEdit(save) {
  if (!board.editing) return;
  const ti = $('#board .bd-title'), tx = $('#board .bd-text');
  if (save) {
    const k = editKey(board.i);
    const val = { ...(edits[k] || {}) };
    val[lang] = { title: ti.innerHTML, text: tx.innerHTML };
    const btn = $('#board .bd-save');
    btn.disabled = true; btn.textContent = '…';
    try {
      edits = await admin.saveEdit(k, val, `Edit teks ${t(board.loc.title)}`);
      toast(t(UI.editSaved), 3200, true);
    } catch (e) { toast(e.message, 4500, true); btn.disabled = false; btn.textContent = t(UI.save); return; }
    btn.disabled = false; btn.textContent = t(UI.save);
  }
  board.editing = false;
  $('#board').classList.remove('editing');
  ti.contentEditable = tx.contentEditable = 'false';
  if (!save) renderBoard();
}

export function setupBoard() {
  $('#board .bd-prev').addEventListener('click', () => boardStep(-1));
  $('#board .bd-next').addEventListener('click', () => boardStep(1));
  $('#board .bd-exit').addEventListener('click', () => exitBoard());
  $('#board .bd-edit').addEventListener('click', () => startEdit());
  $('#board .bd-save').addEventListener('click', () => endEdit(true));
  $('#board .bd-cancel').addEventListener('click', () => endEdit(false));
  $('#board .bd-media').addEventListener('click', (e) => {
    const im = e.target.closest('.mosaic img');
    if (!im) return;
    const z = document.createElement('div');
    z.id = 'zoom-img'; z.innerHTML = `<img src="${im.getAttribute('src')}" alt="">`;
    z.addEventListener('click', () => z.remove());
    document.body.appendChild(z);
  });
}
export const isEditing = () => board.editing;

// buku di bangku taman & warna robot memakai papan yang sama
export function openBooks(onExit) { openBoard({ key: 'buku', title: UI.reading, books: true }, onExit); }
export function openPaint(onExit) { openBoard({ key: 'cat', title: UI.paint, paint: true }, onExit); }

// ------------------------------------------------------------------ notifikasi saat gedung diklik
export function notify(L) {
  const box = $('#notifs');
  box.innerHTML = '';
  const items = [`<b>${L.no}</b> ${t(L.title)}`, ...t(L.notes || []), `➜ ${t(UI.clickPeek)}`];
  items.forEach((txt, k) => {
    const el = document.createElement('div');
    el.className = 'notif' + (k === 0 ? ' head' : '');
    el.innerHTML = txt;
    el.style.animationDelay = `${k * 0.12}s`;
    box.appendChild(el);
    setTimeout(() => sfx.notif(), k * 120);
  });
  clearTimeout(notify.t);
  notify.t = setTimeout(() => (box.innerHTML = ''), 6500);
}

// ------------------------------------------------------------------ peta
export function openMap(robotPos, onPick) {
  $('#map-img').src = 'img/peta.svg';
  const mk = $('#map-markers');
  mk.innerHTML = '';
  const go = (L) => { closeMap(); onPick(L, (L.mx - 750) * 0.1, (L.my - 760) * 0.1); };
  for (const L of LOCATIONS) {
    const d = document.createElement('div');
    d.className = 'mk';
    d.dataset.name = t(L.title);
    d.innerHTML = `<span>${L.no}</span>`;
    d.style.left = (L.mx / 1500) * 100 + '%'; d.style.top = (L.my / 1500) * 100 + '%';
    d.addEventListener('click', () => go(L));
    mk.appendChild(d);
  }
  const me = $('#map-me');
  me.style.left = ((robotPos.x * 10 + 750) / 1500) * 100 + '%';
  me.style.top = ((robotPos.y * 10 + 760) / 1500) * 100 + '%';
  me.style.background = paintNow;
  const leg = $('#map-legend');
  leg.innerHTML = `<h3>${t({ id: 'Daftar lokasi', en: 'Locations' })}</h3><p class="mh">${t(UI.teleport)}</p>` + LOCATIONS.map((L) =>
    `<button class="lg ${L.blog ? 'blog' : ''}" data-k="${L.key}"><i><span>${L.no}</span></i><span><b>${t(L.title)}</b><small>${(t(L.notes || [])[0] || '').replace(/^\S+\s/, '')}</small></span></button>`).join('');
  leg.querySelectorAll('.lg').forEach((b) => b.addEventListener('click', () => go(LOCATIONS.find((L) => L.key === b.dataset.k))));
  $('#map').classList.remove('hidden');
  sfx.pop();
}
export function closeMap() { $('#map').classList.add('hidden'); }
export function mapOpen() { return !$('#map').classList.contains('hidden'); }

// ------------------------------------------------------------------ pesan & stopwatch
let toastTimer = 0;
export function toast(msg, ms = 1600, small = false) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.toggle('small', small);
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}
export function lapTimer(text) {
  const el = $('#laptimer');
  if (text == null) el.classList.add('hidden');
  else { el.textContent = text; el.classList.remove('hidden'); }
}
export function activityBar(html) {
  const el = $('#activity');
  if (html == null) el.classList.add('hidden');
  else { el.querySelector('.act-text').innerHTML = html; el.classList.remove('hidden'); }
}

// ------------------------------------------------------------------ tuas sentuh
export const joy = { x: 0, z: 0, active: false };
export function setupJoystick() {
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouch) return;
  const base = $('#joy'), knob = $('#joy-knob');
  base.classList.remove('hidden');
  let id = null, cx = 0, cy = 0;
  const move = (x, y) => {
    let dx = x - cx, dy = y - cy;
    const r = 50, d = Math.hypot(dx, dy);
    if (d > r) { dx = (dx / d) * r; dy = (dy / d) * r; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    joy.x = dx / r; joy.z = dy / r;
  };
  base.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    id = e.pointerId; base.setPointerCapture(id);
    const b = base.getBoundingClientRect(); cx = b.left + b.width / 2; cy = b.top + b.height / 2;
    joy.active = true; move(e.clientX, e.clientY);
  });
  base.addEventListener('pointermove', (e) => { if (e.pointerId === id) move(e.clientX, e.clientY); });
  const end = () => { id = null; joy.active = false; joy.x = joy.z = 0; knob.style.transform = ''; };
  base.addEventListener('pointerup', end);
  base.addEventListener('pointercancel', end);
}

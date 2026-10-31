# Kampus Mini — Portofolio 3D Desi Susanti (v2)

**EN:** An interactive 3D portfolio: walk a little robot around a mini campus, visit buildings to read
about my research, projects, achievements and blog (code, food, travel). Built with Three.js, no server needed.

**ID:** Portofolio 3D interaktif: jalankan robot kecil berkeliling kampus mini, datangi gedung-gedung untuk
membaca riset, proyek, prestasi, dan blog (kode, kuliner, jalan-jalan). Dibuat dengan Three.js, tanpa server.

### 🎮 [Jelajahi Kampus Mini 3D →](https://des1susanti.github.io/portofolio-v2/)  ·  📄 [Mode biasa →](https://des1susanti.github.io/portofolio-v2/classic.html)

Versi pertama (Flask + Tailwind): [des1susanti.pythonanywhere.com](https://des1susanti.pythonanywhere.com)

[![Kampus Mini 3D](img/preview-kampus.png)](https://des1susanti.github.io/portofolio-v2/)

<table>
  <tr>
    <td><img src="img/preview-awal.png" alt="Layar awal"><br><sub>Layar awal: klik untuk mulai</sub></td>
    <td><img src="img/preview-airmancur.png" alt="Air mancur"><br><sub>Air mancur di bundaran</sub></td>
  </tr>
</table>

## Cara bermain

| Kontrol | Fungsi |
|---|---|
| `W A S D` / tombol panah | Jalankan robot |
| `Shift` | Berlari |
| Seret layar | Geser pandangan atas-bawah-kanan-kiri |
| Seret klik-kanan / `Ctrl`+seret / `Q` `E` | Putar kamera |
| Gulir mouse / tombol `+` `−` | Perbesar / perkecil |
| Tombol ⌖ | Kamera kembali ke belakang robot (searah hadap robot) |
| Klik gedung | Muncul catatan singkat isi gedung |
| Masuk pintu ◆ | Pintu terbuka, robot masuk, papan isi muncul |
| `←` `→` / `Enter` / `Esc` | Di dalam gedung: geser isi / buka tautan / keluar |
| ✎ (pojok kanan bawah, khusus pemilik) | Edit teks di dalam gedung |
| `M` | Peta · `N` siang/malam |
| Tuas pojok kiri bawah | Kontrol di HP |

Tombol pojok kanan atas: **menu** (mode biasa), **peta**, **warna robot**, **siang/malam**, **suara**, **ID/EN**. Roda gigi samar ⚙ di pojok kiri atas: masuk pemilik.

**Hal-hal kecil:** musik pembuka saat mulai · rumput & daun bergoyang · kucing, burung, kupu-kupu, kunang-kunang (malam) ·
air mancur di bundaran · memancing di dermaga Taman Danau · membaca di bangku taman (buku tersambung ke Google Books) · mini game bola & lintasan · permata tersembunyi.

<table>
  <tr>
    <td><img src="img/preview-papan.png" alt="Galeri proyek"><br><sub>Papan isi gedung: Galeri Proyek</sub></td>
    <td><img src="img/preview-mancing.png" alt="Memancing"><br><sub>Memancing di Taman Danau</sub></td>
  </tr>
  <tr>
    <td><img src="img/preview-malam.png" alt="Malam"><br><sub>Mode malam</sub></td>
    <td><img src="img/preview-peta.png" alt="Peta"><br><sub>Peta: klik lokasi untuk pindah</sub></td>
  </tr>
</table>

## 16 lokasi

1 Gerbang Utama · 2 Gedung Beranda · 3 Masjid Kampus · 4 Auditorium Wisuda · 5 Lab AI · 6 Galeri Proyek ·
7 Ruang Kelas · 8 Balai Prestasi · 9 Lapangan & Lintasan · 10 Perpustakaan (Blog Kode) · 11 Kantin (Blog Kuliner) ·
12 Terminal Bus (Blog Jalan-jalan) · 13 Kantor Pos (Kontak) · 14 Bengkel Cat Robot · 15 Menara Siger · 16 Taman Danau

## Mode biasa

`classic.html` — halaman portofolio biasa (tanpa 3D) dengan animasi, galeri foto geser, kartu proyek yang bisa dibalik,
filter proyek, dan blog. Cocok untuk HP lemah dan mudah ditemukan Google.

<table>
  <tr>
    <td><img src="img/preview-mode-biasa.png" alt="Mode biasa"><br><sub>Beranda</sub></td>
    <td><img src="img/preview-proyek.png" alt="Galeri proyek"><br><sub>Galeri proyek</sub></td>
  </tr>
  <tr>
    <td colspan="2"><img src="img/preview-kontak.png" alt="Kontak"><br><sub>Kontak</sub></td>
  </tr>
</table>

## Menjalankan di VS Code

Situs ini memakai modul JavaScript, jadi **harus dibuka lewat server lokal** (tidak bisa klik dua kali `index.html`).

**Cara 1 — ekstensi Live Server (paling mudah)**
1. Buka folder `portofolio-v2` di VS Code.
2. Pasang ekstensi **Live Server** (VS Code akan menyarankannya otomatis).
3. Klik kanan `index.html` → **Open with Live Server**.

**Cara 2 — Terminal VS Code**
```bash
python3 -m http.server 8000
```
lalu buka http://localhost:8000 di browser.

## Mengubah isi

| Yang diubah | Caranya |
|---|---|
| Teks gedung, catatan klik, proyek, kontak | `js/content.js` |
| Teks gedung, teks & foto *Tentang*, daftar buku | langsung dari situs dalam **mode pemilik** → otomatis tersimpan ke GitHub (`data/edits.json`) |
| Tulisan blog (tulis, edit, hapus, unggah foto) | **mode pemilik** → menu **Tulis blog** (`tulis.html`) → 🚀 Terbitkan |
| Foto | taruh di `img/` (kecilkan dulu, lebar ±1200 px) |
| Musik pembuka | ganti file `audio/pembuka.mp3` |
| Gedung, pohon, jalan | `js/world.js` · hewan: `js/animals.js` · robot: `js/robot.js` |

Komputer terasa berat? Buka dengan `index.html?ringan` (tanpa bayangan dan lampu malam).

## Mode pemilik (hanya Desi yang bisa edit)

Pengunjung cukup klik **MULAI**: mereka bisa melihat, berkeliling, memancing, membaca buku, menggerakkan robot,
dan mengganti warna robot — tanpa bisa mengubah apa pun. Pemilik masuk lewat **roda gigi ⚙ samar di pojok kiri atas**
(ada di Kampus 3D dan mode biasa) dengan **email + kata sandi**.

**Cara kerjanya (aman untuk situs statis):** kata sandi tidak disimpan di mana pun. Yang disimpan di `data/akses.json`
hanyalah kunci GitHub (token) yang **dikunci** (AES-256-GCM) memakai email + kata sandi (PBKDF2 600.000 putaran),
plus sidik jari email. Saat login benar, kunci GitHub terbuka di browser itu dan tombol edit muncul.
Token hanya boleh menulis ke repo `portofolio-v2`, jadi kalau terjadi apa-apa pun, akun GitHub lain aman dan setiap
perubahan bisa dibatalkan dari riwayat commit.

**Pengaturan awal (sekali saja):**
1. Buat token: GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
   *Repository access*: **Only select repositories → `portofolio-v2`**. *Permissions → Contents*: **Read and write**.
   Masa berlaku mis. 1 tahun. Salin token (`github_pat_…`), jangan dibagikan.
2. Di situs: klik ⚙ → buka **"Masuk dengan token GitHub (pengaturan awal)"** → tempel token → Masuk.
3. Klik ⚙ lagi → **Akun login (email & kata sandi)** → isi email + kata sandi → **Simpan akun**. Ulangi untuk email kedua.
4. Selesai. Sekitar 1 menit kemudian, login cukup dengan email + kata sandi dari perangkat mana pun.

Ganti kata sandi: masuk → ⚙ → isi email yang sama + kata sandi baru → Simpan akun.
Token kedaluwarsa: buat token baru → masuk dengan token → simpan ulang kedua akun.
Gunakan kata sandi panjang yang **berbeda** dari kata sandi email/Gmail.

## Menerbitkan dengan GitHub Pages (gratis)

1. Unggah folder ini ke repo baru bernama `portofolio-v2` (kalau namanya lain, ubah `CONFIG` di `js/content.js`).
2. Di GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root) → Save**.
3. Tunggu 1–2 menit, situs tampil di [des1susanti.github.io/portofolio-v2](https://des1susanti.github.io/portofolio-v2/).

## Teknologi

Three.js r160 (disertakan di `vendor/`, lisensi MIT) · JavaScript modul · HTML/CSS · tanpa server, tanpa build.
Dibuat dengan bantuan AI.

---

Diadaptasi dari portofolio [Bruno Simon](https://bruno-simon.com) ([github.com/brunosimon](https://github.com/brunosimon)).

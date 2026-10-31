# Mitologi Nusantara: Tokoh Legenda yang Muncul dari Gerakan Tangan

![Tokoh di dalam kubus 3D](img/proyek/mitologi.jpg)

Bagaimana kalau Garuda, Naga Besukih, atau Nyi Roro Kidul bisa dipanggil hanya dengan gerakan tangan di depan webcam? Itulah ide proyek **Mitologi Nusantara**.

## Cara kerjanya

1. **Kamera** menangkap gambar tangan, lalu **MediaPipe Hand Landmarker** menemukan 21 titik pada setiap tangan.
2. Program membaca bentuk tangan: menjepit (jempol menempel telunjuk), mengepal, atau terbuka.
3. Jepit lalu buka → **kubus 3D** muncul di antara jari. Lebar jari menentukan besar kubus.
4. Tangan lain mengepal → kubus penuh **asap berwarna**. Kepalan dibuka → asap hilang, **titik-titik node** berkumpul dan berubah menjadi gambar tokoh.

## Membuat gambar diam menjadi "hidup"

Setiap tokoh hanya punya satu gambar, tapi bisa bergerak dengan teknik *warping*: posisi piksel digeser sedikit demi sedikit setiap frame.

```python
# contoh: sayap mengepak = bagian kiri & kanan berputar pada bahu
theta = kuat * sin(laju * t) * bobot_sayap
dx = rx * (cos(theta) - 1) - ry * sin(theta)
dy = rx * sin(theta) + ry * (cos(theta) - 1)
```

Jenis gerak yang dipakai: `napas`, `goyang`, `putar` (sayap), `liuk` (naga), `kibar` (rambut), dan `api` (Banaspati).

## Pelajaran

- Deteksi gerakan tangan perlu **ambang ganda** (hysteresis) supaya tidak berkedip-kedip.
- Gambar tokoh perlu dipisahkan dari latar belakangnya dulu (GrabCut di OpenCV).

Kode lengkap: [github.com/des1susanti/mitologi-nusantara](https://github.com/des1susanti/mitologi-nusantara)

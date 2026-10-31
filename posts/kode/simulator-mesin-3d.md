# Simulator Mesin 3D: Membongkar Mobil dengan Dua Tangan

![Mobil terbongkar](img/proyek/mesin3d.jpg)

Mobil sport ini tersusun dari **puluhan ribu titik cahaya**, dibuat langsung dengan rumus matematika (tanpa file model 3D).

## Gerakan

- **Dua tangan dijauhkan** → mobil terbongkar menjadi 25 bagian, lengkap dengan nama.
- **Cubit** satu bagian → bagian itu bisa ditarik keluar.
- **Kepalkan tangan** → semua bagian kembali terakit.

## Trik teknis

Setiap titik punya arah "bongkar" sendiri. Posisi akhirnya cukup:

```python
posisi = posisi_awal + arah_bongkar * tingkat_bongkar + tarikan_cubit
```

Titik-titik digambar dengan `numpy.bincount` lalu diberi efek cahaya (*glow*) dengan Gaussian blur, sehingga tetap cepat walau titiknya banyak.

Kode lengkap: [github.com/des1susanti/simulator-mesin-3d](https://github.com/des1susanti/simulator-mesin-3d)

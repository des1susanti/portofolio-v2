# Presensi Flutter: Absen WFO/WFH dengan Geofencing dan Verifikasi Wajah

![Presensi Flutter](img/proyek/presensi.jpg)

Aplikasi presensi berbasis **Flutter** dan **Firebase** untuk civitas akademika perguruan tinggi, yang mendukung kerja dari kantor (WFO) maupun dari rumah (WFH).

## Fitur utama

| Fitur | Fungsi |
|---|---|
| Geofencing | Presensi WFO hanya bisa dilakukan di dalam area kampus |
| Deteksi Fake GPS | Menolak presensi dari lokasi palsu |
| Verifikasi wajah | Memastikan yang melakukan presensi adalah orang yang benar |

## Alur aplikasi

![Halaman masuk, presensi, dan profil](img/proyek/presensi-layar.jpg)

**1. Masuk.** Pengguna login dengan NIDN/NIK dan kata sandi. Tersedia pilihan bahasa Indonesia dan Inggris.

**2. Presensi.** Peta menampilkan lingkaran area kampus dan posisi pengguna, lengkap dengan jam, tanggal, dan alamat. Pengguna memilih WFO atau WFH, lalu menekan *Absen Masuk* atau *Absen Keluar*. Untuk WFO, aplikasi memastikan pengguna berada di dalam area, misalnya *"39 m dari kampus · Dalam area"*.

**3. Profil.** Menampilkan data pengguna dan rekap kehadiran bulan ini: jumlah hari hadir dan izin/cuti.

Teknologi: Flutter, Dart, Firebase, OpenStreetMap.

Kode lengkap: [github.com/des1susanti/presensi-flutter](https://github.com/des1susanti/presensi-flutter)

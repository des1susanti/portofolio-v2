# FTTH Self-Reporting: Lapor Gangguan Internet Sendiri

![FTTH Self-Reporting](img/proyek/ftth.jpg)

Aplikasi web **Laravel 11** agar pelanggan internet FTTH (fiber to the home) bisa melaporkan gangguan sendiri, sekaligus merapikan alur kerja teknisi dan manajemen.

## Empat peran

| Peran | Yang bisa dilakukan |
|---|---|
| Pelanggan | Membuat laporan gangguan dan memantau progres tiket |
| Teknisi | Menerima tugas dan memperbarui status dari lapangan |
| Admin & Manager | Membagi tugas, mengelola pengguna, mengekspor laporan (PDF/Excel) |

Hak akses tiap halaman dijaga lewat **middleware** Laravel yang terhubung ke kolom `role` di database.

Teknologi: Laravel 11, MySQL/MariaDB, Tailwind CSS.

Kode lengkap: [github.com/des1susanti/ftth-self-reporting](https://github.com/des1susanti/ftth-self-reporting)

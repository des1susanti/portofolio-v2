# ETL SAP ↔ iCRM+: Rekonsiliasi Data Gudang Otomatis

![ETL SAP iCRM](img/proyek/etl.jpg)

Aplikasi web untuk **ETL (Extract, Transform, Load)** dan **rekonsiliasi data** antara SAP dan iCRM+, supaya tim gudang tidak lagi mencocokkan stok secara manual di spreadsheet.

## Fitur utama

- **Pipeline ETL otomatis:** mengambil data dari SAP dan iCRM+, menyeragamkan formatnya, lalu memuatnya ke satu database.
- **Mesin rekonsiliasi:** menandai selisih jumlah, kode barang yang hilang, dan perbedaan status.
- **Laporan siap audit:** bisa diunduh dalam Excel/PDF.

## Dua peran

- **Admin Gudang:** memicu sinkronisasi harian dan melihat peringatan selisih.
- **Manager:** memantau dasbor, tren, dan menyetujui laporan akhir.

Teknologi: Laravel 11, PHP, MySQL.

Kode lengkap: [github.com/des1susanti/etl-sap-icrm-supply-chain](https://github.com/des1susanti/etl-sap-icrm-supply-chain)

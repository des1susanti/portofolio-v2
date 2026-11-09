# Prediksi Prestasi Siswa dengan ANN dan SVR di Orange Data Mining

![Student Achievement Prediction: ANN vs SVR](img/proyek/student-achievement.jpg)

Penelitian S2 saya membandingkan dua algoritma *machine learning*, **Artificial Neural Network (ANN)** dan **Support Vector Regression (SVR)**, untuk memprediksi prestasi belajar siswa SMK Telkom Lampung. Hasilnya terbit di **JURNAL INFOTEL Vol. 16 No. 3 (2024)**, jurnal nasional terakreditasi Sinta 2.

## Data

- **550 data siswa** dengan **26 fitur** akademik dan nonakademik.
- Contoh fiturnya: nilai rata-rata, peringkat, keterlambatan, ketidakhadiran, prestasi akademik dan nonakademik, kegiatan ekstrakurikuler, dan jarak rumah ke sekolah.

## Alur kerja di Orange

![Alur kerja Orange Data Mining](img/proyek/student-achievement-workflow.jpg)

1. **Data:** data latih dan data uji dimuat terpisah, lalu kolom yang dipakai dipilih dengan *Select Columns*.
2. **Pra-pemrosesan:** normalisasi fitur.
3. **Model:** ANN dengan dua lapisan tersembunyi (100 dan 200 neuron), serta SVR.
4. **Evaluasi:** *Test and Score* dengan MSE, RMSE, MAE, dan R², dilengkapi *Predictions*, *Scatter Plot*, dan *Box Plot* untuk membandingkan hasil prediksi.

## Hasil

ANN menunjukkan kinerja **sedikit lebih unggul** daripada SVR dalam memprediksi prestasi siswa. Rincian angka dan pembahasannya dapat dibaca di artikel jurnal.

## Catatan privasi

Data asli berisi informasi pribadi siswa, sehingga **tidak dibagikan**. Repositori hanya berisi alur kerja Orange dan dokumentasinya.

Teknologi: Orange Data Mining, ANN, SVR.

- Artikel: [doi.org/10.20895/infotel.v16i3.1163](https://doi.org/10.20895/infotel.v16i3.1163)
- Alur kerja: [github.com/des1susanti/student-achievement-ann-svr](https://github.com/des1susanti/student-achievement-ann-svr)

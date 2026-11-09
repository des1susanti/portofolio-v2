# Rice Pest Detection: Mendeteksi 14 Jenis Hama Padi dengan YOLOv8

![Rice Pest Detection with YOLOv8](img/proyek/ricepest.jpg)

Hama padi bisa menurunkan hasil panen secara besar, padahal mengenali jenisnya masih banyak dilakukan secara manual. Dalam proyek ini saya melatih model **deteksi objek YOLOv8** untuk menemukan letak serangga pada foto sekaligus mengenali jenisnya, lalu membandingkan model yang ringan dengan model yang lebih besar.

## Data

- **Dataset IP102** (Wu dkk., CVPR 2019), dataset publik hama serangga yang banyak dipakai dalam riset.
- Diambil **14 jenis hama padi**, antara lain penggulung daun (*rice leaf roller*), wereng cokelat (*brown plant hopper*), penggerek batang kuning (*yellow rice borer*), dan ganjur (*rice gall midge*).
- **1.011 gambar latih** dan **237 gambar uji**, dengan total **1.306 objek** berlabel kotak (*bounding box*).

## Cara kerja

1. Mengubah anotasi Pascal VOC (XML) menjadi format YOLO, termasuk menangani beberapa file XML yang rusak.
2. *Transfer learning*: model yang sudah dilatih pada dataset COCO dilatih ulang untuk hama padi.
3. Membandingkan dua ukuran model, **YOLOv8n** (±3 juta parameter) dan **YOLOv8s** (±11 juta parameter), masing-masing 50 epoch di Google Colab (GPU T4).

## Hasil

| Model | Precision | Recall | mAP@0,5 | mAP@0,5:0,95 | Kecepatan | Ukuran |
|---|---|---|---|---|---|---|
| YOLOv8n | 0,636 | 0,781 | 0,753 | 0,458 | 4 ms/gambar | 6,2 MB |
| YOLOv8s | 0,669 | 0,711 | 0,735 | 0,460 | 8 ms/gambar | 22,5 MB |

![Contoh hasil deteksi](img/proyek/ricepest-hasil.jpg)

**Temuan utama:** akurasi kedua model **setara**, tetapi YOLOv8n **dua kali lebih cepat** dan **3,6 kali lebih kecil**. Dengan data latih sekitar seribu gambar, kapasitas tambahan YOLOv8s belum memberi peningkatan akurasi, sehingga model ringan lebih tepat untuk perangkat di lapangan.

Jenis yang paling mudah dikenali adalah *rice water weevil* dan *rice gall midge*. Yang paling sulit adalah ulat daun dan wereng, karena bentuknya mirip satu sama lain dan contohnya sedikit.

## Keterbatasan

Foto IP102 umumnya berupa foto *close-up*, sehingga serangga tampak besar dan jelas. Di sawah, hama terlihat jauh lebih kecil, sering tertutup daun, dan kondisi cahayanya beragam. Menguji dan menyesuaikan model untuk kondisi lapangan adalah langkah berikutnya.

Teknologi: Python, PyTorch, Ultralytics YOLOv8, Google Colab, Gradio.

Kode lengkap: [github.com/des1susanti/rice-pest-yolov8](https://github.com/des1susanti/rice-pest-yolov8)

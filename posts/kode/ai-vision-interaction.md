# AI Vision Interaction System: Menggambar di Udara & Deteksi Objek

![AI Vision](img/proyek/aivision.jpg)

Repo ini berisi dua modul interaksi berbasis **computer vision**.

## 1. Virtual Paint
Menggambar di udara tanpa menyentuh apa pun. **MediaPipe** melacak titik-titik tangan, lalu koordinat ujung jari dipetakan menjadi goresan di kanvas OpenCV.

## 2. Deteksi objek YOLOv8 + logika tambahan
Model **YOLOv8** (pre-trained) mendeteksi objek secara real-time, lalu hasilnya diperbaiki dengan logika buatan sendiri:

- **Penyaringan spasial:** ukuran dan rasio kotak deteksi dipakai untuk membedakan objek yang mirip, misalnya *smartwatch* dan *ponsel*.
- **Pemetaan label kontekstual:** label standar COCO diubah menjadi istilah yang lebih sesuai, misalnya *Bottle* menjadi *Tumbler* atau *Toothbrush* menjadi *Pen*.

Teknologi: Python, OpenCV, Ultralytics YOLOv8, MediaPipe.

Kode lengkap: [github.com/des1susanti/AI-Vision-Interaction-System](https://github.com/des1susanti/AI-Vision-Interaction-System)

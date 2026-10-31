# Pohon Mangga dengan Python Turtle

![Pohon mangga](img/proyek/pohon.jpg)

Python Turtle biasanya dipakai untuk belajar menggambar garis. Di proyek ini, turtle dipakai untuk membuat **animasi utuh**: petani menanam benih, menyiram, akar dan tunas tumbuh, batang dan cabang membesar, daun rimbun, bunga berguguran, sampai mangga matang.

## Tips agar animasi lancar

- Matikan animasi bawaan dengan `screen.tracer(0)` dan panggil `screen.update()` sendiri.
- Ribuan daun digambar **langsung ke kanvas Tk** (`create_polygon`), jauh lebih cepat daripada lewat turtle.
- Cabang pohon dibuat dengan **rekursi**: setiap cabang melahirkan 2–3 cabang yang lebih kecil.

Kode lengkap: [github.com/des1susanti/turtle-animation-pohon](https://github.com/des1susanti/turtle-animation-pohon)

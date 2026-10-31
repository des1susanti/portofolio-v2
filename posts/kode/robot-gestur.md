# Robot Gestur: Menjadi Dalang dengan Ujung Jari

![Robot marionet](img/proyek/robot.jpg)

Proyek ini terinspirasi dari wayang dan boneka marionet. Robot ungu di layar terhubung **benang emas** ke setiap ujung jari.

## Pemetaan jari ke tubuh robot

| Jari | Bagian robot |
|---|---|
| Telunjuk & jari manis | Kedua lengan |
| Jari tengah | Kepala & badan |
| Jempol & kelingking | Kedua kaki |

Seberapa lurus sebuah jari dihitung dari jarak ujung jari ke pergelangan dibandingkan jarak pangkal jari ke pergelangan:

```python
lurus = (jarak(ujung, pergelangan) / jarak(pangkal, pergelangan) - 1.05) / 0.75
```

## Tangan kedua

Tangan kiri tidak memegang benang, tetapi menjadi **penggerak**: digeser untuk berjalan, diangkat cepat untuk melompat, dikepal untuk duduk.

Kode lengkap: [github.com/des1susanti/robot-gestur](https://github.com/des1susanti/robot-gestur)

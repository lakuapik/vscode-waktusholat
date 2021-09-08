# Waktu Sholat

[![visual studio marketplace](https://img.shields.io/badge/visual%20studio%20marketplace-v2.0.0-blue)](https://marketplace.visualstudio.com/items?itemName=lakuapik.waktusholat)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/lakuapik.waktusholat)](https://marketplace.visualstudio.com/items?itemName=lakuapik.waktusholat)
[![Rating](https://img.shields.io/visual-studio-marketplace/stars/lakuapik.waktusholat)](https://marketplace.visualstudio.com/items?itemName=lakuapik.waktusholat)

Ekstensi Visual Studio Code (vscode) untuk menampilkan dan mengingatkan waktu sholat.

![img alt](https://cdn.statically.io/gh/lakuapik/vscode-waktusholat/v2.x/screenshots/animated.gif)

Data waktu sholat diambil dari https://github.com/lakuapik/jadwalsholatorg/tree/master/adzan yang merupakan hasil parsing dari website https://jadwalsholat.org.

## Fitur

### Status Bar

![img alt](https://cdn.statically.io/gh/lakuapik/vscode-waktusholat/v2.x/screenshots/status-bar.png)

### Notifikasi 5 menit sebelum

![img alt](https://cdn.statically.io/gh/lakuapik/vscode-waktusholat/v2.x/screenshots/5-min-before.png)

### Notifikasi waktu tiba

![img alt](https://cdn.statically.io/gh/lakuapik/vscode-waktusholat/v2.x/screenshots/on-time.png)

### Suara Adzan

Ekstensi ini menggunakan perkakas [`play-sound`](https://www.npmjs.com/package/play-sound) untuk memutar suara adzan.

Apabila suara adzan tidak terdengar, silahkan pasang aplikasi berikut ini:

* Windows (belum di tes):
* Ubuntu GNU/Linux
  ```bash
  $ sudo apt install mpg123
  ```
* MacOS (belum di tes): `afplay`

## Pengaturan

* `waktusholat.kota`  
  Jadwal waktu sholat mengikuti kota yang dipilih.

* `waktusholat.suara-adzan-aktif`  
  Aktif/Non-aktifkan suara kumandang azdan.

## Perintah

* **Waktu Sholat : Perbarui Jadwal**  
  Memperbarui data jadwal waktu sholat.

* **Waktu Sholat : Pilih Kota**  
  Jadwal waktu sholat mengikuti kota yang dipilih.

## Atribusi
* Ikon oleh [Freepik](https://www.flaticon.com/authors/freepik) diunduh di [www.flaticon.com](https://www.flaticon.com/free-icon/muslim-man-praying_84628).

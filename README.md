# Waktu Sholat

[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/version/lakuapik.waktusholat.svg?tyle=flat-square)](https://marketplace.visualstudio.com/items?itemName=lakuapik.waktusholat)
[![Installs](https://vsmarketplacebadge.apphb.com/installs-short/lakuapik.waktusholat.svg?tyle=flat-square)](https://marketplace.visualstudio.com/items?itemName=lakuapik.waktusholat)
[![Rating](https://vsmarketplacebadge.apphb.com/rating-star/lakuapik.waktusholat.svg?tyle=flat-square)](https://marketplace.visualstudio.com/items?itemName=lakuapik.waktusholat)

Ekstensi Visual Studio Code (vscode) untuk menampilkan dan mengingatkan waktu sholat.

> [PENTING] Ubah kota di pengaturan setelah Anda selesai memasang ekstensi ini.

Data waktu sholat diambil dari https://github.com/lakuapik/jadwalsholatorg/tree/master/adzan yang merupakan hasil parsing dari website https://jadwalsholat.org.

## Tampilan

### Status Bar

![img alt](https://raw.githubusercontent.com/lakuapik/vscode-waktusholat/master/screenshots/status-bar.png)

### Notifikasi 5 menit sebelum

![img alt](https://raw.githubusercontent.com/lakuapik/vscode-waktusholat/master/screenshots/waktunya-dzuhur-min-5.png)

### Notifikasi waktu tiba

![img alt](https://raw.githubusercontent.com/lakuapik/vscode-waktusholat/master/screenshots/waktunya-dzuhur.png)

## Suara Adzan

Ekstensi ini menggunakan perkakas [`play-sound`](https://www.npmjs.com/package/play-sound) untuk memutar suara adzan.

Apabila suara adzan tidak terdengar, silahkan pasang aplikasi berikut ini:

* Windows (belum di tes):
* Ubuntu GNU/Linux
  ```bash
  $ sudo apt install mpg123
  ```
* MacOs (belum di tes): `afplay`

## Pengaturan

![img alt](https://raw.githubusercontent.com/lakuapik/vscode-waktusholat/master/screenshots/settings.png)

* `waktusholat.kota`  
  Jadwal waktu sholat mengikuti kota yang ditentukan.

## Perintah

![img alt](https://raw.githubusercontent.com/lakuapik/vscode-waktusholat/master/screenshots/commands.png)

* `waktusholat.update`  
  Waktu Sholat : Update  
  Memperbarui data jadwal waktu sholat.

* `waktusholat.selectCity`  
  Waktu Sholat : Pilih Kota  
  Jadwal waktu sholat mengikuti kota yang ditentukan.

## Ikon
Icons made by [Freepik](https://www.flaticon.com/authors/freepik) from [www.flaticon.com](https://www.flaticon.com/free-icon/muslim-man-praying_84628)

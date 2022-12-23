# Change Log

## [2.0.1] - 2022-12-23

### Fixed
- Gagal ketika pertama kali dibuka di windows (masalah mkdir) ([#15](https://github.com/lakuapik/vscode-waktusholat/pull/15))

## [2.0.0] - 2021-09-08

Dirombak, dibuat lebih sederhana dan *maintainable*.

### Added
- Popup pilih kota saat pertama kali pasang ekstensi
- Popup aktifkan suara adzan saat pertama kali pasang ekstensi
- Opsi aktif/non-aktifkan suara adzan bisa diatur lewat konfigurasi
- Tambah pustaka `esbuild` sebagai ganti `webpack` untuk bundle javascript
- Tambah pustaka `underscorejs` sebagai ganti `lodash`
- Tambah pustaka `node-fetch` sebagai ganti `request` dan `request-promise`
- Tambah lisensi [MIT](./LICENSE.md)

### Fixed
- Hanya perbarui jadwal ketika perubahan konfigurasi kota
- Pembaruan kode dan penyederhanaan logic ([#12](https://github.com/lakuapik/vscode-waktusholat/issues/12))
- Freeze ketika perbarui jadwal ([#9](https://github.com/lakuapik/vscode-waktusholat/issues/9))
- Kumandangkan suara adzan saat `shubuh|dzuhur|ashr|magrib|isya` saja ([#8](https://github.com/lakuapik/vscode-waktusholat/issues/8))
- Suara adzan bentrok ketika membuka lebih dari 1 vscode secara bersamaan ([#7](https://github.com/lakuapik/vscode-waktusholat/issues/7))

### Removed
- Hapus pustaka yang tidak diperlukan

## [1.1.0] - 2020-09-19

### Added
- Download berkas adzan mp3 dari internet

### Fixed
- Suara adzan tidak berputar

### Removed
- Hapus berkas adzan mp3, folder `sounds`

## [1.0.6] - 2020-04-21

### Added
- Memutar suara adzan ketika waktu sholat tiba

## [1.0.5] - 2019-11-08

### Added
- Screenshoot tampilan

## [1.0.4] - 2019-11-08

### Fixed
- Waktu undefined setelah isya

## [1.0.3] - 2019-11-06

### Added
- Notifikasi 5 menit sebelum waktu sholat tiba
- Alert untuk memilih kota saat pertama menjalankan ekstensi

### Fixed
- Status bar
- Refactor kode

## [1.0.2] - 2019-11-04

### Added
- Fungsi ketika status bar di klik

### Fixed
- Ganti style penulisan js
- Update data waktu sholat

## [1.0.1] - 2019-11-02

### Added
- Ikon
- Perintah untuk memilih kota dengan `QuickPick`

### Fixed
- Ganti librari `request` ke `request-promise`
- Letak file json diubah dari `tmp` ke `globalStoragePath`

## [1.0.0] - 2019-11-01

### Added
- Notifikasi ketika waktu sholat tiba
- Pengaturan kota (mempengaruhi waktu sholat)
- Status Bar waktu sholat selanjutnya dan muncul tooltip ketika di hover
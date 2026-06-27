# 🎮 ZakiTopup - Platform Top-Up Game Premium (Inspirasi Lapakgaming & Lapakhuda)

Selamat datang di **ZakiTopup**! Ini adalah website top-up game full-stack simulated yang dirancang dengan estetika premium modern (*dark mode* futuristik dengan aksen neon ungu-violet & cyan, glassmorphism, dan animasi mikro yang halus). 

Aplikasi ini dibangun menggunakan arsitektur **Single-Page Application (SPA) berbasis Vanilla HTML, CSS, dan JavaScript**, serta didukung oleh mesin database simulasi berbasis **`localStorage`**.

---

## ⚡ Cara Menjalankan Aplikasi (Sangat Mudah!)

Karena proyek ini dirancang tanpa memerlukan server backend Node.js/Python yang rumit, Anda dapat langsung menjalankan dan mengujinya di komputer Anda tanpa instalasi apa pun:

1. Pergi ke direktori proyek Anda: `c:\Users\qwner\OneDrive\Dokumen\zakiatha`.
2. Temukan berkas **`index.html`**.
3. **Klik ganda (double-click)** berkas `index.html` untuk membukanya di browser web favorit Anda (Google Chrome, Microsoft Edge, Firefox, Safari, dll.).
4. Website akan langsung terbuka, memuat data katalog game awal secara otomatis, dan siap digunakan!

---

## ✨ Fitur-Fitur Utama & Halaman

Navigasi antar halaman dilakukan secara instan tanpa memuat ulang halaman (*no page reload*) berkat router URL Hash (`#`):

### 1. 🏠 Halaman Utama (`#home`)
- **Hero Banner Premium**: Menampilkan promosi dinamis dengan efek visual modern.
- **Pencarian Real-Time**: Ketik nama game di kotak pencarian, dan katalog game akan tersaring secara otomatis saat Anda mengetik.
- **Filter Kategori**: Menyaring game berdasarkan kategori (Semua, Mobile Games, PC Games, Voucher).
- **Katalog Grid Interaktif**: Kartu game yang responsif dengan efek hover menyala (*glowing*) dan perbesaran gambar dinamis. Semua game menggunakan **logo ikon SVG kustom** yang tajam dan tidak akan pecah saat diperbesar.

### 2. 🎮 Halaman Detail Top-up (`#game/:slug`)
- **Form Input Akun Dinamis**: Bidang input menyesuaikan dengan game yang dipilih (misalnya: *User ID + Zone ID* untuk Mobile Legends, *Riot ID* untuk Valorant, *UID + Dropdown Server* untuk Genshin Impact).
- **Pilihan Nominal Terstruktur**: Grid nominal item (Diamond, UC, VP, dll.) lengkap dengan harga coret diskon dan badge "Populer".
- **Kalkulator Pembayaran Real-Time**: Menampilkan pilihan metode pembayaran (QRIS, DANA, OVO, ShopeePay, Transfer Bank VA, Alfamart, Indomaret). Ketika Anda memilih nominal paket, **total biaya akhir (Harga Item + Biaya Admin flat/persentase) langsung dihitung dan diperbarui secara real-time** pada setiap kartu pembayaran.
- **Simulasi Verifikasi Akun**: Saat mengklik tombol "Beli Sekarang", sistem akan menampilkan indikator pemuatan (*spinner*) selama 1,2 detik untuk mensimulasikan pencarian database asli sebelum memverifikasi dan menampilkan Nickname pemain yang realistis (misalnya: `Gamer_GGWP`).
- **Input WhatsApp**: Menyimpan kontak WhatsApp untuk pengiriman detail tagihan.

### 3. 📄 Halaman Invoice & Detail Pembayaran (`#invoice/:id`)
- **Countdown Timer Real-Time**: Waktu hitung mundur 24 jam untuk pembayaran berjalan mundur setiap detik. Jika waktu habis, status otomatis berubah menjadi `FAILED` (Kedaluwarsa).
- **Instruksi Bayar Kontekstual**: 
  - **QRIS**: Menampilkan visual kode QRIS kustom (SVG).
  - **Virtual Account (VA)**: Menampilkan nomor rekening VA beserta tombol **Salin** fungsional yang menyalin nomor ke clipboard Anda.
  - **Retail**: Menampilkan kode pembayaran kustom (seperti `ZK-XXXXXXXXX`) untuk ditunjukkan ke kasir.
- **Panel Simulator Pembayaran (Sangat Keren!)**: Di bagian bawah halaman invoice, terdapat panel pengembang khusus. Klik tombol **"Bayar Sukses (Simulasi)"** atau **"Bayar Gagal"** untuk mengirimkan sinyal ke database lokal. Status transaksi, visual ikon, dan teks petunjuk akan langsung berubah secara instan (misal menampilkan kode Serial Number / SN pengiriman Diamond jika sukses).

### 4. 🔍 Pelacakan Pesanan (`#track`)
- Cari transaksi Anda sebelumnya dengan memasukkan **Nomor Invoice** atau **Nomor WhatsApp**.
- Menampilkan riwayat transaksi lengkap dengan tanggal, nominal, dan statusnya. Klik pada baris riwayat untuk membuka kembali invoice aslinya.

### 5. 🛠️ Dashboard Admin Super Lengkap (`#admin`)
Ini adalah pusat fungsionalitas backend simulasi Anda:
- **Statistik Keuangan**: Memantau Total Pendapatan (akumulasi transaksi sukses), jumlah transaksi sukses/pending, dan jumlah game aktif.
- **Kelola Transaksi**: Melihat semua riwayat transaksi masuk di sistem. Admin dapat menyetujui (`SUCCESS`) atau membatalkan (`FAILED`) transaksi secara manual.
- **Kelola Game (Full CRUD)**: Tambah game baru, edit data game lama, ubah status aktif/non-aktif, atau hapus game. Anda dapat mengatur konfigurasi form input data akun melalui skema JSON sederhana langsung dari form! Game baru yang disimpan akan **langsung muncul di halaman utama** seketika.
- **Kelola Nominal (Product CRUD)**: Tambah nominal paket baru, atur harga jual, dan nyalakan/matikan status rekomendasi "Populer" untuk game apa pun.
- **Kelola Pembayaran**: Aktifkan/nonaktifkan metode pembayaran tertentu atau ubah besaran biaya admin.

---

## 📂 Struktur Berkas Proyek

Proyek ini terorganisir dengan sangat rapi dan modular:

```text
zakiatha/
├── index.html            # Wadah utama aplikasi (SPA Shell)
├── styles.css            # Sistem desain master (CSS Variables, Utilities, Components)
├── README.md             # Dokumentasi ini (Panduan penggunaan)
└── js/
    ├── db.js             # Mesin Database Lokal (Simulasi CRUD menggunakan localStorage)
    ├── app.js            # Router utama & koordinator tampilan
    └── views/
        ├── home.js       # View: Landing Page & Katalog Game
        ├── detail.js     # View: Form Top-up, Nominal, & Pembayaran
        ├── invoice.js    # View: Detail Pembayaran & Simulasi Transaksi
        ├── track.js      # View: Pelacakan Status & Riwayat Transaksi
        └── admin.js      # View: Dashboard Admin & Pengelolaan Data
```

---

## 🔧 Pengembangan Lebih Lanjut (Menjadi Real Full-Stack)

Jika di masa mendatang Anda ingin menghubungkan aplikasi ini ke database server sungguhan (seperti Node.js, Express, MongoDB, MySQL, atau Supabase):
1. Anda hanya perlu memodifikasi berkas **`js/db.js`**.
2. Ubah fungsi-fungsi di dalam objek `dbService` (seperti `getGames`, `createTransaction`, dll.) untuk melakukan panggilan API (`fetch` ke endpoint backend Anda) alih-alih membaca/menulis ke `localStorage`.
3. Seluruh antarmuka (HTML, CSS, JS Views) Anda akan tetap berfungsi 100% tanpa perlu diubah sama sekali! Ini membuat arsitektur aplikasi ini sangat modular dan siap untuk ditingkatkan ke tingkat produksi komersial.

*Selamat mencoba dan bersenang-senang menguji platform ZakiTopup Anda!*

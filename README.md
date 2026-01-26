# Restaurant/Cafe Landing Template (Static)

Template 1 halaman (HTML + Tailwind CDN) dengan menu yang bisa:
- filter kategori
- search
- modal detail + tombol order WhatsApp
- tombol Full Menu (PDF)

## Struktur
- `index.html` : halaman utama
- `data/site.json` : semua info bisnis (nama, WA, alamat, jam buka, link PDF, map, gambar)
- `data/menu.json` : daftar menu (kategori, harga, deskripsi, badges)
- `js/app.js` : render menu + modal + WA link
- `assets/images/` : taruh gambar sendiri (hero & gallery)

## Cara edit (paling sering)
1) Buka `data/site.json`, ganti:
   - `brandName`, `whatsappNumber`, `address`, dll
2) Buka `data/menu.json`, edit item menu:
   - `name`, `category`, `price`, `desc`, `badges`
3) Ganti gambar di `assets/images/` (nama file disesuaikan dengan `site.json`).

## Deploy ke Vercel (paling enak via GitHub)
1) Buat repo di GitHub, upload semua file folder ini.
2) Vercel → Add New → Project → Import repo.
3) Framework: **Other**
4) Build Command: **(kosong / None)**
5) Output Directory: **(kosong)**  
Selesai — karena ini static root.

## Deploy ke Netlify
### A) Drag & drop (paling cepat)
- Zip/unzip folder ini → drag folder ke Netlify (Site deploy).
### B) GitHub (lebih rapi)
1) New site from Git
2) Pilih repo
3) Build command kosong, publish directory: `/` (root)

## Catatan penting
- Karena `site.json` & `menu.json` dibaca via `fetch()`, template ini cocok untuk hosting (Vercel/Netlify). 
  Kalau dibuka langsung via file `index.html` (double click), sebagian browser bisa blok `fetch` file lokal.
  Solusi lokal: pakai live server (VSCode extension) saat preview.

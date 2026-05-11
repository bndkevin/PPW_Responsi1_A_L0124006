# Setup EmailJS untuk Sistem Reservasi KaKev Company

## Langkah-langkah Setup EmailJS:

### 1. Buat Akun EmailJS
1. Kunjungi https://www.emailjs.com/
2. Daftar akun gratis
3. Verifikasi email Anda

### 2. Setup Email Service
1. Di dashboard EmailJS, klik "Email Services"
2. Klik "Add New Service"
3. Pilih provider email (Gmail, Outlook, dll.)
4. Masukkan kredensial email Anda
5. Simpan service dan catat **Service ID**

### 3. Buat Email Template untuk Reservasi
1. Klik "Email Templates"
2. Klik "Create New Template"
3. Beri nama template: `reservasi`
4. Gunakan template berikut:

**Subject:**
```
Reservasi Baru dari {{customer_name}} - KaKev Company
```

**Template Body:**
```
Halo Admin KaKev Company,

Ada reservasi baru masuk dari website:

DETAIL PELANGGAN:
- Nama Lengkap: {{customer_name}}
- Email: {{customer_email}}
- Nomor Telepon: {{customer_phone}}

DETAIL RESERVASI:
- Tanggal: {{reservation_date}}
- Waktu: {{reservation_time}}
- Jumlah Orang: {{number_of_people}}
- Cabang: {{branch_name}}

CATATAN KHUSUS:
{{special_notes}}

Waktu Pengiriman: {{timestamp}}

Mohon segera konfirmasi reservasi ini.

Terima kasih,
Sistem Reservasi KaKev Company
```

4. Simpan template dan catat **Template ID** sebagai `template_reservasi` (atau gunakan nama template sebagai ID).

5. Buat Email Template untuk Pesanan Delivery & Takeaway
1. Klik "Email Templates"
2. Klik "Create New Template"
3. Beri nama template: `order`
4. Gunakan template berikut:
```
Pesanan Baru dari {{customer_name}} - KaKev Company
```

**Template Body:**
```
Halo Admin KaKev Company,

Ada pesanan baru masuk dari website:

DETAIL PELANGGAN:
- Nama Lengkap: {{customer_name}}
- Email: {{customer_email}}

DETAIL PESANAN:
- Menu: {{order_item}}
- Jumlah: {{order_quantity}}
- Tipe: {{order_type}}
- Cabang: {{branch_name}}

CATATAN KHUSUS:
{{special_notes}}

Waktu Pengiriman: {{timestamp}}

Mohon segera proses pesanan ini.

Terima kasih,
Sistem Pesanan KaKev Company
```

6. Simpan template pesanan dan catat **Template ID** sebagai `template_order` (atau gunakan nama template sebagai ID).

### 4. Dapatkan Public Key
1. Di dashboard EmailJS, klik "Account"
2. Copy **Public Key**

### 5. Update script.js dengan Credentials EmailJS

Ganti placeholder di `src/script.js`:

```javascript
// Ganti YOUR_PUBLIC_KEY_HERE dengan Public Key Anda
emailjs.init("YOUR_PUBLIC_KEY_HERE");

// Reservation Form menggunakan:
emailjs.send('YOUR_SERVICE_ID', 'template_reservasi', emailData)

// Order Form menggunakan:
emailjs.send('YOUR_SERVICE_ID', 'template_order', emailData)
```

**Catatan:**
- Template `template_reservasi`: Untuk form Sistem Reservasi Online
- Template `template_order`: Untuk form Delivery & Takeaway
- Kedua template menggunakan Service ID yang sama
- Pastikan nama template di EmailJS matches dengan yang di script.js

### 6. Test Sistem
1. Jalankan website secara lokal
2. Isi form **Sistem Reservasi Online** dan klik "Ajukan Reservasi"
   - Email akan dikirim dengan template reservasi
3. Isi form **Delivery & Takeaway** dan klik "Kirim Pesanan via AJAX"
   - Email akan dikirim dengan template order
4. Periksa email `anthoniajayani@gmail.com` untuk kedua jenis pesan

## Ringkasan Field di Setiap Template

**Template Reservasi:**
- `customer_name`, `customer_email`, `customer_phone`
- `reservation_date`, `reservation_time`, `number_of_people`
- `special_notes`, `branch_name`, `timestamp`

**Template Order:**
- `customer_name`, `customer_email`
- `order_item`, `order_quantity`, `order_type`
- `special_notes`, `branch_name`, `timestamp`

## Catatan Penting:
- EmailJS memiliki limit gratis 200 email per bulan
- Pastikan nama template di EmailJS **EXACTLY sama** dengan yang di script.js
- Pastikan Service ID sudah dikonfigurasi dengan benar
import sys

# Membaca input tiga integer (jam, menit, detik) dari Bumi
input_line = sys.stdin.readline().strip()
H, M, S = map(int, input_line.split())

# Menghitung total detik di Bumi dari tengah malam
total_seconds_earth = H * 3600 + M * 60 + S

# Menghitung total "detik" di Roketin Planet menggunakan fraksi hari
total_rok_seconds = (total_seconds_earth / 86400) * 100000

# Mengonversi total_rok_seconds ke jam, menit, detik di Roketin
HR = int(total_rok_seconds // 10000)  # 1 jam = 10,000 "detik" Roketin
remaining = total_rok_seconds % 10000
MR = int(remaining // 100)            # 1 menit = 100 "detik" Roketin
SR = int(remaining % 100)             # Sisa adalah detik

# Fungsi untuk memformat angka menjadi dua digit
def pad(num):
    return f"{num:02d}"

# Memformat waktu Bumi dan Roketin
earth_time = f"{pad(H)}:{pad(M)}:{pad(S)}"
rok_time = f"{pad(HR)}:{pad(MR)}:{pad(SR)}"

# Menampilkan hasil
print(f"on earth {earth_time}, on planet Roketin Planet : {rok_time}")
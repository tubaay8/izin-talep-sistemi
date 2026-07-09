INSERT INTO roles (name, description) VALUES
  ('Admin', 'Sistem yoneticisi, tum kayitlari yonetebilir'),
  ('Yonetici', 'Kendi personelinin izin taleplerini onaylar/reddeder'),
  ('Personel', 'Izin talebi olusturabilir')
ON DUPLICATE KEY UPDATE description = VALUES(description);

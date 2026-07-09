INSERT INTO departments (name) VALUES
  ('Insan Kaynaklari'),
  ('Bilgi Islem'),
  ('Muhasebe'),
  ('Satis')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Sadece yillik izin hakki kotasindan dusen izin turlerini isaretler.
ALTER TABLE leave_types
  ADD COLUMN IF NOT EXISTS counts_toward_quota TINYINT(1) NOT NULL DEFAULT 0;

-- Not: veritabaninda "Yillik Izin" hem duzgun Turkce karakterlerle hem de
-- eski ASCII haliyle (farkli seed calistirmalarindan kalma) mukerrer olarak
-- kayitli olabilir. Ikisini de isaretliyoruz ki mevcut/gelecek talepler
-- hangi kayda baglanirsa baglansin kota dogru islesin.
UPDATE leave_types SET counts_toward_quota = 1 WHERE name IN ('Yıllık İzin', 'Yillik Izin');

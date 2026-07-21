-- Sadece yillik izin hakki kotasindan dusen izin turlerini isaretler.
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'leave_types' AND COLUMN_NAME = 'counts_toward_quota'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE leave_types ADD COLUMN counts_toward_quota TINYINT(1) NOT NULL DEFAULT 0',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Not: veritabaninda "Yillik Izin" hem duzgun Turkce karakterlerle hem de
-- eski ASCII haliyle (farkli seed calistirmalarindan kalma) mukerrer olarak
-- kayitli olabilir. Ikisini de isaretliyoruz ki mevcut/gelecek talepler
-- hangi kayda baglanirsa baglansin kota dogru islesin.
UPDATE leave_types SET counts_toward_quota = 1 WHERE name IN ('Yıllık İzin', 'Yillik Izin');

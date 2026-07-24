-- Departmanlar artik silinmiyor, sadece pasife alinip veritabaninda
-- kaliyor; bu sayede geçmiş kullanici/izin kayitlari bozulmadan tarihsel
-- olarak dogru gorunmeye devam eder.
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'departments' AND COLUMN_NAME = 'is_active'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE departments ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER manager_id',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

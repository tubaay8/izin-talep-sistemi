-- Izin turleri artik silinmiyor, sadece pasife alinip veritabaninda
-- kaliyor; bu sayede bu turu kullanan gecmis izin talepleri bozulmadan
-- tarihsel olarak dogru gorunmeye devam eder.
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'leave_types' AND COLUMN_NAME = 'is_active'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE leave_types ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER is_hourly',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

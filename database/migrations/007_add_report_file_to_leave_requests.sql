-- "ADD COLUMN IF NOT EXISTS" bazi MySQL surumlerinde (8.0.29 oncesi) desteklenmiyor;
-- bunun yerine INFORMATION_SCHEMA uzerinden kontrol edip PREPARE/EXECUTE ile
-- calistiriyoruz, boylece hem eski hem yeni surumlerde ve tekrar calistirmada calisir.
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'leave_requests' AND COLUMN_NAME = 'report_file'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE leave_requests ADD COLUMN report_file VARCHAR(255) NULL AFTER reason',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

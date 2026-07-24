-- Saatlik izin turunde talep, tek bir tarih icinde bir saat araligi olarak
-- girilir (start_date = end_date, start_time/end_time doludur). Gun bazli
-- izin turlerinde bu iki kolon NULL kalir.
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'leave_requests' AND COLUMN_NAME = 'start_time'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE leave_requests ADD COLUMN start_time TIME NULL AFTER end_date',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'leave_requests' AND COLUMN_NAME = 'end_time'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE leave_requests ADD COLUMN end_time TIME NULL AFTER start_time',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Saatlik izin gibi gun yerine saat araligiyla alinan izin turlerini
-- isaretlemek icin. Bu turde bir izin talebinde start_time/end_time
-- zorunlu olur, gun sayisi yerine saat sayisi hesaplanir.
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'leave_types' AND COLUMN_NAME = 'is_hourly'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE leave_types ADD COLUMN is_hourly TINYINT(1) NOT NULL DEFAULT 0 AFTER counts_toward_quota',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

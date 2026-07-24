-- Saatlik izinler biriktikce (bir is gunu = 540 dakika/9 saat) tam gune
-- tamamlanmamis kalan dakikayi tutar. 540'a ulasinca used_days 1 artar,
-- bu kolon sifirlanir (bkz. leaveBalance.service.js).
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'leave_balances' AND COLUMN_NAME = 'pending_minutes'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE leave_balances ADD COLUMN pending_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 0 AFTER used_days',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'leave_requests' AND COLUMN_NAME = 'delegate_user_id'
);
SET @col_sql = IF(@col_exists = 0,
  'ALTER TABLE leave_requests ADD COLUMN delegate_user_id INT UNSIGNED NULL AFTER reason',
  'SELECT 1');
PREPARE col_stmt FROM @col_sql;
EXECUTE col_stmt;
DEALLOCATE PREPARE col_stmt;

SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'leave_requests' AND CONSTRAINT_NAME = 'fk_leave_requests_delegate'
);
SET @sql = IF(@fk_exists = 0,
  'ALTER TABLE leave_requests ADD CONSTRAINT fk_leave_requests_delegate FOREIGN KEY (delegate_user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE SET NULL',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

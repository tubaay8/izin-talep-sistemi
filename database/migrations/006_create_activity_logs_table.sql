CREATE TABLE IF NOT EXISTS activity_logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  actor_id INT UNSIGNED NULL,
  actor_name VARCHAR(100) NOT NULL,
  actor_role VARCHAR(50) NOT NULL,
  target_user_id INT UNSIGNED NULL,
  action_type VARCHAR(50) NOT NULL,
  description VARCHAR(500) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_logs_actor FOREIGN KEY (actor_id)
    REFERENCES users (id) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_activity_logs_target FOREIGN KEY (target_user_id)
    REFERENCES users (id) ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_activity_logs_actor (actor_id),
  INDEX idx_activity_logs_target (target_user_id),
  INDEX idx_activity_logs_action_type (action_type),
  INDEX idx_activity_logs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

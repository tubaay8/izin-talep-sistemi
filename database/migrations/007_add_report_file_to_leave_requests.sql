ALTER TABLE leave_requests
  ADD COLUMN IF NOT EXISTS report_file VARCHAR(255) NULL AFTER reason;

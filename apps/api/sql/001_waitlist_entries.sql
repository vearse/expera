-- Run once against the Expera MySQL database before enabling production waitlist storage.
CREATE TABLE IF NOT EXISTS waitlist_entries (
  id CHAR(36) NOT NULL PRIMARY KEY,
  fullName VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,
  role VARCHAR(64) NOT NULL,
  institution VARCHAR(200) NULL,
  createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_waitlist_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Required for express-session + connect-pg-simple
CREATE TABLE IF NOT EXISTS sessions (
  sid varchar PRIMARY KEY,
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_expire_idx ON sessions(expire);

-- Verify table creation
SELECT table_name FROM information_schema.tables WHERE table_name = 'sessions';
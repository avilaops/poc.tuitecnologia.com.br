CREATE TABLE IF NOT EXISTS app_users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('guest', 'presenter', 'owner')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS app_users_username_lower_uidx
  ON app_users (lower(username));

CREATE TABLE IF NOT EXISTS app_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  token_digest CHAR(64) NOT NULL UNIQUE,
  ip_hash CHAR(64) NOT NULL,
  user_agent TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS app_sessions_expires_idx ON app_sessions (expires_at);

CREATE TABLE IF NOT EXISTS access_events (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  ip_hash CHAR(64) NOT NULL,
  user_agent TEXT NOT NULL DEFAULT '',
  path TEXT NOT NULL DEFAULT '/tr-poc/',
  success BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS access_events_created_idx ON access_events (created_at DESC);
CREATE INDEX IF NOT EXISTS access_events_type_idx ON access_events (event_type, created_at DESC);

CREATE TABLE IF NOT EXISTS used_sso_tokens (
  jti UUID PRIMARY KEY,
  used_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Incremental JWT hardening: bump on logout to invalidate refresh tokens.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "token_version" INTEGER NOT NULL DEFAULT 0;

-- Concurrency-safe per-company employee / sub-admin / main-admin code sequences.
-- Does not alter existing users.employee_id values.

CREATE TABLE IF NOT EXISTS "company_user_code_sequences" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "role_prefix" VARCHAR(10) NOT NULL,
    "next_value" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_user_code_sequences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "company_user_code_sequences_company_id_role_prefix_key"
  ON "company_user_code_sequences"("company_id", "role_prefix");

CREATE INDEX IF NOT EXISTS "company_user_code_sequences_company_id_idx"
  ON "company_user_code_sequences"("company_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'company_user_code_sequences_company_id_fkey'
  ) THEN
    ALTER TABLE "company_user_code_sequences"
      ADD CONSTRAINT "company_user_code_sequences_company_id_fkey"
      FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

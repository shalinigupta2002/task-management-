-- Add tenant ownership to task frequencies.
-- company_id NULL = platform/global master data (Super Admin only to mutate).
-- company_id SET = company-owned custom frequency.

ALTER TABLE "task_frequencies" ADD COLUMN IF NOT EXISTS "company_id" UUID;

-- Drop legacy global-only unique on frequency_name if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'task_frequencies_frequency_name_key'
  ) THEN
    ALTER TABLE "task_frequencies" DROP CONSTRAINT "task_frequencies_frequency_name_key";
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "task_frequencies_platform_name_key"
  ON "task_frequencies" ("frequency_name")
  WHERE "company_id" IS NULL AND "deleted_at" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "task_frequencies_company_name_key"
  ON "task_frequencies" ("company_id", "frequency_name")
  WHERE "company_id" IS NOT NULL AND "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "task_frequencies_company_id_idx"
  ON "task_frequencies" ("company_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'task_frequencies_company_id_fkey'
  ) THEN
    ALTER TABLE "task_frequencies"
      ADD CONSTRAINT "task_frequencies_company_id_fkey"
      FOREIGN KEY ("company_id") REFERENCES "companies"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

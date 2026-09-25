-- The previous migration dropped a CONSTRAINT named task_frequencies_frequency_name_key,
-- but Postgres still had a UNIQUE INDEX with the same name from the initial schema.
-- That global unique blocks company-scoped frequencies with the same name.

DROP INDEX IF EXISTS "task_frequencies_frequency_name_key";

/**
 * Concurrency-safe employee / sub-admin / main-admin code allocation.
 * Format: {companyCode}-{EMP|SA|MA}-{NNN}
 * Stored in User.employeeId (existing field + @@unique([companyId, employeeId])).
 *
 * Uses raw SQL against company_user_code_sequences so allocation works even if
 * the Prisma client has not been regenerated yet.
 */
import { randomUUID } from "crypto";
import prisma from "../config/database.js";
import ApiError from "../utils/ApiError.js";

export const ROLE_CODE_PREFIX = {
  EMPLOYEE: "EMP",
  SUB_ADMIN: "SA",
  MAIN_ADMIN: "MA",
};

export function roleNameToCodePrefix(roleName) {
  const prefix = ROLE_CODE_PREFIX[roleName];
  if (!prefix) {
    throw ApiError.badRequest(`No employee code prefix for role ${roleName}`);
  }
  return prefix;
}

export function formatEmployeeCode(companyCode, rolePrefix, sequence) {
  const n = Math.max(1, Number(sequence) || 1);
  const padded = String(n).padStart(3, "0");
  return `${companyCode}-${rolePrefix}-${padded}`;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Highest sequence already used for this company + role prefix (includes soft-deleted).
 * Prevents reuse after delete/deactivate.
 */
export async function findMaxUsedSequence(tx, companyId, companyCode, rolePrefix) {
  const db = tx || prisma;
  const users = await db.user.findMany({
    where: {
      companyId,
      employeeId: { not: null },
    },
    select: { employeeId: true },
  });

  const re = new RegExp(`^${escapeRegex(companyCode)}-${escapeRegex(rolePrefix)}-(\\d+)$`, "i");
  let max = 0;
  for (const u of users) {
    const m = String(u.employeeId || "").match(re);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!Number.isNaN(n)) max = Math.max(max, n);
    }
  }
  return max;
}

async function readSequenceNextValue(db, companyId, rolePrefix) {
  const rows = await db.$queryRaw`
    SELECT next_value AS "nextValue"
    FROM company_user_code_sequences
    WHERE company_id = ${companyId}::uuid
      AND role_prefix = ${rolePrefix}
    LIMIT 1
  `;
  return rows?.[0]?.nextValue != null ? Number(rows[0].nextValue) : null;
}

/**
 * Allocate next code inside an existing Prisma interactive transaction.
 * Uses INSERT … ON CONFLICT + UPDATE … RETURNING (row-level lock).
 */
export async function allocateEmployeeCode(tx, { companyId, companyCode, roleName }) {
  if (!companyId || !companyCode) {
    throw ApiError.badRequest("companyId and companyCode are required to allocate employee code");
  }
  const rolePrefix = roleNameToCodePrefix(roleName);
  const maxUsed = await findMaxUsedSequence(tx, companyId, companyCode, rolePrefix);

  await tx.$executeRaw`
    INSERT INTO company_user_code_sequences (id, company_id, role_prefix, next_value, created_at, updated_at)
    VALUES (${randomUUID()}::uuid, ${companyId}::uuid, ${rolePrefix}, ${maxUsed}, NOW(), NOW())
    ON CONFLICT (company_id, role_prefix) DO NOTHING
  `;

  const rows = await tx.$queryRaw`
    UPDATE company_user_code_sequences
    SET
      next_value = GREATEST(next_value, ${maxUsed}) + 1,
      updated_at = NOW()
    WHERE company_id = ${companyId}::uuid
      AND role_prefix = ${rolePrefix}
    RETURNING next_value
  `;

  const nextValue = Number(rows?.[0]?.next_value);
  if (!nextValue || Number.isNaN(nextValue)) {
    throw ApiError.internal("Failed to allocate employee code sequence");
  }

  return formatEmployeeCode(companyCode, rolePrefix, nextValue);
}

/** Peek next code without consuming the sequence (UI preview only). */
export async function previewNextEmployeeCode({ companyId, companyCode, roleName }) {
  const rolePrefix = roleNameToCodePrefix(roleName);
  const maxUsed = await findMaxUsedSequence(prisma, companyId, companyCode, rolePrefix);
  const seqValue = await readSequenceNextValue(prisma, companyId, rolePrefix);
  const next = Math.max(seqValue ?? 0, maxUsed) + 1;
  return formatEmployeeCode(companyCode, rolePrefix, next);
}

export function shouldAutoGenerateEmployeeCode(roleName) {
  return Boolean(ROLE_CODE_PREFIX[roleName]);
}

export default {
  allocateEmployeeCode,
  previewNextEmployeeCode,
  formatEmployeeCode,
  shouldAutoGenerateEmployeeCode,
  roleNameToCodePrefix,
  ROLE_CODE_PREFIX,
};

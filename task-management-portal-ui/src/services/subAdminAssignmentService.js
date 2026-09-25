/**
 * Removes an employee from the logged-in Sub Admin's assignment list only.
 *
 * Backend note: No dedicated Sub Admin ↔ Employee assignment removal API exists yet.
 * This does NOT call DELETE /users/:id and must not be treated as company user deletion.
 * Prefer department-scoped user APIs for production assignment management.
 */
export async function removeEmployeeAssignment(_employeeId) {
  throw new Error(
    "Sub Admin assignment removal is not available via API yet. Use department-scoped user management instead of localStorage."
  );
}

export function hasAssignmentRemovalApi() {
  return false;
}


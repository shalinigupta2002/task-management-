import { getSubAdminProfile, setSubAdminProfile, updateSubAdmin } from "../utils/mainAdminStorage";

/**
 * Removes an employee from the logged-in Sub Admin's assignment list only.
 *
 * Backend note: No dedicated Sub Admin ↔ Employee assignment removal API exists yet.
 * This does NOT call DELETE /user/:id and does NOT remove the employee from the company.
 */
export async function removeEmployeeAssignment(employeeId) {
  if (!employeeId) {
    throw new Error("Employee id is required");
  }

  const profile = getSubAdminProfile();
  const assignedEmployees = profile.assignedEmployees || [];

  if (!assignedEmployees.includes(employeeId)) {
    return profile;
  }

  const updatedProfile = {
    ...profile,
    assignedEmployees: assignedEmployees.filter((id) => id !== employeeId),
  };

  setSubAdminProfile(updatedProfile);

  if (profile.id) {
    updateSubAdmin(profile.id, { assignedEmployees: updatedProfile.assignedEmployees });
  }

  return updatedProfile;
}

export function hasAssignmentRemovalApi() {
  return false;
}

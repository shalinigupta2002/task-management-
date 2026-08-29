import { toDisplayStatus } from "./session";

/** Resolve department head display name from API/mock payload. */
export function getDepartmentHead(dept) {
  if (!dept) return "—";

  const namedHead = dept.headOfDepartment || dept.headName;
  if (namedHead && namedHead !== "—") return namedHead;

  const users = dept.users || [];
  const byDesignation = users.find((u) => /head|manager|director/i.test(u.designation || ""));
  if (byDesignation) {
    return [byDesignation.firstName, byDesignation.lastName].filter(Boolean).join(" ");
  }

  const mainAdmin = users.find((u) => u.role?.name === "MAIN_ADMIN");
  if (mainAdmin) {
    return [mainAdmin.firstName, mainAdmin.lastName].filter(Boolean).join(" ");
  }

  const subAdmin = users.find((u) => u.role?.name === "SUB_ADMIN");
  if (subAdmin) {
    return [subAdmin.firstName, subAdmin.lastName].filter(Boolean).join(" ");
  }

  if (users[0]) {
    return [users[0].firstName, users[0].lastName].filter(Boolean).join(" ");
  }

  return "—";
}

export function getDepartmentUserCount(dept) {
  if (dept?._count?.users != null) return dept._count.users;
  if (dept?.totalUsers != null) return dept.totalUsers;
  if (dept?.userCount != null) return dept.userCount;
  return 0;
}

export function mapDepartmentRow(dept) {
  const description = dept.description?.trim() || "";
  return {
    id: dept.id,
    name: dept.departmentName,
    code: dept.departmentCode,
    description,
    head: getDepartmentHead(dept),
    users: getDepartmentUserCount(dept),
    status: toDisplayStatus(dept.status),
  };
}

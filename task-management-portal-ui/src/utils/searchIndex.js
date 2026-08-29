import { getCompanies } from "../utils/superAdminStorage";
import { getSubAdmins } from "../utils/mainAdminStorage";
import { getEmployeeTasks } from "../utils/employeeStorage";

let cachedIndex = null;

export function buildSearchIndex() {
  if (cachedIndex) return cachedIndex;

  const items = [];

  try {
    getCompanies().forEach((c) => {
      items.push({ id: `co-${c.id}`, type: "Company", title: c.name, subtitle: c.email, path: `/super-admin/companies/${c.id}` });
    });
  } catch { /* ignore */ }

  try {
    getSubAdmins().forEach((a) => {
      items.push({ id: `sa-${a.id}`, type: "Employee", title: a.fullName, subtitle: a.department, path: `/dashboard/admins/${a.id}` });
    });
  } catch { /* ignore */ }

  try {
    getEmployeeTasks().forEach((t) => {
      items.push({ id: `tk-${t.id}`, type: "Task", title: t.title, subtitle: t.status, path: `/employee/tasks/${t.id}` });
    });
  } catch { /* ignore */ }

  const departments = ["HR", "IT", "Finance", "Operations", "Compliance", "Engineering", "Sales"];
  departments.forEach((d, i) => {
    items.push({ id: `dept-${i}`, type: "Department", title: d, subtitle: "Department", path: "/dashboard/departments" });
  });

  cachedIndex = items;
  return items;
}

export function searchAll(index, query) {
  const q = query.toLowerCase();
  return index.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.subtitle?.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
  ).slice(0, 12);
}

export function invalidateSearchIndex() {
  cachedIndex = null;
}

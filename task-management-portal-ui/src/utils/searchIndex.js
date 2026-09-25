let cachedIndex = null;

/** Build search index from supplied live records (no localStorage demo data). */
export function buildSearchIndex({ companies = [], users = [], tasks = [], departments = [] } = {}) {
  const items = [];

  companies.forEach((c) => {
    items.push({
      id: `co-${c.id}`,
      type: "Company",
      title: c.companyName || c.name,
      subtitle: c.email || "",
      path: `/super-admin/companies/${c.id}`,
    });
  });

  users.forEach((u) => {
    const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email;
    items.push({
      id: `usr-${u.id}`,
      type: "User",
      title: name,
      subtitle: u.email || "",
      path: "/dashboard/employees",
    });
  });

  tasks.forEach((t) => {
    items.push({
      id: `tk-${t.id}`,
      type: "Task",
      title: t.title,
      subtitle: t.status || "",
      path: `/dashboard/tasks/${t.id}`,
    });
  });

  departments.forEach((d) => {
    items.push({
      id: `dept-${d.id}`,
      type: "Department",
      title: d.departmentName || d.name,
      subtitle: "Department",
      path: "/dashboard/departments",
    });
  });

  cachedIndex = items;
  return items;
}

export function getSearchIndex() {
  return cachedIndex || [];
}

export function clearSearchIndex() {
  cachedIndex = null;
}

export function searchAll(index, query) {
  const q = String(query || "").toLowerCase().trim();
  if (!q) return [];
  const list = index || cachedIndex || [];
  return list.filter((item) =>
    [item.title, item.subtitle, item.type].some((v) => String(v || "").toLowerCase().includes(q))
  );
}

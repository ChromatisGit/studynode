 function getAutisticallyBalancedRows(
  count: number,
  maxPerRow = 4
): number[] {
  if (count <= 0) return [];

  const rows = Math.max(1, Math.ceil(count / maxPerRow));

  const base = Math.floor(count / rows);
  const extra = count % rows;

  return Array.from({ length: rows }, (_, i) => base + (i < extra ? 1 : 0));
}

export function chunkCourses<T>(courses: T[]): T[][] {
  const sizes = getAutisticallyBalancedRows(courses.length, 4);
  const rows: T[][] = [];
  let index = 0;

  for (const size of sizes) {
    rows.push(courses.slice(index, index + size));
    index += size;
  }

  return rows;
}
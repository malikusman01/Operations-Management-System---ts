// Minimal client-side CSV export — no extra dependencies needed.
export function downloadCsv<T extends object>(filename: string, inputRows: T[]) {
  if (typeof window === "undefined") return;
  const rows: Record<string, unknown>[] =
    inputRows.length > 0
      ? (inputRows as unknown as Record<string, unknown>[])
      : [{ note: "No data available" }];
  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
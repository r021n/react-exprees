export function formatDate(dateStr?: string | null) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateOnly(dateStr?: string | null) {
  if (!dateStr) return "-";
  try {
    const [y, m, d] = dateStr.split("-");
    return `${d}-${m}-${y}`;
  } catch {
    return dateStr;
  }
}

export function formatPriceIDR(amount: number) {
  return amount.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });
}

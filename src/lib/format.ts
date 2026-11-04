export const money = (kobo?: number | null) =>
  `₦${Math.round((Number(kobo) || 0) / 100).toLocaleString("en-NG")}`;

export const rating = (value?: number | null) => ((Number(value) || 0) / 10).toFixed(1);

export const shortDate = (date?: Date | string | null) => {
  if (!date) return "";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
};

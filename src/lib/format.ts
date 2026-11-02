export const money = (kobo: number) => `₦${Math.round(kobo / 100).toLocaleString("en-NG")}`;
export const rating = (value: number) => (value / 10).toFixed(1);
export const shortDate = (date: Date | string) => new Date(date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

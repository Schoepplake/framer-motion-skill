/**
 * Formatierungs-Helfer (deutsche Lokalisierung).
 */

const DATE_FMT = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const DATETIME_FMT = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Formatiert ein ISO-Datum (yyyy-mm-dd) als TT.MM.JJJJ. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const ms = Date.parse(iso.length <= 10 ? `${iso}T00:00:00Z` : iso);
  if (Number.isNaN(ms)) return "—";
  return DATE_FMT.format(new Date(ms));
}

/** Formatiert einen ISO-Zeitstempel als TT.MM.JJJJ, HH:MM. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return "—";
  return DATETIME_FMT.format(new Date(ms));
}

/** Formatiert einen Zeitraum „von – bis“. */
export function formatDateRange(
  von: string | null | undefined,
  bis: string | null | undefined,
): string {
  if (!von && !bis) return "—";
  return `${formatDate(von)} – ${formatDate(bis)}`;
}

/** Relative Zeitangabe (z. B. „vor 3 Min.“). */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return "—";
  const diff = Date.now() - ms;
  const min = Math.round(diff / 60000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} Min.`;
  const std = Math.round(min / 60);
  if (std < 24) return `vor ${std} Std.`;
  const tage = Math.round(std / 24);
  if (tage < 30) return `vor ${tage} ${tage === 1 ? "Tag" : "Tagen"}`;
  return formatDate(iso);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("de-DE").format(n);
}

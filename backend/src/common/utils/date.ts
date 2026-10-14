const BRASILIA_OFFSET_MS = 3 * 60 * 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// RN01: AAAA-MM-DDTHH:MM-03:00
const INPUT_REGEX = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})-03:00$/;

/** Interpreta a data e hora da RN01. Devolve null para formato errado ou data inexistente. */
export function parseBrasiliaDateTime(text: string): Date | null {
  const match = INPUT_REGEX.exec(text);
  if (!match) return null;
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const utc = new Date(
    Date.UTC(year, month - 1, day, hour, minute) + BRASILIA_OFFSET_MS,
  );
  const local = new Date(utc.getTime() - BRASILIA_OFFSET_MS);
  const roundTrips =
    local.getUTCFullYear() === year &&
    local.getUTCMonth() === month - 1 &&
    local.getUTCDate() === day &&
    local.getUTCHours() === hour &&
    local.getUTCMinutes() === minute;
  return roundTrips ? utc : null;
}

/** Formato das respostas: AAAA-MM-DDTHH:MM:SS-03:00. */
export function formatBrasiliaDateTime(date: Date): string {
  const local = new Date(date.getTime() - BRASILIA_OFFSET_MS);
  return `${local.toISOString().slice(0, 19)}-03:00`;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/** Dias com fração entre dois instantes, arredondados para cima; nunca negativo (RN15). */
export function remainingDays(until: Date, now: Date): number {
  const days = Math.ceil((until.getTime() - now.getTime()) / MS_PER_DAY);
  return Math.max(days, 0);
}

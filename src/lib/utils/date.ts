// Returns today's date as "YYYY-MM-DD" in Brazil's timezone (America/Sao_Paulo).
// Servers typically run in UTC; without this helper, "today" can be off by up to 3 hours
// for users in UTC-3, causing tasks and products to appear with wrong dates.
export function getTodayBrazil(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

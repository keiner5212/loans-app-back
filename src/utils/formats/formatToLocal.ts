export function formatUtcToLocal(utcDateStr: string | undefined | null, locale: string, timeZone: string): string | undefined {
    if (!utcDateStr) return undefined;

    const localDate = new Date(utcDateStr);

    return localDate.toLocaleString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timeZone,
        timeZoneName: "shortOffset",
    });
}
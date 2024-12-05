
enum CreditPeriod {
    // monthly
    MONTHLY = 12,
    // weekly
    WEEKLY = 52,
    // bi-weekly
    QUARTERLY = 26,
}


export function convertMonthlyRate(rate: number, period: CreditPeriod): number {
    const annualRate = Math.pow(1 + rate, CreditPeriod.MONTHLY) - 1; // Convierte la tasa mensual a anual
    const convertedRate = Math.pow(1 + annualRate, 1 / period) - 1;  // Convierte la tasa anual al periodo deseado

    // Redondear hacia arriba al segundo decimal
    const roundedRate = Math.round(convertedRate * 10000) / 10000;

    return roundedRate;
}
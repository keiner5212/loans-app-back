
enum CreditPeriod {
    // monthly
    MONTHLY = 12,
    // weekly
    WEEKLY = 52,
    // bi-weekly
    QUARTERLY = 26,
}

/**
 * function to convert monthly rate to another period
 * based on https://matefinanciera.com/conversion-de-tasas-de-interes (conversion de periodicidad)
 * @param rate the monthly rate in decimal format
 * @param period the period of the credit
 * @returns the converted rate
 */
export function convertMonthlyRate(rate: number, period: CreditPeriod): number {
    const annualRate = Math.pow(1 + rate, CreditPeriod.MONTHLY) - 1; // Convierte la tasa mensual a anual
    const convertedRate = Math.pow(1 + annualRate, 1 / period) - 1;  // Convierte la tasa anual al periodo deseado

    // Redondear hacia arriba a 4 decimales
    const roundedRate = Math.ceil(parseFloat((convertedRate * 10000).toFixed(1))) / 10000;

    return roundedRate;
}
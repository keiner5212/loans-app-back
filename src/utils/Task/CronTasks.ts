import { Credit, Status } from "../../entities/Credit";

enum CreditPeriod {
    // monthly
    MONTHLY = 12,
    // weekly
    WEEKLY = 52,
    // bi-weekly
    QUARTERLY = 24,
}

// Function to calculate the time difference in days, months, weeks, or bi-weekly periods
function calculateTimeDiff(lastDate: Date, today: Date, period: CreditPeriod): number {
    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24); // Days

    switch (period) {
        case CreditPeriod.MONTHLY:
            return diffDays / 30; // Average days in a month
        case CreditPeriod.WEEKLY:
            return diffDays / 7; // Days to weeks
        case CreditPeriod.QUARTERLY:
            return diffDays / 15; // Days to bi-weekly periods
        default:
            return 0;
    }
}

export async function updateCreditStatus() {
    const credits = await Credit.findAll();
    const today = new Date();

    for (const credit of credits) {
        // if credit is not released, skip
        if (credit.status !== Status.RELEASED) {
            continue;
        }
        const lastPaymentDate = credit.lastPaymentDate ? new Date(credit.lastPaymentDate) : new Date(credit.releasedDate);
        const diffTime = calculateTimeDiff(lastPaymentDate, today, credit.period);

        // Check if the credit is overdue
        if (diffTime >= 1) {
            credit.status = Status.LATE; // Update the status to "late"
            await credit.save(); // Save the updated credit
        }
    }
}

import { Credit, Status } from "@/entities/Credit";
import { Payment, PaymentStatus } from "@/entities/Payment";
import { calcularPago } from "../amortizacion/Credit";
import { Financing } from "@/entities/Financing";
import { Op } from "sequelize";

enum CreditPeriod {
    // monthly
    MONTHLY = 12,
    // weekly
    WEEKLY = 52,
    // bi-weekly
    QUARTERLY = 26,
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

function calculateNextPaymentDate(lastPaymentDate: Date, period: CreditPeriod): Date {
    if (!lastPaymentDate || isNaN(lastPaymentDate.getTime())) {
        throw new Error("Invalid lastPaymentDate provided.");
    }

    const nextPaymentDate = new Date(lastPaymentDate);
    switch (period) {
        case CreditPeriod.MONTHLY:
            nextPaymentDate.setMonth(lastPaymentDate.getMonth() + 1);
            break;
        case CreditPeriod.WEEKLY:
            nextPaymentDate.setDate(lastPaymentDate.getDate() + 7);
            break;
        case CreditPeriod.QUARTERLY:
            nextPaymentDate.setDate(lastPaymentDate.getDate() + 15);
            break;
        default:
            break;
    }
    return nextPaymentDate;
}

export async function updateCreditStatus() {
    // get all credits
    const credits = await Credit.findAll({
        where: {
            status: {
                // Skip if the credit is not RELEASED or LATE
                [Op.notIn]: [Status.RELEASED, Status.LATE],
            },
        },
    });
    const today = new Date();

    for (const credit of credits) {
        const diffTime = calculateTimeDiff(credit.lastPaymentDate ? new Date(credit.lastPaymentDate) : new Date(credit.releasedDate), today, credit.period);

        // Check if the credit is overdue
        if (diffTime >= 1 && credit.status != Status.LATE) {
            credit.status = Status.LATE; // Update the status to "late"
            await credit.save(); // Save the updated credit
        }

        // update status to payments
        const payments = await Payment.findAll({ where: { creditId: credit.id, status: PaymentStatus.PENDING } });

        for (const payment of payments) {
            const paymentDate = new Date(payment.timelyPayment);
            if (paymentDate > today) {
                // payment is late
                payment.status = PaymentStatus.LATE;
            }
            await payment.save();
        }

        // create the next payment if does not exist

        const lastPaymentDate = credit.lastPaymentDate ? new Date(credit.lastPaymentDate) : new Date(credit.releasedDate);

        let lastPaymentDateRelative = undefined;

        if (diffTime >= 1 && diffTime < 2) { // only one payment late
            lastPaymentDateRelative = lastPaymentDate
        } else if (diffTime >= 2) { // more than one payment late
            // get last late payment
            const payment = await Payment.findOne({ where: { creditId: credit.id, status: PaymentStatus.LATE }, order: [['timelyPayment', 'DESC']] });
            lastPaymentDateRelative = payment ? payment.timelyPayment : lastPaymentDate;
        } else {
            // not late
            lastPaymentDateRelative = lastPaymentDate
        }

        const nextPaymentDate = calculateNextPaymentDate(lastPaymentDateRelative, credit.period);

        if (nextPaymentDate > today) {
            continue;
        }

        const financing = await Financing.findOne({ where: { creditId: credit.id } });

        let downPayment = 0;
        if (financing) {
            downPayment = financing.downPayment;
        }

        const paymentToCreate = {
            creditId: credit.id,
            userCreatorId: null,
            amount: calcularPago(credit.interestRate / 100, credit.requestedAmount, downPayment,
                credit.yearsOfPayment * credit.period, credit.period
            ),
            period: credit.lastPaymentPeriod ? credit.lastPaymentPeriod + 1 : 1,
            paymentDate: new Date(),
            timelyPayment: nextPaymentDate,
            status: PaymentStatus.PENDING,
        }

        await Payment.create(paymentToCreate);

    }
}

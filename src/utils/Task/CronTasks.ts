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
export function calculateTimeDiff(lastDate: Date, today: Date, period: CreditPeriod): number {
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

export function calculateNextPaymentDate(lastPaymentDate: Date, period: CreditPeriod): Date | null {
    if (!lastPaymentDate || isNaN(lastPaymentDate.getTime())) {
        return null;
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
                [Op.in]: [Status.RELEASED, Status.LATE],
            },
        },
    });
    const today = new Date();

    for (const credit of credits) {

        const lastPaymentDate = credit.lastPaymentDate ? new Date(credit.lastPaymentDate) : new Date(credit.releasedDate);
        const diffTime = calculateTimeDiff(lastPaymentDate, today, credit.period);

        // Check if the credit is overdue
        if (diffTime >= 1 && credit.status != Status.LATE) {
            credit.status = Status.LATE; // Update the status to "late"
            await credit.save(); // Save the updated credit
        }


        // create the next payment if does not exist
        let lastPaymentPeriod = credit.lastPaymentPeriod ? credit.lastPaymentPeriod : 0;
        let lastPaymentDateRelative = undefined;

        if (diffTime >= 1) {
            // one o more than one payments late
            const lastLatePayment = await Payment.findOne({
                where: { creditId: credit.id, status: PaymentStatus.LATE },
                order: [["timelyPayment", "DESC"]],
            });
            lastPaymentDateRelative = lastLatePayment ? lastLatePayment.timelyPayment : lastPaymentDate;
            lastPaymentPeriod = lastLatePayment ? lastLatePayment.period : lastPaymentPeriod;
        } else {
            // Not late
            lastPaymentDateRelative = lastPaymentDate;
        }

        const nextPaymentDate = calculateNextPaymentDate(lastPaymentDateRelative, credit.period);

        if (!nextPaymentDate) {
            continue;
        }

        if (nextPaymentDate > today) {
            // next payment is in the future, check if theres a pending payment
            const pendingPayment = await Payment.findOne({ where: { creditId: credit.id, status: PaymentStatus.PENDING } });
            if (pendingPayment) continue // already has a pending payment
        }

        // check if there is a financing
        const financing = await Financing.findOne({ where: { creditId: credit.id } });
        let downPayment = 0;
        if (financing) {
            downPayment = financing.downPayment;
        }

        // create the next payment
        const paymentToCreate = {
            creditId: credit.id,
            userCreatorId: null,
            amount: calcularPago(credit.interestRate / 100, credit.requestedAmount, downPayment,
                credit.yearsOfPayment * credit.period, credit.period
            ),
            period: lastPaymentPeriod + 1,
            paymentDate: null,
            timelyPayment: nextPaymentDate,
            status: PaymentStatus.PENDING,
        }

        await Payment.create(paymentToCreate);

        // update status to payments
        const payments = await Payment.findAll({ where: { creditId: credit.id, status: PaymentStatus.PENDING } });

        for (const payment of payments) {
            const paymentDate = payment.timelyPayment
            if (paymentDate < today) {
                // Payment is late
                payment.status = PaymentStatus.LATE;
            }
            await payment.save();
        }
    }
}

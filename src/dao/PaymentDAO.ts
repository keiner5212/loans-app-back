import { HttpStatusCode } from "axios";
import { DaoResponse, ErrorControl } from "@/constants/ErrorControl";
import { createDebugger } from "@/utils/debugConfig";
import { Payment, PaymentStatus } from "@/entities/Payment";
import { Credit, Status } from "@/entities/Credit";
import { calculateNextPaymentDate, calculateTimeDiff } from "@/utils/Task/CronTasks";
import { Financing } from "@/entities/Financing";
import { calcularPago } from "@/utils/amortizacion/Credit";
import { User } from "@/entities/User";


const log = createDebugger("FinancingDAO");
const logError = log.extend("error");


export class PaymentDAO {

    protected static async pay(paymentID: number, EmployeeID: number): Promise<DaoResponse> {
        try {
            const payment = await Payment.findByPk(paymentID);
            if (!payment) {
                return [ErrorControl.ERROR, "Payment not found", HttpStatusCode.NotFound];
            }
            const credit = await Credit.findByPk(payment.creditId);
            if (!credit) {
                return [ErrorControl.ERROR, "Credit not found", HttpStatusCode.NotFound];
            }

            const user = await User.findByPk(EmployeeID);
            if (!user) {
                return [ErrorControl.ERROR, "User not found", HttpStatusCode.NotFound];
            }

            payment.userCreatorId = user.id;
            payment.status = PaymentStatus.RELEASED;
            payment.paymentDate = new Date();
            await payment.save();

            credit.lastPaymentDate = payment.paymentDate;
            credit.lastPaymentPeriod = payment.period;

            const LatePayments = await Payment.findAll({ where: { creditId: credit.id, status: PaymentStatus.LATE } });
            if (LatePayments.length > 0) {
                credit.status = Status.LATE;
            } else {
                credit.status = Status.RELEASED;
            }

            await credit.save();


            return [ErrorControl.SUCCESS, "Payment paid", HttpStatusCode.Created];
        } catch (error) {
            const msg = "Error in add payment.";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }

    protected static async update(payment: Omit<Payment, "id">, id_payment: number): Promise<DaoResponse> {
        try {
            const updatedPayment = await Payment.update(payment, { where: { id: id_payment } });
            return [ErrorControl.SUCCESS, updatedPayment, HttpStatusCode.Ok];
        } catch (error) {
            const msg = "Error in update payment.";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }

    protected static async delete(id_payment: number): Promise<DaoResponse> {
        try {
            const deletedPayment = await Payment.destroy({ where: { id: id_payment } });
            return [ErrorControl.SUCCESS, deletedPayment, HttpStatusCode.Ok];
        } catch (error) {
            const msg = "Error in delete payment.";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }

    protected static async getPaymentById(id: number): Promise<DaoResponse> {
        try {
            const payment = await Payment.findOne({ where: { id } });
            if (!payment) {
                return [
                    ErrorControl.PERSONALIZED,
                    "Payment not found",
                    HttpStatusCode.NotFound,
                ];
            }
            return [ErrorControl.SUCCESS, payment, HttpStatusCode.Ok];
        } catch (error) {
            const msg = "Error in get payment by id.";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }

    // get payments by and credit id

    protected static async getPaymentByCreditId(creditId: number): Promise<DaoResponse> {
        try {
            const payments = await Payment.findAll({ where: { creditId } });
            return [ErrorControl.SUCCESS, payments, HttpStatusCode.Ok];
        } catch (error) {
            const msg = "Error in get payment by credit id.";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }

    protected static async updateCreditStatusById(creditId: number): Promise<DaoResponse> {
        // Fetch the specific credit by ID
        const credit = await Credit.findByPk(creditId);

        if (!credit) {
            return [
                ErrorControl.PERSONALIZED,
                "Credit not found",
                HttpStatusCode.NotFound,
            ];
        }

        if (![Status.RELEASED, Status.LATE].includes(credit.status as Status)) {
            return [
                ErrorControl.PERSONALIZED,
                "Credit not released or late",
                HttpStatusCode.NotFound,
            ]
        }

        const today = new Date();
        const lastPaymentDate = credit.lastPaymentDate ? credit.lastPaymentDate : credit.releasedDate;
        const diffTime = calculateTimeDiff(lastPaymentDate, today, credit.period);

        // Check if the credit is overdue
        if (diffTime >= 1 && credit.status !== Status.LATE) {
            credit.status = Status.LATE; // Update the status to "late"
            await credit.save(); // Save the updated credit
        }

        // Update status of payments
        const payments = await Payment.findAll({ where: { creditId: credit.id, status: PaymentStatus.PENDING } });

        for (const payment of payments) {
            const paymentDate = new Date(payment.timelyPayment);
            if (paymentDate < today) {
                // Payment is late
                payment.status = PaymentStatus.LATE;
            }
            await payment.save();
        }

        // Determine last payment details
        let lastPaymentPeriod = credit.lastPaymentPeriod || 0;
        let lastPaymentDateRelative;

        if (diffTime >= 1 && diffTime < 2) {
            // Only one payment late
            lastPaymentDateRelative = lastPaymentDate;
        } else if (diffTime >= 2) {
            // More than one payment late
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
            return [
                ErrorControl.PERSONALIZED,
                "Error in calculate next payment date.",
                HttpStatusCode.Ok,
            ];
        }

        if (nextPaymentDate > today) {
            // Next payment is in the future, check if there’s a pending payment
            const pendingPayment = await Payment.findOne({ where: { creditId: credit.id, status: PaymentStatus.PENDING } });
            if (pendingPayment) {
                return [
                    ErrorControl.PERSONALIZED,
                    "There is already a pending payment for this credit.",
                    HttpStatusCode.Ok,
                ];
            }; // Already has a pending payment
        }

        // Check if there is financing
        const financing = await Financing.findOne({ where: { creditId: credit.id } });
        const downPayment = financing ? financing.downPayment : 0;

        // Create the next payment
        const paymentToCreate = {
            creditId: credit.id,
            userCreatorId: null,
            amount: calcularPago(
                credit.interestRate / 100,
                credit.requestedAmount,
                downPayment,
                credit.yearsOfPayment * credit.period,
                credit.period
            ),
            period: lastPaymentPeriod + 1,
            paymentDate: null,
            timelyPayment: nextPaymentDate,
            status: PaymentStatus.PENDING,
        };

        await Payment.create(paymentToCreate);

        return [
            ErrorControl.SUCCESS,
            "Credit status updated successfully.",
            HttpStatusCode.Ok,
        ]
    }

}
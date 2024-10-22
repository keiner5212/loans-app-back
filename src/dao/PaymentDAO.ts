import { HttpStatusCode } from "axios";
import { DaoResponse, ErrorControl } from "../constants/ErrorControl";
import { createDebugger } from "../utils/debugConfig";
import { Payment } from "../entities/Payment";


const log = createDebugger("FinancingDAO");
const logError = log.extend("error");


export class PaymentDAO {

    protected static async add(payment: Omit<Payment, "id">): Promise<DaoResponse> {
        try {
            const newPayment = await Payment.create(payment);
            return [ErrorControl.SUCCESS, newPayment.id, HttpStatusCode.Created];
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

    //get payments by user id and credit id

    protected static async getPaymentByCreditIdAndUserId(creditId: number, userId: number): Promise<DaoResponse> {
        try {
            const payments = await Payment.findAll({ where: { creditId, userId } });
            return [ErrorControl.SUCCESS, payments, HttpStatusCode.Ok];
        } catch (error) {
            const msg = "Error in get payment by credit id and user id.";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }

}
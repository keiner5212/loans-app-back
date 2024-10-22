import { HttpStatusCode } from "axios";
import { DaoResponse, ErrorControl } from "../constants/ErrorControl";
import { Credit, Status } from "../entities/Credit";
import { createDebugger } from "../utils/debugConfig";

const log = createDebugger("CreditDAO");
const logError = log.extend("error");

export class CreditDao {

    protected static async getCreditById(id: number): Promise<DaoResponse> {
        try {
            const credit = await Credit.findOne({ where: { id } });
            if (!credit) {
                return [
                    ErrorControl.PERSONALIZED,
                    "Credit not found",
                    HttpStatusCode.NotFound,
                ];
            }

            return [ErrorControl.SUCCESS, credit, HttpStatusCode.Ok];
        } catch (error) {
            const msg = "Error in get credit by id";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }

    protected static async getCreditByUserId(userId: number): Promise<DaoResponse> {
        try {
            const credits = await Credit.findAll({ where: { userId } });
            return [ErrorControl.SUCCESS, credits, HttpStatusCode.Ok];
        } catch (error) {
            const msg = "Error in get credit by user id";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }

    protected static async add(credit: Omit<Credit, "id">): Promise<DaoResponse> {
        try {
            credit.status = Status.PENDING;
            const newCredit = await Credit.create(credit);
            return [ErrorControl.SUCCESS, newCredit.id, HttpStatusCode.Created];
        } catch (error) {
            const msg = "Error in add credit";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }

    protected static async update(credit: Omit<Credit, "id">, id_credit: number): Promise<DaoResponse> {
        try {
            const updatedCredit = await Credit.update(credit, { where: { id: id_credit } });
            return [ErrorControl.SUCCESS, updatedCredit, HttpStatusCode.Ok];
        } catch (error) {
            const msg = "Error in update credit";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }

    protected static async delete(id_credit: number): Promise<DaoResponse> {
        try {
            const deletedCredit = await Credit.destroy({ where: { id: id_credit } });
            return [ErrorControl.SUCCESS, deletedCredit, HttpStatusCode.Ok];
        } catch (error) {
            const msg = "Error in delete credit";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }

    protected static async approve(id_credit: number): Promise<DaoResponse> {
        try {
            const credit = await Credit.findOne({ where: { id: id_credit } });
            if (!credit) {
                return [
                    ErrorControl.PERSONALIZED,
                    "Credit not found",
                    HttpStatusCode.NotFound,
                ];
            }
            credit.status = Status.APPROVED;
            await credit.save();
            return [ErrorControl.SUCCESS, credit, HttpStatusCode.Ok];
        } catch (error) {
            const msg = "Error in approve credit";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }

    protected static async reject(id_credit: number): Promise<DaoResponse> {
        try {
            const credit = await Credit.findOne({ where: { id: id_credit } });
            if (!credit) {
                return [
                    ErrorControl.PERSONALIZED,
                    "Credit not found",
                    HttpStatusCode.NotFound,
                ];
            }
            credit.status = Status.REJECTED;
            await credit.save();
            return [ErrorControl.SUCCESS, credit, HttpStatusCode.Ok];
        } catch (error) {
            const msg = "Error in reject credit";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }
}
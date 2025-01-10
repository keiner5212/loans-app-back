import { HttpStatusCode } from "axios";
import { DaoResponse, ErrorControl } from "@/constants/ErrorControl";
import { Credit, CreditType, Status } from "@/entities/Credit";
import { createDebugger } from "@/utils/debugConfig";
import { Financing } from "@/entities/Financing";
import { User } from "@/entities/User";

const log = createDebugger("CreditDAO");
const logError = log.extend("error");

export class CreditDao {

    //getCreditsLate
    protected static async getCreditsLate(): Promise<DaoResponse> {
        try {
            const credits = await Credit.findAll({ where: { status: Status.LATE } });
            return [ErrorControl.SUCCESS, credits, HttpStatusCode.Ok];
        } catch (error) {
            const msg = "Error in get credits late";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }

    //cancel credit (put the status to CANCELED and the requested amount to 0)
    protected static async cancel(id_credit: number, reason: string): Promise<DaoResponse> {
        try {
            const credit = await Credit.findOne({ where: { id: id_credit } });
            if (!credit) {
                return [
                    ErrorControl.PERSONALIZED,
                    "Credit not found",
                    HttpStatusCode.NotFound,
                ];
            }
            credit.status = Status.CANCELED;
            credit.finishedDate = new Date();
            credit.finishedMessage = reason;
            await credit.save();
            return [ErrorControl.SUCCESS, credit, HttpStatusCode.Ok];
        } catch (error) {
            const msg = "Error in cancel credit";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }

    protected static async saveContract(id: number, contract: string): Promise<DaoResponse> {
        try {
            const credit = await Credit.findOne({ where: { id } });
            if (!credit) {
                return [
                    ErrorControl.PERSONALIZED,
                    "Credit not found",
                    HttpStatusCode.NotFound,
                ];
            }

            credit.signedContract = contract;
            credit.status = Status.RELEASED;
            credit.releasedDate = new Date();
            await credit.save();
            return [ErrorControl.SUCCESS, credit, HttpStatusCode.Ok];
        } catch (error) {
            const msg = "Error in save contract";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }

    protected static async getCredits(): Promise<DaoResponse> {
        try {
            const credits = await Credit.findAll();
            return [ErrorControl.SUCCESS, credits, HttpStatusCode.Ok];
        } catch (error) {
            const msg = "Error in get credits";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }

    protected static async getLateCredits(): Promise<DaoResponse> {
        try {
            const credits = await Credit.findAll({ where: { status: Status.LATE } });
            return [ErrorControl.SUCCESS, credits, HttpStatusCode.Ok];
        } catch (error) {
            const msg = "Error in get late credits";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }


    protected static async getCreditContractInfo(id: number): Promise<DaoResponse> {
        try {
            const credit = await Credit.findOne({ where: { id } });
            if (!credit) {
                return [
                    ErrorControl.PERSONALIZED,
                    "Credit not found",
                    HttpStatusCode.NotFound,
                ];
            }

            //get user info
            const user = await User.findOne({ where: { id: credit.userId } });
            if (!user) {
                return [
                    ErrorControl.PERSONALIZED,
                    "User of credit not found",
                    HttpStatusCode.NotFound,
                ];
            }

            user.deletePrivateData();

            //if credit is of type financing, get financing info
            if (credit.creditType == CreditType.FINANCING) {
                const financing = await Financing.findOne({ where: { creditId: credit.id } });
                if (!financing) {
                    return [
                        ErrorControl.PERSONALIZED,
                        "Financing of credit not found",
                        HttpStatusCode.NotFound,
                    ];
                }

                return [ErrorControl.SUCCESS, {
                    credit,
                    user,
                    financing
                }, HttpStatusCode.Ok];
            } else {

                return [ErrorControl.SUCCESS, {
                    user,
                    credit
                }, HttpStatusCode.Ok];
            }

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

            //if credit is of type financing, get financing info
            if (credit.creditType == CreditType.FINANCING) {
                const financing = await Financing.findOne({ where: { creditId: credit.id } });
                if (!financing) {
                    return [
                        ErrorControl.PERSONALIZED,
                        "Financing of credit not found",
                        HttpStatusCode.NotFound,
                    ];
                }

                return [ErrorControl.SUCCESS, {
                    credit,
                    financing
                }, HttpStatusCode.Ok];
            } else {

                return [ErrorControl.SUCCESS, {
                    credit
                }, HttpStatusCode.Ok];
            }

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
            credit.aprovedDate = new Date();
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
            credit.rejectedDate = new Date();
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
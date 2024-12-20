import { HttpStatusCode } from "axios";
import { DaoResponse, ErrorControl } from "@/constants/ErrorControl";
import { Financing } from "@/entities/Financing";
import { createDebugger } from "@/utils/debugConfig";
import { Credit } from "@/entities/Credit";


const log = createDebugger("FinancingDAO");
const logError = log.extend("error");

export class FinancingDAO {

    protected static async add(financing: Omit<Financing, "id">): Promise<DaoResponse> {
        try {
            const newFinancing = await Financing.create(financing);
            return [ErrorControl.SUCCESS, newFinancing.id, HttpStatusCode.Created];
        } catch (error) {
            const msg = "Error in add financing";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }

    protected static async delete(id_financing: number): Promise<DaoResponse> {
        try {
            const deletedFinancing = await Financing.destroy({ where: { id: id_financing } });
            return [ErrorControl.SUCCESS, deletedFinancing, HttpStatusCode.Ok];
        } catch (error) {
            const msg = "Error in delete financing";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }


    protected static async getFinancingByUserId(userId: number): Promise<DaoResponse> {
        try {

            const credits = await Credit.findAll({ where: { userId } });
            const creditsIds = credits.map(credit => credit.id);
            const financings = await Financing.findAll({ where: { creditId: creditsIds } });
            return [ErrorControl.SUCCESS, financings, HttpStatusCode.Ok];
        } catch (error) {
            const msg = "Error in get financing by user id";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }

    //get by id

    protected static async getFinancingById(id: number): Promise<DaoResponse> {
        try {
            const financing = await Financing.findOne({ where: { id } });
            if (!financing) {
                return [
                    ErrorControl.PERSONALIZED,
                    "Financing not found",
                    HttpStatusCode.NotFound,
                ];
            }
            return [ErrorControl.SUCCESS, financing, HttpStatusCode.Ok];
        } catch (error) {
            const msg = "Error in get financing by id";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }


    protected static async update(financing: Omit<Financing, "id">, id_financing: number): Promise<DaoResponse> {
        try {
            const updatedFinancing = await Financing.update(financing, { where: { id: id_financing } });
            return [ErrorControl.SUCCESS, updatedFinancing, HttpStatusCode.Ok];
        } catch (error) {
            const msg = "Error in update financing";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }

}
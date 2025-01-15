import { DaoResponse, ErrorControl } from "@/constants/ErrorControl";
import { Credit, CreditType } from "@/entities/Credit";
import { Financing } from "@/entities/Financing";
import { Payment } from "@/entities/Payment";
import { User } from "@/entities/User";
import { createDebugger } from "@/utils/debugConfig";
import { HttpStatusCode } from "axios";
import { Op } from "sequelize";



const log = createDebugger("ReportsDAO");
const logError = log.extend("error");


export class ReportsDAO {
    protected static async getReports(
        table: string,
        startDate?: Date,
        endDate?: Date,
        data?: any
    ): Promise<DaoResponse> {
        let response = null;
        try {
            switch (table) {
                case "Pagos":
                    response = await this.getPayments(data, startDate, endDate);
                    break;
                case "Usuarios":
                    response = await User.findAll({
                        where: startDate && endDate ? {
                            created_at: {
                                [Op.between]: [startDate, endDate]
                            }
                        } : {}
                    });
                    break;
                case "Creditos":
                    response = await this.getCreditsOrFinancing(CreditType.CREDIT, startDate, endDate, data);
                    break;
                case "Financiamientos":
                    response = await this.getCreditsOrFinancing(CreditType.FINANCING, startDate, endDate, data);
                    break;
                case "Creditos y Financiamientos":
                    response = await this.getCreditsOrFinancing(null, startDate, endDate, data);
                    break;
                default:
                    throw new Error("Invalid table specified");
            }

            return [ErrorControl.SUCCESS, response, HttpStatusCode.Ok];
        } catch (error) {
            const msg = "Error in get reports.";
            logError(`${msg}: ${error}`);
            return [ErrorControl.ERROR, msg, HttpStatusCode.InternalServerError];
        }
    }

    private static async getPayments(data: any, startDate?: Date, endDate?: Date) {
        const whereClause: any = {};

        if (startDate && endDate) {
            whereClause.paymentDate = { [Op.between]: [startDate, endDate] };
        }

        if (data) {
            const user = await User.findOne({ where: { [Op.or]: [{ email: data }, { document: data }] } });
            if (!user) {
                return [];
            }
            const creditsOfUser = await Credit.findAll({ where: { userId: user.id } });
            whereClause.creditId = { [Op.in]: creditsOfUser.map((credit) => credit.id) };
        }

        const payments = await Payment.findAll({ where: whereClause });

        return Promise.all(payments.map(async (payment) => {
            const credit = await Credit.findByPk(payment.creditId);
            const financing = await Financing.findOne({ where: { creditId: credit?.id } });
            return { payment, credit, financing };
        }));
    }

    private static async getCreditsOrFinancing(
        creditType: CreditType | null,
        startDate?: Date,
        endDate?: Date,
        status?: any
    ) {
        const whereClause: any = {};

        if (creditType) {
            whereClause.creditType = creditType;
        }

        if (startDate && endDate) {
            whereClause.applicationDate = { [Op.between]: [startDate, endDate] };
        }

        if (status) {
            whereClause.status = status;
        }

        const credits = await Credit.findAll({ where: whereClause });

        return Promise.all(credits.map(async (credit) => {
            const user = await User.findByPk(credit.userId);
            const financing = creditType === CreditType.FINANCING ?
                await Financing.findOne({ where: { creditId: credit.id } }) :
                null;

            return { credit, user, financing };
        }));
    }
}

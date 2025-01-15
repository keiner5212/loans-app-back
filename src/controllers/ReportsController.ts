import { ReportsDAO } from "@/dao/ReportsDAO";
import { Request, Response, Router } from "express";

export class ReportsController extends ReportsDAO {
    private router: Router;

    constructor() {
        super();
        this.router = Router();
    }

    public routes(): Router {

        this.router.post("/:table", (req: Request, res: Response) => {
            const table = req.params.table;
            const { data, startDate, endDate } = req.body;
            ReportsDAO.getReports(table, startDate, endDate, data).then((response) => res.status(response[2]).json(
                { data: response[1] }
            ));
        });

        return this.router;
    }
}
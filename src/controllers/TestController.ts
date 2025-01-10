import { updateCreditStatus } from "@/utils/Task/CronTasks";
import { SendNotifications } from "@/utils/Task/NotificationTasks";
import { Request, Response, Router } from "express";

export class TestController {
    private router: Router;

    constructor() {
        this.router = Router();
    }

    public routes(): Router {
        this.router.get("/updateCreditStatus", (req: Request, res: Response) => {
            updateCreditStatus().then(() => res.send("OK"));
        });

        this.router.get("/SendNotifications", (req: Request, res: Response) => {
            SendNotifications().then(() => res.send("OK"));
        });

        return this.router;

    }
}
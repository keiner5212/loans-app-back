import { Request, Response, Router } from "express";
import { verifyToken } from "@/middlewares/jwt";
import { isUserMaster } from "@/middlewares/Roles";
import { ErrorControl } from "@/constants/ErrorControl";
import { ConfigDao } from "@/dao/ConfigDAO";
import { AlertFrequency, Config } from "@/constants/Config";
import { NotificationServiceScheduler } from "@/utils/Task/NotificationServiceScheduler";

export class ConfigController extends ConfigDao {
    private router: Router;

    constructor() {
        super();
        this.router = Router();
    }

    public routes(): Router {
        this.router.get(
            "/:key",
            verifyToken,
            async (req: Request, res: Response) => {
                const key = req.params.key;
                const data = await ConfigDao.GetConfig(key);
                if (data[0] === ErrorControl.SUCCESS) {
                    return res
                        .status(data[2])
                        .json({
                            message: "Config found successfully",
                            data: data[1],
                        });
                }
                return res.status(data[2]).send(data[1]);
            }
        );

        this.router.put(
            "/",
            verifyToken,
            isUserMaster,
            async (req: Request, res: Response) => {
                const { key, value } = req.body;
                const data = await ConfigDao.SetConfig(key, value);
                if (key == Config.ALERT_FREQUENCY) {
                    const notificationTask = NotificationServiceScheduler.getInstance();
                    switch (value) {
                        case AlertFrequency.DAILY:
                            notificationTask.setDaily();
                            break;
                        case AlertFrequency.WEEKLY:
                            notificationTask.setWeekly();
                            break;
                        case AlertFrequency.MONTHLY:
                            notificationTask.setMonthly();
                            break;
                    }
                }
                console.log(data);
                if (data[0] === ErrorControl.SUCCESS) {
                    return res
                        .status(data[2])
                        .json({
                            message: "Config updated successfully",
                            data: data[1],
                        });
                }

                return res.status(data[2]).send(data[1]);
            }
        );

        this.router.delete(
            "/key",
            verifyToken,
            isUserMaster,
            async (req: Request, res: Response) => {
                const key = req.params.key;
                const data = await ConfigDao.delete(key);
                if (data[0] === ErrorControl.SUCCESS) {
                    return res
                        .status(data[2])
                        .send("Credit deleted successfully: " + data[1]);
                }
                return res.status(data[2]).send(data[1]);
            }
        );

        return this.router;
    }
}

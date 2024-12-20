import { Router, Request, Response } from "express";
import { verifyToken } from "@/middlewares/jwt";
import { isUserAdmin } from "@/middlewares/Roles";
import { NotificationDao } from "@/dao/NotificationDao";
import { ErrorControl } from "@/constants/ErrorControl";

export class NotificationController extends NotificationDao {
    private router: Router;

    constructor() {
        super();
        this.router = Router();
    }

    public routes(): Router {
        this.router.post("/whatsapp", verifyToken, isUserAdmin, async (req: Request, res: Response) => {
            const { to, message, mediaUrl } = req.body;
            const data = await NotificationDao.sendWhatsAppNotification(to, message, mediaUrl);
            if (data[0] === ErrorControl.SUCCESS) {
                return res.status(data[2]).json({ message: "WhatsApp notification sent successfully", data: data[1] });
            }
            return res.status(data[2]).send(data[1]);
        });

        this.router.post("/email", verifyToken, isUserAdmin, async (req: Request, res: Response) => {
            const { to, subject, text } = req.body;
            const data = await NotificationDao.sendEmailNotification(to, subject, text);
            if (data[0] === ErrorControl.SUCCESS) {
                return res.status(data[2]).json({ message: "Email notification sent successfully", data: data[1] });
            }
            return res.status(data[2]).send(data[1]);
        });

        return this.router;
    }
}

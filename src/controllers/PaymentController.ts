import { Request, Response, Router } from "express";
import { PaymentDAO } from "../dao/PaymentDAO";
import { ErrorControl } from "../constants/ErrorControl";
import { CheckCache } from "../middlewares/Cache";
import { Cache } from "../utils/cache";

export class PaymentController extends PaymentDAO {
    private router: Router
    constructor() {
        super();
        this.router = Router();
    }

    public routes(): Router {

        this.router.get("/credit/:creditId",
            CheckCache, async (req: Request, res: Response) => {
                const creditId = parseInt(req.params.creditId);
                const data = await PaymentDAO.getPaymentByCreditId(creditId);
                if (data[0] === ErrorControl.SUCCESS) {
                    Cache.set(req.body.cacheKey, {
                        message: "Payments found successfully",
                        data: data[1],
                    }, 60);
                    return res
                        .status(data[2])
                        .json({
                            message: "Payments found successfully",
                            data: data[1],
                        })
                }
                return res.status(data[2]).send(data[1]);
            }

        );

        this.router.get("/:id",
            CheckCache, async (req: Request, res: Response) => {
                const id = parseInt(req.params.id);
                const data = await PaymentDAO.getPaymentById(id);
                if (data[0] === ErrorControl.SUCCESS) {
                    Cache.set(req.body.cacheKey, {
                        message: "Payments found successfully",
                        data: data[1],
                    }, 60);
                    return res
                        .status(data[2])
                        .json({
                            message: "Payments found successfully",
                            data: data[1],
                        })
                }
                return res.status(data[2]).send(data[1]);
            });

        this.router.post("/", async (req: Request, res: Response) => {
            const data = await PaymentDAO.add(req.body);
            if (data[0] === ErrorControl.SUCCESS) {
                return res
                    .status(data[2])
                    .send("Payment created successfully: " + data[1]);
            }
            return res.status(data[2]).send(data[1]);
        });

        this.router.put("/:id", async (req: Request, res: Response) => {
            const id = parseInt(req.params.id);
            const data = await PaymentDAO.update(req.body, id);
            if (data[0] === ErrorControl.SUCCESS) {
                return res
                    .status(data[2])
                    .send("Payment updated successfully: " + data[1]);
            }
            return res.status(data[2]).send(data[1]);
        });

        this.router.delete("/:id", async (req: Request, res: Response) => {
            const id = parseInt(req.params.id);
            const data = await PaymentDAO.delete(id);
            if (data[0] === ErrorControl.SUCCESS) {
                return res
                    .status(data[2])
                    .send("Payment deleted successfully: " + data[1]);
            }
            return res.status(data[2]).send(data[1]);
        });


        return this.router
    }
}
import { Router } from "express";
import { PaymentDAO } from "../dao/PaymentDAO";
import { ErrorControl } from "../constants/ErrorControl";

export class PaymentController extends PaymentDAO {
    private router: Router
    constructor() {
        super();
        this.router = Router();
    }

    public routes(): Router {

        this.router.get("/user/:userId/credit/:creditId", async (req, res) => {
            const userId = parseInt(req.params.userId);
            const creditId = parseInt(req.params.creditId);
            const data = await PaymentDAO.getPaymentByCreditIdAndUserId(creditId, userId);
            if (data[0] === ErrorControl.SUCCESS) {
                return res
                    .status(data[2])
                    .send("Payments found successfully: " + data[1]);
            }
            return res.status(data[2]).send(data[1]);
        }

        );

        this.router.get("/:id", async (req, res) => {
            const id = parseInt(req.params.id);
            const data = await PaymentDAO.getPaymentById(id);
            if (data[0] === ErrorControl.SUCCESS) {
                return res
                    .status(data[2])
                    .send("Payments found successfully: " + data[1]);
            }
            return res.status(data[2]).send(data[1]);
        });

        this.router.post("/", async (req, res) => {
            const data = await PaymentDAO.add(req.body);
            if (data[0] === ErrorControl.SUCCESS) {
                return res
                    .status(data[2])
                    .send("Payment created successfully: " + data[1]);
            }
            return res.status(data[2]).send(data[1]);
        });

        this.router.put("/:id", async (req, res) => {
            const id = parseInt(req.params.id);
            const data = await PaymentDAO.update(req.body, id);
            if (data[0] === ErrorControl.SUCCESS) {
                return res
                    .status(data[2])
                    .send("Payment updated successfully: " + data[1]);
            }
            return res.status(data[2]).send(data[1]);
        });

        this.router.delete("/:id", async (req, res) => {
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
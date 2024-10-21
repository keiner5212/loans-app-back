import { Request, Response, Router } from "express";
import { UserDAO } from "../dao/UserDAO";
import { CreateUserBodyValidations } from "../middlewares/UserValidations";
import { ErrorControl } from "../constants/ErrorControl";
import { verifyToken } from "../middlewares/jwt";
import { CheckCache } from "../middlewares/Cache";
import { HttpStatusCode } from "axios";

export class UserController extends UserDAO {
	private router: Router;

	constructor() {
		super();
		this.router = Router();
	}

	public routes(): Router {
		// Token verification
		this.router.get(
			"/verifyToken",
			verifyToken,
			(req: Request, res: Response) => {
				return res
					.status(HttpStatusCode.Ok)
					.send("Token verified successfully.");
			}
		);

		// Add user
		this.router.post(
			"/",
			CreateUserBodyValidations,
			async (req: Request, res: Response) => {
				const data = await UserDAO.add(req.body);
				if (data[0] === ErrorControl.SUCCESS) {
					return res
						.status(data[2])
						.send("User created successfully: " + data[1]);
				}
				return res.status(data[2]).send(data[1]);
			}
		);

		// Get user
		this.router.get(
			"/",
			verifyToken,
			CheckCache,
			async (req: Request, res: Response) => {
				const userId = req.body.user.id;
				const data = await UserDAO.getUserById(userId);
				return res.status(data[2]).send(data[1]);
			}
		);

		// Sign in
		this.router.post("/signin", async (req: Request, res: Response) => {
			const { email, password } = req.body;
			const data = await UserDAO.signIn(email, password);
			return res.status(data[2]).send(data[1]);
		});

		// Forgot password (send)
		this.router.post(
			"/forgot_password",
			async (req: Request, res: Response) => {
				const { email } = req.body;
				const data = await UserDAO.forgorPassword(email);
				return res.status(data[2]).send(data[1]);
			}
		);

		// Forgot password (verify code)
		this.router.post(
			"/forgot_password/verify_code",
			async (req: Request, res: Response) => {
				const { email, code } = req.body;
				const data = await UserDAO.verifyForgotPasswordCode(email, code);
				return res.status(data[2]).send(data[1]);
			}
		);

		// Forgot password (reset)
		this.router.post(
			"/forgot_password/reset",
			async (req: Request, res: Response) => {
				const { email, code, password } = req.body;
				const data = await UserDAO.resetPassword(email, code, password);
				return res.status(data[2]).send(data[1]);
			}
		);

		// Update user
		this.router.put(
			"/",
			verifyToken,
			async (req: Request, res: Response) => {
				const userId = req.body.user.id;
				const data = await UserDAO.update(req.body, userId);
				if (data[0] === ErrorControl.SUCCESS) {
					return res.status(data[2]).send(data[1]);
				}
				return res.status(data[2]).send(data[1]);
			}
		);

		return this.router;
	}

}

import { Request, Response, Router } from "express";
import { UserDAO } from "../dao/UserDAO";
import { CreateUserBodyValidations } from "../middlewares/UserValidations";
import { User } from "../entities/User";
import { ErrorControl } from "../constants/ErrorControl";
import { verifyToken } from "../middlewares/jwt";
import multer from "multer";
import { FirebaseService } from "../service/firebaseDB";
import { CheckCache } from "../middlewares/Cache";
import { HttpStatusCode } from "axios";

const firebaseService = FirebaseService.getInstance();
const upload = multer();

export class UserController extends UserDAO {
	private router: Router;

	constructor() {
		super();
		this.router = Router();
	}

	public routes(): Router {
		//token verification
		this.router.get(
			"/verifyToken",
			verifyToken,
			(req: Request, res: Response) => {
				return res
					.status(HttpStatusCode.Ok)
					.send("Token verified successfully.");
			}
		);

		// add
		this.router.post(
			"/",
			CreateUserBodyValidations,
			async (req: Request, res: Response) => {
				const user = User.fromJson(req.body);
				const data = await UserDAO.add(user);
				if (data[0] == ErrorControl.SUCCESS) {
					return res
						.status(data[2])
						.send("User created successfully: " + data[1]);
				}
				return res.status(data[2]).send(data[1]);
			}
		);

		// get user
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

		// sign in
		this.router.post("/signin", async (req: Request, res: Response) => {
			const { email, password } = req.body;
			const data = await UserDAO.signIn(email, password);
			return res.status(data[2]).send(data[1]);
		});

		// forgot password (send)
		this.router.post(
			"/forgot_password",
			async (req: Request, res: Response) => {
				const { email } = req.body;
				const data = await UserDAO.forgorPassword(email);
				return res.status(data[2]).send(data[1]);
			}
		);

		// forgot password (verify code)
		this.router.post(
			"/forgot_password/verify_code",
			async (req: Request, res: Response) => {
				const { email, code } = req.body;
				const data = await UserDAO.verifyForgotPasswordCode(
					email,
					code
				);
				return res.status(data[2]).send(data[1]);
			}
		);

		// forgot password (reset)
		this.router.post(
			"/forgot_password/reset",
			async (req: Request, res: Response) => {
				const { email, code, password } = req.body;
				const data = await UserDAO.resetPassword(email, code, password);
				return res.status(data[2]).send(data[1]);
			}
		);

		// update
		this.router.put(
			"/",
			upload.none(),
			verifyToken,
			async (req: Request, res: Response) => {
				const user = User.fromJson(req.body);
				const image = req.body.image;

				if (image) {
					if (image.type === "Buffer" && Array.isArray(image.data)) {
						const url = await firebaseService.uploadImage(
							Buffer.from(image.data),
							req.body.user.id + ".jpg"
						);
						user.image = url;
					}
				}
				const data = await UserDAO.update(user, req.body.user.id);
				return res.status(data[2]).send(data[1]);
			}
		);

		return this.router;
	}
}

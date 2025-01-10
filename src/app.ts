import cors from "cors";
import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import compression from "compression";
import { config } from "dotenv";
import { UserController } from "@/controllers/UserController";
import { CreditController } from "@/controllers/CreditController";
import { PaymentController } from "@/controllers/PaymentController";
import { FinancingController } from "@/controllers/FinancingController";
import { verifyAppTokenMiddleware } from "@/middlewares/appToken";
import { ConfigController } from "@/controllers/ConfigController";
import { FilesController } from "@/controllers/FilesController";
import { NotificationController } from "@/controllers/NotificationController";
import { TestController } from "./controllers/TestController";

config();

export class App {
	private app: Application;
	private prefix = "/api/v1";
	private numRequest = 0;

	constructor() {
		this.app = express();
	}

	private configuation() {
		// CONFIG
		this.app.disable("x-powered-by");
	}

	private midlewares() {
		// MIDDLEWARES
		this.app.use(cors());
		this.app.use(express.json({ limit: '10mb' }));
		morgan.token("date", () => {
			const date = new Date();
			return `[${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}.${date.getUTCMilliseconds()}]`;
		});
		morgan.token("requests", () => `${++this.numRequest}`);
		const format = "\n#:requests\tt::date\tm::method\trt::response-time ms\np::url\ts::status\tb::res[content-length]\n";
		this.app.use(morgan(format));
		this.app.use(compression());
		this.app.use(verifyAppTokenMiddleware);
	}


	private generalRoutes() {
		// ROUTES
		this.app.get("/", async (req: Request, res: Response) => {
			res.json({
				message: "Welcome to the App",
			});
		});
	}

	private controllerRoutes() {
		// Controllers ROUTES
		this.app.use(this.prefix + "/config", new ConfigController().routes());
		this.app.use(this.prefix + "/user", new UserController().routes());
		this.app.use(this.prefix + "/credit", new CreditController().routes());
		this.app.use(this.prefix + "/payment", new PaymentController().routes());
		this.app.use(this.prefix + "/financing", new FinancingController().routes());
		this.app.use(this.prefix + "/files", new FilesController().routes());
		this.app.use(this.prefix + "/notification", new NotificationController().routes());
		//test route
		this.app.use(this.prefix + "/test", new TestController().routes());
	}

	private NotFound() {
		// 404 PAGE
		this.app.use((req: Request, res: Response) => {
			res.status(404).send("Page not found");
		});
	}

	public config(): Application {
		this.configuation();
		this.midlewares();
		this.generalRoutes();
		this.controllerRoutes();
		this.NotFound();

		return this.app;
	}
}

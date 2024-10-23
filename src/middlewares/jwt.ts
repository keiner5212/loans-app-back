import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { config } from "dotenv";
import { HttpStatusCode } from "axios";
import { createDebugger } from "../utils/debugConfig";

config();

const log = createDebugger("jwt");
const logError = log.extend("error");
/**
 * Verify token
 * @param req
 * @param res
 * @param next
 */
export const verifyToken = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader?.split(" ")[1];

	if (token == null) {
		log("Access denied. No token provided.");
		return res
			.status(HttpStatusCode.Unauthorized)
			.send("Access denied. No token provided.");
	}

	verify(
		token,
		process.env.JWT_SECRET as string,
		(err: any, payload: any) => {
			if (err) {
				logError("Invalid token:", token);
				return res
					.status(HttpStatusCode.Forbidden)
					.send("Invalid token.");
			}
			req.body.user = payload;
			next();
		}
	);
};

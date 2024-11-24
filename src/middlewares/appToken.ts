import { NextFunction, Request, Response } from "express";
import { config } from "dotenv";
import { HttpStatusCode } from "axios";
import { createDebugger } from "../utils/debugConfig";
import { verifyAppToken } from "../utils/security/appToken";

config();

const log = createDebugger("app-token");
const logError = log.extend("error");
/**
 * Verify token
 * @param req
 * @param res
 * @param next
 */
export const verifyAppTokenMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const appToken = req.headers["x-app-token"];
    if (appToken == null) {
        log("Access denied. No recognized app.");
        return res
            .status(HttpStatusCode.Unauthorized)
            .send("Access denied. No token provided.");
    }

    const isvalid = verifyAppToken(appToken as string);
    if (isvalid) {
        next();
    } else {
        logError("Invalid token:", appToken);
        return res
            .status(HttpStatusCode.Forbidden)
            .send("Invalid token.");
    }

};

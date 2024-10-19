import { Request, Response } from "express";
import { Cache } from "../utils/cache";
import { createDebugger } from "../utils/debugConfig";
import { HttpStatusCode } from "axios";

const middlewareDebugger = createDebugger("cache");

export const CheckCache = async (req: Request, res: Response, next: any) => {
	let cacheKey = req.method + req.originalUrl;
	if (req.body.user) {
		cacheKey += req.body.user.id;
	}
	const cachedData = Cache.get(cacheKey);
	if (cachedData) {
		middlewareDebugger(`Cache found for ${cacheKey}`);
		return res.status(HttpStatusCode.Ok).send(cachedData);
	} else {
		req.body.cacheKey = cacheKey;
		next();
	}
};

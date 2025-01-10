import { Request, Response } from "express";
import { Cache } from "@/utils/cache";
import { createDebugger } from "@/utils/debugConfig";
import { HttpStatusCode } from "axios";

const log = createDebugger("cache");

export const CheckCache = async (req: Request, res: Response, next: any) => {
	//check if the cache is disabled on the request
	const isDisabled = req.headers["x-disable-cache"] === "true";
	if (isDisabled) {
		log("Cache disabled");
		return next();
	}
	// check if the cache exists and return it
	let cacheKey = req.method + req.originalUrl;
	if (req.body.user) {
		cacheKey += req.body.user.id;
	}
	const cachedData = Cache.get(cacheKey);
	if (cachedData) {
		log(`Cache found for ${cacheKey}`);
		return res.status(HttpStatusCode.Ok).send(cachedData);
	} else {
		// if not, continue
		req.body.cacheKey = cacheKey;
		next();
	}
};

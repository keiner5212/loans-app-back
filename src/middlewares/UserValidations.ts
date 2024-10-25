import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { createDebugger } from "../utils/debugConfig";
import { HttpStatusCode } from "axios";

const middlewareDebugger = createDebugger("UserValidations");

export const CreateUserBodyValidations = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const schema = Joi.object({
		name: Joi.string().required().allow(""),
		email: Joi.string().required(),
		document_type: Joi.string().required().allow(""),
		document: Joi.string().required().allow(""),
		phone: Joi.string().required().allow(""),
		role: Joi.string().required().allow(""),
		password: Joi.string().required(),
	});

	const { error } = schema.validate(req.body);
	if (error) {
		middlewareDebugger(error.details[0].message);
		return res.status(HttpStatusCode.BadRequest).send(error.details[0].message);
	}

	next();
};

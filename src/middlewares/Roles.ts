import { NextFunction, Request, Response } from "express";
import { createDebugger } from "@/utils/debugConfig";
import { HttpStatusCode } from "axios";
import { Roles } from "@/constants/Roles";


const log = createDebugger("RolesMiddleware");

export const isUserRecovery = (req: Request, res: Response, next: NextFunction) => {

    if (req.body.user.role === Roles.USER_RECOVERY ||
        req.body.user.role === Roles.USER_MASTER ||
        req.body.user.role === Roles.USER_ADMIN) {

        next();
    } else {
        log("Forbidden, usser was not recovery");
        return res.status(HttpStatusCode.Forbidden).send("Forbidden");
    }
}


export const isUserCollocation = (req: Request, res: Response, next: NextFunction) => {

    if (req.body.user.role === Roles.USER_COLLOCATION ||
        req.body.user.role === Roles.USER_MASTER ||
        req.body.user.role === Roles.USER_ADMIN) {
        next();
    } else {
        log("Forbidden, usser was not collocation");
        return res.status(HttpStatusCode.Forbidden).send("Forbidden");
    }
}


export const isUserAdmin = (req: Request, res: Response, next: NextFunction) => {

    if (req.body.user.role === Roles.USER_ADMIN
        || req.body.user.role === Roles.USER_MASTER
    ) {
        next();
    } else {
        log("Forbidden, usser was not admin");
        return res.status(HttpStatusCode.Forbidden).send("Forbidden");
    }
}


export const isUserMaster = (req: Request, res: Response, next: NextFunction) => {

    if (req.body.user.role === Roles.USER_MASTER) {
        next();
    } else {
        log("Forbidden, usser was not master");
        return res.status(HttpStatusCode.Forbidden).send("Forbidden");
    }
}


import { HttpStatusCode } from "axios";
import { DaoResponse, ErrorControl } from "../constants/ErrorControl";
import { createDebugger } from "../utils/debugConfig";
import { AppConfig } from "../entities/Config";

const log = createDebugger("ConfigDao");
const logError = log.extend("error");

export class ConfigDao {

    protected static async GetConfig(key: string): Promise<DaoResponse> {
        try {
            const config = await AppConfig.findOne({ where: { key } });
            if (!config) {
                return [
                    ErrorControl.PERSONALIZED,
                    "config not found",
                    HttpStatusCode.NotFound,
                ];
            }

            return [ErrorControl.SUCCESS, config, HttpStatusCode.Ok];
        } catch (error) {
            const msg = "Error in get config";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }


    protected static async SetConfig(key: string, value: string): Promise<DaoResponse> {
        try {
            const existingConfig = await AppConfig.findOne({ where: { key } });

            //update if exists
            if (existingConfig) {
                await existingConfig.update({ value });
                return [ErrorControl.SUCCESS, existingConfig.id, HttpStatusCode.Created];
            }

            //create
            const newConfig = await AppConfig.create({
                key,
                value
            });
            return [ErrorControl.SUCCESS, newConfig.id, HttpStatusCode.Created];
        } catch (error) {
            const msg = "Error in add config";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }

    protected static async delete(key: string): Promise<DaoResponse> {
        try {
            const deletedConfig = await AppConfig.destroy({ where: { key } });
            return [ErrorControl.SUCCESS, deletedConfig, HttpStatusCode.Ok];
        } catch (error) {
            const msg = "Error in delete config";
            logError(msg + ": " + error);
            return [
                ErrorControl.ERROR,
                msg,
                HttpStatusCode.InternalServerError,
            ];
        }
    }

}
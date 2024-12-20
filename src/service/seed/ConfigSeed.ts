import { Config } from "@/constants/Config";
import { AppConfig } from "@/entities/Config";
import { createDebugger } from "@/utils/debugConfig";

const log = createDebugger("ConfigSeed");
const logError = log.extend("error");

/**
 * Seed default Config
 */
export async function seedConfig() {
    const defaultConfigs = [
        [Config.INTEREST_RATE, "0.03"], // 3%
    ]

    // verify if there is configs already
    for (const config of defaultConfigs) {
        const existingConfig = await AppConfig.findOne({ where: { key: config[0] } });
        if (existingConfig) {
            logError(`There are already configs with key: ${config[0]}`);
            continue;
        }

        await AppConfig.create({
            key: config[0],
            value: config[1],
        });
    }

    log(`Default config created`);

}

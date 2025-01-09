import { config } from "dotenv";
import { createDebugger } from "@/utils/debugConfig";
import { App } from "@/app";
import { getLocalIP } from "@/utils/net/LocalIp";
import { createDatabase, Migrations } from "@/service/Migrations";
import { CronService } from "@/utils/Task/CronService";
import { NotificationServiceScheduler } from "@/utils/Task/NotificationServiceScheduler";
import { AppConfig } from "./entities/Config";
import { AlertFrequency, Config } from "./constants/Config";
import { Global } from "./constants/Global";

// CONFIGURATION
config();
const PORT: number = parseInt(process.env.PORT ?? '3000', 10);

async function setUpDatabase() {
    const databaseName = process.env.POSTGRES_DB || "";
    await createDatabase(databaseName)
    await Migrations();
}

setUpDatabase().then(async () => {
    // set up the globals

    const companyName = await AppConfig.findOne({ where: { key: Config.DOCUMENT_NAME } })
    Global.appName = companyName?.value || process.env.APP_NAME || "";

    // task for update database status and more every 24 hours
    const cronService = CronService.getInstance();
    cronService.start();

    // task for send notification every 24 hours (default)
    const notificationTask = NotificationServiceScheduler.getInstance();
    notificationTask.start();

    // change interval based on config
    const config = await AppConfig.findOne({ where: { key: Config.ALERT_FREQUENCY } })
    if (config) {
        switch (config.value) {
            case AlertFrequency.DAILY:
                notificationTask.setDaily();
                break;
            case AlertFrequency.WEEKLY:
                notificationTask.setWeekly();
                break;
            case AlertFrequency.MONTHLY:
                notificationTask.setMonthly();
                break;
        }
    }

    // APP
    const app = new App().config();

    // DEBUGGER
    const serverDebugger = createDebugger('server');

    // LISTEN
    app.listen(PORT, () => {
        const ip = getLocalIP();
        serverDebugger(`Server running, check:\nhttp://localhost:${PORT}\nhttp://${ip}:${PORT}`);
    });

})

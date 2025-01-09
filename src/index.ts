import { config } from "dotenv";
import { createDebugger } from "@/utils/debugConfig";
import { App } from "@/app";
import { getLocalIP } from "@/utils/net/LocalIp";
import { createDatabase, Migrations } from "@/service/Migrations";
import { CronService } from "@/utils/Task/CronService";
import { NotificationServiceScheduler } from "@/utils/Task/NotificationServiceScheduler";

// CONFIGURATION
config();
const PORT: number = parseInt(process.env.PORT ?? '3000', 10);

async function setUpDatabase() {
    const databaseName = process.env.POSTGRES_DB || "";
    await createDatabase(databaseName)
    await Migrations();
}

setUpDatabase().then(() => {
    // task for update database status and more every 24 hours
    const cronService = CronService.getInstance();
    cronService.start();
    // task for send notification every 24 hours (default)
    const notificationTask = NotificationServiceScheduler.getInstance();
    notificationTask.start();
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

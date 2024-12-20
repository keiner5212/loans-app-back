import cron from 'node-cron';
import { createDebugger } from '@/utils/debugConfig';
import { updateCreditStatus } from './CronTasks';

const log = createDebugger("cronService");
const logError = log.extend("error");

export class CronService {
    private static instance: CronService;
    private task: cron.ScheduledTask;
    private isRunning: boolean;
    private currentInterval: string;

    private constructor() {
        this.isRunning = false;
        this.currentInterval = '0 0 * * *'; // Runs every 24 hours by default (at midnight)

        this.task = cron.schedule(this.currentInterval, this.runTask.bind(this), {
            scheduled: false,
            timezone: "UTC"
        });

        log('CronService initialized. Default interval: 1 day (24 hours)');
    }

    // Singleton access method
    public static getInstance(): CronService {
        if (!CronService.instance) {
            CronService.instance = new CronService();
        }
        return CronService.instance;
    }

    private async runTask() {
        if (this.isRunning) {
            log('Task is already running. Skipping this instance.');
            return;
        }

        this.isRunning = true; // Mark task as running

        try {
            log('Running task...');
            await updateCreditStatus();
            log('Task completed.');
        } catch (error) {
            logError('Error running task: ' + error);
        } finally {
            this.isRunning = false; // Mark task as completed
        }
    }

    // Start the cron job
    public start() {
        log('Starting cron job...');
        this.task.start();
    }

    // Stop the cron job
    public stop() {
        log('Stopping cron job...');
        this.task.stop();
    }

    // Change the cron job interval in hours
    public setInterval(hours: number) {
        const newInterval = `0 */${hours} * * *`;
        if (newInterval !== this.currentInterval) {
            log(`Changing interval to every ${hours} hours.`);
            this.stop();
            this.currentInterval = newInterval;
            this.task = cron.schedule(this.currentInterval, this.runTask.bind(this), {
                scheduled: false,
                timezone: "UTC"
            });
            this.start(); // Restart the task with the new interval
        } else {
            log('Interval is already set to this value.');
        }
    }
}

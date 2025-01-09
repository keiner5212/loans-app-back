import cron from 'node-cron';
import { createDebugger } from '@/utils/debugConfig';
import { SendNotifications } from './NotificationTasks';

const log = createDebugger("NotificationScheduler");
const logError = log.extend("error");

export class NotificationServiceScheduler {
    private static instance: NotificationServiceScheduler;
    private task: cron.ScheduledTask;
    private isRunning: boolean;
    private currentInterval: string;

    private constructor() {
        this.isRunning = false;
        this.currentInterval = '0 0 * * *'; // Runs every 24 hours by default (UTC midnight)

        this.task = cron.schedule(this.currentInterval, this.runTask.bind(this), {
            scheduled: false,
            timezone: "UTC"
        });

        log('NotificationServiceScheduler initialized, task will run every 24 hours (utc midnight).');
    }

    // Singleton access method
    public static getInstance(): NotificationServiceScheduler {
        if (!NotificationServiceScheduler.instance) {
            NotificationServiceScheduler.instance = new NotificationServiceScheduler();
        }
        return NotificationServiceScheduler.instance;
    }

    private async runTask() {
        if (this.isRunning) {
            log('Task is already running. Skipping this instance.');
            return;
        }

        this.isRunning = true; // Mark task as running

        try {
            log('Sending notifications...');
            await SendNotifications();
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

    // Change interval to weekly
    public setWeekly() {
        log('Changing interval to weekly...');
        this.changeInterval('0 0 * * 0'); // Runs every Sunday at midnight UTC
    }

    // Change interval to daily (24 hours)
    public setDaily() {
        log('Changing interval to daily...');
        this.changeInterval('0 0 * * *'); // Runs every day at midnight UTC
    }

    // Change interval to monthly
    public setMonthly() {
        log('Changing interval to monthly...');
        this.changeInterval('0 0 1 * *'); // Runs on the 1st of each month at midnight UTC
    }

    // General method to change the cron schedule
    private changeInterval(newInterval: string) {
        if (this.currentInterval === newInterval) {
            log('Interval is already set to the specified value. No changes made.');
            return;
        }

        this.stop(); // Stop the current task
        this.task = cron.schedule(newInterval, this.runTask.bind(this), {
            scheduled: false,
            timezone: "UTC"
        });
        this.currentInterval = newInterval; // Update the current interval
        this.start(); // Restart the task with the new schedule

        log(`Interval successfully changed to: ${newInterval}`);
    }
}

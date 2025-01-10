
import { ErrorControl } from "@/constants/ErrorControl";
import { DaoResponse } from "@/constants/ErrorControl";
import { createDebugger } from "@/utils/debugConfig";
import { MailService } from "@/utils/Email/SendEmail";
import { WhatsAppService } from "@/utils/Whatsapp/WhatsAppService";

const log = createDebugger("NotificationDao");
const logError = log.extend("error");

const mailService = MailService.getInstance();
const whatsAppService = WhatsAppService.getInstance();
export class NotificationDao {

    /**
     * 
     * @param to - phone number to send message (international format: 573123456723)
     * @param message - message to send
     * @param mediaUrl - url of media to send
     * @returns 
     */
    protected static async sendWhatsAppNotification(to: string, message: string, mediaUrl?: string): Promise<DaoResponse> {
        try {
            const [success, response] = await whatsAppService.sendMessage({ to, message, mediaUrl });
            if (success) {
                return [ErrorControl.SUCCESS, response, 200];
            }
            return [ErrorControl.ERROR, response, 500];
        } catch (error) {
            logError("Error in WhatsApp notification: " + error);
            return [ErrorControl.ERROR, "Failed to send WhatsApp notification", 500];
        }
    }

    /**
     * 
     * @param to - the email address to send the notification
     * @param subject - the subject of the email
     * @param text - the text of the email
     * @returns 
     */
    protected static async sendEmailNotification(to: string, subject: string, text: string): Promise<DaoResponse> {
        try {
            const [success, response] = await mailService.sendMail({ from: MailService.fromDefault, to, subject, textHTML: text });
            if (success) {
                return [ErrorControl.SUCCESS, response, 200];
            }
            return [ErrorControl.ERROR, response, 500];
        } catch (error) {
            logError("Error in email notification: " + error);
            return [ErrorControl.ERROR, "Failed to send email notification", 500];
        }
    }
}

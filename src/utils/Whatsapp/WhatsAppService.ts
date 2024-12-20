import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { config } from "dotenv";
import { createDebugger } from "@/utils/debugConfig";

config();
const log = createDebugger("whatsapp");
const logError = log.extend("error");

/**
 * Interface for WhatsApp message options
 * @interface WhatsAppMessageOptions
 * @property {string} to - The phone number to send the message to (international format: +1234567890)
 * @property {string} message - The message to send
 */
interface WhatsAppMessageOptions {
    to: string;
    message: string;
    mediaUrl?: string;
}

export class WhatsAppService {
    private static instance: WhatsAppService;
    private client: Client;

    private constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: "default-session", 
            }),
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });

        this.client.on("qr", (qr) => {
            qrcode.generate(qr, { small: true });
            log("Scan this QR code to log in to WhatsApp.");
        });

        this.client.on("ready", () => {
            log("WhatsApp client is ready.");
        });

        this.client.on("authenticated", () => {
            log("Authentication successful.");
        });

        this.client.on("auth_failure", (error) => {
            logError("Authentication failed: " + error);
        });

        this.client.on("disconnected", (reason) => {
            logError("Disconnected: " + reason);
        });

        this.client.initialize();
    }

    // Singleton access method
    public static getInstance(): WhatsAppService {
        if (!WhatsAppService.instance) {
            WhatsAppService.instance = new WhatsAppService();
        }
        return WhatsAppService.instance;
    }

    // Send a message
    public async sendMessage(options: WhatsAppMessageOptions): Promise<[boolean, any]> {
        try {
            const chatId = `${options.to}@c.us`;
            if (options.mediaUrl) {
                const media = await MessageMedia.fromUrl(options.mediaUrl);
                await this.client.sendMessage(chatId, media, { caption: options.message });
            } else {
                await this.client.sendMessage(chatId, options.message);
            }
            log(`Message sent to: ${options.to}`);
            return [true, `Message sent to ${options.to}`];
        } catch (error) {
            logError("Error sending message: " + error);
            return [false, error];
        }
    }
}

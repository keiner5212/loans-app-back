import nodemailer, { Transporter } from "nodemailer";
import { config } from "dotenv";
import { createDebugger } from "../debugConfig";

config();
const log = createDebugger("mailer");
const logError = log.extend("error");

interface MailOptions {
	from: string;
	to: string;
	subject: string;
	text: string;
}

const appName = process.env.APP_NAME || "Opa";

export class MailService {
	private static instance: MailService;
	private transporter: Transporter;
	public fromDefault: string;

	private constructor() {
		// Configure Nodemailer transport
		this.transporter = nodemailer.createTransport({
			host: "smtp.gmail.com",
			port: 465,
			secure: true,
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});

		this.fromDefault = `Skillwork <${process.env.EMAIL_USER}>`;

		// Verify connection configuration
		this.transporter.verify((error, success) => {
			if (error) {
				logError(error);
			} else {
				log("Mail server is ready");
			}
		});
	}

	// Singleton access method
	public static getInstance(): MailService {
		if (!MailService.instance) {
			MailService.instance = new MailService();
		}
		return MailService.instance;
	}

	// Method to send an email
	public async sendMail(mailOptions: MailOptions): Promise<[boolean, any]> {
		try {
			const options = {
				from: mailOptions.from,
				to: mailOptions.to,
				subject: mailOptions.subject,
				html: `
          <h1>${appName}</h1>
          <p>Hello from ${appName}, you have a new message:</p>
          <br>
          <p>${mailOptions.text}</p>
          <br>
          <p>Regards,</p>
          <p>Skillwork Team</p>
        `,
			};

			const info = await this.transporter.sendMail(options);
			log(
				"Email sent to: " +
					mailOptions.to +
					" with response: " +
					info.response
			);
			return [true, info];
		} catch (error) {
			logError("Error sending email: " + error);
			return [false, error];
		}
	}
}

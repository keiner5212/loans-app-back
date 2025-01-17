import nodemailer, { Transporter } from "nodemailer";
import { config } from "dotenv";
import { createDebugger } from "@/utils/debugConfig";

config();
const log = createDebugger("mailer");
const logError = log.extend("error");

interface MailOptions {
	from: string;
	to: string;
	subject: string;
	textHTML: string;
}


export class MailService {
	private static instance: MailService;
	private transporter: Transporter;
	public static appName: string = "";
	public static fromDefault: string = "";

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

		// Verify connection configuration
		this.transporter.verify((error) => {
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
					<h1>${MailService.appName}</h1>
					<p>Hello from ${MailService.appName}, you have a new message:</p>
					<br>
					<div>${mailOptions.textHTML}</div>
					<br>
					<p>Regards,</p>
					<p>${MailService.appName} Team</p>
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

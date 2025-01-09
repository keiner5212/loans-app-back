import { Config } from "@/constants/Config";
import { AppConfig } from "@/entities/Config";
import { Credit, Status } from "@/entities/Credit";
import { Payment, PaymentStatus } from "@/entities/Payment";
import { User } from "@/entities/User";
import { MailService } from "@/utils/Email/SendEmail";
import { WhatsAppService } from "@/utils/Whatsapp/WhatsAppService";

const mailService = MailService.getInstance();
const whatsAppService = WhatsAppService.getInstance();

async function getCompanyInfo() {
    const configs = await AppConfig.findAll();
    const companyInfo = configs.reduce((info, config: AppConfig) => {
        info[config.key] = config.value;
        return info;
    }, {} as Record<string, string>);
    return companyInfo;
}

export async function SendNotifications() {
    // Get company information
    const companyInfo = await getCompanyInfo();

    // Get credits with status "late"
    const credits = await Credit.findAll({ where: { status: Status.LATE } });

    for (const credit of credits) {
        const user = await User.findByPk(credit.userId);
        if (user) {
            // Get pending payments for this credit
            const pendingPayments = await Payment.findAll({
                where: { creditId: credit.id, status: PaymentStatus.PENDING },
            });

            const pendingDetails = pendingPayments.map(
                (payment) =>
                    `- Payment #${payment.period}: $${payment.amount.toFixed(2)} due on ${new Date(payment.timelyPayment).toLocaleDateString()}`
            ).join("\n");

            // Compose message
            const companyName = companyInfo[Config.DOCUMENT_NAME] || "Company Name";
            const companyPhone = companyInfo[Config.COMPANY_PHONE] || "No phone available";
            const companyEmail = companyInfo[Config.COMPANY_EMAIL] || "No email available";

            const emailMessage = `
                Dear ${user.name},

                We hope this message finds you well. We are reaching out to inform you that your credit (ID: ${credit.id}) is currently marked as late. Below, you will find details about the pending payments:

                ${pendingDetails}

                Please ensure prompt payment to avoid further penalties.

                For any questions, please contact us:
                - Phone: ${companyPhone}
                - Email: ${companyInfo[Config.COMPANY_EMAIL] || "No email available"}
                - Address: ${companyEmail}

                Thank you for your attention.

                Best regards,
                ${companyName}`;

            const whatsappMessage = `
                    Hi ${user.name},

                    This is a reminder that your credit (ID: ${credit.id}) is late. Please review the pending payments:

                    ${pendingDetails}

                    Contact us at ${companyPhone} or email us at ${companyEmail} if you have any questions.

                    Thank you, ${companyName}`;

            // Send email
            await mailService.sendMail({
                from: mailService.fromDefault,
                to: user.email,
                subject: "Late Payment Notification",
                text: emailMessage,
            });

            // Send WhatsApp message
            await whatsAppService.sendMessage({
                to: user.phone,
                message: whatsappMessage,
            });

            // Wait 10 seconds before sending the next notification
            await new Promise((resolve) => setTimeout(resolve, 10000));
        }
    }
}

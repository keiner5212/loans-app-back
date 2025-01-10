import { Config } from "@/constants/Config";
import { AppConfig } from "@/entities/Config";
import { Credit, Status } from "@/entities/Credit";
import { Payment, PaymentStatus } from "@/entities/Payment";
import { User } from "@/entities/User";
import { MailService } from "@/utils/Email/SendEmail";
import { WhatsAppService } from "@/utils/Whatsapp/WhatsAppService";
import { config } from "dotenv";
import { Op } from "sequelize";
import { formatUtcToLocal } from "../formats/formatToLocal";

config();

const countryCode = process.env.WHATSAPP_COUNTRY_CODE;

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
    const TWO_DAYS_IN_MS = 2.3 * 24 * 3600 * 1000; // Two (and a little) days in milliseconds
    const today = new Date();
    const twoDaysFromNow = new Date(today.getTime() + TWO_DAYS_IN_MS);

    // Get company information
    const companyInfo = await getCompanyInfo();
    const companyName = companyInfo[Config.DOCUMENT_NAME] || "Nombre de la empresa";
    const companyPhone = companyInfo[Config.COMPANY_PHONE] || "Teléfono no disponible";
    const companyEmail = companyInfo[Config.COMPANY_EMAIL] || "Correo electrónico no disponible";

    // Get credits with status "late"
    const lateCredits = await Credit.findAll({ where: { status: Status.LATE } });

    for (const credit of lateCredits) {
        const user = await User.findByPk(credit.userId);
        if (user) {
            // Get Late payments for this credit
            const pendingPayments = await Payment.findAll({
                where: { creditId: credit.id, status: PaymentStatus.LATE },
            });

            const pendingDetails = pendingPayments.map(
                (payment) =>
                    `- Pago #${payment.period}: $${payment.amount} con fecha de vencimiento ${formatUtcToLocal(payment.timelyPayment.toUTCString(), process.env.LOCALE || "en-US", process.env.TIMEZONE || "UTC")}`
            ).join("<br>");

            const emailMessage = `
                <p>Estimado/a ${user.name},</p>
                <p>Esperamos que este mensaje le encuentre bien. Nos ponemos en contacto para informarle que su crédito (ID: ${credit.id}) está actualmente marcado como atrasado. A continuación, encontrará los detalles de los pagos pendientes:</p>
                <p>${pendingDetails}</p>
                <p>Por favor, asegúrese de realizar el pago lo antes posible para evitar más penalizaciones.</p>
                <p>Si tiene preguntas, no dude en contactarnos:</p>
                <ul>
                    <li>Teléfono: ${companyPhone}</li>
                    <li>Correo electrónico: ${companyEmail}</li>
                </ul>
                <p>Gracias por su atención.</p>`;

            const whatsappMessage = `Hola ${user.name},

Este es un recordatorio de que su crédito (ID: ${credit.id}) está atrasado. Por favor, revise los pagos pendientes:

${pendingPayments.map(payment => `- Pago #${payment.period}: $${payment.amount} con fecha de vencimiento ${formatUtcToLocal(payment.timelyPayment.toUTCString(), process.env.LOCALE || "en-US", process.env.TIMEZONE || "UTC")}`).join("\n")}

Contáctenos al ${companyPhone} o por correo electrónico en ${companyEmail} si tiene alguna pregunta.

Gracias, ${companyName}`;

            // Send email
            await mailService.sendMail({
                from: MailService.fromDefault,
                to: user.email,
                subject: "Notificación de Pago Atrasado",
                textHTML: emailMessage,
            });

            // Send WhatsApp message
            await whatsAppService.sendMessage({
                to: countryCode + user.phone,
                message: whatsappMessage,
            });

            // Wait 10 seconds before sending the next notification
            await new Promise((resolve) => setTimeout(resolve, 10000));
        }
    }

    // Get credits with status "released"
    const releasedCredits = await Credit.findAll({ where: { status: Status.RELEASED } });

    for (const credit of releasedCredits) {
        const user = await User.findByPk(credit.userId);
        if (user) {
            // Get pending payments that are due in the next 2 days
            const upcomingPayments = await Payment.findAll({
                where: {
                    creditId: credit.id,
                    status: PaymentStatus.PENDING,
                    timelyPayment: {
                        [Op.between]: [today, twoDaysFromNow],
                    },
                },
            });

            if (upcomingPayments.length > 0) {
                const paymentDetails = upcomingPayments.map(
                    (payment) =>
                        `- Pago #${payment.period}: $${payment.amount} con fecha de vencimiento ${formatUtcToLocal(payment.timelyPayment.toUTCString(), process.env.LOCALE || "en-US", process.env.TIMEZONE || "UTC")}`
                ).join("<br>");

                const emailMessage = `
                    <p>Estimado/a ${user.name},</p>
                    <p>Esperamos que este mensaje le encuentre bien. Nos ponemos en contacto para recordarle los próximos pagos de su crédito (ID: ${credit.id}). A continuación, encontrará los detalles de los pagos con vencimiento en los próximos dos días:</p>
                    <p>${paymentDetails}</p>
                    <p>Por favor, asegúrese de realizar el pago puntualmente para evitar penalizaciones.</p>
                    <p>Si tiene preguntas, no dude en contactarnos:</p>
                    <ul>
                        <li>Teléfono: ${companyPhone}</li>
                        <li>Correo electrónico: ${companyEmail}</li>
                    </ul>
                    <p>Gracias por su atención.</p>`;

                const whatsappMessage = `Hola ${user.name},

Este es un recordatorio de los próximos pagos de su crédito (ID: ${credit.id}). Por favor, revise los detalles a continuación:

${upcomingPayments.map(payment => `- Pago #${payment.period}: $${payment.amount} con fecha de vencimiento ${formatUtcToLocal(payment.timelyPayment.toUTCString(), process.env.LOCALE || "en-US", process.env.TIMEZONE || "UTC")}`).join("\n")}

Contáctenos al ${companyPhone} o por correo electrónico en ${companyEmail} si tiene alguna pregunta.

Gracias, ${companyName}`;

                // Send email
                await mailService.sendMail({
                    from: MailService.fromDefault,
                    to: user.email,
                    subject: "Recordatorio de Próximo Pago",
                    textHTML: emailMessage,
                });

                // Send WhatsApp message
                await whatsAppService.sendMessage({
                    to: countryCode + user.phone,
                    message: whatsappMessage,
                });

                // Wait 10 seconds before sending the next notification
                await new Promise((resolve) => setTimeout(resolve, 10000));
            }
        }
    }
}

import { Credit, Status } from "@/entities/Credit";
import { User } from "@/entities/User";
import { MailService } from "@/utils/Email/SendEmail";
import { WhatsAppService } from "@/utils/Whatsapp/WhatsAppService";

const mailService = MailService.getInstance();
const whatsAppService = WhatsAppService.getInstance();

export async function SendNotifications() {
    //get credits with status "late"
    const credits = await Credit.findAll({ where: { status: Status.LATE } });
    // send notifications
    for (const credit of credits) {
        const user = await User.findByPk(credit.userId);
        if (user) {
            await mailService.sendMail({
                from: mailService.fromDefault,
                to: user.email,
                subject: "Credit late notification",
                text: `The credit with id ${credit.id} is late, please pay it as soon as possible.`,
            });

            await whatsAppService.sendMessage({
                to: user.phone,
                message: `The credit with id ${credit.id} is late, please pay it as soon as possible.`,
            });

            await new Promise((resolve) => setTimeout(resolve, 10000)); // wait 10 seconds before sending the next notification (avoiding spamming)
        }
    }
}

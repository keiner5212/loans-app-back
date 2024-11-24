import { Roles } from "../../constants/Roles";
import { User } from "../../entities/User";
import { EncriptPassword } from "../../utils/cryptography/encrypt";
import { createDebugger } from "../../utils/debugConfig";

const log = createDebugger("UserSeed");
const logError = log.extend("error");

/**
 * Seed default users
 */
export async function seedUsers() {
    const email = "admin@admin.admin";
    const password = "admin";

    // verify if there are users with role of master (Roles.USER_MASTER)
    const masters = await User.findAll({ where: { role: Roles.USER_MASTER } });
    if (masters.length > 0) {
        logError(`There are already users with role of master.`);
        return;
    }

    const hashedPassword = await EncriptPassword(password);
    await User.create({
        name: "Admin",
        email,
        document_type: "CC",
        document: "123456789",
        phone: "0000000000",
        role: Roles.USER_MASTER,
        password: hashedPassword,
        created_at: new Date(),
    });

    log(`Default admin user created with email: ${email}`);
}

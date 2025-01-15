import { Roles } from "@/constants/Roles";
import { Credit, CreditType, Status } from "@/entities/Credit";
import { Financing } from "@/entities/Financing";
import { Payment, PaymentStatus } from "@/entities/Payment";
import { User } from "@/entities/User";
import { calcularPago } from "@/utils/amortizacion/Credit";
import { EncriptPassword } from "@/utils/cryptography/encrypt";
import { createDebugger } from "@/utils/debugConfig";
import { CreditPeriod } from "@/utils/Task/CronTasks";
import { faker } from "@faker-js/faker";

const log = createDebugger("FakeSeed");
const logError = log.extend("error");

export async function seedFake() {
    //users
    const everyonePassword = "test"
    const hashedPassword = await EncriptPassword(everyonePassword);
    const everyoneproofOfIncome = "1736551559804-1066348385_constancia_de_ingresos.pdf"
    const everyonedocumentImageBack = "1736551560007-1066348385_documento_detras.jpg"
    const everyonedocumentImageFront = "1736551559938-1066348385_documento_delante.jpg"
    const everyonelocationCroquis = "1736551559875-1066348385_croquis_ubicacion.jpg"


    const fakeUsers = [];
    const numberOfUsers = 10; // Define cuántos usuarios quieres generar

    for (let i = 0; i < numberOfUsers; i++) {
        fakeUsers.push({
            name: faker.name.fullName(),
            email: faker.internet.email(),
            document_type: faker.helpers.arrayElement(["CC", "TI", "CE"]),
            document: faker.string.numeric(10),
            phone: faker.phone.number({ style: "human" }),
            role: faker.helpers.arrayElement([
                Roles.USER_CLIENT,
                Roles.USER_RECOVERY,
                Roles.USER_COLLOCATION,
            ]),
            password: hashedPassword,
            proofOfIncome: everyoneproofOfIncome,
            documentImageFront: everyonedocumentImageBack,
            documentImageBack: everyonedocumentImageFront,
            locationCroquis: everyonelocationCroquis,
            created_at: new Date(),
        });
    }

    try {
        await User.bulkCreate(fakeUsers); // Inserta todos los usuarios en la base de datos
        log(`Successfully created ${numberOfUsers} fake users.`);
    } catch (error) {
        logError("Error seeding fake users:", error);
    }

    //credits

    const fakeCredits = [];
    const numberOfCredits = 10; // Número de créditos a generar

    const users = await User.findAll(); // Obtener todos los usuarios de la base de datos

    if (users.length === 0) {
        logError("No users found to assign credits.");
        return;
    }

    for (let i = 0; i < numberOfCredits; i++) {
        const user = faker.helpers.arrayElement(users); // Selecciona un usuario aleatorio
        const userCreator = 3; // Selecciona aleatoriamente un creador de crédito

        const temp: Record<string, any> = {
            userId: user.id!,
            creditType: faker.helpers.arrayElement([CreditType.CREDIT, CreditType.FINANCING]),
            userCreatorId: userCreator!,
            requestedAmount: faker.finance.amount({
                min: 10000,
                max: 50000,
                dec: 2,
            }), // Monto solicitado entre 1000 y 50000
            approvedAmount: faker.finance.amount(
                {
                    min: 1000,
                    max: 10000,
                    dec: 2
                }
            ), // Monto aprobado entre 1000 y 50000
            lateInterest: faker.finance.amount(
                {
                    min: 0,
                    max: 2,
                    dec: 2
                }
            ), // Interés por atraso entre 0% y 2%
            interestRate: faker.finance.amount(
                {
                    min: 3,
                    max: 5,
                    dec: 2
                }
            ), // Tasa de interés entre 3% y 5%
            yearsOfPayment: faker.number.int({ min: 1, max: 5 }), // Plazo de 1 a 5 años
            period: faker.helpers.arrayElement([CreditPeriod.MONTHLY, CreditPeriod.WEEKLY, CreditPeriod.QUARTERLY]), // Periodo: mensual, semanal o quincenal
            status: faker.helpers.arrayElement([
                Status.PENDING, Status.APPROVED, Status.REJECTED, Status.RELEASED, Status.LATE, Status.FINISHED, Status.CANCELED
            ]),
            applicationDate: faker.date.past({
                years: 1
            }),
            lastPaymentDate: faker.datatype.boolean() ? faker.date.recent({
                days: 5
            }) : null, // Fecha del último pago, si aplica
            lastPaymentPeriod: faker.number.int({ min: 1, max: 12 }), // Periodo de último pago en meses
            signedContract: `1736871145719-8c262ead-fb72-4bf0-833f-d578339cd184.pdf`, // Nombre de archivo para el contrato firmado
        }
        if (temp.status == Status.APPROVED) {
            temp["aprovedDate"] = faker.date.past({
                years: 0.5
            })
        }
        if (temp.status == Status.RELEASED) {
            const fakeDate = faker.date.past({
                years: 0.5
            })
            temp["aprovedDate"] = fakeDate
            //fakeDate + 2 dias
            temp["releasedDate"] = new Date(fakeDate.getTime() + 2 * 24 * 60 * 60 * 1000);
        }
        if (temp.status == Status.LATE) {
            const fakeDate = faker.date.past({
                years: 0.5
            })
            temp["aprovedDate"] = fakeDate
            //fakeDate + 2 dias
            temp["releasedDate"] = new Date(fakeDate.getTime() + 2 * 24 * 60 * 60 * 1000);
            // new Date(fakeDate.getTime() + 2 * 24 * 60 * 60 * 1000) - 30 dias
            temp["lastPaymentDate"] = new Date(new Date(fakeDate.getTime() + 2 * 24 * 60 * 60 * 1000).getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        if (temp.status == Status.FINISHED) {
            const fakeDate = faker.date.past({
                years: 0.5
            })
            temp["aprovedDate"] = fakeDate
            //fakeDate + 2 dias
            temp["releasedDate"] = new Date(fakeDate.getTime() + 2 * 24 * 60 * 60 * 1000);
            // releasedDate + 6 meses
            temp["finishedDate"] = new Date(new Date(fakeDate.getTime() + 2 * 24 * 60 * 60 * 1000).getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
            temp["finishedMessage"] = ""
        }
        if (temp.status == Status.CANCELED) {
            const fakeDate = faker.date.past({
                years: 0.5
            })
            temp["aprovedDate"] = fakeDate
            //fakeDate + 2 dias
            temp["releasedDate"] = new Date(fakeDate.getTime() + 2 * 24 * 60 * 60 * 1000);
            // releasedDate + 6 meses
            temp["finishedDate"] = new Date(new Date(fakeDate.getTime() + 2 * 24 * 60 * 60 * 1000).getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
            temp["finishedMessage"] = faker.lorem.sentence();
        }
        fakeCredits.push(temp);
    }

    try {
        await Credit.bulkCreate(fakeCredits); // Inserta todos los créditos en la base de datos
        log(`Successfully created ${numberOfCredits} fake credits.`);
    } catch (error) {
        logError("Error seeding fake credits:", error);
    }

    //financings

    // financings (Se agregan después de crear los créditos)
    const financings = [];

    // Buscar todos los créditos de tipo FINANCING
    const financingCredits = await Credit.findAll({
        where: {
            creditType: CreditType.FINANCING
        }
    });

    for (const credit of financingCredits) {
        // Generar financiamiento solo si el tipo de crédito es FINANCING
        const financing = {
            creditId: credit.id!,
            vehiclePlate: faker.vehicle.vrm(), // Número de placa del vehículo
            vehicleVIN: faker.vehicle.vin(), // VIN del vehículo
            vehicleDescription: faker.vehicle.model(), // Descripción del vehículo
            downPayment: parseFloat(faker.finance.amount({
                min: 1000,
                max: 10000,
                dec: 2
            })), // Pago inicial entre 1000 y 10000
        };

        financings.push(financing);
    }

    try {
        await Financing.bulkCreate(financings); // Inserta todos los financiamientos en la base de datos
        log(`Successfully created financings for ${financings.length} credits.`);
    } catch (error) {
        logError("Error seeding fake financings:", error);
    }

    //payments

    const credits = await Credit.findAll({
        where: {
            status: Status.RELEASED, // Solo considerar créditos con status 'RELEASED'
            creditType: CreditType.CREDIT // Solo considerar los planes de financiamiento
        },
    });

    const payments: any[] = [];

    for (const credit of credits) {
        const numberOfPayments = credit.yearsOfPayment * 12; // Suponiendo que el crédito se paga mensualmente o según el período

        for (let period = 1; period <= numberOfPayments; period++) {
            // Generar la fecha de pago: Debe ser dentro del rango de la fecha de liberación (releasedDate) del crédito
            const paymentTimelyDate = new Date(credit.releasedDate); 
            paymentTimelyDate.setMonth(paymentTimelyDate.getMonth() + period - 1); // Fecha de pago incrementada mes a mes

            // Verificar que la fecha de pago no sea posterior a la releasedDate del crédito
            if (paymentTimelyDate > new Date(credit.releasedDate)) {
                break; // Si la fecha de pago excede la fecha de liberación, no se crean más pagos
            }

            // Crear el pago
            const user = faker.helpers.arrayElement(users); // Asociar un usuario aleatorio a cada pago
            const lateAmount = 0
            const amount = calcularPago(credit.interestRate / 100, credit.requestedAmount, 0,
                credit.yearsOfPayment * credit.period, credit.period
            )

            const payment: any = {
                creditId: credit.id!,
                userCreatorId: user.id!, // Asociar un creador del pago (empleado)
                lateAmount,
                amount,
                period, // Incrementar el número del período
                status: lateAmount > 0 ? PaymentStatus.LATE : PaymentStatus.RELEASED, // Si hay un pago tardío, marcar como LATE
                paymentDate: lateAmount > 0 ? faker.date.past({ years: 0.1 }) : paymentTimelyDate, // Si es tarde, asignar una fecha pasada
                timelyPayment: paymentTimelyDate,
            };

            payments.push(payment);
        }
    }

    // Insertar los pagos en la base de datos
    try {
        await Payment.bulkCreate(payments); // Inserta todos los pagos en la base de datos
        log(`Successfully created ${payments.length} payments.`);
    } catch (error) {
        logError("Error seeding payments:", error);
    }
}

import { DataTypes, Model, ModelAttributes } from "sequelize"
import { Credit } from "./Credit"
import { User } from "./User"

export enum PaymentStatus {
    PENDING = "PENDING",
    LATE = "LATE",
    RELEASED = "RELEASED",
    LATE_RELEASED = "LATE_RELEASED",
}


/**
 * Payment model
 * 
 * field - `id` is the primary key,
 * field - `creditId` is a foreign key to `Credit` model,
 * field - `userId` is a foreign key to `User` model, is the user who made the payment,
 * field - `userCreatorId` is a foreign key to `User` model, is the employee who saved the payment,
 * field - `lateAmount` is the amount paid by interest for the late payment,
 * field - `amount` is the amount of the payment,
 * field - `period` is the period of the payment,
 * field - `status` is an indicator of the status of the payment,
 * field - `paymentDate` is the date of the payment,
 * field - `timelyPayment` is the date in which the payment must be made,
 */
export class Payment extends Model {
    public id!: number
    public creditId!: number
    public userCreatorId!: number | null | undefined
    public lateAmount!: number
    public amount!: number
    public period!: number
    public status!: string
    public paymentDate!: Date | null
    public timelyPayment!: Date
}


export const paymentDDL: ModelAttributes = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    creditId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Credit,
            key: 'id',
        },
    },
    userCreatorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    lateAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    period: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    paymentDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    timelyPayment: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}
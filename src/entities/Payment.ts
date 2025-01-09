import { DataTypes, Model, ModelAttributes } from "sequelize"
import { Credit } from "./Credit"
import { User } from "./User"

export enum PaymentStatus {
    PENDING = "PENDING",
    LATE = "LATE",
    RELEASED = "RELEASED",
}


/**
 * Payment model
 * 
 * field - `id` is the primary key,
 * field - `creditId` is a foreign key to `Credit` model,
 * field - `userId` is a foreign key to `User` model, is the user who made the payment,
 * field - `userCreatorId` is a foreign key to `User` model, is the employee who saved the payment,
 * field - `amount` is the amount of the payment,
 * field - `period` is the period of the payment,
 * field - `date` is the date of the payment,
 * 
 */
export class Payment extends Model {
    public id!: number
    public creditId!: number
    public userCreatorId!: number
    public amount!: number
    public period!: number
    public status!: string
    public date!: Date
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
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
        onDelete: 'CASCADE',
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
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}
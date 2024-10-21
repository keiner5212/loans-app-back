import { DataTypes, Model } from "sequelize";
import { User } from "./User";

/**
 * Credit model
 * 
 * field - `id` is the primary key,
 * field - `userId` is a foreign key to `User` model,
 * field - `requestedAmount` is the amount requested for the credit,
 * field - `interestRate` is the interest rate of the credit,
 * field - `status` is an indicator of the status of the credit,
 * field - `applicationDate` is the date when the credit was applied,
 */
export class Credit extends Model {
    public id?: number;
    public userId!: number;
    public requestedAmount!: number;
    public interestRate!: number;
    public status!: string;
    public applicationDate!: Date;
}

export const creditDDL = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
		autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    requestedAmount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    interestRate: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    applicationDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
};
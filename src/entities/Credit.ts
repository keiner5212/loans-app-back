import { DataTypes, Model, ModelAttributes } from "sequelize";
import { User } from "./User";

export enum Status {
    //pendiente
    PENDING = "PENDING",
    //aprobado
    APPROVED = "APPROVED",
    //rechazado
    REJECTED = "REJECTED",
    //desembolsado
    RELEASED = "RELEASED",
    //atrasado
    LATE = "LATE",
    //terminado
    FINISHED = "FINISHED",
}

export enum CreditType {
    CREDIT = "CREDIT",
    FINANCING = "FINANCING",
}

/**
 * Credit model
 * 
 * field - `id` is the primary key,
 * field - `userId` is a foreign key to `User` model, is the user who applied for the credit,
 * field - `userCreatorId` is a foreign key to `User` model, is the employee who created the credit application,
 * field - `requestedAmount` is the amount requested for the credit,
 * field - `interestRate` is the interest rate of the credit,
 * field - `yearsOfPayment` is the years of payment of the credit,
 * field - `period` is the period of the credit,
 * field - `status` is an indicator of the status of the credit,
 * field - `applicationDate` is the date when the credit was applied,
 */
export class Credit extends Model {
    public id?: number;
    public userId!: number;
    public creditType!: string;
    public userCreatorId!: number;
    public requestedAmount!: number;
    public interestRate!: number;
    public yearsOfPayment!: number;
    public period!: number;
    public status!: string;
    public applicationDate!: Date;
    public aprovedDate!: Date;
    public rejectedDate!: Date;
    public releasedDate!: Date;
    public finishedDate!: Date;
    public lastPaymentDate!: Date;
    public signedContract!: string;
}

export const creditDDL: ModelAttributes = {
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
        onDelete: 'CASCADE',
    },
    creditType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: CreditType.CREDIT,
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
    requestedAmount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    interestRate: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    yearsOfPayment: {
        type: DataTypes.INTEGER,
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
    applicationDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    aprovedDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    rejectedDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    releasedDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    finishedDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    lastPaymentDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    signedContract: {
        type: DataTypes.STRING,
        allowNull: true,
    },
};
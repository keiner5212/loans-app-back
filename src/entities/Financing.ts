import { DataTypes, Model } from "sequelize";
import { Credit } from "./Credit";

/**
 * Financing model
 * 
 * field - `id` is the primary key,
 * field - `creditId` is a foreign key to `Credit` model,
 * field - `vehiclePlate` is the plate of the vehicle,
 * field - `vehicleVIN` is the VIN of the vehicle,
 * field - `vehicleDescription` is the description of the vehicle,
 * field - `downPayment` is the down payment of the vehicle,
 */
export class Financing extends Model {
    public id?: number;
    public creditId!: number;
    public vehiclePlate!: string;
    public vehicleVIN!: string;
    public vehicleDescription!: string;
    public downPayment!: number;
}


export const financingDDL = {
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
    vehiclePlate: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    vehicleVIN: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    vehicleDescription: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    downPayment: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
}
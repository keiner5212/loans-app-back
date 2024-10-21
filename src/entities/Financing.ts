import { DataTypes, Model } from "sequelize";
import { Credit } from "./Credit";

/**
 * Financing model
 * 
 * field - `id` is the primary key,
 * field - `creditId` is a foreign key to `Credit` model,
 * field - `vehicleFinancing` is the vehicle financing of the credit,
 */
export class Financing extends Model {
    public id?: number;
    public creditId!: number;
    public vehicleFinancing!: string;
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
    vehicleFinancing: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}
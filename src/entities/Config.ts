import { DataTypes, Model } from "sequelize";


export class AppConfig extends Model {
    public id?: number;
    public key?: string;
    public value?: string;
}

export const configDDL = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false,
    },
};
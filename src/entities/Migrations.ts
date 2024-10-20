import { DataTypes } from "sequelize";
import User from "./User";
import { PostgresService } from "../service/PostgresDB";

export function Migrations() {
    const db = PostgresService.getInstance().getSequelize();

    User.init(
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            document_type: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            document: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            role: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize: db,
            modelName: 'User',
            tableName: 'users',
            timestamps: false,
        }
    );





    PostgresService.sync();
}
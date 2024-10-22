import { User, userDDL } from "./User";
import { PostgresService } from "../service/PostgresDB";
import { Credit, creditDDL } from "./Credit";
import { Financing, financingDDL } from "./Financing";
import { Sequelize } from "sequelize";
import { createDebugger } from "../utils/debugConfig";
import { Payment, paymentDDL } from "./Payment";

const log = createDebugger('migrations');

/**
 * Create the database if it doesn't exist
 */
export async function createDatabase(databaseName: string) {
    const connection = new Sequelize(
        `postgres://` +
        `${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@` +
        `${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/postgres`
    );

    const [result] = await connection.query(
        `SELECT 1 FROM pg_database WHERE datname = '${databaseName}';`
    );

    if (result.length === 0) {
        await connection.query(`CREATE DATABASE "${databaseName}";`);
        log(`Database "${databaseName}" created successfully.`);
    } else {
        log(`Database "${databaseName}" already exists.`);
    }

    await connection.close();
}

/**
 * Migrate the database
 */
export async function Migrations() {
    const db = PostgresService.getInstance().getSequelize();

    User.init(
        userDDL,
        {
            sequelize: db,
            modelName: 'User',
            tableName: 'users',
            timestamps: false,
        }
    );

    Credit.init(
        creditDDL,
        {
            sequelize: db,
            modelName: 'Credit',
            tableName: 'credits',
            timestamps: false,
        }
    )

    Financing.init(
        financingDDL,
        {
            sequelize: db,
            modelName: 'Financing',
            tableName: 'financings',
            timestamps: false,
        }
    )

    Payment.init(
        paymentDDL,
        {
            sequelize: db,
            modelName: 'Payment',
            tableName: 'payments',
            timestamps: false,
        }
    )



    await PostgresService.sync();
}
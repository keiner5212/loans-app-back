import { Sequelize } from 'sequelize';
import { createDebugger } from '../utils/debugConfig';
import { config } from 'dotenv';

config();

const log = createDebugger('postgresDB');
const logError = log.extend('error');

export class PostgresService {
	private static instance: PostgresService;
	private sequelize: Sequelize;

	private constructor() {
		const postgresConfig = {
			username: process.env.POSTGRES_USER || '',
			password: process.env.POSTGRES_PASSWORD || '',
			database: process.env.POSTGRES_DB || '',
			host: process.env.POSTGRES_HOST || '',
			port: Number(process.env.POSTGRES_PORT) || 5432,
			dialect: 'postgres',
		};

		this.sequelize = new Sequelize(postgresConfig.database, postgresConfig.username, postgresConfig.password, {
			host: postgresConfig.host,
			port: postgresConfig.port,
			dialect: postgresConfig.dialect as any,
			logging: (msg) => log(msg),
		});

		this.connect();
	}

	public static getInstance(): PostgresService {
		if (!PostgresService.instance) {
			PostgresService.instance = new PostgresService();
		}
		return PostgresService.instance;
	}

	private async connect(): Promise<void> {
		try {
			await this.sequelize.authenticate();
			log('Connected to the database:', process.env.POSTGRES_DB);
		} catch (error) {
			logError('Error connecting to the database:', error);
		}
	}

	public async query(queryText: string, params?: any[]): Promise<any> {
		try {
			const [results] = await this.sequelize.query(queryText, {
				replacements: params,
			});
			log('Query executed:', queryText);
			return results;
		} catch (error) {
			logError('Error executing query:', error);
			throw error;
		}
	}

	public async close(): Promise<void> {
		try {
			await this.sequelize.close();
			log('Connection closed');
		} catch (error) {
			logError('Error closing the connection:', error);
		}
	}

	public getSequelize(): Sequelize {
		return this.sequelize;
	}

	public static async sync(): Promise<void> {
		try {
			await PostgresService.getInstance().sequelize.sync({ alter: true });
			log('Database synced');
		} catch (error) {
			logError('Error syncing the database:', error);
		}
	}
}

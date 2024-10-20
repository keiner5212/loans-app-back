import pgPromise, { IDatabase, IMain } from 'pg-promise';
import { config } from 'dotenv';
import { createDebugger } from '../utils/debugConfig';

config();

const log = createDebugger('postgresDB');
const logError = log.extend('error');

export class PostgresService {
	private static instance: PostgresService;
	private db: IDatabase<any>;
	private pgp: IMain;


	private constructor() {
		const postgresConfig = {
			user: process.env.POSTGRES_USER,
			host: process.env.POSTGRES_HOST,
			database: process.env.POSTGRES_DB,
			password: process.env.POSTGRES_PASSWORD,
			port: Number(process.env.POSTGRES_PORT),
		};

		this.pgp = pgPromise();
		this.db = this.pgp(postgresConfig);

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
			await this.db.connect();
			log('Conectado a la base de datos:', process.env.POSTGRES_DB);
		} catch (error) {
			logError('Error al conectar a la base de datos:', error);
		}
	}

	public async query(queryText: string, params?: any[]): Promise<any> {
		try {
			const res = await this.db.any(queryText, params);
			log('Consulta ejecutada:', queryText);
			return res;
		} catch (error) {
			logError('Error en la consulta:', error);
			throw error;
		}
	}

	public async close(): Promise<void> {
		await this.pgp.end();
		log('Conexión cerrada');
	}
}

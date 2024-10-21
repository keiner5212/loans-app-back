import { DataTypes, Model } from 'sequelize';

/**
 * User model
 * 
 * field - `id` is the primary key,
 * field - `name` is the name of the user,
 * field - `email` is the email of the user,
 * field - `document_type` is the type of the document,
 * field - `document` is the document of the user,
 * field - `phone` is the phone of the user,
 * field - `role` is the role of the user,
 * field - `password` is the password of the user,
 * field - `created_at` is the date when the user was created,
 */
export class User extends Model {
	public id?: number;
	public name!: string;
	public email!: string;
	public document_type!: string;
	public document!: string;
	public phone!: string;
	public role!: string;
	public password!: string;
	public created_at!: Date;

	public deletePrivateData(): void {
		this.password = "";
	}
}

export const userDDL = {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		allowNull: false,
		autoIncrement: true,
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
}



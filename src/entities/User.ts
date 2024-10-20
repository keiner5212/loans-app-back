import { Model } from 'sequelize';

interface UserAttributes {
	id?: string;
	name?: string;
	email?: string;
	document_type?: string;
	document?: string;
	phone?: string;
	role?: string;
	password?: string;
	created_at?: Date;
}

export class User extends Model<UserAttributes> implements UserAttributes {
	public id?: string;
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


export default User;

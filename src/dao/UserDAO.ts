import { config } from "dotenv";
import { User } from "../entities/User";
import { createDebugger } from "../utils/debugConfig";
import {
	ComparePassword,
	EncriptPassword,
} from "../utils/cryptography/encrypt";
import { sign } from "jsonwebtoken";
import { MailService } from "../utils/Email/SendEmail";
import { generateCode } from "../utils/Email/VerificationCode";
import { Cache } from "../utils/cache";
import { DaoResponse, ErrorControl } from "../constants/ErrorControl";
import { HttpStatusCode } from "axios";

config();

// logger config
const log = createDebugger("UserDAO");
const logError = log.extend("error");

const mailService = MailService.getInstance();

export class UserDAO {
	protected static async signIn(
		email: string,
		password: string
	): Promise<DaoResponse> {
		try {
			// get user
			const user = await User.findOne({ where: { email } });

			if (!user) {
				return [
					ErrorControl.PERSONALIZED,
					"User not found",
					HttpStatusCode.NotFound,
				];
			}

			// Compare password
			const passwordMatch = await ComparePassword(password, user.password);
			if (!passwordMatch) {
				return [
					ErrorControl.PERSONALIZED,
					"Password incorrect",
					HttpStatusCode.BadRequest,
				];
			}

			// Create token with JWT
			const token = sign(
				{ id: user.id, email, role: user.role },
				process.env.JWT_SECRET as string,
				{
					expiresIn: process.env.JWT_EXPIRATION_TIME === "x" ? undefined : process.env.JWT_EXPIRATION_TIME,
				}
			);

			return [
				ErrorControl.SUCCESS,
				{
					token: token,
				},
				HttpStatusCode.Ok,
			];
		} catch (error) {
			const msg = "Error in sign in";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}
	protected static async add(user: User): Promise<DaoResponse> {
		try {
			// Verify if email already exists
			const existingUser = await User.findOne({ where: { email: user.email } });
			if (existingUser) {
				return [
					ErrorControl.PERSONALIZED,
					"Email already exists",
					HttpStatusCode.Conflict,
				];
			}

			// Encrypt password
			user.password = await EncriptPassword(user.password);

			// Save user
			const newUser = await User.create(user);

			log("User created with ID: " + newUser.id);
			return [ErrorControl.SUCCESS, newUser.id, HttpStatusCode.Created];
		} catch (error) {
			const msg = "Error in add user";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}
	protected static async forgorPassword(email: string): Promise<DaoResponse> {
		try {
			// Verify if email exists
			const existingUser = await User.findOne({ where: { email } });
			if (!existingUser) {
				return [
					ErrorControl.PERSONALIZED,
					"Email not found",
					HttpStatusCode.NotFound,
				];
			}

			// Generate a verification code
			const code = generateCode(6);

			// Send the verification code via email
			const info = await mailService.sendMail({
				from: mailService.fromDefault,
				to: email,
				subject: "Forgot password",
				text: "Your verification code: " + code,
			});

			// Check if the email was sent successfully
			if (!info[0]) {
				throw new Error("Email not sent, error: " + info[1]);
			}

			// Store the verification code in cache
			const key = "forgot_password_code_" + email;
			Cache.set(key, code);

			return [ErrorControl.SUCCESS, "Email sent", HttpStatusCode.Ok];
		} catch (error) {
			const msg = "Error sending email";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}
	protected static async verifyForgotPasswordCode(
		email: string,
		code: string
	): Promise<DaoResponse> {
		try {
			// Create a key for the cached verification code
			const key = "forgot_password_code_" + email;
			// Retrieve the cached code from cache
			const cachedCode = Cache.get(key);

			// Check if the code is not found in the cache
			if (!cachedCode) {
				return [
					ErrorControl.PERSONALIZED,
					"Code not found",
					HttpStatusCode.NotFound,
				];
			}

			// Verify if the provided code matches the cached code
			if (cachedCode !== code) {
				return [
					ErrorControl.PERSONALIZED,
					"Code incorrect",
					HttpStatusCode.BadRequest,
				];
			}

			// Make sure the code is not expired by making it infinite in the cache
			Cache.makeInfinite(key);

			return [ErrorControl.SUCCESS, "Code correct", HttpStatusCode.Ok];
		} catch (error) {
			const msg = "Error verifying code";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}
	protected static async resetPassword(
		email: string,
		code: string,
		password: string
	): Promise<DaoResponse> {
		try {
			// Create a key for the cached verification code
			const key = "forgot_password_code_" + email;
			// Retrieve the cached code from cache
			const cachedCode = Cache.get(key);

			// Check if the code is not found in the cache
			if (!cachedCode) {
				return [
					ErrorControl.PERSONALIZED,
					"Code not found",
					HttpStatusCode.NotFound,
				];
			}

			// Verify if the provided code matches the cached code
			if (cachedCode !== code) {
				return [
					ErrorControl.PERSONALIZED,
					"Code incorrect",
					HttpStatusCode.BadRequest,
				];
			}

			// Remove the code from the cache
			Cache.delete(key);

			// Encrypt the new password
			const hashedPassword = await EncriptPassword(password);

			// Find the user by email using Sequelize
			const user = await User.findOne({ where: { email } });

			// Check if the user exists
			if (!user) {
				return [
					ErrorControl.PERSONALIZED,
					"Email not found",
					HttpStatusCode.NotFound,
				];
			}

			// Update the user's password in the database
			user.password = hashedPassword;
			await user.save(); // Save the updated user object

			return [
				ErrorControl.SUCCESS,
				"Password updated",
				HttpStatusCode.Ok,
			];
		} catch (error) {
			const msg = "Error updating password";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	} protected static async getUserById(id_user: string): Promise<DaoResponse> {
		try {
			// Find the user by ID using Sequelize
			const user = await User.findOne({ where: { id: id_user } });

			// Check if the user exists
			if (!user) {
				return [
					ErrorControl.PERSONALIZED,
					"User not found",
					HttpStatusCode.NotFound,
				];
			}

			// delete sensitive information like password before returning
			user.deletePrivateData();

			return [ErrorControl.SUCCESS, user, HttpStatusCode.Ok];
		} catch (error) {
			const msg = "Error getting user";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}

	protected static async update(
		userData: User,
		id_user: string
	): Promise<DaoResponse> {
		try {
			// Find the user by ID
			const user = await User.findOne({ where: { id: id_user } });

			// Check if the user exists
			if (!user) {
				return [
					ErrorControl.PERSONALIZED,
					"User not found",
					HttpStatusCode.NotFound,
				];
			}

			// Update user fields using the provided userData
			await user.update(userData);

			return [ErrorControl.SUCCESS, "User updated", HttpStatusCode.Ok];
		} catch (error) {
			const msg = "Error updating user";
			logError(msg + ": " + error);
			return [
				ErrorControl.ERROR,
				msg,
				HttpStatusCode.InternalServerError,
			];
		}
	}

}

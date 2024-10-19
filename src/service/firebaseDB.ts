import { initializeApp, FirebaseApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";
import { Auth, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
	getStorage,
	ref,
	uploadBytes,
	getDownloadURL,
	FirebaseStorage,
} from "firebase/storage";
import { createDebugger } from "../utils/debugConfig";
import { config } from "dotenv";

config();

const log = createDebugger("firebaseDB");
const logError = log.extend("error");

export class FirebaseService {
	private static instance: FirebaseService;
	private app: FirebaseApp;
	private db: Firestore;
	private auth: Auth;
	private storage: FirebaseStorage;

	private constructor() {
		// Firebase configuration
		const firebaseConfig = {
			apiKey: process.env.FB_API_KEY,
			authDomain: process.env.FB_AUTH_DOMAIN,
			projectId: process.env.FB_PROJECT_ID,
			storageBucket: process.env.FB_STORAGE_BUCKET,
			messagingSenderId: process.env.FB_MESSAGE_SENDER_ID,
			appId: process.env.FB_APP_ID,
		};

		// Initialize Firebase app
		this.app = initializeApp(firebaseConfig);

		// Initialize Firestore, Auth, and Storage services
		this.db = getFirestore(this.app);
		this.auth = getAuth(this.app);
		this.storage = getStorage(this.app);
	}

	// Singleton access method
	public static getInstance(): FirebaseService {
		if (!FirebaseService.instance) {
			FirebaseService.instance = new FirebaseService();
			log(
				"Trying to sign in API user...(email: %s)",
				process.env.FB_API_USER_EMAIL ?? ""
			);
			FirebaseService.instance.signInUser(
				process.env.FB_API_USER_EMAIL ?? "",
				process.env.FB_API_USER_PASSWORD ?? ""
			);
		}
		return FirebaseService.instance;
	}

	// Method to sign in a user in the Firebase Authentication system
	public async signInUser(email: string, password: string): Promise<void> {
		try {
			const userCredential = await signInWithEmailAndPassword(
				this.auth,
				email,
				password
			);
			const user = userCredential.user;
			log("User signed in: %s", user.uid);
		} catch (error) {
			logError("Error signing in:", error);
		}
	}

	// Method to upload an image
	public async uploadImage(file: Buffer, name: string): Promise<string> {
		try {
			log("Buffer length:", file.length);
			const storageRef = ref(this.storage, `images/${name}`);
			const snapshot = await uploadBytes(storageRef, file);
			const downloadURL = await getDownloadURL(snapshot.ref);

			log("Archivo subido correctamente");
			return downloadURL;
		} catch (error) {
			logError("Error al subir la imagen:", error);
			throw error;
		}
	}

	// Getters for Firestore, Auth, App, and Storage instances
	public getFirestoreInstance(): Firestore {
		return this.db;
	}

	public getAuthInstance(): Auth {
		return this.auth;
	}

	public getAppInstance(): FirebaseApp {
		return this.app;
	}

	public getStorageInstance(): FirebaseStorage {
		return this.storage;
	}
}

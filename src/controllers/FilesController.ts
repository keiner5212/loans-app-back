import { Request, Response, Router } from "express";
import { ExpressServerConfig } from "@/constants/Config";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import { createDebugger } from "@/utils/debugConfig";

const log = createDebugger("FilesController");
const logError = log.extend("error");
export class FilesController {
    private router: Router;

    constructor() {
        this.router = Router();
    }

    public routes(): Router {
        const storage = multer.diskStorage({
            destination: async (req, file, cb) => {
                try {
                    const storagePath = path.resolve(__dirname, "..", ExpressServerConfig.STORAGE_PATH);
                    // Asegurarse de que la carpeta existe
                    await fs.mkdir(storagePath, { recursive: true });
                    cb(null, storagePath);
                } catch (error: any) {
                    logError(error);
                    cb(error, "");
                }
            },
            filename: (req, file, cb) => {
                const originalNameWithoutSpaces = file.originalname.replace(/ /g, "_");
                const customFileName = `${Date.now()}-${originalNameWithoutSpaces}`;
                cb(null, customFileName);
            },
        });

        const upload = multer({
            storage,
            limits: { fileSize: Number(ExpressServerConfig.MAX_FILE_SIZE) },
        });

        // Upload file
        this.router.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
            try {
                if (!req.file) {
                    return res.status(400).json({ message: "No file uploaded." });
                }
                res.status(200).json({
                    message: "File uploaded successfully.",
                    filePath: `${req.file.filename}`,
                });
            } catch (error) {
                logError("Error during file upload:", error);
                res.status(500).json({ message: "Error uploading file." });
            }
        });

        // Get file
        this.router.get("/:filename", async (req: Request, res: Response) => {
            try {
                const filePath = path.resolve(__dirname, "..", ExpressServerConfig.STORAGE_PATH, req.params.filename);
                await fs.access(filePath); // Verificar si el archivo existe
                res.sendFile(filePath);
            } catch (error) {
                logError("Error fetching file:", error);
                res.status(404).json({ message: "File not found." });
            }
        });

        // Delete file
        this.router.delete("/:filename", async (req: Request, res: Response) => {
            try {
                const filePath = path.resolve(__dirname, "..", ExpressServerConfig.STORAGE_PATH, req.params.filename);
                await fs.access(filePath); // Verificar si el archivo existe antes de intentar eliminarlo
                await fs.unlink(filePath);
                res.status(200).json({ message: "File deleted successfully." });
            } catch (error: any) {
                logError("Error deleting file:", error);
                if (error.code === "ENOENT") {
                    res.status(404).json({ message: "File not found." });
                } else {
                    res.status(500).json({ message: "Error deleting file.", error: error.message });
                }
            }
        });

        return this.router;
    }
}

import { Request, Response, Router } from "express";
import { ExpressServerConfig } from "../constants/Config";
import multer from "multer";
import fs from "fs/promises";
import path from "path";

export class FilesController {
    private router: Router;

    constructor() {
        this.router = Router();
    }

    public routes(): Router {
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, path.resolve(__dirname, "..", ExpressServerConfig.STORAGE_PATH));
            },
            filename: (req, file, cb) => {
                const OriginalNameWithoutSpaces = file.originalname.replace(/ /g, "_");
                const customFileName = `${Date.now()}-${OriginalNameWithoutSpaces}`;
                cb(null, customFileName);
            },
        });
        const upload = multer({
            storage,
            limits: { fileSize: Number(ExpressServerConfig.MAX_FILE_SIZE) },

        },);

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
                res.status(500).json({ message: "Error uploading file.", error });
            }
        });

        // Get file
        this.router.get("/:filename", async (req: Request, res: Response) => {
            try {
                const filePath = path.resolve(__dirname, "..", ExpressServerConfig.STORAGE_PATH, req.params.filename);
                await fs.access(filePath);
                res.sendFile(filePath);
            } catch (error) {
                res.status(404).json({ message: "File not found." });
            }
        });

        // Delete file
        this.router.delete("/:filename", async (req: Request, res: Response) => {
            try {
                const filePath = path.resolve(__dirname, "..", ExpressServerConfig.STORAGE_PATH, req.params.filename);
                await fs.unlink(filePath);
                res.status(200).json({ message: "File deleted successfully." });
            } catch (error: any) {
                if (error.code === "ENOENT") {
                    res.status(404).json({ message: "File not found." });
                } else {
                    res.status(500).json({ message: "Error deleting file.", error });
                }
            }
        });

        return this.router;
    }
}

import { StorageService } from "../../domain/services/storage.service";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export class LocalStorageService implements StorageService {
    private readonly uploadDir = path.join(__dirname, "../../../../../uploads");

    async upload(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
        await fs.mkdir(this.uploadDir, { recursive: true });

        const fileExtension = path.extname(fileName);
        const uniqueFileName = `${crypto.randomUUID()}${fileExtension}`;
        const fullPath = path.join(this.uploadDir, uniqueFileName);

        await fs.writeFile(fullPath, fileBuffer as NodeJS.ArrayBufferView);

        return `/uploads/${uniqueFileName}`;
    }
}

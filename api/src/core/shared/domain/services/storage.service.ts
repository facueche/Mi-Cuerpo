export interface StorageService {
    upload(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string>;
}

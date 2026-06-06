import crypto from 'crypto';
import { env } from '../../../config/env';

/**
 * Servicio Criptográfico de Grado Médico (AES-256-GCM + Blind Indexing + Sanitización Semántica)
 * Protege la información PHI (Protected Health Information) a nivel de fila (Field-Level Encryption)
 */
export class EncryptionService {
    // La llave secreta de encriptación debe ser de estrictamente 32 bytes (256 bits)
    private static readonly ALGORITHM = 'aes-256-gcm';
    private static readonly KEY: Buffer = env.encryption.key
        ? Buffer.from(env.encryption.key, 'hex')
        : crypto.scryptSync(env.jwt.secret, 'salt', 32) as Buffer;

    // Se utiliza un secreto estático único en producción para computar los Blind Indexes (índices ciegos)
    private static readonly BLIND_INDEX_PEPPER = env.encryption.blindIndexPepper;

    /**
     * Utilidad para remover acentos, diacríticos, espacios extras y pasar a minúsculas.
     * Transforma: "  Básofílos %  " -> "basofilos %"
     */
    public static sanitizeText(text: string | null | undefined): string {
        if (!text) return '';
        return text
            .trim()
            .toLowerCase()
            .normalize("NFD") // Descompone los caracteres con acentos en letras + símbolos de acento
            .replace(/[\u0300-\u036f]/g, ""); // Remueve los símbolos de acento mediante Regex
    }

    /**
     * Encripta un texto plano usando AES-256-GCM de manera probabilística (seguro contra análisis de frecuencia)
     */
    public static encrypt(text: string | null | undefined): string | null {
        if (text === null || text === undefined) return null;

        const iv = crypto.randomBytes(12); // Vector de inicialización único para cada registro
        const cipher = crypto.createCipheriv(this.ALGORITHM, this.KEY as crypto.CipherKey, iv as crypto.BinaryLike);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag().toString('hex'); // Tag de autenticación para asegurar integridad GCM

        // Formato unificado de persistencia: "iv:ciphertext:tag"
        return `${iv.toString('hex')}:${encrypted}:${authTag}`;
    }

    /**
     * Desencripta un string almacenado bajo el formato "iv:ciphertext:tag"
     */
    public static decrypt(cipherText: string | null | undefined): string | null {
        if (!cipherText) return null;

        try {
            const parts = cipherText.split(':');
            if (parts.length !== 3) {
                // Si el campo no está encriptado (migración previa), lo retornamos como está
                return cipherText;
            }

            const [ivHex, encryptedHex, tagHex] = parts;
            const iv = Buffer.from(ivHex, 'hex');
            const encrypted = Buffer.from(encryptedHex, 'hex');
            const tag = Buffer.from(tagHex, 'hex');

            const decipher = crypto.createDecipheriv(this.ALGORITHM, this.KEY as crypto.CipherKey, iv as crypto.BinaryLike);
            decipher.setAuthTag(tag as NodeJS.TypedArray);

            const decryptedBuffer = decipher.update(encrypted as NodeJS.TypedArray);
            const decrypted = decryptedBuffer.toString('utf8') + decipher.final('utf8');

            return decrypted;
        } catch (error) {
            console.error('Error de desencriptación criptográfica:', error);
            return '[ERROR: Cifrado Invalido o Llave Incorrecta]';
        }
    }

    /**
     * Genera un Hash Ciego (Blind Index) determinista para permitir búsquedas indexadas y exactas en base de datos.
     * Utiliza un HMAC con SHA-256, un pepper secreto y aplica sanitización ortográfica para unificar acentos.
     */
    public static generateBlindIndex(text: string | null | undefined): string | null {
        if (!text) return null;
        const cleanText = this.sanitizeText(text);
        return crypto
            .createHmac('sha256', this.BLIND_INDEX_PEPPER)
            .update(cleanText)
            .digest('hex');
    }
}

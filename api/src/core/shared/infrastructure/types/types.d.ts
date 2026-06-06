declare namespace Express {
    export interface Request {
        userId: string;
        file?: Express.Multer.File;
        files?: Express.Multer.File[];
    }
    export interface Response {
        userId: string;
    }
}

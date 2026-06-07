import { MedicalEvent } from "../../../../generated/prisma/client"

export interface GetAllParams {
    page: number
    limit: number
    search?: string
    userId: string
}

export interface CreateExaminationDTO {
    userId: string;
    date: Date;
    institution: string;
    title: string;
    description: string;
    doctorName: string;
    studies: {
        category: string;
        measurements: {
            parameter: string;
            value: number;
            unit: string;
            minReference: number | null;
            maxReference: number | null;
            isOutOfRange: boolean;
        }[];
    }[];
}

export default interface ExaminationRepository {
    getAll(data: GetAllParams): Promise<[number, MedicalEvent[]]>
    createWithDetails(data: CreateExaminationDTO): Promise<MedicalEvent>
    getById(id: string): Promise<MedicalEvent>
    deleteById(id: string): Promise<void>;
}

import { prisma } from "../../../../config/prisma";
import { MedicalEvent } from "../../../../generated/prisma/client";
import ExaminationRepository, { CreateExaminationDTO, GetAllParams } from "../../domain/repositories/examination.repository";

export default class PrismaExaminationRepository implements ExaminationRepository {
    async getAll(data: GetAllParams): Promise<[number, MedicalEvent[]]> {
        const { page, limit, search, userId } = data;

        const skip = (page - 1) * limit;

        const whereClause: any = {
            userId: userId,
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { institution: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    // Permite buscar también por el nombre de un biomarcador específico (ej: "Colesterol")
                    {
                        studies: {
                            some: {
                                measurements: {
                                    some: {
                                        parameter: { contains: search, mode: 'insensitive' }
                                    }
                                }
                            }
                        }
                    }
                ]
            })
        };

        const [totalItems, medicalEvents] = await prisma.$transaction([
            prisma.medicalEvent.count({ where: whereClause }),
            prisma.medicalEvent.findMany({
                where: whereClause,
                skip: skip,
                take: limit,
                orderBy: {
                    date: 'desc', // Los más recientes primero
                },
                include: {
                    studies: {
                        select: {
                            category: true,
                            measurements: {
                                select: {
                                    isOutOfRange: true
                                }
                            }
                        }
                    }
                }
            })
        ]);

        return [totalItems, medicalEvents];
    }

    async createWithDetails(data: CreateExaminationDTO): Promise<MedicalEvent> {
        const { userId, date, institution, title, studies } = data;

        return await prisma.medicalEvent.create({
            data: {
                userId: userId,
                date: date,
                institution: institution,
                title: title,
                studies: {
                    create: studies.map(study => ({
                        category: study.category,
                        date: date,
                        measurements: {
                            create: study.measurements.map(m => ({
                                parameter: m.parameter,
                                value: m.value,
                                unit: m.unit,
                                minReference: m.minReference,
                                maxReference: m.maxReference,
                                isOutOfRange: m.isOutOfRange
                            }))
                        }
                    }))
                }
            }
        });
    }
}

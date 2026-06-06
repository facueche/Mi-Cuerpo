import { prisma } from "../../../../config/prisma";
import { MedicalEvent } from "../../../../generated/prisma/client";
import { EncryptionService } from "../../../shared/application/encryption.service";
import MedicalEventNotFoundError from "../../domain/errors/medical-event-not-found.error";
import ExaminationRepository, { CreateExaminationDTO, GetAllParams } from "../../domain/repositories/examination.repository";

export default class PrismaExaminationRepository implements ExaminationRepository {

    /**
     * Desencripta un evento médico y su estructura descendente de forma recursiva
     */
    private decryptEvent(event: any): any {
        return {
            ...event,
            title: EncryptionService.decrypt(event.title) as string,
            institution: EncryptionService.decrypt(event.institution) as string,
            description: EncryptionService.decrypt(event.description),
            studies: event.studies?.map((study: any) => ({
                ...study,
                category: EncryptionService.decrypt(study.category) as string,
                measurements: study.measurements?.map((m: any) => ({
                    ...m,
                    parameter: EncryptionService.decrypt(m.parameter) as string
                }))
            }))
        };
    }

    async getAll(data: GetAllParams): Promise<[number, MedicalEvent[]]> {
        const { page, limit, search, userId } = data;
        const skip = (page - 1) * limit;

        // Nota arquitectónica: Para búsquedas por campos encriptados probabilísticamente (contiene / contains),
        // traemos los registros del usuario autenticado y aplicamos el filtrado ligero en memoria.
        // Esto mantiene el aislamiento Multi-Tenant robusto sin comprometer la seguridad.
        const medicalEvents = await prisma.medicalEvent.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            include: {
                studies: {
                    select: {
                        category: true,
                        measurements: {
                            select: {
                                parameter: true,
                                isOutOfRange: true
                            }
                        }
                    }
                }
            }
        });

        // Desencriptamos todos los eventos médicos en memoria
        const decryptedEvents = medicalEvents.map(event => this.decryptEvent(event));

        // Filtramos en memoria si existe búsqueda activa
        let filteredEvents = decryptedEvents;
        if (search) {
            const cleanSearch = search.toLowerCase();
            filteredEvents = decryptedEvents.filter(event =>
                event.title.toLowerCase().includes(cleanSearch) ||
                event.institution.toLowerCase().includes(cleanSearch) ||
                (event.description && event.description.toLowerCase().includes(cleanSearch)) ||
                event.studies.some((study: any) =>
                    study.category.toLowerCase().includes(cleanSearch) ||
                    study.measurements.some((m: any) => m.parameter.toLowerCase().includes(cleanSearch))
                )
            );
        }

        const totalItems = filteredEvents.length;
        const paginatedEvents = filteredEvents.slice(skip, skip + limit);

        return [totalItems, paginatedEvents];
    }

    async createWithDetails(data: CreateExaminationDTO): Promise<MedicalEvent> {
        const { userId, date, institution, title, studies } = data;

        // Encriptamos todos los campos descriptivos textuales
        const encryptedTitle = EncryptionService.encrypt(title) as string;
        const encryptedInstitution = EncryptionService.encrypt(institution) as string;

        const createdEvent = await prisma.medicalEvent.create({
            data: {
                userId: userId,
                date: date,
                institution: encryptedInstitution,
                title: encryptedTitle,
                studies: {
                    create: studies.map(study => ({
                        category: EncryptionService.encrypt(study.category) as string,
                        date: date,
                        measurements: {
                            create: study.measurements.map(m => ({
                                parameter: EncryptionService.encrypt(m.parameter) as string,
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

        return this.decryptEvent(createdEvent);
    }

    async getById(id: string): Promise<MedicalEvent> {
        const event = await prisma.medicalEvent.findUnique({
            where: { id },
            include: {
                files: true,
                studies: {
                    include: {
                        measurements: {
                            orderBy: { parameter: 'asc' } // Ordenará encriptados (se re-ordena si es necesario)
                        }
                    }
                }
            }
        });

        if (!event) {
            throw new MedicalEventNotFoundError();
        }

        const decrypted = this.decryptEvent(event);

        // Re-ordenamos alfabéticamente en memoria tras desencriptar los nombres reales de los biomarcadores
        if (decrypted.studies) {
            decrypted.studies.forEach((study: any) => {
                if (study.measurements) {
                    study.measurements.sort((a: any, b: any) => a.parameter.localeCompare(b.parameter));
                }
            });
        }

        return decrypted;
    }

    async deleteById(id: string): Promise<void> {
        await prisma.$transaction(async (tx) => {
            await tx.measurement.deleteMany({
                where: { study: { medicalEventId: id } }
            });

            await tx.study.deleteMany({
                where: { medicalEventId: id }
            });

            await tx.medicalEvent.delete({
                where: { id }
            });
        });
    }
}

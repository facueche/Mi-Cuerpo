export default class MedicalEventNotFoundError extends Error {
    constructor() {
        super("Medical event not found");
        this.name = "MedicalEventNotFoundError";
    }
}

import Event from "./event";

export default interface EventsRepository {
  save(event: Event): Promise<void>;
}

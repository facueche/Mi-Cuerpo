import AppEventEmitter from "../../../config/event-emmiter";
import Event from "../domain/event";
import EventsRepository from "../domain/events.repository";

export interface EventMap {
  [key: string]: ((event: Event) => void)[];
}

export default class AuditLogEventManager {
  private static dispatchedEvents: Event[] = [];
  private static eventsRepository: EventsRepository;

  public static setEventsRepository(eventsRepository: EventsRepository): void {
    AuditLogEventManager.eventsRepository = eventsRepository;
  }

  public static dispatch(event: Event): void {
    AuditLogEventManager.dispatchedEvents.push(event);
  }

  public static commitAll(): void {
    const eventEmitter = AppEventEmitter.getInstance();

    setImmediate(() => {
      AuditLogEventManager.dispatchedEvents.forEach((event) => {
        eventEmitter.emit(event.getName(), event);
        AuditLogEventManager.eventsRepository.save(event);
      });

      AuditLogEventManager.dispatchedEvents = [];
    });
  }

  public static registerEvents(
    events: Record<string, ((event: Event) => void)[]>,
  ): void {
    for (const eventName in events) {
      const eventHandlers = events[eventName];
      eventHandlers.forEach((eventHandler) => {
        AppEventEmitter.getInstance().on(eventName, eventHandler);
      });
    }
  }
}

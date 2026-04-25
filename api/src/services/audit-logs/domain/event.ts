import { DetailedDiff } from "deep-object-diff";

export interface Diff extends DetailedDiff {}

export default abstract class Event {
  private occurredAt: Date;

  protected constructor() {
    this.occurredAt = new Date();
  }

  public abstract getName(): string;
  public abstract getTopic(): string;
  public abstract getAction(): string;
  public abstract getTargetId(): string;
  public abstract getUserId(): string;
  public abstract getSource(): string;

  public abstract getPayload(): Record<string, unknown>;
  public abstract getDiff(): Diff;

  public abstract getMetadata(): Record<string, unknown>;

  public getOccurredAt(): Date {
    return this.occurredAt;
  }
}

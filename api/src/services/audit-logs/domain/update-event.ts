import DiffCalculator from "../infrastructure/diff-calculator";
import Event, { Diff } from "./event";

export default abstract class UpdateEvent extends Event {
  protected diff: Diff;

  constructor(oldData: Record<string, any>, newData: Record<string, any>) {
    super();
    this.diff = DiffCalculator.calculateDiff(oldData, newData);
  }

  public getDiff(): Diff {
    return this.diff;
  }
}

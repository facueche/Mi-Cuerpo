import { DetailedDiff, detailedDiff } from "deep-object-diff";

export default class DiffCalculator {
  public static calculateDiff(
    oldData: Record<string, any>,
    newData: Record<string, any>,
  ): DetailedDiff {
    const oldDataCopy = JSON.parse(JSON.stringify(oldData));
    const newDataCopy = JSON.parse(JSON.stringify(newData));
    return detailedDiff(oldDataCopy, newDataCopy);
  }
}

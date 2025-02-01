import { TimedTrigger } from "../lib/TriggerDataManager.types";

export function validateTimes (triggers: TimedTrigger[]): boolean[] {
  const invalidIndices = Array(triggers.length).map(() => false);

  const firstTime = triggers[0][0];
  if (firstTime[0] !== 0 || firstTime[1] !== 0 || firstTime[2] !== 0) {
    invalidIndices[0] = true;
  }

  for (let i = 0; i < triggers.length - 1; i += 1) {
    const time1 = triggers[i][0] as number[];
    const time2 = triggers[i + 1][0] as number[];
    const index1 = (
      time1[0] * 60 + time1[1]
    ) * 40 + time1[2];
    const index2 = (
      time2[0] * 60 + time2[1]
    ) * 40 + time2[2];

    if (index1 >= index2) {
      invalidIndices[i + 1] = true;
    }
  }

  return invalidIndices;
}

export interface StepBounds {
  top: number;
  bottom: number;
}

/**
 * The last step whose top has crossed the fixed viewport trigger line wins.
 * A small dead band prevents sub-pixel layout movement at a boundary from
 * switching forward and immediately back again.
 */
export function activeStepAtLine(
  bounds: readonly StepBounds[],
  triggerY: number,
  currentIndex = 0,
  hysteresis = 8,
): number {
  if (bounds.length === 0) return 0;

  const current = Math.min(Math.max(currentIndex, 0), bounds.length - 1);
  let candidate = 0;
  for (let index = 1; index < bounds.length; index += 1) {
    if (bounds[index].top <= triggerY) candidate = index;
    else break;
  }

  if (candidate > current) {
    return bounds[candidate].top <= triggerY - hysteresis ? candidate : current;
  }

  if (candidate < current) {
    return bounds[current].top > triggerY + hysteresis ? candidate : current;
  }

  return current;
}

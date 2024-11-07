type Getter<T> = (value: T) => number;
type Setter<T> = (value: T, smoothedValue: number) => number;

export function smooth<T>(
  arr: T[],
  windowSize: number,
  getter: Getter<T> = (value) => Number(value),
  setter?: Setter<T>,
): number[] {
  const get: Getter<T> = getter;
  const result: number[] = [];

  for (let i = 0; i < arr.length; i += 1) {
    const leftOffset = i - windowSize;
    const from = leftOffset >= 0 ? leftOffset : 0;
    const to = i + windowSize + 1;

    let count = 0;
    let sum = 0;
    for (let j = from; j < to && j < arr.length; j += 1) {
      sum += get(arr[j]);
      count += 1;
    }

    result[i] = setter ? setter(arr[i], sum / count) : sum / count;
  }

  return result;
}

export const pick = <T extends object, const K extends readonly (keyof T)[]>(
  source: T,
  keys: K,
): Pick<T, K[number]> => {
  const result = {} as Pick<T, K[number]>;

  for (const key of keys) {
    if (key in source) {
      result[key] = source[key];
    }
  }

  return result;
};

/**
 * Type guard to check if an unknown is a number
 * @param x Value to check number status of
 * @returns Whether x is a number
 */
export function isNumber(x: unknown): x is number {
  return typeof x === "number";
}

/**
 * Type guard to check if an unknown is a string
 * @param x Value to check string status of
 * @returns Whether x is a string
 */
export function isString(x: unknown): x is string {
  return typeof x === "string";
}

/**
 * Type guard to check if an unknown is an array
 * @param x Value to check array status of
 * @returns Whether x is an array
 */
export function isArray(x: unknown): x is unknown[] {
  return Array.isArray(x);
}

/**
 * Type guard to check if an array is a string array
 * @param arr Array to check type of
 * @returns Whether arr is a string array
 */
export function isStringArray(arr: unknown): arr is string[] {
  return isArray(arr) && arr.every((item) => isString(item));
}

/**
 * Type guard to check if an array is a number array
 * @param arr Array to check type of
 * @returns Whether arr is a number array
 */
export function isNumberArray(arr: unknown): arr is number[] {
  return isArray(arr) && arr.every((item) => isNumber(item));
}

/**
 * Type guard to check if an object is a valid record
 * @param obj Object to check type of
 * @returns Whether obj is a record
 */
export function isRecord(obj: unknown): obj is Record<string | number | symbol, unknown> {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}

/**
 * Type guard to check if an object is a record with numbers as keys
 * @param obj Object to check type of
 * @returns Whether obj is a record of numbers
 */
export function isNumberRecord(obj: unknown): obj is Record<number, unknown> {
  return isRecord(obj) && isNumberArray(Object.keys(obj));
}

/**
 * Type guard to check if an object is a record with strings as keys
 * @param obj Object to check type of
 * @returns Whether obj is a record of strings
 */
export function isStringRecord(obj: unknown): obj is Record<string, unknown> {
  return isRecord(obj) && isStringArray(Object.keys(obj));
}

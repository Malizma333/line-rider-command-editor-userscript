export enum ASSERT_TYPE {
  STR = "string",
  NUM = "number",
  ARR = "Array",
  NUM_ARR = "Array<number>",
  STR_ARR = "Array<string>",
  RECORD = "Record<string>",
}

interface ASSERT_TYPE_MAP {
  [ASSERT_TYPE.NUM]: number;
  [ASSERT_TYPE.STR]: string;
  [ASSERT_TYPE.ARR]: unknown[];
  [ASSERT_TYPE.NUM_ARR]: number[];
  [ASSERT_TYPE.STR_ARR]: string[];
  [ASSERT_TYPE.RECORD]: Record<string, unknown>;
}

/**
 * Type guard to check if an unknown is a number
 * @param x Value to check number status of
 * @returns Whether x is a number
 */
function isNumber(x: unknown): x is number {
  return typeof x === "number";
}

/**
 * Type guard to check if an unknown is a string
 * @param x Value to check string status of
 * @returns Whether x is a string
 */
function isString(x: unknown): x is string {
  return typeof x === "string";
}

/**
 * Type guard to check if an unknown is an array
 * @param x Value to check array status of
 * @returns Whether x is an array
 */
function isArray(x: unknown): x is unknown[] {
  return Array.isArray(x);
}

/**
 * Type guard to check if an array is a string array
 * @param arr Array to check type of
 * @returns Whether arr is a string array
 */
function isStringArray(arr: unknown): arr is string[] {
  return isArray(arr) && arr.every((item) => isString(item));
}

/**
 * Type guard to check if an array is a number array
 * @param arr Array to check type of
 * @returns Whether arr is a number array
 */
function isNumberArray(arr: unknown): arr is number[] {
  return isArray(arr) && arr.every((item) => isNumber(item));
}

/**
 * Type guard to check if an object is a valid record
 * @param obj Object to check type of
 * @returns Whether obj is a record with string keys
 */
function isRecord(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === "object" && obj !== null && isStringArray(Object.keys(obj));
}

/**
 * Function to assert that a type guard is true and throws an error if it isn't
 * @param value Value to assert type of
 * @param expectedType Type expected from value
 */
export function assert<T extends ASSERT_TYPE>(value: unknown, expectedType: T): asserts value is ASSERT_TYPE_MAP[T] {
  const message = `Assertion failed: ${value} was not ${expectedType}`;

  switch (expectedType) {
    case ASSERT_TYPE.NUM:
      if (!isNumber(value)) throw new Error(message);
      break;
    case ASSERT_TYPE.STR:
      if (!isString(value)) throw new Error(message);
      break;
    case ASSERT_TYPE.ARR:
      if (!isArray(value)) throw new Error(message);
      break;
    case ASSERT_TYPE.RECORD:
      if (!isRecord(value)) throw new Error(message);
      break;
    case ASSERT_TYPE.NUM_ARR:
      if (!isNumberArray(value)) throw new Error(message);
      break;
    case ASSERT_TYPE.STR_ARR:
      if (!isStringArray(value)) throw new Error(message);
      break;
  }
}

/**
 * Function to check that a type guard is true and returns false if it isn't
 * @param value Value to check type of
 * @param expectedType Type expected from value
 * @returns Whether value is type expectedType
 */
export function check<T extends ASSERT_TYPE>(value: unknown, expectedType: T): value is ASSERT_TYPE_MAP[T] {
  switch (expectedType) {
    case ASSERT_TYPE.NUM:
      if (!isNumber(value)) return false;
      break;
    case ASSERT_TYPE.STR:
      if (!isString(value)) return false;
      break;
    case ASSERT_TYPE.ARR:
      if (!isArray(value)) return false;
      break;
    case ASSERT_TYPE.RECORD:
      if (!isRecord(value)) return false;
      break;
    case ASSERT_TYPE.NUM_ARR:
      if (!isNumberArray(value)) return false;
      break;
    case ASSERT_TYPE.STR_ARR:
      if (!isStringArray(value)) return false;
      break;
  }

  return true;
}

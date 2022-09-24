/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

/**
 * Checks if types are equal, example usage:
 * @fail const test: AssertEqual<{ a: string }, { a: "string" }> = true; // Type Error
 * @pass const test2: AssertEqual<{ a: string }, { a: string }> = true;
 */
type AssertEqual<U, T> = [U] extends [T]
  ? [T] extends [U]
    ? true
    : false
  : false;

/**
 * Test if two types are equal, example usage:
 * @fail assertEqual<{ a: string }, { a: "string" }>(true); // Type Error
 * @pass assertEqual<{ a: string }, { a: string }>(true);
 */
function assertEqual<T, E>(_result: AssertEqual<T, E>): void {}

export { AssertEqual, assertEqual };

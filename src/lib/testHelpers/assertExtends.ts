/**
 * Assert that type A is assignable to type B (A extends B).
 * Pass `true` when A should extend B, `false` when it shouldn't.
 * The type system validates correctness at compile time.
 *
 * @example
 * assertExtends<"foo", string>(true);  // passes - "foo" extends string
 * assertExtends<string, "foo">(false); // passes - string doesn't extend "foo"
 * assertExtends<number, string>(true); // TS error - number doesn't extend string
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
function assertExtends<A, B>(_expectation: A extends B ? true : false): void {}

export { assertExtends };

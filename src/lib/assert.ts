export function assert<I, O extends I>(
  input: I,
  guard: (input: I) => input is O,
  errorMessage?: string
): asserts input is O {
  if (!guard(input))
    throw new TypeError(
      `${errorMessage || "Invalid data"}. Received: ${JSON.stringify(input)}`
    );
}

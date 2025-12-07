import { Depth } from "./Depth";
import { PathEndingIn } from "./PathEndingIn";

/**
 * Type representing any function signature.
 */
interface AnyFunction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (...args: any[]): any;
}

/**
 * Generates a union of all valid dot-notation paths for type T that terminate in functions.
 * This is a convenient alias for PathEndingIn<T, AnyFunction, D>.
 *
 * @typeParam T - The object type to generate paths for
 * @typeParam D - Depth tuple (default: Depth<5> = 5 levels)
 *
 * @example
 * type Obj = { name: string; greet: () => void; nested: { run: () => void } };
 * type FuncPaths = FunctionPath<Obj>; // "greet" | "nested.run"
 */
export type FunctionPath<T, D extends unknown[] = Depth<5>> = PathEndingIn<
  T,
  AnyFunction,
  D
>;

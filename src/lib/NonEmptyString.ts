/** A string that is not empty. */
export type NonEmptyString<S extends string> = S extends "" ? never : S;

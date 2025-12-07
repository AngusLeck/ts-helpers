import { assertEqual } from "../../testHelpers";
import { ExplicitTupleLength, HasRestElement } from "./TupleHelpers";

describe("TupleHelpers", () => {
  describe("ExplicitTupleLength", () => {
    it("returns 2 for regular tuple [string, number]", () => {
      type Result = ExplicitTupleLength<[string, number]>;
      assertEqual<Result, 2>(true);
    });

    it("returns 1 for tuple with rest at position 1 [string, ...number[]]", () => {
      type Result = ExplicitTupleLength<[string, ...number[]]>;
      assertEqual<Result, 1>(true);
    });

    it("returns 2 for tuple with 2 explicit and rest [string, number, ...boolean[]]", () => {
      type Result = ExplicitTupleLength<[string, number, ...boolean[]]>;
      assertEqual<Result, 2>(true);
    });

    it("returns 0 for empty tuple", () => {
      type Result = ExplicitTupleLength<[]>;
      assertEqual<Result, 0>(true);
    });

    it("returns 1 for single element tuple", () => {
      type Result = ExplicitTupleLength<[string]>;
      assertEqual<Result, 1>(true);
    });

    it("returns 0 for tuple with just rest [...number[]]", () => {
      type Result = ExplicitTupleLength<[...number[]]>;
      assertEqual<Result, 0>(true);
    });

    it("returns 3 for three explicit elements with rest", () => {
      type Result = ExplicitTupleLength<[string, number, boolean, ...symbol[]]>;
      assertEqual<Result, 3>(true);
    });

    it("returns 2 for tuple with optional element (no rest)", () => {
      type Result = ExplicitTupleLength<[string, number?]>;
      assertEqual<Result, 2>(true);
    });
  });

  describe("HasRestElement", () => {
    it("returns false for regular tuple [string, number]", () => {
      type Result = HasRestElement<[string, number]>;
      assertEqual<Result, false>(true);
    });

    it("returns true for tuple with rest [string, ...number[]]", () => {
      type Result = HasRestElement<[string, ...number[]]>;
      assertEqual<Result, true>(true);
    });

    it("returns false for empty tuple", () => {
      type Result = HasRestElement<[]>;
      assertEqual<Result, false>(true);
    });

    it("returns true for tuple with just rest [...number[]]", () => {
      type Result = HasRestElement<[...number[]]>;
      assertEqual<Result, true>(true);
    });

    it("returns false for tuple with optional elements", () => {
      type Result = HasRestElement<[string, number?]>;
      assertEqual<Result, false>(true);
    });
  });
});

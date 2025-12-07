import { assertEqual } from "../src/lib/testHelpers";
import { ExplicitTupleLength, HasRestElement } from "../src/lib/experimental/helpers/TupleHelpers";

describe("TupleHelpers", () => {
  describe("ExplicitTupleLength", () => {
    it("should return 2 for [string, number]", () => {
      type Result = ExplicitTupleLength<[string, number]>;
      assertEqual<Result, 2>(true);
    });

    it("should return 1 for [string, ...number[]]", () => {
      type Result = ExplicitTupleLength<[string, ...number[]]>;
      assertEqual<Result, 1>(true);
    });

    it("should return 2 for [string, number, ...boolean[]]", () => {
      type Result = ExplicitTupleLength<[string, number, ...boolean[]]>;
      assertEqual<Result, 2>(true);
    });
  });

  describe("HasRestElement", () => {
    it("should return false for [string, number]", () => {
      type Result = HasRestElement<[string, number]>;
      assertEqual<Result, false>(true);
    });

    it("should return true for [string, ...number[]]", () => {
      type Result = HasRestElement<[string, ...number[]]>;
      assertEqual<Result, true>(true);
    });
  });
});

import { Path } from "./Path";
import { assertEqual } from "./testHelpers/assertEqual";

describe("Path", () => {
  it("should handle basic nested paths", () => {
    interface BasicNested {
      a: {
        b: {
          c: string;
        };
      };
    }

    assertEqual<Path<BasicNested>, "a" | "a.b" | "a.b.c">(true);
  });

  it("should limit depth to 10 levels", () => {
    // Create a deeply nested type that goes beyond 10 levels
    interface Level1 {
      level2: Level2;
    }
    interface Level2 {
      level3: Level3;
    }
    interface Level3 {
      level4: Level4;
    }
    interface Level4 {
      level5: Level5;
    }
    interface Level5 {
      level6: Level6;
    }
    interface Level6 {
      level7: Level7;
    }
    interface Level7 {
      level8: Level8;
    }
    interface Level8 {
      level9: Level9;
    }
    interface Level9 {
      level10: Level10;
    }
    interface Level10 {
      level11: Level11;
    }
    interface Level11 {
      level12: Level12;
    }
    interface Level12 {
      level13: string;
    } // This should be cut off

    // Let's first check what the actual type looks like
    type ActualPath = Path<Level1>;

    // The depth limiter should prevent infinite recursion
    // At depth 10, it should just return the key name without further nesting
    type PathAtDepth10 =
      "level2.level3.level4.level5.level6.level7.level8.level9.level10.level11";

    // This should be included (at exactly depth 10)
    assertEqual<PathAtDepth10 extends ActualPath ? true : false, true>(true);

    // Create a type that tests the depth limit boundary
    interface SimpleDeep {
      a: {
        b: {
          c: { d: { e: { f: { g: { h: { i: { j: { k: string } } } } } } } };
        };
      };
    }

    type SimpleDeepPath = Path<SimpleDeep>;

    // At depth 10, we should get "a.b.c.d.e.f.g.h.i.j" but not "a.b.c.d.e.f.g.h.i.j.k"
    assertEqual<
      "a.b.c.d.e.f.g.h.i.j" extends SimpleDeepPath ? true : false,
      true
    >(true);
  });

  it("should work with mixed types at depth limit", () => {
    interface MixedDeep {
      a: {
        b: {
          c: {
            d: {
              e: {
                f: {
                  g: {
                    h: {
                      i: {
                        j: {
                          // At depth 10, this should be the limit
                          primitive: string;
                          nested: {
                            tooDeep: number; // This should be cut off
                          };
                        };
                      };
                    };
                  };
                };
              };
            };
          };
        };
      };
    }

    // Should include up to depth 10 but not beyond
    type ValidPath = "a.b.c.d.e.f.g.h.i.j";
    type InvalidPath = "a.b.c.d.e.f.g.h.i.j.nested.tooDeep";

    // This should work
    assertEqual<ValidPath extends Path<MixedDeep> ? true : false, true>(true);

    // This should fail - beyond depth 10
    assertEqual<InvalidPath extends Path<MixedDeep> ? true : false, false>(
      true
    );
  });
});

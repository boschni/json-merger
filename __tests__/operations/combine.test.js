const jsonMerger = require("../../dist");
const { testConfig } = require("../../__helpers__");

describe("when merging two objects and a source property has a $combine indicator", function () {
  test("it should combine the source property with the target", function () {
    const object1 = {
      a: [1, 2, 3],
    };

    const object2 = {
      a: {
        $combine: [3, 3],
      },
    };

    const result = jsonMerger.mergeObjects([object1, object2], testConfig());

    expect(result).toMatchSnapshot();
  });

  test("it should combine if no defaultArrayMergeOperation specified", function () {
    const object1 = {
      a: [1, 2, 3],
    };

    const object2 = {
      a: [3, 3],
    };

    const result = jsonMerger.mergeObjects([object1, object2], testConfig());

    expect(result).toMatchSnapshot();
  });

  test("it should combine objects", function () {
    const object1 = {
      a: {
        prop1: "prop1 from a",
        prop2: "prop2 from a",
        prop3: "prop3 from a",
      },
    };

    const object2 = {
      a: {
        $combine: {
          prop2: "prop2 from b",
          prop3: "prop3 from b",
        },
      },
      b: "b",
    };

    const result = jsonMerger.mergeObjects([object1, object2], testConfig());

    expect(result).toMatchSnapshot();
  });

  test("it should combine objects to same result as without combine operation", function () {
    const object1 = {
      a: {
        prop1: "prop1 from a",
        prop2: "prop2 from a",
        prop3: "prop3 from a",
      },
    };

    const object2 = {
      a: {
        prop2: "prop2 from b",
        prop3: "prop3 from b",
      },
      b: "b",
    };

    const object2combine = {
      a: {
        $combine: {
          prop2: "prop2 from b",
          prop3: "prop3 from b",
        },
      },
      b: "b",
    };

    const resultWithNoCombine = jsonMerger.mergeObjects(
      [object1, object2],
      testConfig(),
    );
    const resultWithCombine = jsonMerger.mergeObjects(
      [object1, object2combine],
      testConfig(),
    );

    expect(resultWithCombine).toBe(resultWithNoCombine);
  });
});

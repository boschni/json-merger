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
});

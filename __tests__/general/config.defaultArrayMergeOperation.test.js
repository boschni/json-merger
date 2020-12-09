const jsonMerger = require("../../dist");
const { testConfig } = require("../../__helpers__");

describe("when config.defaultArrayMergeOperation is", function () {
  test("not set combine should be used", function () {
    const defaultArrayMergeOperation = undefined;
    const object1 = {
      a: [1, 2, 3],
    };

    const object2 = {
      a: [3, 3],
    };

    const result = jsonMerger.mergeObjects(
      [object1, object2],
      testConfig({ defaultArrayMergeOperation })
    );

    expect(result).toMatchSnapshot();
  });

  test("set to replace, replace should be used", function () {
    const defaultArrayMergeOperation = "replace";
    const object1 = {
      a: [1, 2, 3],
    };

    const object2 = {
      a: [3, 3],
    };

    const result = jsonMerger.mergeObjects(
      [object1, object2],
      testConfig({ defaultArrayMergeOperation })
    );

    expect(result).toMatchSnapshot();
  });

  test("set to concat, concat should be used", function () {
    const defaultArrayMergeOperation = "concat";
    const object1 = {
      a: [1, 2, 3],
    };

    const object2 = {
      a: [3, 3],
    };

    const result = jsonMerger.mergeObjects(
      [object1, object2],
      testConfig({ defaultArrayMergeOperation })
    );

    expect(result).toMatchSnapshot();
  });

  test("set to a unsupported value, combine should be used", function () {
    const defaultArrayMergeOperation = "unsupported value";
    const object1 = {
      a: [1, 2, 3],
    };

    const object2 = {
      a: [3, 3],
    };

    const result = jsonMerger.mergeObjects(
      [object1, object2],
      testConfig({ defaultArrayMergeOperation })
    );

    expect(result).toMatchSnapshot();
  });

  test("set to a unsupported value, combine should be used", function () {
    const defaultArrayMergeOperation = "anotherUnsupportedValue=D";
    const object1 = {
      a: [1, 2, 3],
    };

    const object2 = {
      a: [3, 3],
    };

    const result = jsonMerger.mergeObjects(
      [object1, object2],
      testConfig({ defaultArrayMergeOperation })
    );

    expect(result).toMatchSnapshot();
  });
});

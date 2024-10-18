const jsonMerger = require("../../dist");
const { testConfig } = require("../../__helpers__");

describe("when config.enableExpressionOperation is set", function () {
  test("to undefined it should not process expression operations", function () {
    const object1 = {
      a: {
        aa: "original",
      },
    };

    const object2 = {
      a: {
        aa: {
          $expression: "'should be the value of /a/aa'",
        },
      },
    };

    const result = jsonMerger.mergeObjects(
      [object1, object2],
      testConfig({ enableExpressionOperation: undefined }),
    );

    expect(result).toMatchSnapshot();
  });

  test("to false it should not process expression operations", function () {
    const object1 = {
      a: {
        aa: "original",
      },
    };

    const object2 = {
      a: {
        aa: {
          $expression: "'should be the value of /a/aa'",
        },
      },
    };

    const result = jsonMerger.mergeObjects(
      [object1, object2],
      testConfig({ enableExpressionOperation: false }),
    );

    expect(result).toMatchSnapshot();
  });

  test("to true it should process expression operations", function () {
    const object1 = {
      a: {
        aa: "original",
      },
    };

    const object2 = {
      a: {
        aa: {
          $expression: "'should be the value of /a/aa'",
        },
      },
    };

    const result = jsonMerger.mergeObjects(
      [object1, object2],
      testConfig({ enableExpressionOperation: true }),
    );

    expect(result).toMatchSnapshot();
  });
});

const jsonMerger = require("../../dist");
const { testConfig } = require("../../__helpers__");

describe("when config.stringify is set  to \"pretty\" and config.prettyPrintIndenting is set", function () {
  test("to a number between 1 and 10, it will indent with that many spaces", function () {
    const object = {
      a: {
        b: {
          c: 1
        }
      },
    };

    const result = jsonMerger.mergeObject(
      object,
      testConfig({
        stringify: "pretty",
        prettyPrintIndenting: 3
      }),
    );

    expect(result).toMatchSnapshot();
  });

  test("to \\t it should indent with tabs", function () {
    const object = {
      a: {
        $replace: 1,
      },
    };

    const result = jsonMerger.mergeObject(
      object,
      testConfig({
        stringify: "pretty",
        prettyPrintIndenting: "\t"
      }),
    );

    expect(result).toMatchSnapshot();
  });
});

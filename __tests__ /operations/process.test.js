const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when merging two objects and a source property has a $process indicator", function () {

    test("it should process the $process property and then process/merge the result with the target", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "$process": {
                    "$$replace": "replaced"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should use the $process property result as $currentSource when processing/merging with the target", function () {

        const object = {
            "$process": {
                "$merge": {
                    "source": {
                        "a": {
                            "$$expression": "$currentSource.b"
                        }
                    },
                    "with": {
                        "b": "bValue"
                    }
                }
            }
        };

        const result = jsonMerger.mergeObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });
});

const jsonMerger = require("../dist/index");
const {testConfig} = require("./__helpers__/index");

describe("when merging two objects", function () {

    test("it should merge non-operation properties starting with the indicator prefix", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "$$noOperation": true
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should be possible to escape an indicator with an additional prefix character", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "$$replace": {
                    "with": "not replaced"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should be possible to escape an indicator but the value should be processed", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "$$replace": {
                    "with": {
                        "$replace": {
                            "with": "not replaced"
                        }
                    }
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

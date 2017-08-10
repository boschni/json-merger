const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when merging two objects and a source property has a $replace indicator", function () {

    test("it should not merge the source property but replace it", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "$replace": true,
                "bb": "replaced"
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and a $value indicator it should not merge the source property but replace it with the $value result", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "$replace": true,
                "$value": {
                    "bb": "replaced"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and a $ref indicator it should not merge the source property but replace it with the $ref result", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "$replace": true,
                "$ref": "/b"
            },
            "b": {
                "bb": "replaced"
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and a $merge indicator it should not merge the source property but replace it with the $merge result", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "$replace": true,
                "$merge": {
                    "source": "notImportant",
                    "with": {
                        "bb": "replaced"
                    }
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

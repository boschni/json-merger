const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when merging two objects and a source property has a $replace indicator", function () {

    test("it should not merge the source property but replace it with $replace.with", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "$replace": {
                    "bb": "replaced"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should process the $replace.with property and replace the source property with the result", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "$replace": {
                    "$merge": {
                        "source": "notImportant",
                        "with": {
                            "bb": "replaced"
                        }
                    }
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

describe("when merging two arrays and a source array item has a $replace indicator", function () {

    test("it should process the $replace.with property and replace the array item with the result", function () {

        const object1 = {
            "a": [
                {
                    "a1": "original"
                },
                {
                    "a2": "original"
                }
            ]
        };

        const object2 = {
            "a": [
                {},
                {
                    "$replace": {
                        "$merge": {
                            "source": "notImportant",
                            "with": {
                                "b2": "replaced"
                            }
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when merging two objects and a source property has a $remove indicator", function () {

    test("it should remove the property", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "aa": {
                    "$remove": true
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

describe("when merging two arrays and a source property has a $remove indicator", function () {

    test("it should remove the item", function () {

        const object1 = {
            "a": [
                1,
                2,
                3
            ]
        };

        const object2 = {
            "a": [
                {
                    "$remove": true
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

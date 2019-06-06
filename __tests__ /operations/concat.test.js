const jsonMerger = require("../../dist");
const {testConfig} = require("../../__helpers__");

describe("when merging two objects and a source property has a $concat indicator", function () {

    test("it should concat the source property with the target", function () {

        const object1 = {
            "a": [1, 2]
        };

        const object2 = {
            "a": {
                "$concat": [3, 4]
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should concat even if one value is not an array", function () {

        const object1 = {
            "a": [1]
        };

        const object2 = {
            "a": {
                "$concat": 2
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should concat even if both values are not arrays", function () {

        const object1 = {
            "a": 1
        };

        const object2 = {
            "a": {
                "$concat": 2
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

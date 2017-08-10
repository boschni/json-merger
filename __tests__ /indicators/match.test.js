const helpers = require("../../__helpers__");

describe("when merging two objects and a source property has an $match indicator", function () {

    test("it should use the $match json path result as value", function () {

        const object1 = {
            "a": {
                "aa": "original1",
                "ab": "original2"
            }
        };

        const object2 = {
            "a": {
                "ac": {
                    "$match": "$.ab"
                }
            }
        };

        const result = helpers.mergeObjects([object1, object2]);

        expect(result).toMatchSnapshot();
    });
});

describe("when merging two arrays and a source property has an $match indicator and an $remove indicator", function () {

    test("it should remove the item matched by the $match json path", function () {

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
                    "$match": "$[1]",
                    "$remove": true
                }
            ]
        };

        const result = helpers.mergeObjects([object1, object2]);

        expect(result).toMatchSnapshot();
    });
});

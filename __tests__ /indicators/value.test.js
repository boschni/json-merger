const helpers = require("../../__helpers__");

describe("when merging two objects and a source property has a $value indicator", function () {

    test("it should use the $value property as value instead of the property itself", function () {

        const object1 = {
            "a": "original"
        };

        const object2 = {
            "a": {
                "$value": "value"
            }
        };

        const result = helpers.mergeObjects([object1, object2]);

        expect(result).toMatchSnapshot();
    });

    test("it should use the $value property as value instead of the property itself and merge if it are two objects", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "$value": {
                    "bb": "value"
                }
            }
        };

        const result = helpers.mergeObjects([object1, object2]);

        expect(result).toMatchSnapshot();
    });

    test("it should also process the $value property instead of just using the $value property value", function () {

        const object1 = {
            "a": "original"
        };

        const object2 = {
            "a": {
                "$value": {
                    "$value": "value"
                }
            }
        };

        const result = helpers.mergeObjects([object1, object2]);

        expect(result).toMatchSnapshot();
    });

    test("and a $ref indicator it should use the $ref property as value instead of the $value property", function () {

        const object1 = {
            "a": "original"
        };

        const object2 = {
            "a": {
                "$value": "value",
                "$ref": "/b"
            },
            "b": "refValue"
        };

        const result = helpers.mergeObjects([object1, object2]);

        expect(result).toMatchSnapshot();
    });
});

describe("when merging two arrays and a source property has a $value indicator", function () {

    test("it should use the $value property as value instead of the property itself", function () {

        const object1 = {
            "a": [
                "original"
            ]
        };

        const object2 = {
            "a": {
                "$replace": true,
                "$value": [
                    "value"
                ]
            }
        };

        const result = helpers.mergeObjects([object1, object2]);

        expect(result).toMatchSnapshot();
    });
});

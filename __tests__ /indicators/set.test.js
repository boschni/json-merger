const helpers = require("../../__helpers__");

describe("when merging two objects and a source property has a $set indicator", function () {

    test("containing an object it should set a property with $set.key as key and $set.value as value", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "$set": {
                    "key": "$value",
                    "value": true
                }
            }
        };

        const result = helpers.mergeObjects([object1, object2]);

        expect(result).toMatchSnapshot();
    });

    test("containing an array it should set all properties defined in $set: [{key,value},{key,value}]", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "$set": [
                    {
                        "key": "$value",
                        "value": true
                    },
                    {
                        "key": "$remove",
                        "value": true
                    }
                ]
            }
        };

        const result = helpers.mergeObjects([object1, object2]);

        expect(result).toMatchSnapshot();
    });

    test("it should process the value property in $set", function () {

        const object1 = {
            "a": {
                "aa": "one"
            }
        };

        const object2 = {
            "a": {
                "$set": {
                    "key": "$value",
                    "value": {
                        "$value": "two"
                    }
                }
            }
        };

        const result = helpers.mergeObjects([object1, object2]);

        expect(result).toMatchSnapshot();
    });
});

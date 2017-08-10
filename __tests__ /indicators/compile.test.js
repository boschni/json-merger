const helpers = require("../../__helpers__");

describe("when merging two objects and a source property has a $compile indicator", function () {

    test("it should compile the $compile property and then compile/merge the result with the target", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "$compile": {
                    "$set": {
                        "key": "$value",
                        "value": "replaced"
                    }
                }
            }
        };

        const result = helpers.mergeObjects([object1, object2]);

        expect(result).toMatchSnapshot();
    });

    test("it should use the $compile property result as $sourceRoot when compiling/merging with the target", function () {

        const object = {
            "$compile": {
                "$merge": {
                    "source": {
                        "a": {
                            "$set": {
                                "key": "$expression",
                                "value": "$sourceRoot.b"
                            }
                        }
                    },
                    "with": {
                        "b": "bValue"
                    }
                }
            }
        };

        const result = helpers.fromObject(object);

        expect(result).toMatchSnapshot();
    });
});

const helpers = require("../../__helpers__");

describe("when merging two objects and a source property has a $id indicator", function () {

    test("it should not merge the $id property", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "$id": 1
            }
        };

        const result = helpers.mergeObjects([object1, object2]);

        expect(result).toMatchSnapshot();
    });
});

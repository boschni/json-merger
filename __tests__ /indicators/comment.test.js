const helpers = require("../../__helpers__");

describe("when merging two objects and a source property has a $comment indicator", function () {

    test("it should not merge the $comment property", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "$comment": "comment"
            }
        };

        const result = helpers.mergeObjects([object1, object2]);

        expect(result).toMatchSnapshot();
    });
});

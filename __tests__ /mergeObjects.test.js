const jsonMerger = require("../dist");
const {testConfig} = require("./__helpers__");

describe(".mergeObjects() when merging two objects it", function () {

    test("should add properties if they do not exist on the target", function () {

        const object1 = {
            "1a": {
                "1aa": 1
            }
        };

        const object2 = {
            "2b": {
                "2bb": 2
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should overwrite a primitive property value if the source property value is a primitive", function () {

        const object1 = {
            "1a": 1
        };

        const object2 = {
            "1a": "overwrite"
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should overwrite an object property value if the source property value is a primitive", function () {

        const object1 = {
            "1a": {
                "1aa": 1
            }
        };

        const object2 = {
            "1a": "overwrite"
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should overwrite an array property value if the source property value is a primitive", function () {

        const object1 = {
            "1a": [1]
        };

        const object2 = {
            "1a": "overwrite"
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should overwrite an object property value if the source property value is an array", function () {

        const object1 = {
            "1a": {
                "1aa": 1
            }
        };

        const object2 = {
            "1a": ["overwrite"]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should overwrite a string property value if the source property value is an object", function () {

        const object1 = {
            "1a": "string"
        };

        const object2 = {
            "1a": {
                "1aa": "overwrite"
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should overwrite a string property value if the source property value is an array", function () {

        const object1 = {
            "1a": "string"
        };

        const object2 = {
            "1a": [
                "overwrite"
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should overwrite an object if the source is a primitive", function () {

        const object1 = {
            "1a": {
                "1aa": 1
            }
        };

        const object2 = "overwrite";

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should not mutate any of the input objects", function () {

        const object1 = {
            "1a": {
                "1aa": 1
            }
        };

        const object2 = {
            "2b": {
                "2bb": 2
            }
        };

        const objects = [object1, object2];

        jsonMerger.mergeObjects(objects);

        expect(objects).toMatchSnapshot();
    });
});

describe("when merging two arrays it", function () {

    test("should merge items on matching index", function () {

        const object1 = [
            {
                "1a": "1a"
            },
            {
                "1b": "1b"
            },
            {
                "1c": "1c"
            }
        ];

        const object2 = [
            {
                "2a": "2a"
            },
            {
                "2b": "2b"
            }
        ];

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should add items if the source array has more items", function () {

        const object1 = [
            {
                "1a": "1a"
            }
        ];

        const object2 = [
            {
                "2a": "2a"
            },
            {
                "2b": "2b"
            }
        ];

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should not modify the array if the source array is empty", function () {

        const object1 = [
            {
                "1a": "1a"
            }
        ];

        const object2 = [];

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

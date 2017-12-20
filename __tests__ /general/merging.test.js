const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when merging two objects it", function () {

    test("should add properties if they do not exist on the target", function () {

        const object1 = {
            "object1": {
                "prop": "/object1 should be on the result"
            }
        };

        const object2 = {
            "object2": {
                "prop": "and /object2 should be on the result"
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should overwrite a primitive property value if the source property value is a primitive", function () {

        const object1 = {
            "object": 1
        };

        const object2 = {
            "object": "/object should be overwritten with this value"
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should overwrite an object property value if the source property value is a primitive", function () {

        const object1 = {
            "object": {
                "prop": "should be overwritten"
            }
        };

        const object2 = {
            "object": "/object should be overwritten with this value"
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should overwrite an array property value if the source property value is a primitive", function () {

        const object1 = {
            "object": [1]
        };

        const object2 = {
            "object": "/object should be overwritten with this value"
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should overwrite an object property value if the source property value is an array", function () {

        const object1 = {
            "object": {
                "prop": "should be overwritten"
            }
        };

        const object2 = {
            "object": ["/object should be overwritten with this array"]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should overwrite a string property value if the source property value is an object", function () {

        const object1 = {
            "object": "string"
        };

        const object2 = {
            "object": {
                "prop": "/object should be overwritten with this value"
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should overwrite a string property value if the source property value is an array", function () {

        const object1 = {
            "object": "string"
        };

        const object2 = {
            "object": [
                "/object should be overwritten with this array"
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should overwrite an object if the source is a primitive", function () {

        const object1 = {
            "object": {
                "prop": 1
            }
        };

        const object2 = "should be overwritten with this value";

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should not mutate any of the input objects", function () {

        const object1 = {
            "object1": {
                "prop": 1
            }
        };

        const object2 = {
            "object2": {
                "prop": 2
            }
        };

        const objects = [object1, object2];

        jsonMerger.mergeObjects(objects);

        expect(objects).toMatchSnapshot();
    });

    test("should be able to handle null values", function () {

        const object1 = {
            "object1": {
                "prop1": 1,
                "prop2": null
            }
        };

        const object2 = {
            "object2": {
                "prop1": 2,
                "prop2": null
            }
        };

        const objects = [object1, object2];

        jsonMerger.mergeObjects(objects);

        expect(objects).toMatchSnapshot();
    });

    test("should delete the object key for an undefined value", function () {

        const object1 = {
            "prop": 1
        };

        const object2 = {
            "prop": undefined
        };

        const result = jsonMerger.mergeObjects([object1, object2], {stringify: false});

        expect(result.hasOwnProperty("prop")).toBe(false);
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
                "2a": "this property should be added to the first item"
            },
            {
                "2b": "this property should be added to the second item"
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
                "2a": "this property should be added to the first item"
            },
            {
                "2b": "this object should be added to the array"
            }
        ];

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should not modify the array if the source array is empty", function () {

        const object1 = [
            {
                "1a": "this should be the only array item"
            }
        ];

        const object2 = [];

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should be able to handle null values", function () {

        const object1 = [
            {
                "1a": "1a"
            },
            null
        ];

        const object2 = [];

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

describe("when merging two arrays containing operations it", function () {

    test("should apply the operation to the element matching the index in the target array, even if elements are removed", function () {

        const object1 = [
            {
                "prop": "this item should be removed"
            },
            {
                "prop": "this should be the first item"
            },
            {
                "prop": "this should be the second item"
            }
        ];

        const object2 = [
            {
                "$remove": true
            },
            {
                "prop2": "this should be added to the first item"
            }
        ];

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should apply the operation to the element matching the index in the target array, even if elements are inserted", function () {

        const object1 = [
            {
                "prop": "this should be the second item"
            },
            {
                "prop": "this should be the third item"
            },
            {
                "prop": "this should be the fourth item"
            }
        ];

        const object2 = [
            {
                "$insert": {
                    "index": 0,
                    "value": {
                        "prop": "this should be the first item"
                    }
                }
            },
            {
                "prop2": "this should be added to the third item"
            }
        ];

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

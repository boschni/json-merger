const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when merging two arrays and the source item has", function () {

    test("$insert: 0 it should prepend the source array item", function () {

        const object1 = {
            "a": [
                {
                    "aa": "string"
                }
            ]
        };

        const object2 = {
            "a": [
                {
                    "$insert": 0,
                    "bb": "prepend"
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("$insert: 1 it should insert the source array item at index 1", function () {

        const object1 = {
            "a": [
                {
                    "aa1": "string"
                },
                {
                    "aa2": "string"
                }
            ]
        };

        const object2 = {
            "a": [
                {
                    "$insert": 1,
                    "bb": "insert at index 1"
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("$insert: 1 and an other item also has $insert: 1 it should insert the last item at index 1", function () {

        const object1 = {
            "a": [
                {
                    "aa1": "string"
                },
                {
                    "aa2": "string"
                }
            ]
        };

        const object2 = {
            "a": [
                {
                    "$insert": 1,
                    "bb": "insert at index 2"
                },
                {
                    "$insert": 1,
                    "cc": "insert at index 1"
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("$insert: -1 it should insert the source array item before the last item", function () {

        const object1 = {
            "a": [
                {
                    "aa1": "string"
                },
                {
                    "aa2": "string"
                }
            ]
        };

        const object2 = {
            "a": [
                {
                    "$insert": -1,
                    "bb": "insert before last"
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("$insert: - it should append the source array item", function () {

        const object1 = {
            "a": [
                {
                    "aa1": "string"
                },
                {
                    "aa2": "string"
                }
            ]
        };

        const object2 = {
            "a": [
                {
                    "$insert": "-",
                    "bb": "append"
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("an $insert value higher than the target array length it should append the array item", function () {

        const object1 = {
            "a": [
                {
                    "aa1": "string"
                },
                {
                    "aa2": "string"
                }
            ]
        };

        const object2 = {
            "a": [
                {
                    "$insert": 10,
                    "bb": "append"
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

test("$insert on a non array item should do nothing and be stripped", function () {

    const object1 = {
        "1a": {
            "1aa": 1
        }
    };

    const object2 = {
        "2b": {
            "$insert": true,
            "2bb": 2
        }
    };

    const result = jsonMerger.mergeObjects([object1, object2], testConfig());

    expect(result).toMatchSnapshot();
});

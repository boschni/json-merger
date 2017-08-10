const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when merging two arrays and the source item has", function () {

    test("$prepend it should prepend the source array item", function () {

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
                    "$prepend": true,
                    "bb": "prepend"
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("$prepend and an other item also has $prepend it should prepend them in the order they are defined", function () {

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
                    "$prepend": true,
                    "bb": "prepend 1"
                },
                {
                    "$prepend": true,
                    "cc": "prepend 2"
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("$prepend it should prepend the source array item even if there is an $index indicator with index: 0", function () {

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
                    "$prepend": true,
                    "bb": "prepend"
                },
                {
                    "$insert": 0,
                    "cc": "insert"
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

test("$prepend on a non array item should do nothing and be stripped", function () {

    const object1 = {
        "1a": {
            "1aa": 1
        }
    };

    const object2 = {
        "2b": {
            "$prepend": true,
            "2bb": 2
        }
    };

    const result = jsonMerger.mergeObjects([object1, object2], testConfig());

    expect(result).toMatchSnapshot();
});

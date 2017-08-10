const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when merging two arrays and the source item has", function () {

    test("$append it should append the source array item", function () {

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
                    "$append": true,
                    "bb": "append"
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("$append and an other item also has $append it should append them in the order they are defined", function () {

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
                    "$append": true,
                    "bb": "append 1"
                },
                {
                    "$append": true,
                    "cc": "append 2"
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("$append it should append the source array item even if there is an $index indicator with a higher index", function () {

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
                    "$append": true,
                    "bb": "append"
                },
                {
                    "$insert": 10,
                    "cc": "insert"
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

test("$append on a non array item should do nothing and be stripped", function () {

    const object1 = {
        "1a": {
            "1aa": 1
        }
    };

    const object2 = {
        "2b": {
            "$append": true,
            "2bb": 2
        }
    };

    const result = jsonMerger.mergeObjects([object1, object2], testConfig());

    expect(result).toMatchSnapshot();
});

const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when merging two arrays and a source item has $append", function () {

    test("it should append the source array item to the target array", function () {

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
                    "$append": {
                        "bb": "append"
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should process the $append.value property before appending it to the target array", function () {

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
                    "$append": {
                        "bb": {
                            "$replace": "append"
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and an other item also has $append it should append them in the order they are defined", function () {

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
                    "$append": {
                        "bb": "append 1"
                    }
                },
                {
                    "$append": {
                        "cc": "append 2"
                    }
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
            "$append": {
                "2bb": 2
            }
        }
    };

    const result = jsonMerger.mergeObjects([object1, object2], testConfig());

    expect(result).toMatchSnapshot();
});

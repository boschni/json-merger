const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when merging two arrays and the source item has $prepend", function () {

    test("it should prepend the source array item", function () {

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
                    "$prepend": {
                        "bb": "prepend"
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should process the $prepend.value property before prepending it to the target array", function () {

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
                    "$prepend": {
                        "bb": {
                            "$replace": "prepend"
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and an other item also has $prepend it should prepend them in the order they are defined", function () {

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
                    "$prepend": {
                        "bb": "prepend 1"
                    }
                },
                {
                    "$prepend": {
                        "cc": "prepend 2"
                    }
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
            "$prepend": {
                "2bb": 2
            }
        }
    };

    const result = jsonMerger.mergeObjects([object1, object2], testConfig());

    expect(result).toMatchSnapshot();
});

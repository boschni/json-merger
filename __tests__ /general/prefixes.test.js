const jsonMerger = require("../../dist/index");
const {testConfig} = require("../__helpers__/index");

describe("when merging two objects", function () {

    test("it should merge non-operation properties starting with the operation prefix", function () {

        const object1 = {
            "a": {
                "aa": "this should be the value of /a/aa"
            }
        };

        const object2 = {
            "a": {
                "$$noOperation": "this should be the value of /a/$$noOperation"
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should be possible to escape a keyword with an additional prefix character", function () {

        const object1 = {
            "a": {
                "aa": "this should be the value of /a/aa"
            }
        };

        const object2 = {
            "a": {
                "$$replace": "this should be the value of /a/$replace"
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should be possible to escape a keyword but the value should be processed", function () {

        const object1 = {
            "a": {
                "aa": "this should be the value of /a/aa"
            }
        };

        const object2 = {
            "a": {
                "$$replace": {
                    "$replace": "this should be the value of /a/$replace"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should be possible to use an operation name in a property name starting with one other character", function () {

        const object1 = {
            "@replace": {
                "aa": "this should be the value of /@replace/aa"
            }
        };

        const result = jsonMerger.mergeObjects([object1], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should be possible to use an operation name in a property name starting with two other characters", function () {

        const object1 = {
            "@@replace": {
                "aa": "this should be the value of /@@replace/aa"
            }
        };

        const result = jsonMerger.mergeObjects([object1], testConfig());

        expect(result).toMatchSnapshot();
    });
});

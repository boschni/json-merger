const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

jest.mock("fs");
const fs = require("fs");

describe("when merging two objects and a source property has a $afterMerges indicator", function () {

    test("it should process the $afterMerges property after processing all sources", function () {

        const object1 = {
            "a": {
                "$afterMerges": {
                    "$expression": "$source.b.prop"
                }
            }
        };

        const object2 = {
            "b": {
                "prop": {
                    "$replace": "this should be the value of a"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

describe("when merging two files and a source property has a $afterMerges indicator", function () {

    test("it should process the $afterMerges property after processing all sources", function () {

        const files = {
            "a.json": {
                "a": {
                    "$afterMerges": {
                        "$expression": "$source.b"
                    }
                }
            },
            "b.json": {
                "b": {
                    "$replace": "this should be the value of a"
                }
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeFiles(["a.json", "b.json"], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $import is used it should handle the phases correctly", function () {

        const files = {
            "a.json": {
                "a": {
                    "$import": "b.json"
                },
                "aa": {
                    "$replace": "this should be the value of /a/b"
                }
            },
            "b.json": {
                "b": {
                    "$afterMerges": {
                        "$expression": "$source.aa"
                    }
                }
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeFile("a.json", testConfig());

        expect(result).toMatchSnapshot();
    });
});

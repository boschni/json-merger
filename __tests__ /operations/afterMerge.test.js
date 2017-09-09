const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

jest.mock("fs");
const fs = require("fs");

describe("when merging two objects and a source property has a $afterMerge indicator", function () {

    test("it should process the $afterMerge property after processing the current source", function () {

        const object1 = {
            "a": {
                "$afterMerge": {
                    "$expression": "$source.a2"
                }
            },
            "a2": {
                "$replace": "This should be the value of /a"
            }
        };

        const object2 = {
            "b": "some value"
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

describe("when merging two files and a source property has a $afterMerge indicator", function () {

    test("it should process the $afterMerge property after processing the current source", function () {

        const files = {
            "a.json": {
                "a": {
                    "$afterMerge": {
                        "$expression": "$source.aa"
                    }
                },
                "aa": {
                    "$replace": "This should be the value of a"
                }
            },
            "b.json": {
                "aa": {
                    "$replace": "some value"
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
                }
            },
            "b.json": {
                "b": {
                    "$afterMerge": {
                        "$expression": "$source.bb"
                    }
                },
                "bb": {
                    "$replace": "This should be the value of /a/b"
                }
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeFile("a.json", testConfig());

        expect(result).toMatchSnapshot();
    });
});

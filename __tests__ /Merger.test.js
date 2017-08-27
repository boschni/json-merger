const {Merger} = require("../dist");
const {testConfig} = require("./__helpers__");

jest.mock("fs");
const fs = require("fs");

describe("Merger()", function () {

    test("should return the same result when processing the same file twice", function () {

        const files = {
            "a.json": {
                "a": {
                    "$replace": {
                        "with": 10
                    }
                }
            }
        };

        fs.__setJsonMockFiles(files);

        const merger = new Merger(testConfig());
        const result1 = merger.mergeFile("a.json");
        const result2 = merger.mergeFile("a.json");

        expect(result1).toBe(result2);
    });

    test("should cache previously loaded files when calling Merger.mergeFile()", function () {

        const files = {
            "a.json": {
                "a": {
                    "$replace": {
                        "with": 10
                    }
                }
            }
        };

        fs.readFileSync.mockClear();
        fs.__setJsonMockFiles(files);

        const merger = new Merger(testConfig());
        merger.mergeFile("a.json");
        merger.mergeFile("a.json");

        expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    });

    test("should cache previously loaded files when loaded from $import", function () {

        const files = {
            "a.json": {
                "a": {
                    "$import": "b.json"
                },
                "b": {
                    "$import": "b.json"
                }
            },
            "b.json": {
                "b": {
                    "$replace": {
                        "with": 10
                    }
                }
            }
        };

        fs.readFileSync.mockClear();
        fs.__setJsonMockFiles(files);

        const merger = new Merger(testConfig());
        merger.mergeFile("a.json");

        expect(fs.readFileSync).toHaveBeenCalledTimes(2);
    });

    test("should cache previously loaded files when merging multiple files", function () {

        const files = {
            "a.json": {
                "a": 10
            },
            "b.json": {
                "a": {
                    "$expression": "$targetProperty + 10"
                }
            }
        };

        fs.readFileSync.mockClear();
        fs.__setJsonMockFiles(files);

        const merger = new Merger(testConfig());
        merger.mergeFiles(["a.json", "b.json", "b.json"]);

        expect(fs.readFileSync).toHaveBeenCalledTimes(2);
    });
});

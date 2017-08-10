const {Merger} = require("..");

jest.mock("fs");

describe("Merger()", function () {

    test("should return the same result when compiling the same file twice", function () {

        const files = {
            "a.json": {
                "a": {
                    "$value": 10
                }
            }
        };

        const fs = require("fs");
        fs.__setJsonMockFiles(files);

        const merger = new Merger({stringify: true});
        const result1 = merger.fromFile("a.json");
        const result2 = merger.fromFile("a.json");

        expect(result1).toBe(result2);
    });

    test("should cache previously loaded files when calling Merger.fromFile()", function () {

        const files = {
            "a.json": {
                "a": {
                    "$value": 10
                }
            }
        };

        const fs = require("fs");
        fs.readFileSync.mockClear();
        fs.__setJsonMockFiles(files);

        const merger = new Merger();
        merger.fromFile("a.json");
        merger.fromFile("a.json");

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
                    "$value": 10
                }
            }
        };

        const fs = require("fs");
        fs.readFileSync.mockClear();
        fs.__setJsonMockFiles(files);

        const merger = new Merger();
        merger.fromFile("a.json");

        expect(fs.readFileSync).toHaveBeenCalledTimes(2);
    });

    test("should cache previously loaded files when loaded from $import", function () {

        const files = {
            "a.json": {
                "a": 10
            },
            "b.json": {
                "a": {
                    "$expression": "$target + 10"
                }
            }
        };

        const fs = require("fs");
        fs.readFileSync.mockClear();
        fs.__setJsonMockFiles(files);

        const merger = new Merger();
        merger.mergeFiles(["a.json", "b.json", "b.json"]);

        expect(fs.readFileSync).toHaveBeenCalledTimes(2);
    });
});

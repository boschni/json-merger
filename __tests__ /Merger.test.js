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

        fs.readFileSync.mockClear();
        fs.__setJsonMockFiles(files);

        const merger = new Merger(testConfig());
        merger.mergeFiles(["a.json", "b.json", "b.json"]);

        expect(fs.readFileSync).toHaveBeenCalledTimes(2);
    });

    describe(".addFile()", function () {

        test("should add a file so sources can reference it", function () {

            const aJson = {
                "a": 10
            };

            const files = {
                "b.json": {
                    "a": {
                        "$expression": "$target + 10"
                    }
                }
            };

            fs.readFileSync.mockClear();
            fs.__setJsonMockFiles(files);

            const merger = new Merger(testConfig());
            merger.addFile("a.json", aJson);
            const result = merger.mergeFiles(["a.json", "b.json", "b.json"]);

            expect(fs.readFileSync).toHaveBeenCalledTimes(1);
            expect(result).toMatchSnapshot();
        });

        test("should also work with relative paths", function () {

            const aJson = {
                "a": 10
            };

            const files = {
                "b.json": {
                    "a": {
                        "$expression": "$target + 10"
                    }
                }
            };

            fs.readFileSync.mockClear();
            fs.__setJsonMockFiles(files);

            const merger = new Merger(testConfig());
            merger.addFile("./a.json", aJson);
            const result = merger.mergeFiles(["./__tests__/../a.json", "b.json", "b.json"]);

            expect(fs.readFileSync).toHaveBeenCalledTimes(1);
            expect(result).toMatchSnapshot();
        });

        test("should also work with URLs", function () {

            const aJson = {
                "a": 10
            };

            const files = {
                "b.json": {
                    "a": {
                        "$expression": "$target + 10"
                    }
                }
            };

            fs.readFileSync.mockClear();
            fs.__setJsonMockFiles(files);

            const merger = new Merger(testConfig());
            merger.addFile("http://example.com/a.json", aJson);
            const result = merger.mergeFiles(["http://example.com/a.json", "b.json", "b.json"]);

            expect(fs.readFileSync).toHaveBeenCalledTimes(1);
            expect(result).toMatchSnapshot();
        });
    });
});

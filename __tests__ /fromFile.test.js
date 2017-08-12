const jsonMerger = require("../dist");
const {testConfig} = require("./__helpers__");

jest.mock("fs");
const fs = require("fs");

describe(".fromFile()", function () {

    test("should process a file if it exists and return the processed object if config.stringify is false", function () {

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

        const result = jsonMerger.fromFile("a.json", testConfig({
            stringify: false
        }));

        expect(result).toMatchSnapshot();
    });

    test("should be able to load an absolute path", function () {

        const files = {
            "/root/a.json": {
                "a": {
                    "$replace": {
                        "with": 10
                    }
                }
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.fromFile("/root/a.json");

        expect(result).toMatchSnapshot();
    });

    test("should return a pretty JSON string if config.stringify is 'pretty'", function () {

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

        const result = jsonMerger.fromFile("a.json", testConfig({
            stringify: "pretty"
        }));

        expect(result).toMatchSnapshot();
    });

    test("should return undefined if the file does not exist and config.throwOnInvalidRef is false", function () {

        const result = jsonMerger.fromFile("nonExisting.json", testConfig({
            throwOnInvalidRef: false
        }));

        expect(result).toBe(undefined);
    });

    test("should throw if the file does not exist and config.throwOnInvalidRef is true", function () {

        try {

            jsonMerger.fromFile("nonExisting.json", testConfig({
                throwOnInvalidRef: true
            }));

            expect("this code").toBe("unreachable");

        } catch (e) {
            expect(e.message).toMatch(/The file ".*nonExisting\.json" does not exist/);
        }
    });
});

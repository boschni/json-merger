const jsonMerger = require("..");
const helpers = require("../__helpers__");

jest.mock("fs");

describe(".fromFile()", function () {

    test("should process a file if it exists and return the processed object if config.stringify is false", function () {

        const files = {
            "a.json": {
                "a": {
                    "$value": 10
                }
            }
        };

        require("fs").__setJsonMockFiles(files);

        const result = jsonMerger.fromFile("a.json", {
            stringify: false
        });

        expect(result).toMatchSnapshot();
    });

    test("should be able to load an absolute path", function () {

        const files = {
            "/root/a.json": {
                "a": {
                    "$value": 10
                }
            }
        };

        require("fs").__setJsonMockFiles(files);

        const result = jsonMerger.fromFile("/root/a.json");

        expect(result).toMatchSnapshot();
    });

    test("should return a pretty JSON string if config.stringify is 'pretty'", function () {

        const files = {
            "a.json": {
                "a": {
                    "$value": 10
                }
            }
        };

        require("fs").__setJsonMockFiles(files);

        const result = jsonMerger.fromFile("a.json", {
            stringify: "pretty"
        });

        expect(result).toMatchSnapshot();
    });

    test("should return undefined if the file does not exist and config.throwOnInvalidRef is false", function () {

        const result = jsonMerger.fromFile("nonExisting.json", {
            throwOnInvalidRef: false
        });

        expect(result).toBe(undefined);
    });

    test("should throw if the file does not exist and config.throwOnInvalidRef is true", function () {

        try {

            jsonMerger.fromFile("nonExisting.json", {
                throwOnInvalidRef: true
            });

            expect("this code").toBe("unreachable");

        } catch (e) {

            helpers.expectStringWithMatchers(e.message, [
                expect.stringMatching(/The file ".*nonExisting\.json" does not exist/)
            ]);
        }
    });
});

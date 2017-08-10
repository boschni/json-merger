const jsonMerger = require("..");
const helpers = require("../__helpers__");

jest.mock("fs");

describe(".mergeFiles()", function () {

    test("should process the files if they exist and return the processed object if config.stringify is false", function () {

        const files = {
            "a.json": {
                "a": {
                    "$value": 10
                }
            },
            "b.json": {
                "b": {
                    "$value": 20
                }
            }
        };

        require("fs").__setJsonMockFiles(files);

        const result = jsonMerger.mergeFiles(["a.json", "b.json"], {
            stringify: false
        });

        expect(result).toMatchSnapshot();
    });

    test("should merge the files in order", function () {

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

        require("fs").__setJsonMockFiles(files);

        const result = jsonMerger.mergeFiles(["a.json", "b.json", "b.json"], {
            stringify: false
        });

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

        const result = jsonMerger.mergeFiles(["a.json"], {
            stringify: "pretty"
        });

        expect(result).toMatchSnapshot();
    });

    test("should return undefined if the file does not exist and config.throwOnInvalidRef is false", function () {

        const result = jsonMerger.mergeFiles(["nonExisting.json"], {
            throwOnInvalidRef: false
        });

        expect(result).toBe(undefined);
    });

    test("should throw if the file does not exist and config.throwOnInvalidRef is true", function () {

        try {

            jsonMerger.mergeFiles(["nonExisting.json"], {
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

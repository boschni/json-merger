const jsonMerger = require("../dist");
const {testConfig} = require("./__helpers__");

jest.mock("fs");
const fs = require("fs");

describe(".mergeFiles()", function () {

    test("should process the files if they exist and return the processed object if config.stringify is false", function () {

        const files = {
            "a.json": {
                "a": {
                    "$replace": 10
                }
            },
            "b.json": {
                "b": {
                    "$replace": 20
                }
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeFiles(["a.json", "b.json"], testConfig({
            stringify: false
        }));

        expect(result).toMatchSnapshot();
    });

    test("should merge the files in order", function () {

        const files = {
            "a.json": {
                "a": 10
            },
            "b.json": {
                "a": {
                    "$expression": "$currentTargetProperty + 10"
                }
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeFiles(["a.json", "b.json", "b.json"], testConfig({
            stringify: false
        }));

        expect(result).toMatchSnapshot();
    });

    test("should return a pretty JSON string if config.stringify is 'pretty'", function () {

        const files = {
            "a.json": {
                "a": {
                    "$replace": 10
                }
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeFiles(["a.json"], testConfig({
            stringify: "pretty"
        }));

        expect(result).toMatchSnapshot();
    });

    test("should return undefined if the file does not exist and config.errorOnInvalidImport is false", function () {

        const result = jsonMerger.mergeFiles(["nonExisting.json"], testConfig({
            errorOnInvalidImport: false
        }));

        expect(result).toBe(undefined);
    });

    test("should throw if the file does not exist and config.errorOnInvalidImport is true", function () {

        try {

            jsonMerger.mergeFiles(["nonExisting.json"], testConfig({
                errorOnInvalidImport: true
            }));

            expect("this code").toBe("unreachable");

        } catch (e) {
            expect(e.message).toMatch(/The file ".*nonExisting\.json" does not exist/);
        }
    });
});

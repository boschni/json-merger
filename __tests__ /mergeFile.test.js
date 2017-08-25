const jsonMerger = require("../dist");
const {testConfig} = require("./__helpers__");

jest.mock("fs");
const fs = require("fs");

describe(".mergeFile()", function () {

    test("should process a file if it exists and return the result", function () {

        const files = {
            "a.json": {
                "a": {
                    "$replace": 10
                }
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeFile("a.json", testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should use the config object", function () {

        const files = {
            "a.json": {
                "a": "this should not be pretty printed"
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeFile("a.json", testConfig({
            stringify: false
        }));

        expect(result).toMatchSnapshot();
    });

    test("should be able to load an absolute path", function () {

        const files = {
            "/root/a.json": {
                "a": {
                    "$replace": 10
                }
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeFile("/root/a.json");

        expect(result).toMatchSnapshot();
    });

    test("should return undefined if the file does not exist and Config.errorOnFileNotFound is false", function () {

        const result = jsonMerger.mergeFile("nonExisting.json", testConfig({
            errorOnFileNotFound: false
        }));

        expect(result).toBe(undefined);
    });

    test("should throw if the file does not exist and Config.errorOnFileNotFound is true", function () {

        try {

            jsonMerger.mergeFile("nonExisting.json", testConfig({
                errorOnFileNotFound: true
            }));

            expect("this code").toBe("unreachable");

        } catch (e) {
            expect(e.message).toMatch(/The file ".*nonExisting\.json" does not exist/);
        }
    });

    test("should process YAML files", function () {

        let yaml = `
        a:
          aa:
            $replace: replaced
        `;

        const files = {
            "a.yaml": yaml
        };

        fs.__setJsonMockFiles(files, false);

        const result = jsonMerger.mergeFile("a.yaml", testConfig());

        expect(result).toMatchSnapshot();
    });
});

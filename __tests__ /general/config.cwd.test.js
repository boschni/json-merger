const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

jest.mock("fs");
const fs = require("fs");

describe("when config.cwd is set", function () {

    test("it should try to load files relative to config.cwd", function () {

        const files = {
            "test/a.json": {
                "object": "this should be the value of /object"
            }
        };

        const object = {
            "$import": "a.json"
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeObject(object, testConfig({
            cwd: "./test"
        }));

        expect(result).toMatchSnapshot();
    });
});

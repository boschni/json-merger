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

    test("it should be possible to change it with Merger.setConfig", function () {

        const files = {
            "test/a.json": {
                "object": "this should be the value of /object"
            },
            "test2/a.json": {
                "object": "this should be the value of /object"
            }
        };

        const object = {
            "$import": "a.json"
        };

        const object2 = {
            "$import": "a.json"
        };

        fs.__setJsonMockFiles(files);

        const merger = new jsonMerger.Merger(testConfig({
            cwd: "./test"
        }));

        const result1 = merger.mergeObject(object);

        merger.setConfig(testConfig({
            cwd: "./test2"
        }));

        const result2 = merger.mergeObject(object2);

        expect([result1, result2]).toMatchSnapshot();
    });
});

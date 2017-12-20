const {Merger} = require("../dist");
const {testConfig} = require("./__helpers__");

jest.mock("fs");
const fs = require("fs");

describe("when `Processor.processSourceProperty()` returns undefined", function () {

    test("it should delete the object key", function () {

        const files = {
            "a.json": {
                "a": {
                    "$remove": true
                }
            }
        };

        fs.__setJsonMockFiles(files);

        const merger = new Merger(testConfig());

        // note: do not stringify the result, we need to test against the result object
        const result = merger.mergeFile("a.json", {stringify: false});

        expect(result.hasOwnProperty('a')).toBe(false);
    });
});

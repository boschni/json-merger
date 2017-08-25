const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when config.operationPrefix is set", function () {

    test("it should only process keywords beginning with the config.operationPrefix", function () {

        const object = {
            "a": {
                "@replace": "this should be the value of a",
            },
            "$replace": "this should be visible"
        };

        const result = jsonMerger.mergeObject(object, testConfig({
            operationPrefix: "@"
        }));

        expect(result).toMatchSnapshot();
    });
});

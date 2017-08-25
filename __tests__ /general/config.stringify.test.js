const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when config.stringify is set", function () {

    test("to false it should not stringify the output", function () {

        const object = {
            "a": {
                "$replace": 1
            }
        };

        const result = jsonMerger.mergeObject(object, testConfig({
            stringify: false
        }));

        expect(result).toMatchSnapshot();
    });

    test("to true it should stringify the output", function () {

        const object = {
            "a": {
                "$replace": 1
            }
        };

        const result = jsonMerger.mergeObject(object, testConfig({
            stringify: true
        }));

        expect(result).toMatchSnapshot();
    });

    test("to 'pretty' it should stringify the output with tabs and newlines", function () {

        const object = {
            "a": {
                "$replace": 1
            }
        };

        const result = jsonMerger.mergeObject(object, testConfig({
            stringify: "pretty"
        }));

        expect(result).toMatchSnapshot();
    });
});

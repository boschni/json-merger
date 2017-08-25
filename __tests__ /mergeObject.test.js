const jsonMerger = require("../dist");
const {testConfig} = require("./__helpers__");

describe(".mergeObject()", function () {

    test("should process the object and return the result", function () {

        const object = {
            "a": {
                "$replace": "this should be the value of a",
            }
        };

        const result = jsonMerger.mergeObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should use the config object", function () {

        const object = {
            "a": "this should not be pretty printed"
        };

        const result = jsonMerger.mergeObject(object, testConfig({
            stringify: false
        }));

        expect(result).toMatchSnapshot();
    });
});

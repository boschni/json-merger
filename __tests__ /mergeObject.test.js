const jsonMerger = require("../dist");
const {testConfig} = require("./__helpers__");

describe(".mergeObject() should process the object and return", function () {

    test("the processed object if config.operationPrefix is @", function () {

        const object = {
            "a": {
                "@replace": 1,
            },
            "$replace": 2
        };

        const result = jsonMerger.mergeObject(object, testConfig({
            operationPrefix: "@"
        }));

        expect(result).toMatchSnapshot();
    });

    test("the processed object if config.stringify is false", function () {

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

    test("a JSON string if config.stringify is true", function () {

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

    test("a pretty JSON string if config.stringify is 'pretty'", function () {

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

const jsonMerger = require("../dist");
const {testConfig} = require("./__helpers__");

describe(".fromObject() should process the object and return", function () {

    test("the processed object if config.indicatorPrefix is @", function () {

        const object = {
            "a": {
                "@replace": {
                    "with": 1
                },
            },
            "$replace": {
                "with": 2
            }
        };

        const result = jsonMerger.fromObject(object, testConfig({
            indicatorPrefix: "@"
        }));

        expect(result).toMatchSnapshot();
    });

    test("the processed object if config.stringify is false", function () {

        const object = {
            "a": {
                "$replace": {
                    "with": 1
                }
            }
        };

        const result = jsonMerger.fromObject(object, testConfig({
            stringify: false
        }));

        expect(result).toMatchSnapshot();
    });

    test("a JSON string if config.stringify is true", function () {

        const object = {
            "a": {
                "$replace": {
                    "with": 1
                }
            }
        };

        const result = jsonMerger.fromObject(object, testConfig({
            stringify: true
        }));

        expect(result).toMatchSnapshot();
    });

    test("a pretty JSON string if config.stringify is 'pretty'", function () {

        const object = {
            "a": {
                "$replace": {
                    "with": 1
                }
            }
        };

        const result = jsonMerger.fromObject(object, testConfig({
            stringify: "pretty"
        }));

        expect(result).toMatchSnapshot();
    });
});

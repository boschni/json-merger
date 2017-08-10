const helpers = require("../__helpers__");

describe(".fromObject() should process the object and return", function () {

    test("the processed object if config.indicatorPrefix is @", function () {

        const object = {
            "a": {
                "@value": 1,
            },
            "$value": 2
        };

        const result = helpers.fromObject(object, {
            indicatorPrefix: "@"
        });

        expect(result).toMatchSnapshot();
    });

    test("the processed object if config.stringify is false", function () {

        const object = {
            "a": {
                "$value": 1
            }
        };

        const result = helpers.fromObject(object, {
            stringify: false
        });

        expect(result).toMatchSnapshot();
    });

    test("a JSON string if config.stringify is true", function () {

        const object = {
            "a": {
                "$value": 1
            }
        };

        const result = helpers.fromObject(object, {
            stringify: true
        });

        expect(result).toMatchSnapshot();
    });

    test("a pretty JSON string if config.stringify is 'pretty'", function () {

        const object = {
            "a": {
                "$value": 1
            }
        };

        const result = helpers.fromObject(object, {
            stringify: "pretty"
        });

        expect(result).toMatchSnapshot();
    });
});

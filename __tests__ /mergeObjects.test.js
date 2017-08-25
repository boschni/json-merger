const jsonMerger = require("../dist");
const {testConfig} = require("./__helpers__");

describe(".mergeObjects()", function () {

    test("should process the objects and return the result", function () {

        const object1 = {
            "a": {
                "$replace": "this should be the value of a",
            }
        };

        const object2 = {
            "b": {
                "$replace": "this should be the value of b",
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should use the config object", function () {

        const object1 = {
            "a": {
                "$replace": "this should be the value of a and not be pretty printed",
            }
        };

        const object2 = {
            "b": {
                "$replace": "this should be the value of b and not be pretty printed",
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig({
            stringify: false
        }));

        expect(result).toMatchSnapshot();
    });
});


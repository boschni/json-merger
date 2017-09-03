const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when merging two objects and a source object contains a $select operation", function () {

    test("and $select is a string it should treat it as a json pointer and select a value in the source", function () {

        const object = {
            "a": {
                "$select": "/b/0"
            },
            "b": [
                "should be the value of /a"
            ]
        };

        const result = jsonMerger.mergeObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $select.path is set it should use the json pointer to select a value in the source", function () {

        const object = {
            "a": {
                "$select": {
                    "path": "/b/0"
                }
            },
            "b": [
                "should be the value of /a"
            ]
        };

        const result = jsonMerger.mergeObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $select.query is set it should use the json path to select a value in the source", function () {

        const object = {
            "a": {
                "$select": {
                    "query": "$.b[1]"
                }
            },
            "b": [
                "should not be the value of /a",
                "should be the value of /a"
            ]
        };

        const result = jsonMerger.mergeObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and a $select.query matching multiple elements is set but $select.multiple is not set it should return the first value", function () {

        const object = {
            "a": {
                "$select": {
                    "query": "$.b[*]"
                }
            },
            "b": [
                "should be the value of /a",
                "should not be the value of /a"
            ]
        };

        const result = jsonMerger.mergeObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and a $select.query matching multiple elements is set and $select.multiple is true it should return an array with all matches", function () {

        const object = {
            "a": {
                "$select": {
                    "query": "$.b[*]",
                    "multiple": true
                }
            },
            "b": [
                "should be in the /a array",
                "should also be in the /a array"
            ]
        };

        const result = jsonMerger.mergeObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $select.path refers to a non existing path it should throw if Config.errorOnRefNotFound is true", function () {

        try {

            const object = {
                "a": {
                    "$select": {
                        "path": "/nonExisting/1"
                    }
                }
            };

            jsonMerger.mergeObject(object, testConfig({
                errorOnRefNotFound: true
            }));

            expect("this code").toBe("unreachable");

        } catch (e) {
            expect(e.message).toMatch(`An error occurred while processing the property "$select"`);
            expect(e.message).toMatch(`at #/a/$select`);
            expect(e.message).toMatch(`The JSON pointer "/nonExisting/1" resolves to undefined`);
        }
    });

    test("and $select.query refers to a non existing path it should throw if Config.errorOnRefNotFound is true", function () {

        try {

            const object = {
                "a": {
                    "$select": {
                        "query": "$.nonExisting.1"
                    }
                }
            };

            jsonMerger.mergeObject(object, testConfig({
                errorOnRefNotFound: true
            }));

            expect("this code").toBe("unreachable");

        } catch (e) {
            expect(e.message).toMatch(`An error occurred while processing the property "$select"`);
            expect(e.message).toMatch(`at #/a/$select`);
            expect(e.message).toMatch(`The JSON path "$.nonExisting.1" resolves to undefined`);
        }
    });

    test("and $select.from is set it should process the $select.from value and select from the result", function () {

        const object = {
            "a": {
                "$select": {
                    "from": {
                        "$replace": "should be the value of /a"
                    },
                    "path": "/"
                }
            }
        };

        const result = jsonMerger.mergeObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });
});

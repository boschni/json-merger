const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

jest.mock("fs");
const fs = require("fs");

describe("when processing an object containing an $include operation", function () {

    test("it should resolve to the file defined in the $include property", function () {

        const files = {
            "a.json": {
                "b": "This should be the value of /a/b"
            }
        };

        const object = {
            "a": {
                "$include": "a.json"
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should process the file content in the current scope", function () {

        const files = {
            "a.json": {
                "$expression": "$source.b"
            }
        };

        const object = {
            "a": {
                "$include": "a.json"
            },
            "b": "This should be the value of /a"
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and used in an source array item it should process the file content as array item source", function () {

        const files = {
            "move.json": {
                "$move": "-"
            }
        };

        const object1 = {
            "a": [
                "should be the third item",
                "should be the first item",
                "should be the second item"
            ]
        };

        const object2 = {
            "a": [
                {
                    "$include": "move.json"
                }
            ]
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

jest.mock("fs");
const fs = require("fs");

describe("when config.params is set", function () {

    test("it should expose the property in the source as $params property", function () {

        const object1 = {
            "object1Params": {
                "$expression": "$params"
            }
        };

        const object2 = {
            "object2Params": {
                "$expression": "$params"
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig({
            params: {
                "prop": "this is the params object"
            }
        }));

        expect(result).toMatchSnapshot();
    });

    test("it should be possible to override the $params property when using $import", function () {

        const files = {
            "a.json": {
                "params": {
                    "$expression": "$params"
                }
            }
        };

        const object1 = {
            "object1": {
                "params": {
                    "$expression": "$params"
                }
            }
        };

        const object2 = {
            "object2": {
                "$import": {
                    "path": "a.json",
                    "params": {
                        "prop": "this is the import params object"
                    }
                }
            }
        };

        const object3 = {
            "object3": {
                "params": {
                    "$expression": "$params"
                }
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeObjects([object1, object2, object3], testConfig({
            params: {
                "prop": "this is the params object"
            }
        }));

        expect(result).toMatchSnapshot();
    });

    test("should not cache an imported file or files imported by the imported file if the params are different", function () {

        const files = {
            "a.json": {
                "a": {
                    "$import": {
                        "path": "b.json",
                        "params": {
                            "prop": "first params prop"
                        }
                    }
                },
                "b": {
                    "$import": {
                        "path": "b.json",
                        "params": {
                            "prop": "second params prop"
                        }
                    }
                }
            },
            "b.json": {
                "$import": "c.json"
            },
            "c.json": {
                "$expression": "$params"
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeFile("a.json", testConfig());

        expect(result).toMatchSnapshot();
    });
});

const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

jest.mock("fs");
const fs = require("fs");

describe("when processing an object containing an $import operation it", function () {

    test("should resolve to the file defined in the $import property", function () {

        const files = {
            "a.json": {
                "b": 100
            }
        };

        const object = {
            "a": {
                "$import": "a.json"
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should resolve the file path relative to the current file", function () {

        const files = {
            "a.json": {
                "$import": "sub/b.json"
            },
            "sub/b.json": {
                "$import": "c.json"
            },
            "sub/c.json": {
                "b": "this should be the value of /a/b"
            }
        };

        const object = {
            "a": {
                "$import": "a.json"
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should resolve to the processed file", function () {

        const files = {
            "a.json": {
                "$replace": "processed"
            }
        };

        const object = {
            "a": {
                "$import": "a.json"
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $import.params is set it should process it and use the property as source params", function () {

        const files = {
            "a.json": {
                "params": {
                    "$expression": "$params"
                }
            }
        };

        const object = {
            "a": {
                "$import": {
                    "path": "a.json",
                    "params": {
                        "$replace": {
                            "prop": "this should be in params"
                        }
                    }
                }
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should resolve to a property in the processed file if also a json pointer is given", function () {

        const files = {
            "a.json": {
                "b": {
                    "bb": {
                        "$replace": "processed"
                    }
                }
            }
        };

        const object = {
            "a": {
                "$import": "a.json#/b/bb"
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should resolve to undefined if the file does not exist and Config.errorOnFileNotFound is false", function () {

        const object = {
            "a": {
                "$import": "non_existing.json"
            }
        };

        const result = jsonMerger.mergeObject(object, testConfig({
            errorOnFileNotFound: false
        }));

        expect(result).toMatchSnapshot();
    });

    test("should resolve to undefined if the file does exist but the pointer does not and opConfig.errorOnRefNotFound is false", function () {

        const files = {
            "a.json": {
                "a": 10
            }
        };

        const object = {
            "a": {
                "$import": "a.json#/a/nonExisting"
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeObject(object, testConfig({
            errorOnRefNotFound: false
        }));

        expect(result).toMatchSnapshot();
    });

    test("should throw if the file does not exist and Config.errorOnFileNotFound is true", function () {

        try {

            const object = {
                "a": {
                    "$import": "non_existing.json"
                }
            };

            jsonMerger.mergeObject(object, testConfig({
                errorOnFileNotFound: true
            }));

            expect("this code").toBe("unreachable");

        } catch (e) {
            expect(e.message).toMatch(`An error occurred while processing the property "$import"`);
            expect(e.message).toMatch(`at #/a/$import`);
            expect(e.message).toMatch(/The file ".*non_existing\.json" does not exist/);
        }
    });

    test("should throw with a processing stack trace if the files do exist but the pointer does not exist and Config.errorOnRefNotFound is true", function () {

        try {

            const files = {
                "b.json": {
                    "b": {
                        "$import": "c.json"
                    }
                },
                "c.json": {
                    "c": 100
                }
            };

            const object = {
                "a": {
                    "$import": "b.json#/b/c/nonExisting"
                }
            };

            fs.__setJsonMockFiles(files);

            jsonMerger.mergeObject(object, testConfig({
                errorOnRefNotFound: true
            }));

            expect("this code").toBe("unreachable");

        } catch (e) {
            expect(e.message).toMatchSnapshot();
        }
    });

    test("should throw with a nested processing stack trace if the files do exist but a nested import does not exist and Config.errorOnFileNotFound is true", function () {

        try {

            const files = {
                "b.json": {
                    "b": {
                        "$import": "c.json"
                    }
                },
                "c.json": {
                    "c": {
                        "$import": "d.json"
                    }
                }
            };

            const object = {
                "a": {
                    "$import": "b.json#/b/c/nonExisting"
                }
            };

            fs.__setJsonMockFiles(files);

            jsonMerger.mergeObject(object, testConfig({
                errorOnFileNotFound: true
            }));

            expect("this code").toBe("unreachable");

        } catch (e) {
            const messageWithoutPaths = e.message.split(process.cwd()).join("/fake/path");
            expect(messageWithoutPaths).toMatchSnapshot();
        }
    });

    describe("and $import is an array containing multiple imports", function () {

        test("should resolve to the processed files and merge them in the order they are defined before returning the result", function () {

            const files = {
                "a.json": {
                    "a": {
                        "aa": {
                            "$replace": "processed a.a.aa"
                        }
                    },
                    "b": {
                        "bb": {
                            "$replace": "processed a.b.bb"
                        }
                    }
                },
                "b.json": {
                    "a": {
                        "bb": "added by b.json"
                    },
                    "b": {
                        "$replace": "replaced by b.json"
                    }
                }
            };

            const object = {
                "a": {
                    "$import": ["a.json", "b.json"]
                }
            };

            fs.__setJsonMockFiles(files);

            const result = jsonMerger.mergeObject(object, testConfig());

            expect(result).toMatchSnapshot();
        });
    });
});

const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

jest.mock("fs");
const fs = require("fs");

describe("containing a local pointer", function () {

    test("should resolve to the referenced value", function () {

        const object = {
            "a": {
                "aa": 10
            },
            "b": {
                "$ref": "/a"
            }
        };

        const result = jsonMerger.fromObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should also resolve to the referenced value if the pointer begins with a fragment identifier", function () {

        const object = {
            "a": {
                "aa": 10
            },
            "b": {
                "$ref": "#/a"
            }
        };

        const result = jsonMerger.fromObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should resolve to the unprocessed referenced value", function () {

        const object = {
            "a": {
                "$replace": {
                    "with": {
                        "aa": 10
                    }
                }
            },
            "b": {
                "$ref": "/a/$replace/with/aa"
            }
        };

        const result = jsonMerger.fromObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should process the result of the reference in the context of $ref", function () {

        const object = {
            "a": {
                "$$ref": "/c"
            },
            "b": {
                "$ref": "/a"
            }
        };

        const result = jsonMerger.fromObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should resolve a deep path", function () {

        const object = {
            "a": {
                "aa": [
                    1,
                    2,
                    3
                ]
            },
            "b": {
                "$ref": "/a/aa/2"
            }
        };

        const result = jsonMerger.fromObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should not resolve a deep path containing a $ref", function () {

        const object = {
            "a": {
                "aa": 10
            },
            "b": {
                "bb": {
                    "$ref": "/a"
                }
            },
            "c": {
                "$ref": "/b/bb/aa"
            }
        };

        const result = jsonMerger.fromObject(object, testConfig({
            throwOnInvalidRef: false
        }));

        expect(result).toMatchSnapshot();
    });

    test("should resolve to undefined if it does not exist and options.throwOnInvalidRef is false", function () {

        const object = {
            "a": {
                "$ref": "/nonExisting"
            }
        };

        const result = jsonMerger.fromObject(object, testConfig({
            throwOnInvalidRef: false
        }));

        expect(result).toMatchSnapshot();
    });

    test("should throw if it does not exist and options.throwOnInvalidRef is true", function () {

        try {

            const object = {
                "a": {
                    "$ref": "/nonExisting"
                }
            };

            jsonMerger.fromObject(object, testConfig({
                throwOnInvalidRef: true
            }));

            expect("this code").toBe("unreachable");

        } catch (e) {
            expect(e.message).toMatch(`An error occurred while processing the property "$ref"`);
            expect(e.message).toMatch(`at #/a/$ref`);
            expect(e.message).toMatch(`The ref "/nonExisting" does not exist`);
        }
    });

    test("should throw if it does exist but contains a $ref that does not exist and options.throwOnInvalidRef is true", function () {

        try {

            const object = {
                "a": {
                    "$ref": "/b/bb/bbb"
                },
                "b": {
                    "bb": {
                        "bbb": {
                            "$ref": "/nonExisting"
                        }
                    }
                }
            };

            jsonMerger.fromObject(object, testConfig({
                throwOnInvalidRef: true
            }));

            expect("this code").toBe("unreachable");

        } catch (e) {
            expect(e.message).toMatch(`An error occurred while processing the property "$ref"`);
            expect(e.message).toMatch(`at #/$ref`);
            expect(e.message).toMatch(`at #/a/$ref`);
            expect(e.message).toMatch(`The ref "/nonExisting" does not exist`);
        }
    });
});

describe("containing a file pointer", function () {

    test("should resolve to the unprocessed file", function () {

        const files = {
            "a.json": {
                "b": 100
            }
        };

        const object = {
            "a": {
                "$ref": "a.json"
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.fromObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should resolve to the unprocessed file and return the referenced value if also a pointer is given", function () {

        const files = {
            "a.json": {
                "b": 100
            }
        };

        const object = {
            "a": {
                "$ref": "a.json#/b"
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.fromObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and used in an source array item it should merge the $ref result with the target", function () {

        const files = {
            "a.json": {
                "$replace": {
                    "with": "replaced"
                }
            }
        };

        const object1 = {
            "a": [
                {
                    "a": 1
                }
            ]
        };

        const object2 = {
            "a": [
                {
                    "$ref": "a.json"
                }
            ]
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("should resolve to undefined if the file does not exist and options.throwOnInvalidRef is false", function () {

        const object = {
            "a": {
                "aa": {
                    "$ref": "non_existing.json"
                }
            }
        };

        const result = jsonMerger.fromObject(object, testConfig({
            throwOnInvalidRef: false
        }));

        expect(result).toMatchSnapshot();
    });

    test("should resolve to undefined if the file does exist but the pointer does not and options.throwOnInvalidRef is false", function () {

        const files = {
            "a.json": {
                "a": 10
            }
        };

        const object = {
            "a": {
                "$ref": "a.json#/a/nonExisting"
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.fromObject(object, testConfig({
            throwOnInvalidRef: false
        }));

        expect(result).toMatchSnapshot();
    });

    test("should throw if the file does not exist and options.throwOnInvalidRef is true", function () {

        try {

            const object = {
                "a": {
                    "$ref": "non_existing.json"
                }
            };

            jsonMerger.fromObject(object, testConfig({
                throwOnInvalidRef: true
            }));

            expect("this code").toBe("unreachable");

        } catch (e) {
            expect(e.message).toMatch(`An error occurred while processing the property "$ref"`);
            expect(e.message).toMatch(`at #/a/$ref`);
            expect(e.message).toMatch(/The file ".*non_existing\.json" does not exist/);
        }
    });

    test("should throw with a nested processing stack trace if the files do exist but the pointer does not exist and options.throwOnInvalidRef is true", function () {

        try {

            const files = {
                "a.json": {
                    "a": {
                        "$ref": "b.json"
                    }
                },
                "b.json": {
                    "b": 100
                }
            };

            const object = {
                "a": {
                    "$ref": "a.json#/a/b/nonExisting"
                }
            };

            fs.__setJsonMockFiles(files);

            jsonMerger.fromObject(object, testConfig({
                throwOnInvalidRef: true
            }));

            expect("this code").toBe("unreachable");

        } catch (e) {
            expect(e.message).toMatch(`An error occurred while processing the property "$ref"`);
            expect(e.message).toMatch(`at #/a/$ref`);
            expect(e.message).toMatch(/The ref "\/a\/b\/nonExisting" does not exist/);
        }
    });
});

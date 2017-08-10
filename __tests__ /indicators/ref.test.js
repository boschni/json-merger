const helpers = require("../../__helpers__");

jest.mock("fs");

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

        const result = helpers.fromObject(object);

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

        const result = helpers.fromObject(object);

        expect(result).toMatchSnapshot();
    });

    test("should resolve to the uncompiled referenced value", function () {

        const object = {
            "a": {
                "$value": {
                    "aa": 10
                }
            },
            "b": {
                "$ref": "/a/$value/aa"
            }
        };

        const result = helpers.fromObject(object);

        expect(result).toMatchSnapshot();
    });

    test("should compile the result of the reference in the context of $ref", function () {

        const object = {
            "a": {
                "$set": {
                    "key": "$ref",
                    "value": "/c"
                }
            },
            "b": {
                "$ref": "/a"
            }
        };

        const result = helpers.fromObject(object);

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

        const result = helpers.fromObject(object);

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

        const result = helpers.fromObject(object, {
            throwOnInvalidRef: false
        });

        expect(result).toMatchSnapshot();
    });

    test("should resolve to undefined if it does not exist and options.throwOnInvalidRef is false", function () {

        const object = {
            "a": {
                "$ref": "/nonExisting"
            }
        };

        const result = helpers.fromObject(object, {
            throwOnInvalidRef: false
        });

        expect(result).toMatchSnapshot();
    });

    test("should throw if it does not exist and options.throwOnInvalidRef is true", function () {

        try {

            const object = {
                "a": {
                    "$ref": "/nonExisting"
                }
            };

            helpers.fromObject(object, {
                throwOnInvalidRef: true
            });

            expect("this code").toBe("unreachable");

        } catch (e) {

            helpers.expectStringWithMatchers(e.message, [
                expect.stringContaining(`An error occurred while processing the property "$ref"`),
                expect.stringContaining(`at #/a/$ref`),
                expect.stringContaining(`The ref "/nonExisting" does not exist`)
            ]);
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

            helpers.fromObject(object, {
                throwOnInvalidRef: true
            });

            expect("this code").toBe("unreachable");

        } catch (e) {

            helpers.expectStringWithMatchers(e.message, [
                expect.stringContaining(`An error occurred while processing the property "$ref"`),
                expect.stringContaining(`at #/$ref`),
                expect.stringContaining(`at #/a/$ref`),
                expect.stringContaining(`The ref "/nonExisting" does not exist`)
            ]);
        }
    });
});

describe("containing a file pointer", function () {

    test("should resolve to the uncompiled file", function () {

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

        require("fs").__setJsonMockFiles(files);

        const result = helpers.fromObject(object);

        expect(result).toMatchSnapshot();
    });

    test("should resolve to the uncompiled file and return the referenced value if also a pointer is given", function () {

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

        require("fs").__setJsonMockFiles(files);

        const result = helpers.fromObject(object);

        expect(result).toMatchSnapshot();
    });

    test("TODO: what should happen here?", function () {

        const files = {
            "removeSecondItem.json": {
                "$match": "$[1]",
                "$remove": true
            }
        };

        const object1 = {
            "a": [
                1,
                2,
                3
            ]
        };

        const object2 = {
            "a": [
                {
                    "$ref": "removeSecondItem.json"
                },
                {
                    "$append": true,
                    "$value": 5
                }
            ]
        };

        require("fs").__setJsonMockFiles(files);

        const result = helpers.mergeObjects([object1, object2]);

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

        const result = helpers.fromObject(object, {
            throwOnInvalidRef: false
        });

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

        require("fs").__setJsonMockFiles(files);

        const result = helpers.fromObject(object, {
            throwOnInvalidRef: false
        });

        expect(result).toMatchSnapshot();
    });

    test("should throw if the file does not exist and options.throwOnInvalidRef is true", function () {

        try {

            const object = {
                "a": {
                    "$ref": "non_existing.json"
                }
            };

            helpers.fromObject(object, {
                throwOnInvalidRef: true
            });

            expect("this code").toBe("unreachable");

        } catch (e) {

            helpers.expectStringWithMatchers(e.message, [
                expect.stringContaining(`An error occurred while processing the property "$ref"`),
                expect.stringContaining(`at #/a/$ref`),
                expect.stringMatching(/The file ".*non_existing\.json" does not exist/)
            ]);
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

            require("fs").__setJsonMockFiles(files);

            helpers.fromObject(object, {
                throwOnInvalidRef: true
            });

            expect("this code").toBe("unreachable");

        } catch (e) {

            helpers.expectStringWithMatchers(e.message, [
                expect.stringContaining(`An error occurred while processing the property "$ref"`),
                expect.stringContaining(`at #/a/$ref`),
                expect.stringMatching(/The ref "\/a\/b\/nonExisting" does not exist/)
            ]);
        }
    });
});

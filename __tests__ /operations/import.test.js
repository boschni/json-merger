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

    test("should resolve to undefined if the file does not exist and options.errorOnInvalidImport is false", function () {

        const object = {
            "a": {
                "$import": "non_existing.json"
            }
        };

        const result = jsonMerger.mergeObject(object, testConfig({
            errorOnInvalidImport: false
        }));

        expect(result).toMatchSnapshot();
    });

    test("should resolve to undefined if the file does exist but the pointer does not and options.errorOnInvalidImport is false", function () {

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
            errorOnInvalidImport: false
        }));

        expect(result).toMatchSnapshot();
    });

    test("should throw if the file does not exist and options.errorOnInvalidImport is true", function () {

        try {

            const object = {
                "a": {
                    "$import": "non_existing.json"
                }
            };

            jsonMerger.mergeObject(object, testConfig({
                errorOnInvalidImport: true
            }));

            expect("this code").toBe("unreachable");

        } catch (e) {
            expect(e.message).toMatch(`An error occurred while processing the property "$import"`);
            expect(e.message).toMatch(`at #/a/$import`);
            expect(e.message).toMatch(/The file ".*non_existing\.json" does not exist/);
        }
    });

    test("should throw with a nested processing stack trace if the files do exist but the pointer does not exist and options.errorOnInvalidImport is true", function () {

        try {

            const files = {
                "a.json": {
                    "a": {
                        "$import": "b.json"
                    }
                },
                "b.json": {
                    "b": 100
                }
            };

            const object = {
                "a": {
                    "$import": "a.json#/a/b/nonExisting"
                }
            };

            fs.__setJsonMockFiles(files);

            jsonMerger.mergeObject(object, testConfig({
                errorOnInvalidImport: true
            }));

            expect("this code").toBe("unreachable");

        } catch (e) {
            expect(e.message).toMatch(`An error occurred while processing the property "$import"`);
            expect(e.message).toMatch(`at #/a/$import`);
            expect(e.message).toMatch(/The ref "\/a\/b\/nonExisting" does not exist/);
        }
    });

    describe("and $import.process is set to false it", function () {

        test("should resolve to the unprocessed file", function () {

            const files = {
                "a.json": {
                    "$replace": 100
                }
            };

            const object = {
                "$import": {
                    "file": "a.json",
                    "process": false
                }
            };

            fs.__setJsonMockFiles(files);

            const result = jsonMerger.mergeObject(object, testConfig());

            expect(result).toMatchSnapshot();
        });

        test("should resolve to the unprocessed file but the operations will be applied when merging with an other object", function () {

            const files = {
                "a.json": {
                    "$replace": {
                        "bb": "replaced"
                    }
                }
            };

            const object1 = {
                "a": {
                    "aa": "original"
                }
            };

            const object2 = {
                "a": {
                    "$import": {
                        "file": "a.json",
                        "process": false
                    }
                }
            };

            fs.__setJsonMockFiles(files);

            const result = jsonMerger.mergeObjects([object1, object2], testConfig());

            expect(result).toMatchSnapshot();
        });

        test("should resolve to the unprocessed file and return the referenced value if also a pointer is given", function () {

            const files = {
                "a.json": {
                    "$replace": 100
                }
            };

            const object = {
                "a": {
                    "$import": {
                        "file": "a.json#/$replace",
                        "process": false
                    }
                }
            };

            fs.__setJsonMockFiles(files);

            const result = jsonMerger.mergeObject(object, testConfig());

            expect(result).toMatchSnapshot();
        });

        test("and used in an source array item it should merge the $import result with the target", function () {

            const files = {
                "a.json": {
                    "$replace": {
                        "b": "replaced"
                    }
                }
            };

            const object1 = {
                "a": [
                    {
                        "a": "original"
                    }
                ]
            };

            const object2 = {
                "a": [
                    {
                        "$import": {
                            "file": "a.json",
                            "process": false
                        }
                    }
                ]
            };

            fs.__setJsonMockFiles(files);

            const result = jsonMerger.mergeObjects([object1, object2], testConfig());

            expect(result).toMatchSnapshot();
        });

        test("should resolve to undefined if the file does not exist and options.errorOnInvalidImport is false", function () {

            const object = {
                "a": {
                    "aa": {
                        "$import": {
                            "file": "non_existing.json",
                            "process": false
                        }
                    }
                }
            };

            const result = jsonMerger.mergeObject(object, testConfig({
                errorOnInvalidImport: false
            }));

            expect(result).toMatchSnapshot();
        });

        test("should resolve to undefined if the file does exist but the pointer does not and options.errorOnInvalidImport is false", function () {

            const files = {
                "a.json": {
                    "a": 10
                }
            };

            const object = {
                "a": {
                    "$import": {
                        "file": "a.json#/a/nonExisting",
                        "process": false
                    }
                }
            };

            fs.__setJsonMockFiles(files);

            const result = jsonMerger.mergeObject(object, testConfig({
                errorOnInvalidImport: false
            }));

            expect(result).toMatchSnapshot();
        });

        test("should throw if the file does not exist and options.errorOnInvalidImport is true", function () {

            try {

                const object = {
                    "a": {
                        "$import": {
                            "file": "non_existing.json",
                            "process": false
                        }
                    }
                };

                jsonMerger.mergeObject(object, testConfig({
                    errorOnInvalidImport: true
                }));

                expect("this code").toBe("unreachable");

            } catch (e) {
                expect(e.message).toMatch(`An error occurred while processing the property "$import"`);
                expect(e.message).toMatch(`at #/a/$import`);
                expect(e.message).toMatch(/The file ".*non_existing\.json" does not exist/);
            }
        });

        test("should throw with a nested processing stack trace if the files do exist but the pointer does not exist and options.errorOnInvalidImport is true", function () {

            try {

                const files = {
                    "a.json": {
                        "a": {
                            "$import": "b.json"
                        }
                    },
                    "b.json": {
                        "b": 100
                    }
                };

                const object = {
                    "a": {
                        "$import": {
                            "file": "a.json#/a/b/nonExisting",
                            "process": false
                        }
                    }
                };

                fs.__setJsonMockFiles(files);

                jsonMerger.mergeObject(object, testConfig({
                    errorOnInvalidImport: true
                }));

                expect("this code").toBe("unreachable");

            } catch (e) {
                expect(e.message).toMatch(`An error occurred while processing the property "$import"`);
                expect(e.message).toMatch(`at #/a/$import`);
                expect(e.message).toMatch(/The ref "\/a\/b\/nonExisting" does not exist/);
            }
        });
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

        test("should resolve to the unprocessed files and merge them in the order they are defined before returning the result", function () {

            const files = {
                "b.json": {
                    "$replace": {
                        "bb": "replaced"
                    }
                },
                "c.json": {
                    "$replace": {
                        "cc": "replaced"
                    }
                }
            };

            const object1 = {
                "a": {
                    "aa": "original"
                }
            };

            const object2 = {
                "a": {
                    "$import": [
                        {
                            "file": "b.json",
                            "process": false
                        },
                        {
                            "file": "c.json",
                            "process": false
                        }
                    ]
                }
            };

            fs.__setJsonMockFiles(files);

            const result = jsonMerger.mergeObjects([object1, object2], testConfig());

            expect(result).toMatchSnapshot();
        });
    });
});

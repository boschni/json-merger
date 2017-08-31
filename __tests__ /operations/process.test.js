const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

jest.mock("fs");
const fs = require("fs");

describe("when merging two objects and a source property has a $process indicator", function () {

    test("and $process.phase is set to 'afterMerges' it should process the $process property after processing all sources", function () {

        const object1 = {
            "a": {
                "$process": {
                    "phase": "afterMerges",
                    "value": {
                        "$expression": "$source.b.prop"
                    }
                }
            }
        };

        const object2 = {
            "b": {
                "prop": {
                    "$replace": "this should be the value of a"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $process.phase is set to 'afterMerge' it should process the $process property after processing the current source", function () {

        const object1 = {
            "a": {
                "$process": {
                    "phase": "afterMerge",
                    "value": {
                        "$expression": "$source.a2"
                    }
                }
            },
            "a2": {
                "$replace": "This should be the value of /a"
            }
        };

        const object2 = {
            "b": "some value"
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

describe("when merging two files and a source property has a $process indicator", function () {

    test("and $process.phase is set to 'afterMerges' it should process the $process property after processing all sources", function () {

        const files = {
            "a.json": {
                "a": {
                    "$process": {
                        "phase": "afterMerges",
                        "value": {
                            "$expression": "$source.b"
                        }
                    }
                }
            },
            "b.json": {
                "b": {
                    "$replace": "this should be the value of a"
                }
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeFiles(["a.json", "b.json"], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $process.phase is set to 'afterMerge' it should process the $process property after processing the current source", function () {

        const files = {
            "a.json": {
                "a": {
                    "$process": {
                        "phase": "afterMerge",
                        "value": {
                            "$expression": "$source.aa"
                        }
                    }
                },
                "aa": {
                    "$replace": "This should be the value of a"
                }
            },
            "b.json": {
                "aa": {
                    "$replace": "wrong"
                }
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeFiles(["a.json", "b.json"], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $import is used it should handle the phases correctly", function () {

        const files = {
            "a.json": {
                "a": {
                    "$import": "b.json"
                },
                "aa": {
                    "$replace": "this should be the value of /a/bb"
                }
            },
            "b.json": {
                "b": {
                    "$process": {
                        "phase": "afterMerge",
                        "value": {
                            "$expression": "$source.bbb"
                        }
                    }
                },
                "bb": {
                    "$process": {
                        "phase": "afterMerges",
                        "value": {
                            "$expression": "$source.aa"
                        }
                    }
                },
                "bbb": {
                    "$replace": "This should be the value of /a/b"
                }
            }
        };

        fs.__setJsonMockFiles(files);

        const result = jsonMerger.mergeFile("a.json", testConfig());

        expect(result).toMatchSnapshot();
    });
});

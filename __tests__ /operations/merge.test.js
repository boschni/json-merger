const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when merging two objects and a source property has a $merge indicator", function () {

    test("it should merge the $merge.source property with the $merge.with property and the result of it should be merged with the target", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "$merge": {
                    "source": {
                        "bb": "source"
                    },
                    "with": {
                        "bb": "with"
                    }
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should process the $merge.source property before being merged with the $merge.with property", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "$merge": {
                    "source": {
                        "ba": {
                            "$replace": "source"
                        }
                    },
                    "with": {
                        "bb": "with"
                    }
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should process the $merge.with property before merging with the $merge.source property", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "$merge": {
                    "source": {
                        "ba": "source"
                    },
                    "with": {
                        "bb": {
                            "$replace": "with"
                        }
                    }
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should process the $merge result before merging with the target", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "$merge": {
                    "source": {
                        "$$replace": "source"
                    },
                    "with": {
                        "bb": "with"
                    }
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

const helpers = require("../../__helpers__");

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

        const result = helpers.mergeObjects([object1, object2]);

        expect(result).toMatchSnapshot();
    });

    test("it should compile the $merge.source property before being merged with the $merge.with property", function () {

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
                            "$value": "source"
                        }
                    },
                    "with": {
                        "bb": "with"
                    }
                }
            }
        };

        const result = helpers.mergeObjects([object1, object2]);

        expect(result).toMatchSnapshot();
    });

    test("it should compile the $merge.with property before merging with the $merge.source property", function () {

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
                            "$value": "with"
                        }
                    }
                }
            }
        };

        const result = helpers.mergeObjects([object1, object2]);

        expect(result).toMatchSnapshot();
    });

    test("it should not compile the $merge result before merging with the target", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "$merge": {
                    "source": {
                        "$set": {
                            "key": "$value",
                            "value": "source"
                        }
                    },
                    "with": {
                        "bb": "with"
                    }
                }
            }
        };

        const result = helpers.mergeObjects([object1, object2]);

        expect(result).toMatchSnapshot();
    });
});

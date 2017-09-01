const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when merging two arrays and the source item has", function () {

    test("$move: 0 it should prepend the target array item matching the source array item index", function () {

        const object1 = {
            "a": [
                {
                    "a1": "string"
                },
                {
                    "a2": "move to index 0"
                }
            ]
        };

        const object2 = {
            "a": [
                {},
                {
                    "$move": 0
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("$move.index set to 0 and $move.value set it should merge and prepend the target array item matching the source array item index", function () {

        const object1 = {
            "a": [
                {
                    "a1": "string"
                },
                {
                    "a2": "string"
                }
            ]
        };

        const object2 = {
            "a": [
                {},
                {
                    "$move": {
                        "index": 0,
                        "value": {
                            "a2": "move to index 0"
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("$move: 0 it should prepend the source array item if no matching target array item found", function () {

        const object1 = {
            "a": [
                {
                    "a1": "string"
                },
                {
                    "a2": "string"
                }
            ]
        };

        const object2 = {
            "a": [
                {},
                {},
                {
                    "$move": {
                        "index": 0,
                        "value": {
                            "b1": "move to index 0"
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("$move: 1 it should merge and insert the target array item matching the source array item index at index 1", function () {

        const object1 = {
            "a": [
                {
                    "a1": "string"
                },
                {
                    "a2": "string"
                },
                {
                    "a3": "string"
                }
            ]
        };

        const object2 = {
            "a": [
                {
                    "$move": {
                        "index": 1,
                        "value": {
                            "a1": "move to index 1"
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("$move: 2 it should merge and insert the result array item matching the source array item index (including insert items) at index 2", function () {

        const object1 = {
            "a": [
                {
                    "a1": "string"
                },
                {
                    "a2": "string"
                },
                {
                    "a3": "string"
                }
            ]
        };

        const object2 = {
            "a": [
                {
                    "$insert": {
                        "index": 0,
                        "value": {
                            "b1": "insert at index 0"
                        }
                    }
                },
                {
                    "$move": {
                        "index": 3,
                        "value": {
                            "a1": "move second target array item to index 3"
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("$move: -1 it should merge and insert the target array item matching the source array item index before the last item", function () {

        const object1 = {
            "a": [
                {
                    "a1": "string"
                },
                {
                    "a2": "string"
                },
                {
                    "a3": "string"
                }
            ]
        };

        const object2 = {
            "a": [
                {
                    "$move": {
                        "index": -1,
                        "value": {
                            "a1": "insert at index 1"
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("$move: 99 it should merge and append the target array item matching the source array item index", function () {

        const object1 = {
            "a": [
                {
                    "a1": "string"
                },
                {
                    "a2": "string"
                },
                {
                    "a3": "string"
                }
            ]
        };

        const object2 = {
            "a": [
                {
                    "$move": {
                        "index": 99,
                        "value": {
                            "a11": "append"
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("$move: - it should merge and append the target array item matching the source array item index", function () {

        const object1 = {
            "a": [
                {
                    "a1": "string"
                },
                {
                    "a2": "string"
                },
                {
                    "a3": "string"
                }
            ]
        };

        const object2 = {
            "a": [
                {
                    "$move": {
                        "index": "-",
                        "value": {
                            "a11": "append"
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

test("$move on a non array item should do nothing and be stripped", function () {

    const object1 = {
        "1a": {
            "1aa": 1
        }
    };

    const object2 = {
        "2b": {
            "$move": {
                "index": 1,
                "value": {
                    "2bb": 2
                }
            }
        }
    };

    const result = jsonMerger.mergeObjects([object1, object2], testConfig());

    expect(result).toMatchSnapshot();
});

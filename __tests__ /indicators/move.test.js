const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when merging two arrays and the source item has", function () {

    test("$move: 0 it should merge and prepend the target array item matching the source array item index", function () {

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
                    "$move": 0,
                    "a2": "move to index 0"
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
                    "$move": 0,
                    "b1": "move to index 0"
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
                    "$move": 1,
                    "a1": "move to index 1"
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("$move: 2 it should merge and insert the target array item matching the source array item index (not including insert items) at index 3 because an other item has been prepended", function () {

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
                    "$insert": 0,
                    "b1": "insert at index 0"
                },
                {
                    "$move": 2,
                    "a1": "move to index 3"
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
                    "$move": -1,
                    "a1": "insert at index 1"
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
                    "$move": 99,
                    "a11": "append"
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
                    "$move": "-",
                    "a11": "append"
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
            "$move": 1,
            "2bb": 2
        }
    };

    const result = jsonMerger.mergeObjects([object1, object2], testConfig());

    expect(result).toMatchSnapshot();
});

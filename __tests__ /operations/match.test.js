const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when merging two arrays and a source array item has a $match indicator", function () {

    test("and $match.index is set it should search for a match in the target array and use $match.then as value", function () {

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
                    "$match": {
                        "index": 1,
                        "value": {
                            "$remove": true
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $match.index is set to '-' it should match with the last item in the target array and use $match.then as value", function () {

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
                    "$match": {
                        "index": "-",
                        "value": {
                            "$remove": true
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $match.query is set it should search for a match in the target array and use $match.then as value", function () {

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
                    "$match": {
                        "query": "$[1]",
                        "value": {
                            "$remove": true
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $match.path is set it should search for a match in the target array and use $match.then as value", function () {

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
                    "$match": {
                        "path": "/1",
                        "value": {
                            "$remove": true
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should ignore the item if no matching $match.index has been found", function () {

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
                    "$match": {
                        "index": 99,
                        "value": {
                            "$remove": true
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should ignore the item if no matching $match.query has been found", function () {

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
                    "$match": {
                        "query": "$[99]",
                        "value": {
                            "$remove": true
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should process and merge the $match.then value if a match is found", function () {

        const object1 = {
            "a": [
                {
                    "a1": "original"
                },
                {
                    "a2": "original"
                }
            ]
        };

        const object2 = {
            "a": [
                {
                    "$match": {
                        "index": 1,
                        "value": {
                            "b2": {
                                "$replace": "merged"
                            }
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should correct the result array index if a matched item below the current source array index has been removed", function () {

        const object1 = {
            "a": [
                {
                    "prop": "this should be removed"
                },
                {
                    "prop": "this should be the first item"
                },
                {
                    "prop": "this should be the second item"
                },
                {
                    "prop": "this should be the third item"
                }
            ]
        };

        const object2 = {
            "a": [
                {
                    "prop2": "this should be removed"
                },
                {
                    "$match": {
                        "index": 0,
                        "value": {
                            "$remove": true
                        }
                    }
                },
                {
                    "prop2": "this should be added to the second item"
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should correct the result array index if a matched item equal to the current source array index has been removed", function () {

        const object1 = {
            "a": [
                {
                    "prop": "this should be the first item"
                },
                {
                    "prop": "this should be removed"
                },
                {
                    "prop": "this should be the second item"
                }
            ]
        };

        const object2 = {
            "a": [
                {
                    "prop2": "this should be added to the first item"
                },
                {
                    "$match": {
                        "index": 1,
                        "value": {
                            "$remove": true
                        }
                    }
                },
                {
                    "prop2": "this should be added to the second item"
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

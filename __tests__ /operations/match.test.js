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
                        "then": {
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
                        "then": {
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
                        "then": {
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
                        "then": {
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
                        "then": {
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
                        "then": {
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
                        "then": {
                            "$comment": "Should be stripped",
                            "b2": "merged"
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

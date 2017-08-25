const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when merging two objects and a source property has a $repeat operation", function () {

    test("it should repeat the value", function () {

        const object1 = {
            "prop": []
        };

        const object2 = {
            "prop": {
                "$repeat": {
                    "from": 1,
                    "until": 5,
                    "value": "this should be visible five times"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should merge the result with the target", function () {

        const object1 = {
            "prop": [
                1,
                2,
                3
            ]
        };

        const object2 = {
            "prop": {
                "$repeat": {
                    "from": 1,
                    "until": 1,
                    "value": "this should be the value of the first item"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should set a $repeat local on the scope with the current index", function () {

        const object1 = {
            "prop": []
        };

        const object2 = {
            "prop": {
                "$repeat": {
                    "from": 1,
                    "until": 5,
                    "value": {
                        "$expression": "'This is item with index ' + $repeat.index"
                    }
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should set a $repeat local on the scope with the current value", function () {

        const object1 = {
            "prop": []
        };

        const object2 = {
            "prop": {
                "$repeat": {
                    "from": 1,
                    "until": 5,
                    "value": {
                        "$expression": "'Item with index ' + $repeat.index + ' key ' + $repeat.key + ' and value ' + $repeat.value"
                    }
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $repeat.range is set it should use the property to repeat a range", function () {

        const object1 = {
            "prop": []
        };

        const object2 = {
            "prop": {
                "$repeat": {
                    "range": "1, 10-12, 20 30, 40-42 50,60  70,,80,90-92,100-102",
                    "value": {
                        "$expression": "'Item with index ' + $repeat.index + ' key ' + $repeat.key + ' and value ' + $repeat.value"
                    }
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $repeat.values is set to an array it should use the array to repeat a range", function () {

        const object1 = {
            "prop": []
        };

        const object2 = {
            "prop": {
                "$repeat": {
                    "values": ["a", "b"],
                    "value": {
                        "$expression": "'Item with index ' + $repeat.index + ' key ' + $repeat.key + ' and value ' + $repeat.value"
                    }
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $repeat.values is set to an object it should use the property to repeat a range", function () {

        const object1 = {
            "prop": []
        };

        const object2 = {
            "prop": {
                "$repeat": {
                    "values": {
                        "a": "value-of-a",
                        "b": "value-of-b"
                    },
                    "value": {
                        "$expression": "'Item with index ' + $repeat.index + ' key ' + $repeat.key + ' and value ' + $repeat.value"
                    }
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should be possible to nest repeat operations and get both indexes from the scope", function () {

        const object1 = {
            "prop": []
        };

        const object2 = {
            "prop": {
                "$repeat": {
                    "from": 0,
                    "until": 1,
                    "value": {
                        "$repeat": {
                            "from": 0,
                            "until": 1,
                            "value": {
                                "$expression": "'This is item ' + $parent.$repeat.index + '.' + $repeat.index"
                            }
                        }
                    }
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

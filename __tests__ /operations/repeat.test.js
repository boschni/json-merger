const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when merging two objects and a source property has a $repeat operation", function () {

    test("and only $repeat.from is set it should repeat $repeat.value one time", function () {

        const object1 = {
            "prop": []
        };

        const object2 = {
            "prop": {
                "$repeat": {
                    "from": 1,
                    "value": "this should be visible one time"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $repeat.from is set and $repeat.to it should repeat $repeat.value up to but not including $repeat.to", function () {

        const object1 = {
            "prop": []
        };

        const object2 = {
            "prop": {
                "$repeat": {
                    "from": 1,
                    "to": 5,
                    "value": "this should be visible four times"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $repeat.from is set and $repeat.to is set to the same value it should repeat nothing", function () {

        const object1 = {
            "prop": []
        };

        const object2 = {
            "prop": {
                "$repeat": {
                    "from": 1,
                    "to": 1,
                    "value": "this should not be visible"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $repeat.from is set and $repeat.to is set to a lower value it should repeat backwards", function () {

        const object1 = {
            "prop": []
        };

        const object2 = {
            "prop": {
                "$repeat": {
                    "from": 1,
                    "to": -3,
                    "value": "this should be visible four times"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $repeat.from is set and $repeat.through it should repeat $repeat.value up to including $repeat.through", function () {

        const object1 = {
            "prop": []
        };

        const object2 = {
            "prop": {
                "$repeat": {
                    "from": 1,
                    "through": 5,
                    "value": "this should be visible five times"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $repeat.from is set and $repeat.through is set to the same value it should repeat $repeat.value ones", function () {

        const object1 = {
            "prop": []
        };

        const object2 = {
            "prop": {
                "$repeat": {
                    "from": 1,
                    "through": 1,
                    "value": "this should be visible one time"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $repeat.from is set and $repeat.through is set to a lower value it should repeat backwards", function () {

        const object1 = {
            "prop": []
        };

        const object2 = {
            "prop": {
                "$repeat": {
                    "from": 1,
                    "through": -3,
                    "value": "this should be visible five times"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $repeat.step is set it should repeat with $repeat.step as interval", function () {

        const object1 = {
            "prop": []
        };

        const object2 = {
            "prop": {
                "$repeat": {
                    "from": 5,
                    "through": 10,
                    "step": 5,
                    "value": "this should be visible two times"
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
                    "range": "-5:-10:5 1, 10:12, 20 30, 40:42 50,60  70,,80,90:92,100:102",
                    "value": {
                        "$expression": "'Item with index ' + $repeat.index + ' key ' + $repeat.key + ' and value ' + $repeat.value"
                    }
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $repeat.in is set to an array it should use the array to repeat a range", function () {

        const object1 = {
            "prop": []
        };

        const object2 = {
            "prop": {
                "$repeat": {
                    "in": ["a", "b"],
                    "value": {
                        "$expression": "'Item with index ' + $repeat.index + ' key ' + $repeat.key + ' and value ' + $repeat.value"
                    }
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $repeat.in is set to an object it should use the property to repeat a range", function () {

        const object1 = {
            "prop": []
        };

        const object2 = {
            "prop": {
                "$repeat": {
                    "in": {
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
                    "through": 1,
                    "value": {
                        "$repeat": {
                            "from": 0,
                            "through": 1,
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
                    "through": 1,
                    "value": "this should be the value of the first item"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should set a $repeat variable on the scope with the current $repeat.index, $repeat,key and $repeat.value", function () {

        const object1 = {
            "prop": []
        };

        const object2 = {
            "prop": {
                "$repeat": {
                    "from": 1,
                    "through": 5,
                    "value": {
                        "$expression": "'Item with index ' + $repeat.index + ' key ' + $repeat.key + ' and value ' + $repeat.value"
                    }
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("it should keep the current scope source and target", function () {

        const object1 = {
            "targetProp": "This should be the value of /prop/0/0/c and /prop/0/0/d"
        };

        const object2 = {
            "prop": {
                "$repeat": {
                    "from": 0,
                    "to": 1,
                    "value": {
                        "$repeat": {
                            "from": 0,
                            "to": 1,
                            "value": {
                                "a": {
                                    "$expression": "$source.sourceProp"
                                },
                                "b": {
                                    "$expression": "$parent.$source.sourceProp"
                                },
                                "c": {
                                    "$expression": "$target.targetProp"
                                },
                                "d": {
                                    "$expression": "$parent.$target.targetProp"
                                }
                            }
                        }
                    }
                }
            },
            "sourceProp": "This should be the value of /prop/0/0/a and /prop/0/0/b"
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

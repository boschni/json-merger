const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when merging two arrays and a source array item has an $insert indicator", function () {

    test("and $insert.index is set to 0 it should prepend the $insert.value to the target array", function () {

        const object1 = {
            "a": [
                {
                    "aa": "string"
                }
            ]
        };

        const object2 = {
            "a": [
                {
                    "$insert": {
                        "index": 0,
                        "value": {
                            "bb": "prepend"
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $insert.index is set to 1 it should insert the $insert.value to the target array at index 1", function () {

        const object1 = {
            "a": [
                {
                    "aa1": "string"
                },
                {
                    "aa2": "string"
                }
            ]
        };

        const object2 = {
            "a": [
                {
                    "$insert": {
                        "index": 1,
                        "value": {
                            "bb": "insert at index 1"
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $insert.index is set to 1 and an other item also has $insert.index set to 1 it should insert the last $insert.value to the target array at index 1", function () {

        const object1 = {
            "a": [
                {
                    "aa1": "string"
                },
                {
                    "aa2": "string"
                }
            ]
        };

        const object2 = {
            "a": [
                {
                    "$insert": {
                        "index": 1,
                        "value": {
                            "bb": "insert at index 2"
                        }
                    }
                },
                {
                    "$insert": {
                        "index": 1,
                        "value": {
                            "cc": "insert at index 1"
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $insert.index is set to -1 it should insert the $insert.value to the target array before the last item", function () {

        const object1 = {
            "a": [
                {
                    "aa1": "string"
                },
                {
                    "aa2": "string"
                }
            ]
        };

        const object2 = {
            "a": [
                {
                    "$insert": {
                        "index": -1,
                        "value": {
                            "bb": "insert before last"
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $insert.index is set to '-' it should append the $insert.value to the target array", function () {

        const object1 = {
            "a": [
                {
                    "aa1": "string"
                },
                {
                    "aa2": "string"
                }
            ]
        };

        const object2 = {
            "a": [
                {
                    "$insert": {
                        "index": "-",
                        "value": {
                            "bb": "append"
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $insert.index is set to a value higher than the target array length it should append $insert.value to the target array", function () {

        const object1 = {
            "a": [
                {
                    "aa1": "string"
                },
                {
                    "aa2": "string"
                }
            ]
        };

        const object2 = {
            "a": [
                {
                    "$insert": {
                        "index": 10,
                        "value": {
                            "bb": "append"
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and the source array also has an $append operation then the $insert operation trumps the $append operation", function () {

        const object1 = {
            "a": [
                {
                    "aa": "string"
                }
            ]
        };

        const object2 = {
            "a": [
                {
                    "$append": {
                        "bb": "append"
                    }
                },
                {
                    "$insert": {
                        "index": 10,
                        "value": {
                            "cc": "insert"
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and the source array also has an $prepend operation then the $insert operation trumps the $prepend operation", function () {

        const object1 = {
            "a": [
                {
                    "aa": "string"
                }
            ]
        };

        const object2 = {
            "a": [
                {
                    "$prepend": {
                        "bb": "prepend"
                    }
                },
                {
                    "$insert": {
                        "index": 0,
                        "value": {
                            "cc": "insert"
                        }
                    }
                }
            ]
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

test("$insert on a non array item should do nothing and be stripped", function () {

    const object1 = {
        "1a": {
            "1aa": 1
        }
    };

    const object2 = {
        "2b": {
            "$insert": {
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

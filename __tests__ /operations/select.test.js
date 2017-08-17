const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when merging two objects and a source object contains a $select operation", function () {

    test("and $select.pointer is set it should use the json pointer to select a value in the target", function () {

        const object1 = {
            "a": [
                "should not be selected",
                "should be selected"
            ]
        };

        const object2 = {
            "a": {
                "$select": {
                    "pointer": "/1"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $select.path is set it should use the json path to select a value in the target", function () {

        const object1 = {
            "a": [
                "should not be selected",
                "should be selected"
            ]
        };

        const object2 = {
            "a": {
                "$select": {
                    "path": "$[1]"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and a $select.path matching multiple elements is set but $select.multiple is not set it should return the first value", function () {

        const object1 = {
            "a": [
                "should be selected",
                "should not be selected"
            ]
        };

        const object2 = {
            "a": {
                "$select": {
                    "path": "$[*]"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and a $select.path matching multiple elements is set and $select.multiple is true it should return an array with all matches", function () {

        const object1 = {
            "a": [
                "should be selected",
                "should also be selected"
            ]
        };

        const object2 = {
            "a": {
                "$select": {
                    "path": "$[*]",
                    "multiple": true
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $select.from is set to 'target' it should select from the target", function () {

        const object1 = {
            "a": [
                "target"
            ]
        };

        const object2 = {
            "a": {
                "$select": {
                    "from": "target",
                    "pointer": "/"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $select.from is set to 'targetRoot' it should select from the target root", function () {

        const object1 = {
            "a": [
                "target"
            ]
        };

        const object2 = {
            "a": {
                "$select": {
                    "from": "targetRoot",
                    "pointer": "/"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $select.from is set to 'source' it should select from the source", function () {

        const object1 = {
            "a": [
                "target"
            ]
        };

        const object2 = {
            "a": {
                "$select": {
                    "from": "source",
                    "pointer": "/"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $select.from is set to 'sourceRoot' it should select from the source root", function () {

        const object1 = {
            "a": [
                "target"
            ]
        };

        const object2 = {
            "a": {
                "$select": {
                    "from": "sourceRoot",
                    "pointer": "/"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $select.from is set to a different value it should process the $select.from value and select from the result", function () {

        const object1 = {
            "a": [
                "target"
            ]
        };

        const object2 = {
            "a": {
                "$select": {
                    "from": {
                        "b": {
                            "$replace": "replaced"
                        }
                    },
                    "pointer": "/"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

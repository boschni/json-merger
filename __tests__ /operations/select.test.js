const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when merging two objects and a source object contains a $select operation", function () {

    test("and $select.path is set it should use the json pointer to select a value in the target", function () {

        const object1 = {
            "a": [
                "should not be selected",
                "should be selected"
            ]
        };

        const object2 = {
            "a": {
                "$select": {
                    "path": "/a/1"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $select.query is set it should use the json path to select a value in the target", function () {

        const object1 = {
            "a": [
                "should not be selected",
                "should be selected"
            ]
        };

        const object2 = {
            "a": {
                "$select": {
                    "query": "$.a[1]"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and a $select.query matching multiple elements is set but $select.multiple is not set it should return the first value", function () {

        const object1 = {
            "targetProp": [
                "should be the value of sourceProp",
                "object1/targetProp/1"
            ]
        };

        const object2 = {
            "sourceProp": {
                "$select": {
                    "query": "$.targetProp[*]"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and a $select.query matching multiple elements is set and $select.multiple is true it should return an array with all matches", function () {

        const object1 = {
            "targetProp": [
                "should be selected",
                "should also be selected"
            ],
            "sharedProp": [
                "should be merged",
                "should be merged",
                "should be merged and visible"
            ]
        };

        const object2 = {
            "sharedProp": {
                "$select": {
                    "from": "target",
                    "query": "$.targetProp[*]",
                    "multiple": true
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $select.path refers to a non existing path it should throw if Config.errorOnRefNotFound is true", function () {

        try {

            const object = {
                "a": {
                    "$select": {
                        "path": "/nonExisting/1"
                    }
                }
            };

            jsonMerger.mergeObject(object, testConfig({
                errorOnRefNotFound: true
            }));

            expect("this code").toBe("unreachable");

        } catch (e) {
            expect(e.message).toMatch(`An error occurred while processing the property "$select"`);
            expect(e.message).toMatch(`at #/a/$select`);
            expect(e.message).toMatch(`The JSON pointer "/nonExisting/1" resolves to undefined`);
        }
    });

    test("and $select.query refers to a non existing path it should throw if Config.errorOnRefNotFound is true", function () {

        try {

            const object = {
                "a": {
                    "$select": {
                        "query": "$.nonExisting.1"
                    }
                }
            };

            jsonMerger.mergeObject(object, testConfig({
                errorOnRefNotFound: true
            }));

            expect("this code").toBe("unreachable");

        } catch (e) {
            expect(e.message).toMatch(`An error occurred while processing the property "$select"`);
            expect(e.message).toMatch(`at #/a/$select`);
            expect(e.message).toMatch(`The JSON path "$.nonExisting.1" resolves to undefined`);
        }
    });

    test("and $select.from is set to 'target' it should select from the target", function () {

        const object1 = {
            "targetProp": "should be the value of sharedProp",
            "sharedProp": "object1.sharedProp"
        };

        const object2 = {
            "sharedProp": {
                "$select": {
                    "path": "/targetProp"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $select.from is set to 'currentTarget' it should select from the current target", function () {

        const object1 = {
            "targetProp": "should be the value of sharedProp",
            "sharedProp": "object1.sharedProp"
        };

        const object2 = {
            "sharedProp": {
                "$select": {
                    "from": "currentTarget",
                    "path": "/targetProp"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $select.from is set to 'currentTargetProperty' it should select from the current target property", function () {

        const object1 = {
            "targetProp": "object1.targetProp",
            "sharedProp": "should be the value of sharedProp"
        };

        const object2 = {
            "sourceProp": "object2.sourceProp",
            "sharedProp": {
                "$select": {
                    "from": "currentTargetProperty",
                    "path": "/"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $select.from is set to 'source' it should select from the source", function () {

        const object1 = {
            "targetProp": "object1.targetProp",
            "sharedProp": "object1.sharedProp"
        };

        const object2 = {
            "sourceProp": "should be the value of sharedProp",
            "sharedProp": {
                "$select": {
                    "from": "source",
                    "path": "/sourceProp"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $select.from is set to 'currentSource' it should select from the current source", function () {

        const object1 = {
            "targetProp": "object1.targetProp",
            "sharedProp": "object1.sharedProp"
        };

        const object2 = {
            "sourceProp": "should be the value of sharedProp",
            "sharedProp": {
                "$select": {
                    "from": "currentSource",
                    "path": "/sourceProp"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $select.from is set to 'currentSourceProperty' it should select from the current source property", function () {

        const object1 = {
            "targetProp": "object1.targetProp",
            "sharedProp": "object1.sharedProp"
        };

        const object2 = {
            "sharedProp": {
                "$select": {
                    "from": "currentSourceProperty",
                    "path": "/$select/path"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and $select.from is set to a different value it should process the $select.from value and select from the result", function () {

        const object1 = {
            "targetProp": "object1.targetProp",
            "sharedProp": "object1.sharedProp"
        };

        const object2 = {
            "sharedProp": {
                "$select": {
                    "from": {
                        "$replace": "should be the value of sharedProp"
                    },
                    "path": "/"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

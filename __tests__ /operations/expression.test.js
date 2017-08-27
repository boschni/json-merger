const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when merging two objects and a source property has an $expression operation", function () {

    test("it should execute the expression and return the result", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "aa": {
                    "$expression": "'should be the value of /a/aa'"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("containing an error it should throw with a stack trace to the property", function () {

        try {

            const object = {
                "a": {
                    "$expression": "@"
                }
            };

            jsonMerger.mergeObject(object, testConfig());

            expect("this code").toBe("unreachable");

        } catch (e) {
            expect(e.message).toMatch(`An error occurred while processing the property "$expression"`);
            expect(e.message).toMatch(`at #/a/$expression`);
            expect(e.message).toMatch(`Invalid or unexpected token`);
        }
    });

    test("then the expression should use the current scope object as context", function () {

        const object1 = {
            "a": {
                "aa": {
                    "$replace": "original"
                }
            }
        };

        const object2 = {
            "a": {
                "$expression": "$target.a.aa === 'original' ? 'should be the value of a' : 'wrong'"
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("then the expression should have a local property named '$targetProperty' referring to the processed current target property", function () {

        const object1 = {
            "a": {
                "aa": {
                    "$replace": "original"
                }
            }
        };

        const object2 = {
            "a": {
                "$expression": "$targetProperty.aa === 'original' ? 'should be the value of a' : 'wrong'"
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("then the expression should have a local property named '$sourceProperty' referring to the unprocessed current source property", function () {

        const object1 = {
            "a": {}
        };

        const object2 = {
            "a": {
                "$expression": "$sourceProperty.substr(0, 7) === '$source' ? 'should be the value of a' : 'wrong'",
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and an $expression.input property it should process the property and use the result as $input variable", function () {

        const object1 = {
            "a": {
                "aa": 1
            }
        };

        const object2 = {
            "a": {
                "aa": {
                    "$expression": {
                        "expression": "$targetProperty + $input",
                        "input": {
                            "$replace": 2
                        }
                    }
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("then the expression should have a access to the JavaScript engine APIs", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "aa": {
                    "$expression": "new Date(2017, 1, 1).getFullYear()"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });
});

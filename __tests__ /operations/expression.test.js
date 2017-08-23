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

    test("then the expression should have a local property named '$target' referring to the processed target", function () {

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

    test("then the expression should have a local property named '$currentTarget' referring to the processed current target", function () {

        const object1 = {
            "a": {
                "aa": {
                    "$replace": "original"
                }
            }
        };

        const object2 = {
            "a": {
                "$expression": "$currentTarget.a.aa === 'original' ? 'should be the value of a' : 'wrong'"
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("then the expression should have a local property named '$currentTargetProperty' referring to the processed current target property", function () {

        const object1 = {
            "a": {
                "aa": {
                    "$replace": "original"
                }
            }
        };

        const object2 = {
            "a": {
                "$expression": "$currentTargetProperty.aa === 'original' ? 'should be the value of a' : 'wrong'"
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("then the expression should have a local property named '$source' referring to the unprocessed source", function () {

        const object1 = {
            "a": {}
        };

        const object2 = {
            "a": {
                "$expression": "$source.a.$comment.content === 'original' ? 'should be the value of a' : 'wrong'",
                "$comment": {
                    "content": "original"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("then the expression should have a local property named '$currentSource' referring to the unprocessed current source", function () {

        const object1 = {
            "a": {}
        };

        const object2 = {
            "a": {
                "$expression": "$currentSource.a.$comment.content === 'original' ? 'should be the value of a' : 'wrong'",
                "$comment": {
                    "content": "original"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("then the expression should have a local property named '$currentSourceProperty' referring to the unprocessed current source property", function () {

        const object1 = {
            "a": {}
        };

        const object2 = {
            "a": {
                "$expression": "$currentSourceProperty.$comment.content === 'original' ? 'should be the value of a' : 'wrong'",
                "$comment": {
                    "content": "original"
                }
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and a $merge operation then the expression should have a local property named '$currentTarget' referring to the processed $merge.source property", function () {

        const object = {
            "$merge": {
                "source": {
                    "b": {
                        "$replace": "original"
                    }
                },
                "with": {
                    "a": {
                        "$expression": "$currentTarget.b === 'original' ? 'should be the value of a' : 'wrong'"
                    }
                }
            }
        };

        const result = jsonMerger.mergeObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and a $merge operation then the expression should have a local property named '$currentSource' referring to the processed $merge.with property", function () {

        const object = {
            "$merge": {
                "source": {},
                "with": {
                    "hasSomeProp": {
                        "$expression": "$currentSource.someProp === 10 ? 'should be the value of a' : 'wrong'"
                    },
                    "someProp": 10
                }
            }
        };

        const result = jsonMerger.mergeObject(object, testConfig());

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
                        "expression": "$currentTargetProperty + $input",
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
});

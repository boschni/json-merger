const jsonMerger = require("../../dist");
const {testConfig} = require("../__helpers__");

describe("when merging two objects and a source property has an $expression indicator", function () {

    test("it should execute the expression and return the result", function () {

        const object1 = {
            "a": {
                "aa": "original"
            }
        };

        const object2 = {
            "a": {
                "aa": {
                    "$expression": "10"
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

            jsonMerger.fromObject(object, testConfig());

            expect("this code").toBe("unreachable");

        } catch (e) {
            expect(e.message).toMatch(`An error occurred while processing the property "$expression"`);
            expect(e.message).toMatch(`at #/a/$expression`);
            expect(e.message).toMatch(`Invalid or unexpected token`);
        }
    });

    test("then the expression should have a local property named '$target' referring to the processed target property", function () {

        const object1 = {
            "a": {
                "aa": {
                    "$value": "original"
                }
            }
        };

        const object2 = {
            "a": {
                "$expression": "$target.aa === 'original' ? 'is original' : 'is not original'"
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("then the expression should have a local property named '$targetRoot' referring to the processed target root", function () {

        const object1 = {
            "a": {
                "aa": {
                    "$value": "original"
                }
            }
        };

        const object2 = {
            "a": {
                "$expression": "$targetRoot.a.aa === 'original' ? 'is original' : 'is not original'"
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("then the expression should have a local property named '$source' referring to the unprocessed source property", function () {

        const object1 = {
            "a": {}
        };

        const object2 = {
            "a": {
                "$expression": "$source['$value'] === 'original' ? 'is original' : 'is not original'",
                "$value": "original"
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("then the expression should have a local property named '$sourceRoot' referring to the unprocessed source root", function () {

        const object1 = {
            "a": {}
        };

        const object2 = {
            "a": {
                "$expression": "$sourceRoot.aa['$value'] === 'original' ? 'is original' : 'is not original'",
                "$value": "original"
            }
        };

        const result = jsonMerger.mergeObjects([object1, object2], testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and a $merge indicator then the expression should have a local property named '$targetRoot' referring to the processed $merge.source property", function () {

        const object = {
            "$merge": {
                "source": {
                    "a": "original"
                },
                "with": {
                    "isOriginal": {
                        "$expression": "$targetRoot.a === 'original' ? true : false"
                    }
                }
            }
        };

        const result = jsonMerger.fromObject(object, testConfig());

        expect(result).toMatchSnapshot();
    });

    test("and a $merge indicator then the expression should have a local property named '$sourceRoot' referring to the processed $merge.with property", function () {

        const object = {
            "$merge": {
                "source": {},
                "with": {
                    "hasSomeProp": {
                        "$expression": "$sourceRoot.someProp === 10 ? true : false"
                    },
                    "someProp": 10
                }
            }
        };

        const result = jsonMerger.fromObject(object, testConfig());

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

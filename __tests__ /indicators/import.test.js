const helpers = require("../../__helpers__");

jest.mock("fs");

describe("when compiling an object containing an $import identifier it", function () {

    test("should resolve to the file defined in the $import property", function () {

        const files = {
            "a.json": {
                "b": 100
            }
        };

        const object = {
            "a": {
                "$import": "a.json"
            }
        };

        require("fs").__setJsonMockFiles(files);

        const result = helpers.fromObject(object);

        expect(result).toMatchSnapshot();
    });

    test("should resolve to the compiled file", function () {

        const files = {
            "a.json": {
                "$value": "compiled"
            }
        };

        const object = {
            "a": {
                "$import": "a.json"
            }
        };

        require("fs").__setJsonMockFiles(files);

        const result = helpers.fromObject(object);

        expect(result).toMatchSnapshot();
    });

    test("should resolve to a property in the compiled file if also a json pointer is given", function () {

        const files = {
            "a.json": {
                "b": {
                    "bb": {
                        "$value": "compiled"
                    }
                }
            }
        };

        const object = {
            "a": {
                "$import": "a.json#/b/bb"
            }
        };

        require("fs").__setJsonMockFiles(files);

        const result = helpers.fromObject(object);

        expect(result).toMatchSnapshot();
    });

    test("should resolve to undefined if the file does not exist and options.throwOnInvalidRef is false", function () {

        const object = {
            "a": {
                "$import": "non_existing.json"
            }
        };

        const result = helpers.fromObject(object, {
            throwOnInvalidRef: false
        });

        expect(result).toMatchSnapshot();
    });

    test("should resolve to undefined if the file does exist but the pointer does not and options.throwOnInvalidRef is false", function () {

        const files = {
            "a.json": {
                "a": 10
            }
        };

        const object = {
            "a": {
                "$import": "a.json#/a/nonExisting"
            }
        };

        require("fs").__setJsonMockFiles(files);

        const result = helpers.fromObject(object, {
            throwOnInvalidRef: false
        });

        expect(result).toMatchSnapshot();
    });

    test("should throw if the file does not exist and options.throwOnInvalidRef is true", function () {

        try {

            const object = {
                "a": {
                    "$import": "non_existing.json"
                }
            };

            helpers.fromObject(object, {
                throwOnInvalidRef: true
            });

            expect("this code").toBe("unreachable");

        } catch (e) {

            helpers.expectStringWithMatchers(e.message, [
                expect.stringContaining(`An error occurred while processing the property "$import"`),
                expect.stringContaining(`at #/a/$import`),
                expect.stringMatching(/The file ".*non_existing\.json" does not exist/)
            ]);
        }
    });

    test("should throw with a nested processing stack trace if the files do exist but the pointer does not exist and options.throwOnInvalidRef is true", function () {

        try {

            const files = {
                "a.json": {
                    "a": {
                        "$import": "b.json"
                    }
                },
                "b.json": {
                    "b": 100
                }
            };

            const object = {
                "a": {
                    "$import": "a.json#/a/b/nonExisting"
                }
            };

            require("fs").__setJsonMockFiles(files);

            helpers.fromObject(object, {
                throwOnInvalidRef: true
            });

            expect("this code").toBe("unreachable");

        } catch (e) {

            helpers.expectStringWithMatchers(e.message, [
                expect.stringContaining(`An error occurred while processing the property "$import"`),
                expect.stringContaining(`at #/a/$import`),
                expect.stringMatching(/The ref "\/a\/b\/nonExisting" does not exist/)
            ]);
        }
    });
});
